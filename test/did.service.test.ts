import { DIDService } from '../src/services/did.service';
import { DIDCreateRequest, VerifyRequest } from '../src/types/did.types';

describe('DIDService', () => {
    let didService: DIDService;

    beforeEach(() => {
        didService = new DIDService();
    });

    describe('createDID', () => {
        it('should create a new DID:ION with Ed25519 key', async () => {
            const request: DIDCreateRequest = {
                publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA',
                keyType: 'Ed25519'
            };

            const result = await didService.createDID(request);

            expect(result.did).toMatch(/^did:ion:.+$/);
            expect(result.document.id).toBe(result.did);
            expect(result.document.verificationMethod).toHaveLength(1);
            expect(result.document.verificationMethod[0]?.type).toBe('Ed25519VerificationKey2020');
            expect(result.document.verificationMethod[0]?.publicKeyBase58).toBe(request.publicKey);
            expect(result.created).toBeDefined();
        });

        it('should create a new DID:ION with RSA key', async () => {
            const request: DIDCreateRequest = {
                publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7S',
                keyType: 'RSA'
            };

            const result = await didService.createDID(request);

            expect(result.did).toMatch(/^did:ion:.+$/);
            expect(result.document.verificationMethod[0]?.type).toBe('RsaVerificationKey2018');
        });

        it('should create a new DID:ION with default key type when not specified', async () => {
            const request: DIDCreateRequest = {
                publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA'
            };

            const result = await didService.createDID(request);

            expect(result.document.verificationMethod[0]?.type).toBe('Ed25519VerificationKey2020');
        });

        it('should generate unique DIDs for each creation', async () => {
            const request: DIDCreateRequest = {
                publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA'
            };

            const result1 = await didService.createDID(request);
            const result2 = await didService.createDID(request);

            expect(result1.did).not.toBe(result2.did);
        });
    });

    describe('resolveDID', () => {
        it('should resolve an existing DID', async () => {
            const createRequest: DIDCreateRequest = {
                publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA'
            };

            const created = await didService.createDID(createRequest);
            const resolved = await didService.resolveDID(created.did);

            expect(resolved.didDocument).toEqual(created.document);
            expect(resolved.didDocumentMetadata.created).toBe(created.created);
            expect(resolved.didDocumentMetadata.deactivated).toBe(false);
            expect(resolved.didResolutionMetadata.contentType).toBe('application/did+ld+json');
        });

        it('should throw error for non-existent DID', async () => {
            const nonExistentDID = 'did:ion:EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9Nfk38w5w';

            await expect(didService.resolveDID(nonExistentDID)).rejects.toThrow('DID not found');
        });

        it('should throw error for deactivated DID', async () => {
            const createRequest: DIDCreateRequest = {
                publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA'
            };

            const created = await didService.createDID(createRequest);
            await didService.deactivateDID(created.did);

            await expect(didService.resolveDID(created.did)).rejects.toThrow('DID has been deactivated');
        });
    });

    describe('verifySignature', () => {
        let testDID: string;

        beforeEach(async () => {
            const createRequest: DIDCreateRequest = {
                publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA',
                keyType: 'Ed25519'
            };
            const created = await didService.createDID(createRequest);
            testDID = created.did;
        });

        it('should verify a valid signature', async () => {
            const verifyRequest: VerifyRequest = {
                did: testDID,
                data: 'Hello, World!',
                signature: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            };

            const result = await didService.verifySignature(verifyRequest);

            expect(result.verified).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should reject signature that is too short', async () => {
            const verifyRequest: VerifyRequest = {
                did: testDID,
                data: 'Hello, World!',
                signature: 'short'
            };

            const result = await didService.verifySignature(verifyRequest);

            expect(result.verified).toBe(false);
        });

        it('should reject empty data', async () => {
            const verifyRequest: VerifyRequest = {
                did: testDID,
                data: '',
                signature: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            };

            const result = await didService.verifySignature(verifyRequest);

            expect(result.verified).toBe(false);
        });

        it('should return error for non-existent DID', async () => {
            const verifyRequest: VerifyRequest = {
                did: 'did:ion:nonexistent',
                data: 'Hello, World!',
                signature: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            };

            const result = await didService.verifySignature(verifyRequest);

            expect(result.verified).toBe(false);
            expect(result.error).toContain('DID not found');
        });

        it('should return error for deactivated DID', async () => {
            await didService.deactivateDID(testDID);

            const verifyRequest: VerifyRequest = {
                did: testDID,
                data: 'Hello, World!',
                signature: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            };

            const result = await didService.verifySignature(verifyRequest);

            expect(result.verified).toBe(false);
            expect(result.error).toContain('DID has been deactivated');
        });
    });

    describe('deactivateDID', () => {
        it('should deactivate an existing DID', async () => {
            const createRequest: DIDCreateRequest = {
                publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA'
            };

            const created = await didService.createDID(createRequest);
            await didService.deactivateDID(created.did);

            const allDIDs = didService.getAllDIDs();
            const deactivatedDID = allDIDs.find(d => d.did === created.did);

            expect(deactivatedDID?.deactivated).toBe(true);
            expect(deactivatedDID?.updated).toBeDefined();
        });

        it('should throw error for non-existent DID', async () => {
            const nonExistentDID = 'did:ion:EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9Nfk38w5w';

            await expect(didService.deactivateDID(nonExistentDID)).rejects.toThrow('DID not found');
        });
    });

    describe('getAllDIDs', () => {
        it('should return empty array when no DIDs exist', () => {
            const allDIDs = didService.getAllDIDs();
            expect(allDIDs).toEqual([]);
        });

        it('should return all created DIDs', async () => {
            const createRequest: DIDCreateRequest = {
                publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA'
            };

            const created1 = await didService.createDID(createRequest);
            const created2 = await didService.createDID(createRequest);

            const allDIDs = didService.getAllDIDs();

            expect(allDIDs).toHaveLength(2);
            expect(allDIDs.map(d => d.did)).toContain(created1.did);
            expect(allDIDs.map(d => d.did)).toContain(created2.did);
        });
    });
});
