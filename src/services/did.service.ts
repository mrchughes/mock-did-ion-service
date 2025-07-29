import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
    DIDDocument,
    DIDCreateRequest,
    DIDCreateResponse,
    DIDResolveResponse,
    DIDState,
    VerifyRequest,
    VerifyResponse,
    PublicKey,
    DIDUpdateRequest,
    DIDUpdateResponse,
    DIDRecoverRequest,
    DIDRecoverResponse,
    DIDDeactivateRequest,
    DIDDeactivateResponse,
    OperationType,
    Operation,
    OperationResult,
    Service
} from '../types/did.types';
import { KeyUtils } from '../utils/key-utils';
import { CacheService } from '../utils/cache';
import { IPFSSimulator } from '../utils/ipfs-simulator';
import { AnchoringService } from '../utils/anchoring-service';
import crypto from 'crypto';

export class DIDService {
    private didRegistry: Map<string, DIDState> = new Map();
    private operations: Operation[] = [];
    private cacheService: CacheService;
    private ipfsSimulator: IPFSSimulator;
    private anchoringService: AnchoringService;

    constructor() {
        this.cacheService = new CacheService();
        this.ipfsSimulator = new IPFSSimulator();
        this.anchoringService = new AnchoringService();
    }

    /**
     * Creates a new DID:ION identifier and document
     */
    public async createDID(request: DIDCreateRequest): Promise<DIDCreateResponse> {
        try {
            // Validate the public key
            if (!this.validatePublicKey(request.publicKey, request.keyType || 'Ed25519')) {
                throw new Error('Invalid public key for the specified key type');
            }

            // Generate a unique suffix for the DID
            const didSuffix = this.generateDIDSuffix();
            const did = `did:ion:${didSuffix}`;

            // Create the DID document
            const document = this.createDIDDocument(did, request);

            // If signature is provided, verify it
            if (request.signature) {
                const keyId = `${did}#key-1`;
                const verificationMethod = document.verificationMethod.find(key => key.id === keyId);

                if (!verificationMethod) {
                    throw new Error('Verification method not found');
                }

                // Verify the signature
                const dataToVerify = JSON.stringify({ did, publicKey: request.publicKey });
                const isSignatureValid = KeyUtils.verifySignature(
                    dataToVerify,
                    request.signature,
                    request.publicKey,
                    this.getKeyType(request.keyType || 'Ed25519')
                );

                if (!isSignatureValid) {
                    throw new Error('Invalid signature for create operation');
                }
            }

            // Generate recovery and update commitments
            const recoveryCommitment = this.generateCommitment();
            const updateCommitment = this.generateCommitment();

            // Store the DID state
            const didState: DIDState = {
                did,
                document,
                created: new Date().toISOString(),
                deactivated: false,
                method: {
                    published: true,
                    recoveryCommitment,
                    updateCommitment
                },
                transactions: []
            };

            this.didRegistry.set(did, didState);

            // Create an operation record
            const operation: Operation = {
                type: OperationType.CREATE,
                did,
                content: request,
                timestamp: new Date().toISOString()
            };

            // Queue the operation for anchoring
            const operationHash = this.hashOperation(operation);
            const transactionId = this.anchoringService.queueOperation(operationHash);

            // Add transaction to DID state
            didState.transactions = [transactionId];
            this.didRegistry.set(did, didState);

            // Store the operation
            operation.transactionId = transactionId;
            this.operations.push(operation);

            // Store the DID document in IPFS (simulated)
            this.ipfsSimulator.add(document).catch(() => {
                // Handle IPFS error silently in this mock
            });

            return {
                did,
                document,
                created: didState.created,
                transactionId
            };
        } catch (error) {
            throw new Error(`Failed to create DID: ${error}`);
        }
    }

    /**
     * Updates an existing DID document
     */
    public async updateDID(request: DIDUpdateRequest): Promise<DIDUpdateResponse> {
        try {
            const { did } = request;
            const didState = this.didRegistry.get(did);

            if (!didState) {
                throw new Error(`DID not found: ${did}`);
            }

            if (didState.deactivated) {
                throw new Error(`DID has been deactivated: ${did}`);
            }

            // Verify the signature
            const mainKey = didState.document.verificationMethod[0];

            if (!mainKey || !mainKey.publicKeyBase58) {
                throw new Error('No valid verification method found');
            }

            const dataToVerify = JSON.stringify({
                did,
                publicKey: request.publicKey,
                addServices: request.addServices,
                removeServices: request.removeServices
            });

            const isSignatureValid = KeyUtils.verifySignature(
                dataToVerify,
                request.signature,
                mainKey.publicKeyBase58,
                mainKey.type
            );

            if (!isSignatureValid) {
                throw new Error('Invalid signature for update operation');
            }

            // Update the DID document
            const updatedDocument = { ...didState.document };

            // Update public key if provided
            if (request.publicKey) {
                if (!this.validatePublicKey(request.publicKey, request.keyType || 'Ed25519')) {
                    throw new Error('Invalid public key for the specified key type');
                }

                const keyId = `${did}#key-1`;
                const keyType = this.getKeyType(request.keyType || 'Ed25519');

                updatedDocument.verificationMethod = [
                    {
                        id: keyId,
                        type: keyType,
                        controller: did,
                        publicKeyBase58: request.publicKey
                    }
                ];
            }

            // Add services if provided
            if (request.addServices && request.addServices.length > 0) {
                updatedDocument.service = updatedDocument.service || [];

                for (const service of request.addServices) {
                    // Check if service with same ID already exists
                    const existingServiceIndex = updatedDocument.service.findIndex(s => s.id === service.id);

                    if (existingServiceIndex >= 0) {
                        // Replace existing service
                        updatedDocument.service[existingServiceIndex] = service;
                    } else {
                        // Add new service
                        updatedDocument.service.push(service);
                    }
                }
            }

            // Remove services if specified
            if (request.removeServices && request.removeServices.length > 0) {
                if (updatedDocument.service) {
                    updatedDocument.service = updatedDocument.service.filter(
                        service => !request.removeServices?.includes(service.id)
                    );
                }
            }

            // Generate new update commitment
            const updateCommitment = this.generateCommitment();

            // Update the DID state
            const updatedState: DIDState = {
                ...didState,
                document: updatedDocument,
                updated: new Date().toISOString(),
                method: {
                    ...didState.method,
                    updateCommitment
                }
            };

            // Create an operation record
            const operation: Operation = {
                type: OperationType.UPDATE,
                did,
                content: request,
                signature: request.signature,
                timestamp: new Date().toISOString()
            };

            // Queue the operation for anchoring
            const operationHash = this.hashOperation(operation);
            const transactionId = this.anchoringService.queueOperation(operationHash);

            // Add transaction to DID state
            updatedState.transactions = [...(didState.transactions || []), transactionId];

            // Update the registry
            this.didRegistry.set(did, updatedState);

            // Store the operation
            operation.transactionId = transactionId;
            this.operations.push(operation);

            // Invalidate cache
            this.cacheService.invalidate(did);

            // Store updated document in IPFS (simulated)
            this.ipfsSimulator.add(updatedDocument).catch(() => {
                // Handle IPFS error silently in this mock
            });

            return {
                did,
                document: updatedDocument,
                updated: updatedState.updated || new Date().toISOString(),
                transactionId
            };
        } catch (error) {
            throw new Error(`Failed to update DID: ${error}`);
        }
    }

    /**
     * Recovers a DID using recovery commitment
     */
    public async recoverDID(request: DIDRecoverRequest): Promise<DIDRecoverResponse> {
        try {
            const { did } = request;
            const didState = this.didRegistry.get(did);

            if (!didState) {
                throw new Error(`DID not found: ${did}`);
            }

            if (didState.deactivated) {
                throw new Error(`DID has been deactivated: ${did}`);
            }

            // Validate the public key
            if (!this.validatePublicKey(request.publicKey, request.keyType || 'Ed25519')) {
                throw new Error('Invalid public key for the specified key type');
            }

            // In a real implementation, this would verify against the recovery commitment
            // For this mock, we'll simulate the recovery process

            // Create a new DID document
            const keyId = `${did}#key-1`;
            const keyType = this.getKeyType(request.keyType || 'Ed25519');

            const recoveredDocument: DIDDocument = {
                '@context': [
                    'https://www.w3.org/ns/did/v1',
                    'https://w3id.org/security/suites/ed25519-2020/v1'
                ],
                id: did,
                verificationMethod: [
                    {
                        id: keyId,
                        type: keyType,
                        controller: did,
                        publicKeyBase58: request.publicKey
                    }
                ],
                authentication: [keyId],
                assertionMethod: [keyId],
                keyAgreement: [keyId],
                capabilityInvocation: [keyId],
                capabilityDelegation: [keyId]
            };

            // Add services if provided
            if (request.service && request.service.length > 0) {
                recoveredDocument.service = request.service;
            }

            // Generate new commitments
            const recoveryCommitment = this.generateCommitment();
            const updateCommitment = this.generateCommitment();

            // Update the DID state
            const recoveredState: DIDState = {
                ...didState,
                document: recoveredDocument,
                recovered: new Date().toISOString(),
                method: {
                    published: true,
                    recoveryCommitment,
                    updateCommitment
                }
            };

            // Create an operation record
            const operation: Operation = {
                type: OperationType.RECOVER,
                did,
                content: request,
                signature: request.signature,
                timestamp: new Date().toISOString()
            };

            // Queue the operation for anchoring
            const operationHash = this.hashOperation(operation);
            const transactionId = this.anchoringService.queueOperation(operationHash);

            // Add transaction to DID state
            recoveredState.transactions = [...(didState.transactions || []), transactionId];

            // Update the registry
            this.didRegistry.set(did, recoveredState);

            // Store the operation
            operation.transactionId = transactionId;
            this.operations.push(operation);

            // Invalidate cache
            this.cacheService.invalidate(did);

            // Store recovered document in IPFS (simulated)
            this.ipfsSimulator.add(recoveredDocument).catch(() => {
                // Handle IPFS error silently in this mock
            });

            return {
                did,
                document: recoveredDocument,
                recovered: recoveredState.recovered || new Date().toISOString(),
                transactionId
            };
        } catch (error) {
            throw new Error(`Failed to recover DID: ${error}`);
        }
    }

    /**
     * Deactivates a DID
     */
    public async deactivateDID(request: DIDDeactivateRequest): Promise<DIDDeactivateResponse> {
        try {
            const { did, signature } = request;
            const didState = this.didRegistry.get(did);

            if (!didState) {
                throw new Error(`DID not found: ${did}`);
            }

            if (didState.deactivated) {
                throw new Error(`DID has already been deactivated: ${did}`);
            }

            // Verify the signature
            const mainKey = didState.document.verificationMethod[0];

            if (!mainKey || !mainKey.publicKeyBase58) {
                throw new Error('No valid verification method found');
            }

            const dataToVerify = JSON.stringify({ did, action: 'deactivate' });

            const isSignatureValid = KeyUtils.verifySignature(
                dataToVerify,
                signature,
                mainKey.publicKeyBase58,
                mainKey.type
            );

            if (!isSignatureValid) {
                throw new Error('Invalid signature for deactivate operation');
            }

            // Update the DID state
            const deactivatedState: DIDState = {
                ...didState,
                deactivated: true,
                updated: new Date().toISOString()
            };

            // Create an operation record
            const operation: Operation = {
                type: OperationType.DEACTIVATE,
                did,
                content: { did },
                signature,
                timestamp: new Date().toISOString()
            };

            // Queue the operation for anchoring
            const operationHash = this.hashOperation(operation);
            const transactionId = this.anchoringService.queueOperation(operationHash);

            // Add transaction to DID state
            deactivatedState.transactions = [...(didState.transactions || []), transactionId];

            // Update the registry
            this.didRegistry.set(did, deactivatedState);

            // Store the operation
            operation.transactionId = transactionId;
            this.operations.push(operation);

            // Invalidate cache
            this.cacheService.invalidate(did);

            return {
                did,
                deactivated: deactivatedState.updated || new Date().toISOString(),
                transactionId
            };
        } catch (error) {
            throw new Error(`Failed to deactivate DID: ${error}`);
        }
    }

    /**
     * Resolves a DID to its document
     */
    public async resolveDID(did: string): Promise<DIDResolveResponse> {
        try {
            // Check cache first
            const cachedResult = this.cacheService.get(did);
            if (cachedResult) {
                return cachedResult;
            }

            // If not in local registry, try resolving external DID
            if (!this.didRegistry.has(did)) {
                if (did.startsWith('did:ion:')) {
                    // This is a simulation - in a real scenario, we would try to resolve
                    // from the external ION network
                    throw new Error(`DID not found in local registry: ${did}`);
                } else if (did.startsWith('did:web:') || did.startsWith('did:key:')) {
                    // Simulate resolving other DID methods
                    return this.resolveExternalDID(did);
                } else {
                    throw new Error(`Unsupported DID method: ${did}`);
                }
            }

            const didState = this.didRegistry.get(did);

            if (!didState) {
                throw new Error(`DID not found: ${did}`);
            }

            const result: DIDResolveResponse = {
                didDocument: didState.document,
                didDocumentMetadata: {
                    created: didState.created,
                    updated: didState.updated,
                    recovered: didState.recovered,
                    deactivated: didState.deactivated,
                    method: didState.method
                },
                didResolutionMetadata: {
                    contentType: 'application/did+ld+json'
                }
            };

            // Cache the result
            this.cacheService.set(did, result);

            return result;
        } catch (error) {
            // Return properly formatted error response
            return {
                didDocument: null,
                didDocumentMetadata: {},
                didResolutionMetadata: {
                    contentType: 'application/did+ld+json',
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            } as any;
        }
    }

    /**
     * Verifies a signature against a DID's public key
     */
    public async verifySignature(request: VerifyRequest): Promise<VerifyResponse> {
        try {
            const didState = this.didRegistry.get(request.did);

            if (!didState) {
                return {
                    verified: false,
                    error: `DID not found: ${request.did}`
                };
            }

            if (didState.deactivated) {
                return {
                    verified: false,
                    error: `DID has been deactivated: ${request.did}`
                };
            }

            // Find the verification method to use
            const keyId = request.keyId || `${request.did}#key-1`;
            const verificationMethod = didState.document.verificationMethod.find(
                key => key.id === keyId
            );

            if (!verificationMethod) {
                return {
                    verified: false,
                    error: `Verification method not found: ${keyId}`
                };
            }

            if (!verificationMethod.publicKeyBase58) {
                return {
                    verified: false,
                    error: 'Public key not available in Base58 format'
                };
            }

            // Verify the signature
            const verified = KeyUtils.verifySignature(
                request.data,
                request.signature,
                verificationMethod.publicKeyBase58,
                verificationMethod.type
            );

            return { verified };
        } catch (error) {
            return {
                verified: false,
                error: `Verification failed: ${error}`
            };
        }
    }

    /**
     * Gets transaction status for a DID operation
     */
    public async getTransactionStatus(transactionId: string): Promise<any> {
        return this.anchoringService.getTransactionStatus(transactionId);
    }

    /**
     * Gets all operations for a DID
     */
    public getOperationsForDID(did: string): Operation[] {
        return this.operations.filter(op => op.did === did);
    }

    /**
     * Gets all DIDs in the registry (for testing purposes)
     */
    public getAllDIDs(): DIDState[] {
        return Array.from(this.didRegistry.values());
    }

    /**
     * Simulates resolving an external DID
     */
    private async resolveExternalDID(did: string): Promise<DIDResolveResponse> {
        if (did.startsWith('did:web:')) {
            // Simulate resolving a did:web
            const domainPart = did.substring(8);
            const domain = domainPart.replace(/:/g, '/');

            // Create a simple document for the web DID
            const document: DIDDocument = {
                '@context': ['https://www.w3.org/ns/did/v1'],
                id: did,
                verificationMethod: [
                    {
                        id: `${did}#key-1`,
                        type: 'Ed25519VerificationKey2020',
                        controller: did,
                        publicKeyBase58: this.generateMockPublicKey()
                    }
                ],
                authentication: [`${did}#key-1`],
                assertionMethod: [`${did}#key-1`]
            };

            return {
                didDocument: document,
                didDocumentMetadata: {
                    created: new Date().toISOString()
                },
                didResolutionMetadata: {
                    contentType: 'application/did+ld+json'
                }
            };
        } else if (did.startsWith('did:key:')) {
            // Simulate resolving a did:key
            const publicKeyPart = did.substring(8);

            // Create a document based on the key
            const document: DIDDocument = {
                '@context': ['https://www.w3.org/ns/did/v1'],
                id: did,
                verificationMethod: [
                    {
                        id: `${did}#key-1`,
                        type: 'Ed25519VerificationKey2020',
                        controller: did,
                        publicKeyBase58: publicKeyPart
                    }
                ],
                authentication: [`${did}#key-1`],
                assertionMethod: [`${did}#key-1`]
            };

            return {
                didDocument: document,
                didDocumentMetadata: {
                    created: new Date().toISOString()
                },
                didResolutionMetadata: {
                    contentType: 'application/did+ld+json'
                }
            };
        }

        throw new Error(`Unsupported DID method: ${did}`);
    }

    /**
     * Generates a mock public key for testing
     */
    private generateMockPublicKey(): string {
        return randomBytes(32).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    /**
     * Generates a unique DID suffix for ION
     */
    private generateDIDSuffix(): string {
        // Generate a random suffix that looks like ION network suffixes
        const bytes = randomBytes(32);
        return bytes.toString('base64url').replace(/=/g, '');
    }

    /**
     * Creates a DID document from a create request
     */
    private createDIDDocument(did: string, request: DIDCreateRequest): DIDDocument {
        const keyId = `${did}#key-1`;

        // Create verification method based on the provided public key
        const verificationMethod: PublicKey = {
            id: keyId,
            type: this.getKeyType(request.keyType || 'Ed25519'),
            controller: did,
            publicKeyBase58: request.publicKey
        };

        const document: DIDDocument = {
            '@context': [
                'https://www.w3.org/ns/did/v1',
                'https://w3id.org/security/suites/ed25519-2020/v1'
            ],
            id: did,
            verificationMethod: [verificationMethod],
            authentication: [keyId],
            assertionMethod: [keyId],
            keyAgreement: [keyId],
            capabilityInvocation: [keyId],
            capabilityDelegation: [keyId]
        };

        // Add services if provided
        if (request.service && request.service.length > 0) {
            document.service = request.service;
        }

        return document;
    }

    /**
     * Get the key type string for a given key algorithm
     */
    private getKeyType(keyType: string): string {
        switch (keyType) {
            case 'Ed25519':
                return 'Ed25519VerificationKey2020';
            case 'RSA':
                return 'RsaVerificationKey2018';
            case 'secp256k1':
                return 'EcdsaSecp256k1VerificationKey2019';
            default:
                return 'Ed25519VerificationKey2020';
        }
    }

    /**
     * Validates a public key for a given key type
     */
    private validatePublicKey(publicKey: string, keyType: string): boolean {
        return KeyUtils.validatePublicKey(publicKey, this.getKeyType(keyType));
    }

    /**
     * Generates a commitment hash for recovery/update
     */
    private generateCommitment(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Hashes an operation for anchoring
     */
    private hashOperation(operation: Operation): string {
        const operationString = JSON.stringify(operation);
        return crypto.createHash('sha256').update(operationString).digest('hex');
    }

    /**
     * Cleanup resources when shutting down
     */
    public shutdown(): void {
        this.anchoringService.shutdown();
        this.cacheService.clear();
    }
}
