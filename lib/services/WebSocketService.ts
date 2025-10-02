/**
 * WebSocket Service
 * Real-time market data broadcasting using Socket.IO
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { MarketDataService } from './MarketDataService';
import { StrategyEngine } from '../strategies/StrategyEngine';
import {
  WebSocketMessage,
  MarketUpdateMessage,
  StrategySignalMessage,
  SubscriptionRequest,
  UnsubscriptionRequest,
} from '../types/websocket';

export class WebSocketService {
  private static instance: WebSocketService;
  private io: SocketIOServer | null = null;
  private marketService: MarketDataService;
  private strategyEngine: StrategyEngine;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 5000; // 5 seconds
  private subscribedSymbols: Set<string> = new Set();

  private constructor() {
    this.marketService = MarketDataService.getInstance();
    this.strategyEngine = StrategyEngine.getInstance();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): void {
    if (this.io) {
      console.log('WebSocket server already initialized');
      return;
    }

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
    this.startMarketDataBroadcast();

    console.log('WebSocket server initialized');
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle subscription requests
      socket.on('subscribe', (request: SubscriptionRequest) => {
        this.handleSubscription(socket, request);
      });

      // Handle unsubscription requests
      socket.on('unsubscribe', (request: UnsubscriptionRequest) => {
        this.handleUnsubscription(socket, request);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });

      // Send welcome message
      socket.emit('connection_status', {
        status: 'connected',
        message: 'Connected to Destiny Trading Platform',
        timestamp: new Date(),
      });
    });
  }

  /**
   * Handle subscription requests
   */
  private handleSubscription(socket: Socket, request: SubscriptionRequest): void {
    const { symbols, events } = request;

    // Join symbol rooms
    if (symbols && symbols.length > 0) {
      symbols.forEach(symbol => {
        const normalizedSymbol = symbol.toUpperCase();
        socket.join(`symbol:${normalizedSymbol}`);
        this.subscribedSymbols.add(normalizedSymbol);
      });

      console.log(`Client ${socket.id} subscribed to symbols: ${symbols.join(', ')}`);
    }

    // Join event rooms
    if (events && events.length > 0) {
      events.forEach(event => {
        socket.join(`event:${event}`);
      });

      console.log(`Client ${socket.id} subscribed to events: ${events.join(', ')}`);
    }

    // Send acknowledgment
    socket.emit('subscription_confirmed', {
      symbols,
      events,
      timestamp: new Date(),
    });
  }

  /**
   * Handle unsubscription requests
   */
  private handleUnsubscription(socket: Socket, request: UnsubscriptionRequest): void {
    const { symbols, events } = request;

    // Leave symbol rooms
    if (symbols && symbols.length > 0) {
      symbols.forEach(symbol => {
        const normalizedSymbol = symbol.toUpperCase();
        socket.leave(`symbol:${normalizedSymbol}`);
      });

      console.log(`Client ${socket.id} unsubscribed from symbols: ${symbols.join(', ')}`);
    }

    // Leave event rooms
    if (events && events.length > 0) {
      events.forEach(event => {
        socket.leave(`event:${event}`);
      });

      console.log(`Client ${socket.id} unsubscribed from events: ${events.join(', ')}`);
    }

    // Send acknowledgment
    socket.emit('unsubscription_confirmed', {
      symbols,
      events,
      timestamp: new Date(),
    });
  }

  /**
   * Start broadcasting market data updates
   */
  private startMarketDataBroadcast(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      await this.broadcastMarketUpdates();
    }, this.UPDATE_INTERVAL);

    console.log(`Market data broadcast started (${this.UPDATE_INTERVAL}ms interval)`);
  }

  /**
   * Broadcast market updates to subscribed clients
   */
  private async broadcastMarketUpdates(): Promise<void> {
    if (!this.io || this.subscribedSymbols.size === 0) return;

    try {
      // Fetch quotes for all subscribed symbols
      const symbols = Array.from(this.subscribedSymbols);
      const quotes = await this.marketService.getQuotes(symbols);

      // Broadcast to each symbol room
      for (const [symbol, quote] of quotes) {
        const message: WebSocketMessage<MarketUpdateMessage> = {
          event: 'market_update',
          data: {
            quotes: [quote],
            timestamp: new Date(),
          },
          timestamp: new Date(),
        };

        this.io.to(`symbol:${symbol}`).emit('market_update', message);
      }
    } catch (error) {
      console.error('Error broadcasting market updates:', error);
    }
  }

  /**
   * Broadcast strategy signals
   */
  async broadcastStrategySignals(symbol: string): Promise<void> {
    if (!this.io) return;

    try {
      const historicalData = await this.marketService.getHistoricalData(symbol);
      if (!historicalData) return;

      const consensus = this.strategyEngine.analyzeWithConsensus(symbol, historicalData);

      const message: WebSocketMessage<StrategySignalMessage> = {
        event: 'strategy_signal',
        data: {
          signals: consensus.strategies,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      };

      this.io.to(`symbol:${symbol}`).emit('strategy_signal', message);
      this.io.to('event:strategy_signal').emit('strategy_signal', message);
    } catch (error) {
      console.error('Error broadcasting strategy signals:', error);
    }
  }

  /**
   * Broadcast system alert
   */
  broadcastSystemAlert(level: 'info' | 'warning' | 'error', message: string): void {
    if (!this.io) return;

    this.io.emit('system_alert', {
      event: 'system_alert',
      data: {
        level,
        message,
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    if (!this.io) {
      return {
        connected: 0,
        subscribedSymbols: 0,
        rooms: 0,
      };
    }

    return {
      connected: this.io.engine.clientsCount,
      subscribedSymbols: this.subscribedSymbols.size,
      rooms: this.io.sockets.adapter.rooms.size,
    };
  }

  /**
   * Stop the WebSocket service
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.io) {
      this.io.close();
      this.io = null;
    }

    console.log('WebSocket server stopped');
  }
}
