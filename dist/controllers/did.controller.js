"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIDController = void 0;
const validation_1 = require("../utils/validation");
const response_1 = require("../utils/response");
class DIDController {
    constructor(didService) {
        this.createDID = async (req, res) => {
            try {
                const validatedRequest = (0, validation_1.validateRequest)(validation_1.didCreateSchema, req.body);
                const result = await this.didService.createDID(validatedRequest);
                return (0, response_1.sendSuccess)(res, result, 201);
            }
            catch (error) {
                return (0, response_1.sendError)(res, error instanceof Error ? error.message : 'Failed to create DID', 400);
            }
        };
        this.resolveDID = async (req, res) => {
            try {
                const { did } = req.params;
                if (!did) {
                    return (0, response_1.sendError)(res, 'DID parameter is required', 400);
                }
                (0, validation_1.validateRequest)(validation_1.didResolveSchema, { did });
                const result = await this.didService.resolveDID(did);
                return (0, response_1.sendSuccess)(res, result);
            }
            catch (error) {
                const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
                return (0, response_1.sendError)(res, error instanceof Error ? error.message : 'Failed to resolve DID', statusCode);
            }
        };
        this.verifySignature = async (req, res) => {
            try {
                const validatedRequest = (0, validation_1.validateRequest)(validation_1.verifySignatureSchema, req.body);
                const result = await this.didService.verifySignature(validatedRequest);
                return (0, response_1.sendSuccess)(res, result);
            }
            catch (error) {
                return (0, response_1.sendError)(res, error instanceof Error ? error.message : 'Failed to verify signature', 400);
            }
        };
        this.listDIDs = async (req, res) => {
            try {
                const dids = this.didService.getAllDIDs();
                return (0, response_1.sendSuccess)(res, { dids, count: dids.length });
            }
            catch (error) {
                return (0, response_1.sendError)(res, error instanceof Error ? error.message : 'Failed to list DIDs', 500);
            }
        };
        this.deactivateDID = async (req, res) => {
            try {
                const { did } = req.params;
                if (!did) {
                    return (0, response_1.sendError)(res, 'DID parameter is required', 400);
                }
                (0, validation_1.validateRequest)(validation_1.didResolveSchema, { did });
                await this.didService.deactivateDID(did);
                return (0, response_1.sendSuccess)(res, { message: 'DID deactivated successfully' });
            }
            catch (error) {
                const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
                return (0, response_1.sendError)(res, error instanceof Error ? error.message : 'Failed to deactivate DID', statusCode);
            }
        };
        this.didService = didService;
    }
}
exports.DIDController = DIDController;
//# sourceMappingURL=did.controller.js.map