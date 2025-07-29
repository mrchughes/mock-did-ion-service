import crypto from 'crypto';

/**
 * Simulates the anchoring functionality of ION
 */
export class AnchoringService {
    private transactions: Map<string, AnchorTransaction> = new Map();
    private batches: Map<string, string[]> = new Map();
    private readonly batchSize = 10;
    private pendingOperations: string[] = [];
    private batchProcessingInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Start the batch processing
        this.startBatchProcessing();
    }

    /**
     * Queue an operation for anchoring
     */
    public queueOperation(operationHash: string): string {
        // Generate a transaction ID
        const transactionId = this.generateTransactionId();

        // Create the transaction record
        const transaction: AnchorTransaction = {
            id: transactionId,
            operationHash,
            status: 'pending',
            timestamp: new Date().toISOString(),
            batchId: null
        };

        // Store the transaction
        this.transactions.set(transactionId, transaction);

        // Add to pending operations
        this.pendingOperations.push(transactionId);

        return transactionId;
    }

    /**
     * Get the status of a transaction
     */
    public getTransactionStatus(transactionId: string): AnchorTransaction | null {
        return this.transactions.get(transactionId) || null;
    }

    /**
     * Start the batch processing interval
     */
    private startBatchProcessing(): void {
        if (this.batchProcessingInterval) {
            clearInterval(this.batchProcessingInterval);
        }

        // Process batches every 30 seconds
        this.batchProcessingInterval = setInterval(() => {
            this.processBatch();
        }, 30000);
    }

    /**
     * Process a batch of operations
     */
    private async processBatch(): Promise<void> {
        // Check if there are enough operations for a batch
        if (this.pendingOperations.length === 0) {
            return;
        }

        // Take up to batchSize operations
        const batchOperations = this.pendingOperations.splice(0, this.batchSize);

        // Generate a batch ID
        const batchId = this.generateBatchId();

        // Store the batch
        this.batches.set(batchId, batchOperations);

        // Update transaction statuses to 'batched'
        for (const txId of batchOperations) {
            const transaction = this.transactions.get(txId);
            if (transaction) {
                transaction.status = 'batched';
                transaction.batchId = batchId;
                this.transactions.set(txId, transaction);
            }
        }

        // Simulate consensus delay (5-15 seconds)
        const consensusDelay = Math.floor(Math.random() * 10000) + 5000;

        // After delay, simulate the anchoring
        setTimeout(() => {
            this.simulateAnchoring(batchId);
        }, consensusDelay);
    }

    /**
     * Simulate the anchoring process
     */
    private simulateAnchoring(batchId: string): void {
        const batchOperations = this.batches.get(batchId);

        if (!batchOperations) {
            return;
        }

        // Update transaction statuses to 'anchored'
        for (const txId of batchOperations) {
            const transaction = this.transactions.get(txId);
            if (transaction) {
                transaction.status = 'anchored';
                transaction.anchoredAt = new Date().toISOString();
                this.transactions.set(txId, transaction);
            }
        }
    }

    /**
     * Generate a unique transaction ID
     */
    private generateTransactionId(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Generate a unique batch ID
     */
    private generateBatchId(): string {
        return `batch-${crypto.randomBytes(8).toString('hex')}`;
    }

    /**
     * Clean up resources when shutting down
     */
    public shutdown(): void {
        if (this.batchProcessingInterval) {
            clearInterval(this.batchProcessingInterval);
            this.batchProcessingInterval = null;
        }
    }
}

export interface AnchorTransaction {
    id: string;
    operationHash: string;
    status: 'pending' | 'batched' | 'anchored' | 'failed';
    timestamp: string;
    batchId: string | null;
    anchoredAt?: string;
    error?: string;
}
