import Joi from 'joi';

export const didCreateSchema = Joi.object({
    publicKey: Joi.string().required().min(32).max(256),
    keyType: Joi.string().valid('Ed25519', 'RSA', 'secp256k1').optional()
});

export const didResolveSchema = Joi.object({
    did: Joi.string().required().pattern(/^did:ion:.+$/)
});

export const verifySignatureSchema = Joi.object({
    did: Joi.string().required().pattern(/^did:ion:.+$/),
    data: Joi.string().required(),
    signature: Joi.string().required(),
    keyId: Joi.string().optional()
});

export function validateRequest<T>(schema: Joi.ObjectSchema<T>, data: unknown): T {
    const { error, value } = schema.validate(data);
    if (error) {
        throw new Error(`Validation error: ${error.details.map((d: any) => d.message).join(', ')}`);
    }
    return value;
}
