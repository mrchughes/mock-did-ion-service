export interface PublicKey {
    id: string;
    type: string;
    controller: string;
    publicKeyJwk?: any;
    publicKeyBase58?: string;
}
export interface Service {
    id: string;
    type: string;
    serviceEndpoint: string;
}
export interface DIDDocument {
    '@context': string | string[];
    id: string;
    verificationMethod: PublicKey[];
    authentication: string[];
    assertionMethod: string[];
    keyAgreement?: string[];
    capabilityInvocation?: string[];
    capabilityDelegation?: string[];
    service?: Service[];
}
export interface DIDCreateRequest {
    publicKey: string;
    keyType?: 'Ed25519' | 'RSA' | 'secp256k1';
}
export interface DIDCreateResponse {
    did: string;
    document: DIDDocument;
    created: string;
}
export interface DIDResolveResponse {
    didDocument: DIDDocument;
    didDocumentMetadata: {
        created: string;
        updated?: string;
        deactivated?: boolean;
    };
    didResolutionMetadata: {
        contentType: string;
    };
}
export interface VerifyRequest {
    did: string;
    data: string;
    signature: string;
    keyId?: string;
}
export interface VerifyResponse {
    verified: boolean;
    error?: string;
}
export interface DIDState {
    did: string;
    document: DIDDocument;
    created: string;
    updated?: string;
    deactivated: boolean;
}
//# sourceMappingURL=did.types.d.ts.map