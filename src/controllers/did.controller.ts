import { Request, Response } from 'express';
import { DIDService } from '../services/did.service';
import { validateRequest, didCreateSchema, didResolveSchema, verifySignatureSchema } from '../utils/validation';
import { sendSuccess, sendError } from '../utils/response';
import { DIDCreateRequest, VerifyRequest } from '../types/did.types';

export class DIDController {
    private didService: DIDService;

    constructor(didService: DIDService) {
        this.didService = didService;
    }

    /**
     * POST /did/create - Create a new DID:ION
     */
    public createDID = async (req: Request, res: Response): Promise<Response> => {
        try {
            const validatedRequest = validateRequest(didCreateSchema, req.body);
            const result = await this.didService.createDID(validatedRequest as DIDCreateRequest);
            return sendSuccess(res, result, 201);
        } catch (error) {
            return sendError(res, error instanceof Error ? error.message : 'Failed to create DID', 400);
        }
    };

    /**
     * GET /did/resolve/:did - Resolve a DID to its document
     */
    public resolveDID = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { did } = req.params;
            if (!did) {
                return sendError(res, 'DID parameter is required', 400);
            }
            validateRequest(didResolveSchema, { did });

            const result = await this.didService.resolveDID(did);
            return sendSuccess(res, result);
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
            return sendError(res, error instanceof Error ? error.message : 'Failed to resolve DID', statusCode);
        }
    };    /**
     * POST /did/verify - Verify a signature against a DID's public key
     */
    public verifySignature = async (req: Request, res: Response): Promise<Response> => {
        try {
            const validatedRequest = validateRequest(verifySignatureSchema, req.body);
            const result = await this.didService.verifySignature(validatedRequest as VerifyRequest);
            return sendSuccess(res, result);
        } catch (error) {
            return sendError(res, error instanceof Error ? error.message : 'Failed to verify signature', 400);
        }
    };

    /**
     * GET /did/list - List all DIDs (for testing purposes)
     */
    public listDIDs = async (req: Request, res: Response): Promise<Response> => {
        try {
            const dids = this.didService.getAllDIDs();
            return sendSuccess(res, { dids, count: dids.length });
        } catch (error) {
            return sendError(res, error instanceof Error ? error.message : 'Failed to list DIDs', 500);
        }
    };

    /**
     * DELETE /did/:did - Deactivate a DID (for testing purposes)
     */
    public deactivateDID = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { did } = req.params;
            if (!did) {
                return sendError(res, 'DID parameter is required', 400);
            }
            validateRequest(didResolveSchema, { did });

            await this.didService.deactivateDID(did);
            return sendSuccess(res, { message: 'DID deactivated successfully' });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
            return sendError(res, error instanceof Error ? error.message : 'Failed to deactivate DID', statusCode);
        }
    };
}
