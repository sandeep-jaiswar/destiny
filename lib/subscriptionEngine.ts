/**
 * Subscription Engine for Real-time Market Data
 * Publisher-Subscriber pattern for efficient data distribution
 */

import { EventEmitter } from 'events';
import { MarketQuote, HistoricalData, Subscription, SubscriptionCallback } from '@/types/market';
import { MarketDataService } from './marketDataService';

export class SubscriptionEngine extends EventEmitter {
  private static instance: SubscriptionEngine;
  private subscriptions: Map<string, Set<string>>; // symbol -> Set of subscription IDs
  private callbacks: Map<string, SubscriptionCallback<MarketQuote | HistoricalData[]>>; // subscription ID -> callback
  private updateIntervals: Map<string, NodeJS.Timeout>; // symbol -> interval
  private marketService: MarketDataService;

  private readonly UPDATE_INTERVAL = 5000; // 5 seconds

  private constructor() {
    super();
    this.subscriptions = new Map();
    this.callbacks = new Map();
    this.updateIntervals = new Map();
    this.marketService = MarketDataService.getInstance();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SubscriptionEngine {
    if (!SubscriptionEngine.instance) {
      SubscriptionEngine.instance = new SubscriptionEngine();
    }
    return SubscriptionEngine.instance;
  }

  /**
   * Subscribe to quote updates for a symbol
   */
  subscribeToQuote(
    symbol: string,
    callback: SubscriptionCallback<MarketQuote>
  ): Subscription {
    const subscriptionId = this.generateSubscriptionId(symbol, 'quote');
    
    // Store callback
    this.callbacks.set(subscriptionId, callback);
    
    // Add to subscriptions
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, new Set());
    }
    this.subscriptions.get(symbol)!.add(subscriptionId);

    // Start update interval if not already running
    if (!this.updateIntervals.has(symbol)) {
      this.startQuoteUpdates(symbol);
    }

    console.log(`[SubscriptionEngine] New quote subscription: ${subscriptionId}`);

    return {
      id: subscriptionId,
      symbol,
      type: 'quote',
      createdAt: new Date(),
    };
  }

  /**
   * Subscribe to historical data updates for a symbol
   */
  subscribeToHistorical(
    symbol: string,
    callback: SubscriptionCallback<HistoricalData[]>
  ): Subscription {
    const subscriptionId = this.generateSubscriptionId(symbol, 'historical');
    
    // Store callback
    this.callbacks.set(subscriptionId, callback);
    
    // Add to subscriptions
    if (!this.subscriptions.has(`${symbol}:historical`)) {
      this.subscriptions.set(`${symbol}:historical`, new Set());
    }
    this.subscriptions.get(`${symbol}:historical`)!.add(subscriptionId);

    console.log(`[SubscriptionEngine] New historical subscription: ${subscriptionId}`);

    return {
      id: subscriptionId,
      symbol,
      type: 'historical',
      createdAt: new Date(),
    };
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriptionId: string): boolean {
    // Find and remove from subscriptions
    let removed = false;
    
    for (const [key, subs] of this.subscriptions.entries()) {
      if (subs.has(subscriptionId)) {
        subs.delete(subscriptionId);
        removed = true;
        
        // If no more subscriptions for this symbol, stop updates
        if (subs.size === 0) {
          this.subscriptions.delete(key);
          
          // Extract symbol from key
          const extractedSymbol = key.includes(':') ? key.split(':')[0] : key;
          
          // Stop updates if no more subscriptions
          if (!this.hasActiveSubscriptions(extractedSymbol)) {
            this.stopUpdates(extractedSymbol);
          }
        }
        break;
      }
    }

    // Remove callback
    if (removed) {
      this.callbacks.delete(subscriptionId);
      console.log(`[SubscriptionEngine] Unsubscribed: ${subscriptionId}`);
    }

    return removed;
  }

  /**
   * Get all active subscriptions for a symbol
   */
  getSubscriptions(symbol: string): Subscription[] {
    const subs: Subscription[] = [];
    
    for (const [key, subIds] of this.subscriptions.entries()) {
      if (key === symbol || key.startsWith(`${symbol}:`)) {
        for (const subId of subIds) {
          const parts = subId.split(':');
          subs.push({
            id: subId,
            symbol: parts[0],
            type: parts[1] as 'quote' | 'historical',
            createdAt: new Date(), // Would need to track this separately
          });
        }
      }
    }
    
    return subs;
  }

  /**
   * Get total number of active subscriptions
   */
  getTotalSubscriptions(): number {
    return this.callbacks.size;
  }

  /**
   * Clear all subscriptions
   */
  clearAll(): void {
    // Stop all update intervals
    for (const interval of this.updateIntervals.values()) {
      clearInterval(interval);
    }
    
    this.subscriptions.clear();
    this.callbacks.clear();
    this.updateIntervals.clear();
    
    console.log('[SubscriptionEngine] All subscriptions cleared');
  }

  /**
   * Start quote updates for a symbol
   */
  private startQuoteUpdates(symbol: string): void {
    const interval = setInterval(async () => {
      try {
        const response = await this.marketService.getQuote(symbol);
        
        if (response.success && response.data) {
          // Notify all subscribers
          this.notifySubscribers(symbol, response.data);
          
          // Emit event
          this.emit('quote-update', { symbol, quote: response.data });
        }
      } catch (error) {
        console.error(`[SubscriptionEngine] Error updating ${symbol}:`, error);
      }
    }, this.UPDATE_INTERVAL);

    this.updateIntervals.set(symbol, interval);
    console.log(`[SubscriptionEngine] Started updates for ${symbol}`);
  }

  /**
   * Stop updates for a symbol
   */
  private stopUpdates(symbol: string): void {
    const interval = this.updateIntervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(symbol);
      console.log(`[SubscriptionEngine] Stopped updates for ${symbol}`);
    }
  }

  /**
   * Check if symbol has active subscriptions
   */
  private hasActiveSubscriptions(symbol: string): boolean {
    return this.subscriptions.has(symbol) || 
           this.subscriptions.has(`${symbol}:historical`);
  }

  /**
   * Notify all subscribers for a symbol
   */
  private notifySubscribers(symbol: string, data: MarketQuote | HistoricalData[]): void {
    const subs = this.subscriptions.get(symbol);
    if (!subs) return;

    for (const subId of subs) {
      const callback = this.callbacks.get(subId);
      if (callback) {
        try {
          callback(data);
        } catch (error) {
          console.error(`[SubscriptionEngine] Error in callback ${subId}:`, error);
        }
      }
    }
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(symbol: string, type: 'quote' | 'historical'): string {
    return `${symbol}:${type}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
  }
}
