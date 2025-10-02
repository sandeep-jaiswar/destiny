/**
 * High-Performance In-Memory Store
 * LRU cache implementation for market data
 */

import { CacheEntry, CacheConfig, MemoryStats } from '../types/storage';

export class MemoryStore<T> {
  private cache: Map<string, CacheEntry<T>>;
  private accessOrder: string[]; // For LRU tracking
  private config: CacheConfig;
  private stats: MemoryStats;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.accessOrder = [];
    this.config = {
      maxSize: config.maxSize || 1000,
      ttl: config.ttl || 5 * 60 * 1000, // 5 minutes default
      evictionPolicy: config.evictionPolicy || 'LRU',
    };
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      maxSize: this.config.maxSize,
      utilizationPercent: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      evictions: 0,
    };
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.cacheMisses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    const now = new Date();
    const age = now.getTime() - entry.timestamp.getTime();
    if (age > entry.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.stats.cacheMisses++;
      this.updateHitRate();
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = now;
    this.updateAccessOrder(key);

    this.stats.cacheHits++;
    this.updateHitRate();

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    // Check if we need to evict
    if (!this.cache.has(key) && this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: new Date(),
      accessCount: 1,
      lastAccessed: new Date(),
      ttl: ttl || this.config.ttl,
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
    this.updateStats();
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
      this.updateStats();
    }
    return deleted;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    const now = new Date();
    const age = now.getTime() - entry.timestamp.getTime();
    if (age > entry.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.updateStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): MemoryStats {
    return { ...this.stats };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now.getTime() - entry.timestamp.getTime();
      if (age > entry.ttl) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        cleanedCount++;
      }
    }

    this.updateStats();
    return cleanedCount;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Evict least recently used entry (LRU)
   */
  private evict(): void {
    if (this.accessOrder.length === 0) return;

    const keyToEvict = this.accessOrder[0];
    this.cache.delete(keyToEvict);
    this.removeFromAccessOrder(keyToEvict);
    this.stats.evictions++;
    this.updateStats();
  }

  /**
   * Update access order for LRU tracking
   */
  private updateAccessOrder(key: string): void {
    // Remove key from current position
    this.removeFromAccessOrder(key);
    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order tracking
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.totalEntries = this.cache.size;
    this.stats.totalSize = this.cache.size;
    this.stats.utilizationPercent = (this.cache.size / this.config.maxSize) * 100;
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.cacheHits + this.stats.cacheMisses;
    this.stats.hitRate = total > 0 ? (this.stats.cacheHits / total) * 100 : 0;
  }
}
