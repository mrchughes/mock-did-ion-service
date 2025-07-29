import request from 'supertest';
import { App } from '../src/app';

describe('DID API Integration Tests', () => {
    let app: App;
    let server: any;

    beforeAll(() => {
        app = new App();
        server = app.app;
    });

    describe('POST /did/create', () => {
        it('should create a new DID successfully', async () => {
            const response = await request(server)
                .post('/did/create')
                .send({
                    publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA',
                    keyType: 'Ed25519'
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.did).toMatch(/^did:ion:.+$/);
            expect(response.body.data.document.verificationMethod).toHaveLength(1);
            expect(response.body.data.created).toBeDefined();
        });

        it('should return validation error for missing publicKey', async () => {
            const response = await request(server)
                .post('/did/create')
                .send({
                    keyType: 'Ed25519'
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('publicKey');
        });

        it('should return validation error for invalid keyType', async () => {
            const response = await request(server)
                .post('/did/create')
                .send({
                    publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA',
                    keyType: 'InvalidType'
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('keyType');
        });

        it('should create DID with default key type when not specified', async () => {
            const response = await request(server)
                .post('/did/create')
                .send({
                    publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA'
                })
                .expect(201);

            expect(response.body.data.document.verificationMethod[0]?.type).toBe('Ed25519VerificationKey2020');
        });
    });

    describe('GET /did/resolve/:did', () => {
        let testDID: string;

        beforeEach(async () => {
            const createResponse = await request(server)
                .post('/did/create')
                .send({
                    publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA'
                });
            testDID = createResponse.body.data.did;
        });

        it('should resolve an existing DID', async () => {
            const response = await request(server)
                .get(`/did/resolve/${testDID}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.didDocument.id).toBe(testDID);
            expect(response.body.data.didDocumentMetadata.created).toBeDefined();
            expect(response.body.data.didDocumentMetadata.deactivated).toBe(false);
        });

        it('should return 404 for non-existent DID', async () => {
            const nonExistentDID = 'did:ion:EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9Nfk38w5w';

            const response = await request(server)
                .get(`/did/resolve/${nonExistentDID}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('not found');
        });

        it('should return 400 for invalid DID format', async () => {
            const invalidDID = 'invalid-did-format';

            const response = await request(server)
                .get(`/did/resolve/${invalidDID}`)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Validation error');
        });
    });

    describe('POST /did/verify', () => {
        let testDID: string;

        beforeEach(async () => {
            const createResponse = await request(server)
                .post('/did/create')
                .send({
                    publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA',
                    keyType: 'Ed25519'
                });
            testDID = createResponse.body.data.did;
        });

        it('should verify a valid signature', async () => {
            const response = await request(server)
                .post('/did/verify')
                .send({
                    did: testDID,
                    data: 'Hello, World!',
                    signature: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.verified).toBe(true);
        });

        it('should reject invalid signature', async () => {
            const response = await request(server)
                .post('/did/verify')
                .send({
                    did: testDID,
                    data: 'Hello, World!',
                    signature: 'short'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.verified).toBe(false);
        });

        it('should return validation error for missing fields', async () => {
            const response = await request(server)
                .post('/did/verify')
                .send({
                    did: testDID,
                    // missing data and signature
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Validation error');
        });

        it('should handle non-existent DID gracefully', async () => {
            const response = await request(server)
                .post('/did/verify')
                .send({
                    did: 'did:ion:nonexistent',
                    data: 'Hello, World!',
                    signature: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.verified).toBe(false);
            expect(response.body.data.error).toContain('DID not found');
        });
    });

  describe('GET /did/list', () => {
    it('should list all DIDs', async () => {
      // Get initial count
      const initialResponse = await request(server)
        .get('/did/list')
        .expect(200);
      
      const initialCount = initialResponse.body.data.count;
      
      // Create a few DIDs
      await request(server)
        .post('/did/create')
        .send({ publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA' });
      
      await request(server)
        .post('/did/create')
        .send({ publicKey: '4N3nUHkJTYapzWdxXvGCENEIn6N0vx5sHrF9TrfCsJRB' });

      const response = await request(server)
        .get('/did/list')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dids).toHaveLength(initialCount + 2);
      expect(response.body.data.count).toBe(initialCount + 2);
    });
  });    describe('DELETE /did/:did', () => {
        let testDID: string;

        beforeEach(async () => {
            const createResponse = await request(server)
                .post('/did/create')
                .send({
                    publicKey: '3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA'
                });
            testDID = createResponse.body.data.did;
        });

        it('should deactivate an existing DID', async () => {
            const response = await request(server)
                .delete(`/did/${testDID}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.message).toContain('deactivated successfully');

            // Verify the DID is deactivated by trying to resolve it
            await request(server)
                .get(`/did/resolve/${testDID}`)
                .expect(400); // Should fail because DID is deactivated
        });

        it('should return 404 for non-existent DID', async () => {
            const nonExistentDID = 'did:ion:EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9Nfk38w5w';

            const response = await request(server)
                .delete(`/did/${nonExistentDID}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('not found');
        });
    });

    describe('Health Check', () => {
        it('should return health status', async () => {
            const response = await request(server)
                .get('/health')
                .expect(200);

            expect(response.body.status).toBe('healthy');
            expect(response.body.service).toBe('Mock DID:ION Service');
            expect(response.body.version).toBe('1.0.0');
        });
    });

    describe('Root Endpoint', () => {
        it('should return service information', async () => {
            const response = await request(server)
                .get('/')
                .expect(200);

            expect(response.body.service).toBe('Mock DID:ION Service');
            expect(response.body.endpoints).toBeDefined();
            expect(response.body.endpoints['POST /did/create']).toBeDefined();
        });
    });

    describe('404 Handler', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(server)
                .get('/non-existent-route')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Route not found');
        });
    });
});
