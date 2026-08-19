import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface Room {
  id: string;
  code: string;
  host: string;
  players: Map<string, PlayerConnection>;
  gameState: Record<string, unknown>;
  createdAt: number;
}

interface PlayerConnection {
  id: string;
  name: string;
  ws: WebSocket;
  characterId?: string;
  isHost: boolean;
  lastActivity: number;
}

interface WSMessage {
  type: string;
  payload: Record<string, unknown>;
  roomId?: string;
  playerId?: string;
}

const rooms = new Map<string, Room>();
const playerRooms = new Map<string, string>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function broadcastToRoom(roomCode: string, message: WSMessage, excludePlayerId?: string): void {
  const room = rooms.get(roomCode);
  if (!room) return;

  const messageStr = JSON.stringify(message);
  room.players.forEach((player, playerId) => {
    if (playerId !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(messageStr);
    }
  });
}

function sendToPlayer(playerId: string, message: WSMessage): void {
  const roomCode = playerRooms.get(playerId);
  if (!roomCode) return;

  const room = rooms.get(roomCode);
  if (!room) return;

  const player = room.players.get(playerId);
  if (player && player.ws.readyState === WebSocket.OPEN) {
    player.ws.send(JSON.stringify(message));
  }
}

function createRoom(hostId: string, hostName: string, ws: WebSocket): Room {
  const roomCode = generateRoomCode();
  const room: Room = {
    id: uuidv4(),
    code: roomCode,
    host: hostId,
    players: new Map(),
    gameState: {},
    createdAt: Date.now(),
  };

  const hostPlayer: PlayerConnection = {
    id: hostId,
    name: hostName,
    ws,
    isHost: true,
    lastActivity: Date.now(),
  };

  room.players.set(hostId, hostPlayer);
  rooms.set(roomCode, room);
  playerRooms.set(hostId, roomCode);

  return room;
}

function joinRoom(roomCode: string, playerId: string, playerName: string, ws: WebSocket): boolean {
  const room = rooms.get(roomCode);
  if (!room) return false;

  const player: PlayerConnection = {
    id: playerId,
    name: playerName,
    ws,
    isHost: false,
    lastActivity: Date.now(),
  };

  room.players.set(playerId, player);
  playerRooms.set(playerId, roomCode);
  return true;
}

function leaveRoom(playerId: string): void {
  const roomCode = playerRooms.get(playerId);
  if (!roomCode) return;

  const room = rooms.get(roomCode);
  if (!room) return;

  room.players.delete(playerId);
  playerRooms.delete(playerId);

  if (room.players.size === 0) {
    rooms.delete(roomCode);
  } else if (room.host === playerId) {
    const newHost = room.players.values().next().value;
    if (newHost) {
      newHost.isHost = true;
      room.host = newHost.id;
      sendToPlayer(newHost.id, {
        type: 'host_changed',
        payload: { playerId: newHost.id },
      });
    }
  }
}

function handleMessage(playerId: string, message: WSMessage): void {
  const roomCode = playerRooms.get(playerId);
  if (!roomCode && message.type !== 'create_room' && message.type !== 'join_room') {
    return;
  }

  switch (message.type) {
    case 'leave_room': {
      leaveRoom(playerId);
      sendToPlayer(playerId, {
        type: 'room_left',
        payload: {},
      });
      break;
    }

    case 'player_action': {
      if (!roomCode) break;
      const { action } = message.payload;
      broadcastToRoom(roomCode, {
        type: 'action_performed',
        payload: { playerId, action },
      }, playerId);
      break;
    }

    case 'update_game_state': {
      if (!roomCode) break;
      const { gameState } = message.payload as { gameState: Record<string, unknown> };
      const room = rooms.get(roomCode);
      if (room) {
        room.gameState = { ...room.gameState, ...gameState };
        broadcastToRoom(roomCode, {
          type: 'game_state_updated',
          payload: { gameState: room.gameState },
        }, playerId);
      }
      break;
    }

    case 'combat_action': {
      if (!roomCode) break;
      const { combatAction } = message.payload;
      broadcastToRoom(roomCode, {
        type: 'combat_action_performed',
        payload: { playerId, combatAction },
      }, playerId);
      break;
    }

    case 'chat_message': {
      if (!roomCode) break;
      const { message: chatMessage } = message.payload as { message: string };
      broadcastToRoom(roomCode, {
        type: 'chat_message',
        payload: { playerId, playerName: rooms.get(roomCode)?.players.get(playerId)?.name, message: chatMessage },
      });
      break;
    }

    case 'select_character': {
      if (!roomCode) break;
      const { characterId } = message.payload as { characterId: string };
      const room = rooms.get(roomCode);
      if (room) {
        const player = room.players.get(playerId);
        if (player) {
          player.characterId = characterId;
          broadcastToRoom(roomCode, {
            type: 'character_selected',
            payload: { playerId, characterId },
          });
        }
      }
      break;
    }

    default:
      sendToPlayer(playerId, {
        type: 'error',
        payload: { message: `Unknown message type: ${message.type}` },
      });
  }
}

const PORT = parseInt(process.env.WS_PORT || '3001', 10);

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws: WebSocket) => {
  const playerId = uuidv4();
  console.log(`Player connected: ${playerId}`);

  ws.on('message', (data: WebSocket.Data) => {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      message.playerId = playerId;

      // Handle create_room and join_room specially since they need the WebSocket
      if (message.type === 'create_room') {
        const { playerName } = message.payload as { playerName: string };
        const room = createRoom(playerId, playerName, ws);
        ws.send(JSON.stringify({
          type: 'room_created',
          payload: { roomCode: room.code, roomId: room.id },
        }));
        return;
      }

      if (message.type === 'join_room') {
        const { roomCode, playerName } = message.payload as { roomCode: string; playerName: string };
        const success = joinRoom(roomCode, playerId, playerName, ws);
        if (success) {
          const room = rooms.get(roomCode)!;
          ws.send(JSON.stringify({
            type: 'room_joined',
            payload: { roomCode, roomId: room.id, players: Array.from(room.players.values()).map(p => ({ id: p.id, name: p.name, isHost: p.isHost })) },
          }));
          broadcastToRoom(roomCode, {
            type: 'player_joined',
            payload: { playerId, playerName },
          }, playerId);
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Room not found' },
          }));
        }
        return;
      }

      handleMessage(playerId, message);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Player disconnected: ${playerId}`);
    leaveRoom(playerId);
  });

  ws.on('error', (error) => {
    console.error(`Player ${playerId} error:`, error);
  });

  ws.send(JSON.stringify({
    type: 'connected',
    payload: { playerId },
  }));
});

console.log(`WebSocket server running on port ${PORT}`);
