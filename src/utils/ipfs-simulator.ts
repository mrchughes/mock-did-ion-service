import crypto from 'crypto';

/**
 * Simulates basic IPFS functionality for the mock service
 */
export class IPFSSimulator {
    private contentStore: Map<string, any> = new Map();

    /**
     * Add content to the simulated IPFS network and return a CID
     */
    public async add(content: any): Promise<string> {
        // Generate a CID that resembles an actual IPFS CID (v1)
        const contentString = typeof content === 'string' ? content : JSON.stringify(content);
        const hash = crypto.createHash('sha256').update(contentString).digest('hex');

        // Create a CID-like string (simplified version)
        const cid = `bafybeih${hash.substring(0, 38)}`;

        // Store the content
        this.contentStore.set(cid, content);

        // Simulate network delay
        await this.simulateNetworkDelay();

        return cid;
    }

    /**
     * Get content from the simulated IPFS network using its CID
     */
    public async get(cid: string): Promise<any> {
        // Simulate network delay
        await this.simulateNetworkDelay();

        // Check if content exists
        if (!this.contentStore.has(cid)) {
            throw new Error(`Content with CID ${cid} not found`);
        }

        return this.contentStore.get(cid);
    }

    /**
     * Pin content to keep it persistently available
     */
    public async pin(cid: string): Promise<boolean> {
        // Simulate network delay
        await this.simulateNetworkDelay();

        // Check if content exists
        if (!this.contentStore.has(cid)) {
            throw new Error(`Content with CID ${cid} not found`);
        }

        // In a real implementation, this would mark the content as pinned
        // For this mock, we just return success
        return true;
    }

    /**
     * Simulate various network conditions
     */
    private async simulateNetworkDelay(): Promise<void> {
        // Random delay between 100ms and 1000ms
        const delay = Math.floor(Math.random() * 900) + 100;

        // Occasionally simulate network errors (1% chance)
        const shouldError = Math.random() < 0.01;

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                if (shouldError) {
                    reject(new Error('Network error'));
                } else {
                    resolve(undefined);
                }
            }, delay);
        });
    }

    /**
     * Get the number of items in the store
     */
    public size(): number {
        return this.contentStore.size;
    }

    /**
     * Clear all content from the store
     */
    public clear(): void {
        this.contentStore.clear();
    }
}
