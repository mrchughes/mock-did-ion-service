"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIDService = void 0;
const crypto_1 = require("crypto");
class DIDService {
    constructor() {
        this.didRegistry = new Map();
    }
    async createDID(request) {
        try {
            const didSuffix = this.generateDIDSuffix();
            const did = `did:ion:${didSuffix}`;
            const document = this.createDIDDocument(did, request);
            const didState = {
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
        }
        catch (error) {
            throw new Error(`Failed to create DID: ${error}`);
        }
    }
    async resolveDID(did) {
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
    async verifySignature(request) {
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
            const keyId = request.keyId || didState.document.verificationMethod[0]?.id;
            const verificationMethod = didState.document.verificationMethod.find(key => key.id === keyId);
            if (!verificationMethod) {
                return {
                    verified: false,
                    error: `Verification method not found: ${keyId}`
                };
            }
            const verified = this.performSignatureVerification(request.data, request.signature, verificationMethod);
            return { verified };
        }
        catch (error) {
            return {
                verified: false,
                error: `Verification failed: ${error}`
            };
        }
    }
    getAllDIDs() {
        return Array.from(this.didRegistry.values());
    }
    async deactivateDID(did) {
        const didState = this.didRegistry.get(did);
        if (!didState) {
            throw new Error(`DID not found: ${did}`);
        }
        didState.deactivated = true;
        didState.updated = new Date().toISOString();
        this.didRegistry.set(did, didState);
    }
    generateDIDSuffix() {
        const bytes = (0, crypto_1.randomBytes)(32);
        return bytes.toString('base64url').replace(/=/g, '');
    }
    createDIDDocument(did, request) {
        const keyId = `${did}#key-1`;
        const verificationMethod = {
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
    getKeyType(keyType) {
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
    performSignatureVerification(data, signature, verificationMethod) {
        try {
            if (!signature || !data) {
                return false;
            }
            const keyType = verificationMethod.type;
            switch (keyType) {
                case 'Ed25519VerificationKey2020':
                    return signature.length >= 64;
                case 'RsaVerificationKey2018':
                    return signature.length >= 256;
                case 'EcdsaSecp256k1VerificationKey2019':
                    return signature.length >= 64;
                default:
                    return false;
            }
        }
        catch (error) {
            return false;
        }
    }
}
exports.DIDService = DIDService;
//# sourceMappingURL=did.service.js.map