"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignatureSchema = exports.didResolveSchema = exports.didCreateSchema = void 0;
exports.validateRequest = validateRequest;
const joi_1 = __importDefault(require("joi"));
exports.didCreateSchema = joi_1.default.object({
    publicKey: joi_1.default.string().required().min(32).max(256),
    keyType: joi_1.default.string().valid('Ed25519', 'RSA', 'secp256k1').optional()
});
exports.didResolveSchema = joi_1.default.object({
    did: joi_1.default.string().required().pattern(/^did:ion:.+$/)
});
exports.verifySignatureSchema = joi_1.default.object({
    did: joi_1.default.string().required().pattern(/^did:ion:.+$/),
    data: joi_1.default.string().required(),
    signature: joi_1.default.string().required(),
    keyId: joi_1.default.string().optional()
});
function validateRequest(schema, data) {
    const { error, value } = schema.validate(data);
    if (error) {
        throw new Error(`Validation error: ${error.details.map((d) => d.message).join(', ')}`);
    }
    return value;
}
//# sourceMappingURL=validation.js.map