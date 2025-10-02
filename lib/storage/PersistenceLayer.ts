/**
 * Persistence Layer
 * Backup critical data to MongoDB for recovery
 */

import clientPromise from '../mongodb';
import { MarketQuote, HistoricalData } from '../types/market';
import { PersistenceConfig } from '../types/storage';

export class PersistenceLayer {
  private static instance: PersistenceLayer;
  private config: PersistenceConfig;
  private batchQueue: Map<string, unknown> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;

  private constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = {
      enabled: config.enabled !== false,
      batchSize: config.batchSize || 100,
      batchInterval: config.batchInterval || 60000, // 1 minute
      collection: config.collection || 'market_data_cache',
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<PersistenceConfig>): PersistenceLayer {
    if (!PersistenceLayer.instance) {
      PersistenceLayer.instance = new PersistenceLayer(config);
    }
    return PersistenceLayer.instance;
  }

  /**
   * Save quote to database (batched)
   */
  async saveQuote(quote: MarketQuote): Promise<void> {
    if (!this.config.enabled) return;

    const key = `quote:${quote.symbol}`;
    this.batchQueue.set(key, {
      type: 'quote',
      symbol: quote.symbol,
      data: quote,
      timestamp: new Date(),
    });

    await this.checkBatchSize();
  }

  /**
   * Save historical data to database (batched)
   */
  async saveHistoricalData(data: HistoricalData): Promise<void> {
    if (!this.config.enabled) return;

    const key = `historical:${data.symbol}:${data.period}:${data.interval}`;
    this.batchQueue.set(key, {
      type: 'historical',
      symbol: data.symbol,
      data: data,
      timestamp: new Date(),
    });

    await this.checkBatchSize();
  }

  /**
   * Flush batch queue to database
   */
  async flush(): Promise<number> {
    if (this.batchQueue.size === 0 || !this.config.enabled) {
      return 0;
    }

    try {
      const client = await clientPromise;
      if (!client) {
        console.error('MongoDB client not available');
        return 0;
      }

      const db = client.db();
      const collection = db.collection(this.config.collection);

      const documents = Array.from(this.batchQueue.values());
      
      if (documents.length > 0) {
        const operations = documents.map(doc => ({
          updateOne: {
            filter: { 
              type: (doc as { type: string }).type, 
              symbol: (doc as { symbol: string }).symbol 
            },
            update: { $set: doc as Record<string, unknown> },
            upsert: true,
          },
        }));

        const result = await collection.bulkWrite(operations);
        const savedCount = result.upsertedCount + result.modifiedCount;

        console.log(`Persisted ${savedCount} documents to MongoDB`);

        this.batchQueue.clear();
        return savedCount;
      }

      return 0;
    } catch (error) {
      console.error('Error persisting data to MongoDB:', error);
      return 0;
    }
  }

  /**
   * Load quote from database
   */
  async loadQuote(symbol: string): Promise<MarketQuote | null> {
    if (!this.config.enabled) return null;

    try {
      const client = await clientPromise;
      if (!client) return null;

      const db = client.db();
      const collection = db.collection(this.config.collection);

      const doc = await collection.findOne({
        type: 'quote',
        symbol: symbol,
      }) as { data: MarketQuote } | null;

      return doc?.data || null;
    } catch (error) {
      console.error('Error loading quote from MongoDB:', error);
      return null;
    }
  }

  /**
   * Load historical data from database
   */
  async loadHistoricalData(
    symbol: string,
    period: string,
    interval: string
  ): Promise<HistoricalData | null> {
    if (!this.config.enabled) return null;

    try {
      const client = await clientPromise;
      if (!client) return null;

      const db = client.db();
      const collection = db.collection(this.config.collection);

      const doc = await collection.findOne({
        type: 'historical',
        symbol: symbol,
        'data.period': period,
        'data.interval': interval,
      }) as { data: HistoricalData } | null;

      return doc?.data || null;
    } catch (error) {
      console.error('Error loading historical data from MongoDB:', error);
      return null;
    }
  }

  /**
   * Start automatic batch flushing
   */
  startAutoBatch(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    this.batchTimer = setInterval(async () => {
      await this.flush();
    }, this.config.batchInterval);

    console.log(`Auto-batch persistence started (${this.config.batchInterval}ms interval)`);
  }

  /**
   * Stop automatic batch flushing
   */
  stopAutoBatch(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Check if batch size limit reached and flush if needed
   */
  private async checkBatchSize(): Promise<void> {
    if (this.batchQueue.size >= this.config.batchSize) {
      await this.flush();
    }
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.batchQueue.size;
  }
}
