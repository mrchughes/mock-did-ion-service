export interface JsonWebKey {
    kty: string;
    crv?: string;
    x?: string;
    y?: string;
    n?: string;
    e?: string;
    kid?: string;
    alg?: string;
    [key: string]: any;
}

export interface PublicKey {
    id: string;
    type: string;
    controller: string;
    publicKeyJwk?: JsonWebKey;
    publicKeyBase58?: string;
}

export interface Service {
    id: string;
    type: string;
    serviceEndpoint: string;
    description?: string;
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
    service?: Service[];
    signature?: string;
}

export interface DIDUpdateRequest {
    did: string;
    publicKey?: string;
    keyType?: 'Ed25519' | 'RSA' | 'secp256k1';
    addServices?: Service[];
    removeServices?: string[];
    signature: string;
}

export interface DIDRecoverRequest {
    did: string;
    publicKey: string;
    keyType?: 'Ed25519' | 'RSA' | 'secp256k1';
    service?: Service[];
    signature: string;
}

export interface DIDDeactivateRequest {
    did: string;
    signature: string;
}

export interface DIDCreateResponse {
    did: string;
    document: DIDDocument;
    created: string;
    transactionId?: string;
}

export interface DIDUpdateResponse {
    did: string;
    document: DIDDocument;
    updated: string;
    transactionId?: string;
}

export interface DIDRecoverResponse {
    did: string;
    document: DIDDocument;
    recovered: string;
    transactionId?: string;
}

export interface DIDDeactivateResponse {
    did: string;
    deactivated: string;
    transactionId?: string;
}

export interface DIDResolveResponse {
    didDocument: DIDDocument;
    didDocumentMetadata: {
        created: string;
        updated?: string;
        recovered?: string;
        deactivated?: boolean;
        method?: {
            published: boolean;
            recoveryCommitment?: string;
            updateCommitment?: string;
        };
    };
    didResolutionMetadata: {
        contentType: string;
        error?: string;
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
    recovered?: string;
    deactivated: boolean;
    method?: {
        published: boolean;
        recoveryCommitment?: string;
        updateCommitment?: string;
    };
    transactions?: string[];
}

export enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    RECOVER = 'recover',
    DEACTIVATE = 'deactivate'
}

export interface Operation {
    type: OperationType;
    did?: string;
    content: any;
    signature?: string;
    timestamp: string;
    transactionId?: string;
}

export interface OperationResult {
    success: boolean;
    did: string;
    transactionId?: string;
    error?: string;
}
