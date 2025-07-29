import { DIDResolveResponse } from '../types/did.types';

/**
 * Simple cache implementation for DID documents to improve performance
 */
export class CacheService {
    private cache: Map<string, CacheEntry> = new Map();
    private readonly defaultTTL: number = 3600000; // 1 hour in milliseconds

    /**
     * Store a DID document in the cache
     */
    public set(did: string, document: DIDResolveResponse, ttl: number = this.defaultTTL): void {
        const expiryTime = Date.now() + ttl;
        this.cache.set(did, {
            data: document,
            expiry: expiryTime
        });
    }

    /**
     * Retrieve a DID document from the cache
     */
    public get(did: string): DIDResolveResponse | null {
        const entry = this.cache.get(did);

        if (!entry) {
            return null;
        }

        // Check if the cache entry has expired
        if (Date.now() > entry.expiry) {
            this.cache.delete(did);
            return null;
        }

        return entry.data;
    }

    /**
     * Remove a DID document from the cache
     */
    public invalidate(did: string): void {
        this.cache.delete(did);
    }

    /**
     * Remove all entries from the cache
     */
    public clear(): void {
        this.cache.clear();
    }

    /**
     * Get the size of the cache
     */
    public size(): number {
        return this.cache.size;
    }

    /**
     * Clean expired entries from the cache
     */
    public cleanExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
            }
        }
    }
}

interface CacheEntry {
    data: DIDResolveResponse;
    expiry: number;
}
