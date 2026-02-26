import { Injectable } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTtl = 300000; // 5 minutes in milliseconds

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiresAt = Date.now() + (ttl || this.defaultTtl);
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async reset(): Promise<void> {
    this.cache.clear();
  }

  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  // Clean up expired entries periodically
  startCleanup(intervalMs: number = 60000): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, intervalMs);
  }
}

