/**
 * High-performance in-memory cache with LRU eviction
 * Provides multi-tier caching with intelligent memory management
 */

import { CacheEntry, MemoryMetrics } from '@/types/market';

export class MemoryStore<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private maxMemoryBytes: number;
  private hits: number = 0;
  private misses: number = 0;
  private lastCleanup: Date;
  private readonly MEMORY_ALERT_THRESHOLD = 0.8; // 80%

  constructor(maxSize: number = 1000, maxMemoryMB: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.maxMemoryBytes = maxMemoryMB * 1024 * 1024;
    this.lastCleanup = new Date();
    
    // Schedule periodic cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Set a value in the cache with TTL
   */
  set(key: string, value: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      accessCount: 0,
      ttl,
    };

    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.checkMemoryUsage();
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access count for LRU tracking
    entry.accessCount++;
    this.hits++;
    return entry.data;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
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
   * Evict least recently used entries
   */
  private evictLRU(): void {
    // Find entry with lowest access count
    let minAccessCount = Infinity;
    let lruKey: string | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      console.log(`[MemoryStore] Evicted LRU entry: ${lruKey}`);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    this.lastCleanup = new Date();
    if (removedCount > 0) {
      console.log(`[MemoryStore] Cleaned up ${removedCount} expired entries`);
    }
  }

  /**
   * Check memory usage and alert if threshold exceeded
   */
  private checkMemoryUsage(): void {
    const usage = this.getMemoryUsage();
    
    if (usage.memoryUsagePercent >= this.MEMORY_ALERT_THRESHOLD) {
      console.warn(
        `[MemoryStore] Memory usage at ${(usage.memoryUsagePercent * 100).toFixed(1)}% - ` +
        `consider evicting entries or increasing memory limit`
      );
      
      // Force cleanup of expired entries
      this.cleanup();
      
      // If still over threshold, evict 10% of entries
      if (this.getMemoryUsagePercent() >= this.MEMORY_ALERT_THRESHOLD) {
        const entriesToEvict = Math.ceil(this.cache.size * 0.1);
        for (let i = 0; i < entriesToEvict; i++) {
          this.evictLRU();
        }
      }
    }
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsage(): MemoryMetrics {
    const memoryUsageBytes = this.estimateMemoryUsage();
    
    return {
      totalEntries: this.cache.size,
      quoteCacheSize: this.cache.size, // Override in specific implementations
      historicalCacheSize: 0,
      memoryUsageBytes,
      memoryUsagePercent: memoryUsageBytes / this.maxMemoryBytes,
      maxMemoryBytes: this.maxMemoryBytes,
      cacheHitRate: this.hits / (this.hits + this.misses) || 0,
      lastCleanup: this.lastCleanup,
    };
  }

  /**
   * Get memory usage percentage
   */
  private getMemoryUsagePercent(): number {
    return this.estimateMemoryUsage() / this.maxMemoryBytes;
  }

  /**
   * Estimate memory usage (approximate)
   */
  private estimateMemoryUsage(): number {
    // Rough estimation: assume each entry takes ~1KB on average
    return this.cache.size * 1024;
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }
}
