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
    PublicKey
} from '../types/did.types';

export class DIDService {
    private didRegistry: Map<string, DIDState> = new Map();

    /**
     * Creates a new DID:ION identifier and document
     */
    public async createDID(request: DIDCreateRequest): Promise<DIDCreateResponse> {
        try {
            // Generate a unique suffix for the DID
            const didSuffix = this.generateDIDSuffix();
            const did = `did:ion:${didSuffix}`;

            // Create the DID document
            const document = this.createDIDDocument(did, request);

            // Store the DID state
            const didState: DIDState = {
                did,
                document,
                created: new Date().toISOString(),
                deactivated: false
            };

            this.didRegistry.set(did, didState);

            return {
                did,
                document,
                created: didState.created
            };
        } catch (error) {
            throw new Error(`Failed to create DID: ${error}`);
        }
    }

    /**
     * Resolves a DID to its document
     */
    public async resolveDID(did: string): Promise<DIDResolveResponse> {
        const didState = this.didRegistry.get(did);

        if (!didState) {
            throw new Error(`DID not found: ${did}`);
        }

        if (didState.deactivated) {
            throw new Error(`DID has been deactivated: ${did}`);
        }

        return {
            didDocument: didState.document,
            didDocumentMetadata: {
                created: didState.created,
                updated: didState.updated,
                deactivated: didState.deactivated
            },
            didResolutionMetadata: {
                contentType: 'application/did+ld+json'
            }
        };
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
            const keyId = request.keyId || didState.document.verificationMethod[0]?.id;
            const verificationMethod = didState.document.verificationMethod.find(
                key => key.id === keyId
            );

            if (!verificationMethod) {
                return {
                    verified: false,
                    error: `Verification method not found: ${keyId}`
                };
            }

            // Verify the signature based on key type
            const verified = this.performSignatureVerification(
                request.data,
                request.signature,
                verificationMethod
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
     * Gets all DIDs in the registry (for testing purposes)
     */
    public getAllDIDs(): DIDState[] {
        return Array.from(this.didRegistry.values());
    }

    /**
     * Deactivates a DID
     */
    public async deactivateDID(did: string): Promise<void> {
        const didState = this.didRegistry.get(did);

        if (!didState) {
            throw new Error(`DID not found: ${did}`);
        }

        didState.deactivated = true;
        didState.updated = new Date().toISOString();
        this.didRegistry.set(did, didState);
    }

    private generateDIDSuffix(): string {
        // Generate a random suffix that looks like ION network suffixes
        // Using a simpler approach for the mock service
        const bytes = randomBytes(32);
        return bytes.toString('base64url').replace(/=/g, '');
    } private createDIDDocument(did: string, request: DIDCreateRequest): DIDDocument {
        const keyId = `${did}#key-1`;

        // Create verification method based on the provided public key
        const verificationMethod: PublicKey = {
            id: keyId,
            type: this.getKeyType(request.keyType || 'Ed25519'),
            controller: did,
            publicKeyBase58: request.publicKey
        };

        return {
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
    }

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

    private performSignatureVerification(
        data: string,
        signature: string,
        verificationMethod: PublicKey
    ): boolean {
        try {
            // This is a mock implementation for the prototype
            // In a real implementation, this would perform actual cryptographic verification

            // For the mock, we'll do a simple validation:
            // 1. Check that signature is not empty
            // 2. Check that data is not empty
            // 3. Simulate verification based on key type

            if (!signature || !data) {
                return false;
            }

            // Mock verification logic based on key type
            const keyType = verificationMethod.type;

            switch (keyType) {
                case 'Ed25519VerificationKey2020':
                    // Simulate Ed25519 verification
                    return signature.length >= 64; // Ed25519 signatures are 64 bytes

                case 'RsaVerificationKey2018':
                    // Simulate RSA verification
                    return signature.length >= 256; // RSA signatures are typically 256+ bytes

                case 'EcdsaSecp256k1VerificationKey2019':
                    // Simulate secp256k1 verification
                    return signature.length >= 64; // secp256k1 signatures are 64 bytes

                default:
                    return false;
            }
        } catch (error) {
            return false;
        }
    }
}
