'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from '../engine/types';

interface MultiplayerState {
  connected: boolean;
  playerId: string | null;
  roomCode: string | null;
  players: Array<{ id: string; name: string; isHost: boolean; characterId?: string }>;
  gameState: Partial<GameState> | null;
  chatMessages: Array<{ playerId: string; playerName: string; message: string; timestamp: number }>;
  error: string | null;
}

interface MultiplayerActions {
  connect: (roomCode: string, playerName: string) => Promise<void>;
  createRoom: (playerName: string) => Promise<string>;
  sendAction: (action: Record<string, unknown>) => void;
  updateGameState: (gameState: Partial<GameState>) => void;
  sendCombatAction: (combatAction: Record<string, unknown>) => void;
  sendChatMessage: (message: string) => void;
  selectCharacter: (characterId: string) => void;
  leaveRoom: () => void;
  disconnect: () => void;
}

interface UseMultiplayerReturn {
  state: MultiplayerState;
  actions: MultiplayerActions;
}

export function useMultiplayer(wsUrl: string = 'ws://localhost:3001'): UseMultiplayerReturn {
  const [state, setState] = useState<MultiplayerState>({
    connected: false,
    playerId: null,
    roomCode: null,
    players: [],
    gameState: null,
    chatMessages: [],
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const handleMessage = useCallback((message: { type: string; payload: Record<string, unknown> }) => {
    switch (message.type) {
      case 'connected':
        setState(prev => ({ ...prev, playerId: message.payload.playerId as string }));
        break;

      case 'room_joined':
        setState(prev => ({
          ...prev,
          roomCode: message.payload.roomCode as string,
          players: message.payload.players as Array<{ id: string; name: string; isHost: boolean }>,
        }));
        break;

      case 'player_joined':
        setState(prev => ({
          ...prev,
          players: [...prev.players, message.payload as { id: string; name: string; isHost: boolean }],
        }));
        break;

      case 'player_left':
        setState(prev => ({
          ...prev,
          players: prev.players.filter(p => p.id !== message.payload.playerId),
        }));
        break;

      case 'host_changed':
        setState(prev => ({
          ...prev,
          players: prev.players.map(p => ({
            ...p,
            isHost: p.id === message.payload.playerId,
          })),
        }));
        break;

      case 'game_state_updated':
        setState(prev => ({
          ...prev,
          gameState: message.payload.gameState as Partial<GameState>,
        }));
        break;

      case 'action_performed':
        // Handle action from other players
        break;

      case 'combat_action_performed':
        // Handle combat action from other players
        break;

      case 'chat_message':
        setState(prev => ({
          ...prev,
          chatMessages: [...prev.chatMessages, {
            playerId: message.payload.playerId as string,
            playerName: message.payload.playerName as string,
            message: message.payload.message as string,
            timestamp: Date.now(),
          }],
        }));
        break;

      case 'character_selected':
        setState(prev => ({
          ...prev,
          players: prev.players.map(p => ({
            ...p,
            characterId: p.id === message.payload.playerId ? message.payload.characterId as string : p.characterId,
          })),
        }));
        break;

      case 'error':
        setState(prev => ({ ...prev, error: message.payload.message as string }));
        break;
    }
  }, []);

  const connectRef = useRef<(roomCode: string, playerName: string) => Promise<void>>(() => Promise.resolve());

  const connect = useCallback(async (roomCode: string, playerName: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setState(prev => ({ ...prev, connected: true, error: null }));
        reconnectAttemptsRef.current = 0;

        // Join the room
        ws.send(JSON.stringify({
          type: 'join_room',
          payload: { roomCode, playerName },
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setState(prev => ({ ...prev, connected: false }));
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectRef.current(roomCode, playerName);
          }, Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000));
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ ...prev, error: 'Connection error' }));
      };
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to connect' }));
    }
  }, [wsUrl, handleMessage]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const createRoom = useCallback(async (playerName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setState(prev => ({ ...prev, connected: true, error: null }));
          reconnectAttemptsRef.current = 0;

          ws.send(JSON.stringify({
            type: 'create_room',
            payload: { playerName },
          }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'room_created') {
              const { roomCode } = message.payload;
              setState(prev => ({ ...prev, roomCode }));
              resolve(roomCode);
            } else {
              handleMessage(message);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
            reject(error);
          }
        };

        ws.onclose = () => {
          setState(prev => ({ ...prev, connected: false }));
          wsRef.current = null;
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setState(prev => ({ ...prev, error: 'Connection error' }));
          reject(error);
        };
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to create room' }));
        reject(error);
      }
    });
  }, [wsUrl, handleMessage]);

  const sendAction = useCallback((action: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'player_action',
        payload: { action },
      }));
    }
  }, []);

  const updateGameState = useCallback((gameState: Partial<GameState>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update_game_state',
        payload: { gameState },
      }));
    }
  }, []);

  const sendCombatAction = useCallback((combatAction: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'combat_action',
        payload: { combatAction },
      }));
    }
  }, []);

  const sendChatMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        payload: { message },
      }));
    }
  }, []);

  const selectCharacter = useCallback((characterId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'select_character',
        payload: { characterId },
      }));
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'leave_room',
        payload: {},
      }));
    }
    setState({
      connected: false,
      playerId: null,
      roomCode: null,
      players: [],
      gameState: null,
      chatMessages: [],
      error: null,
    });
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState({
      connected: false,
      playerId: null,
      roomCode: null,
      players: [],
      gameState: null,
      chatMessages: [],
      error: null,
    });
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    actions: {
      connect,
      createRoom,
      sendAction,
      updateGameState,
      sendCombatAction,
      sendChatMessage,
      selectCharacter,
      leaveRoom,
      disconnect,
    },
  };
}
