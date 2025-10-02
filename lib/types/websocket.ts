/**
 * WebSocket Type Definitions
 * Real-time communication types
 */

import { MarketQuote } from './market';
import { StrategyResult } from './strategy';

export type WebSocketEvent =
  | 'market_update'
  | 'strategy_signal'
  | 'portfolio_update'
  | 'system_alert'
  | 'connection_status';

export interface WebSocketMessage<T = unknown> {
  event: WebSocketEvent;
  data: T;
  timestamp: Date;
}

export interface MarketUpdateMessage {
  quotes: MarketQuote[];
  timestamp: Date;
}

export interface StrategySignalMessage {
  signals: StrategyResult[];
  timestamp: Date;
}

export interface SystemAlertMessage {
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

export interface ConnectionStatusMessage {
  status: 'connected' | 'disconnected' | 'reconnecting';
  timestamp: Date;
}

export interface SubscriptionRequest {
  symbols: string[];
  events: WebSocketEvent[];
}

export interface UnsubscriptionRequest {
  symbols?: string[];
  events?: WebSocketEvent[];
}
