// ============================================================
// EVENT SYSTEM - Domain events for the game engine
// The narrative layer consumes these events.
// ============================================================

import type { GameEvent, GameEventType } from './types';

let eventCounter = 0;

export function createEvent(type: GameEventType, data: Record<string, unknown> = {}): GameEvent {
  return {
    type,
    timestamp: Date.now(),
    data: { ...data, _seq: ++eventCounter },
  };
}

export type EventHandler = (event: GameEvent) => void;

export class EventBus {
  private handlers: Map<GameEventType, EventHandler[]> = new Map();
  private allHandlers: EventHandler[] = [];
  private eventHistory: GameEvent[] = [];

  on(type: GameEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
    return () => this.off(type, handler);
  }

  onAll(handler: EventHandler): () => void {
    this.allHandlers.push(handler);
    return () => {
      const idx = this.allHandlers.indexOf(handler);
      if (idx >= 0) this.allHandlers.splice(idx, 1);
    };
  }

  off(type: GameEventType, handler: EventHandler): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx >= 0) handlers.splice(idx, 1);
    }
  }

  emit(event: GameEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > 500) {
      this.eventHistory = this.eventHistory.slice(-250);
    }

    const typeHandlers = this.handlers.get(event.type) || [];
    for (const handler of typeHandlers) {
      try {
        handler(event);
      } catch (err) {
        console.error(`Event handler error for ${event.type}:`, err);
      }
    }

    for (const handler of this.allHandlers) {
      try {
        handler(event);
      } catch (err) {
        console.error('Event handler error:', err);
      }
    }
  }

  getHistory(type?: GameEventType, limit: number = 50): GameEvent[] {
    const events = type
      ? this.eventHistory.filter(e => e.type === type)
      : this.eventHistory;
    return events.slice(-limit);
  }

  clear(): void {
    this.eventHistory = [];
    this.handlers.clear();
    this.allHandlers = [];
  }
}

export const eventBus = new EventBus();
