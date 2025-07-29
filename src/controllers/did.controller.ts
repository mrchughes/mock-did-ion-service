import { Request, Response } from 'express';
import { DIDService } from '../services/did.service';
import {
    validateRequest,
    didCreateSchema,
    didResolveSchema,
    verifySignatureSchema,
    didUpdateSchema,
    didRecoverSchema,
    didDeactivateSchema,
    transactionSchema
} from '../utils/validation';
import { sendSuccess, sendError } from '../utils/response';
import {
    DIDCreateRequest,
    DIDUpdateRequest,
    DIDRecoverRequest,
    DIDDeactivateRequest,
    VerifyRequest
} from '../types/did.types';

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
     * POST /did/update - Update an existing DID document
     */
    public updateDID = async (req: Request, res: Response): Promise<Response> => {
        try {
            const validatedRequest = validateRequest(didUpdateSchema, req.body);
            const result = await this.didService.updateDID(validatedRequest as DIDUpdateRequest);
            return sendSuccess(res, result, 200);
        } catch (error) {
            return sendError(res, error instanceof Error ? error.message : 'Failed to update DID', 400);
        }
    };

    /**
     * POST /did/recover - Recover a DID with new keys
     */
    public recoverDID = async (req: Request, res: Response): Promise<Response> => {
        try {
            const validatedRequest = validateRequest(didRecoverSchema, req.body);
            const result = await this.didService.recoverDID(validatedRequest as DIDRecoverRequest);
            return sendSuccess(res, result, 200);
        } catch (error) {
            return sendError(res, error instanceof Error ? error.message : 'Failed to recover DID', 400);
        }
    };

    /**
     * POST /did/deactivate - Deactivate a DID
     */
    public deactivateDID = async (req: Request, res: Response): Promise<Response> => {
        try {
            const validatedRequest = validateRequest(didDeactivateSchema, req.body);
            const result = await this.didService.deactivateDID(validatedRequest as DIDDeactivateRequest);
            return sendSuccess(res, result, 200);
        } catch (error) {
            return sendError(res, error instanceof Error ? error.message : 'Failed to deactivate DID', 400);
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

            // Check if resolution had an error
            if (result.didResolutionMetadata.error) {
                return sendError(res, result.didResolutionMetadata.error,
                    result.didResolutionMetadata.error.includes('not found') ? 404 : 400);
            }

            return sendSuccess(res, result);
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
            return sendError(res, error instanceof Error ? error.message : 'Failed to resolve DID', statusCode);
        }
    };

    /**
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
     * GET /did/transaction/:id - Get status of a transaction
     */
    public getTransactionStatus = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            if (!id) {
                return sendError(res, 'Transaction ID parameter is required', 400);
            }
            validateRequest(transactionSchema, { id });

            const result = await this.didService.getTransactionStatus(id);
            if (!result) {
                return sendError(res, `Transaction not found: ${id}`, 404);
            }
            return sendSuccess(res, result);
        } catch (error) {
            return sendError(res, error instanceof Error ? error.message : 'Failed to get transaction status', 400);
        }
    };

    /**
     * GET /did/:did/operations - Get all operations for a DID
     */
    public getDIDOperations = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { did } = req.params;
            if (!did) {
                return sendError(res, 'DID parameter is required', 400);
            }
            validateRequest(didResolveSchema, { did });

            const operations = this.didService.getOperationsForDID(did);
            return sendSuccess(res, { operations, count: operations.length });
        } catch (error) {
            return sendError(res, error instanceof Error ? error.message : 'Failed to get DID operations', 400);
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
     * DELETE /did/:did - Deactivate a DID (legacy method)
     * @deprecated Use POST /did/deactivate instead
     */
    public legacyDeactivateDID = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { did } = req.params;
            if (!did) {
                return sendError(res, 'DID parameter is required', 400);
            }
            validateRequest(didResolveSchema, { did });

            // For backward compatibility, create a deactivate request
            const deactivateRequest: DIDDeactivateRequest = {
                did,
                signature: req.body.signature || 'legacy-deactivation'
            };

            await this.didService.deactivateDID(deactivateRequest);
            return sendSuccess(res, { message: 'DID deactivated successfully' });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
            return sendError(res, error instanceof Error ? error.message : 'Failed to deactivate DID', statusCode);
        }
    };
}
