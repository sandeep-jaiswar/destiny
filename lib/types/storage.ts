/**
 * Storage Type Definitions
 * In-memory and persistent storage types
 */

export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  evictionPolicy: 'LRU' | 'LFU' | 'FIFO';
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: Date;
  accessCount: number;
  lastAccessed: Date;
  ttl: number;
}

export interface MemoryStats {
  totalEntries: number;
  totalSize: number;
  maxSize: number;
  utilizationPercent: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  evictions: number;
}

export interface StorageMetrics {
  memoryUsage: MemoryStats;
  lastCleanup: Date;
  nextCleanup: Date;
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  avgReadTime: number;
  avgWriteTime: number;
  totalReads: number;
  totalWrites: number;
  errors: number;
}

export interface PersistenceConfig {
  enabled: boolean;
  batchSize: number;
  batchInterval: number; // milliseconds
  collection: string;
}
