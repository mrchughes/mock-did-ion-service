import { DIDCreateRequest, DIDCreateResponse, DIDResolveResponse, DIDState, VerifyRequest, VerifyResponse } from '../types/did.types';
export declare class DIDService {
    private didRegistry;
    createDID(request: DIDCreateRequest): Promise<DIDCreateResponse>;
    resolveDID(did: string): Promise<DIDResolveResponse>;
    verifySignature(request: VerifyRequest): Promise<VerifyResponse>;
    getAllDIDs(): DIDState[];
    deactivateDID(did: string): Promise<void>;
    private generateDIDSuffix;
    private createDIDDocument;
    private getKeyType;
    private performSignatureVerification;
}
//# sourceMappingURL=did.service.d.ts.map