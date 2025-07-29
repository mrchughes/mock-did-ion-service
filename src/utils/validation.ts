import Joi from 'joi';

/**
 * Validate a request against a schema
 */
export function validateRequest(schema: Joi.Schema, data: any): any {
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });

    if (error) {
        const message = error.details.map(detail => detail.message).join(', ');
        throw new Error(message);
    }

    return value;
}

/**
 * Schema for DID creation requests
 */
export const didCreateSchema = Joi.object({
    publicKey: Joi.string().required().min(32).max(256),
    keyType: Joi.string().valid('Ed25519', 'RSA', 'secp256k1').default('Ed25519'),
    service: Joi.array().items(
        Joi.object({
            id: Joi.string().required(),
            type: Joi.string().required(),
            serviceEndpoint: Joi.string().required(),
            description: Joi.string()
        })
    ),
    signature: Joi.string()
});

/**
 * Schema for DID update requests
 */
export const didUpdateSchema = Joi.object({
    did: Joi.string().required().pattern(/^did:ion:.+$/),
    publicKey: Joi.string(),
    keyType: Joi.string().valid('Ed25519', 'RSA', 'secp256k1'),
    addServices: Joi.array().items(
        Joi.object({
            id: Joi.string().required(),
            type: Joi.string().required(),
            serviceEndpoint: Joi.string().required(),
            description: Joi.string()
        })
    ),
    removeServices: Joi.array().items(Joi.string()),
    signature: Joi.string().required()
}).or('publicKey', 'addServices', 'removeServices');

/**
 * Schema for DID recovery requests
 */
export const didRecoverSchema = Joi.object({
    did: Joi.string().required().pattern(/^did:ion:.+$/),
    publicKey: Joi.string().required(),
    keyType: Joi.string().valid('Ed25519', 'RSA', 'secp256k1').default('Ed25519'),
    service: Joi.array().items(
        Joi.object({
            id: Joi.string().required(),
            type: Joi.string().required(),
            serviceEndpoint: Joi.string().required(),
            description: Joi.string()
        })
    ),
    signature: Joi.string().required()
});

/**
 * Schema for DID deactivation requests
 */
export const didDeactivateSchema = Joi.object({
    did: Joi.string().required().pattern(/^did:ion:.+$/),
    signature: Joi.string().required()
});

/**
 * Schema for resolving a DID
 */
export const didResolveSchema = Joi.object({
    did: Joi.string().required().pattern(/^did:ion:.+$/)
});

/**
 * Schema for verifying a signature
 */
export const verifySignatureSchema = Joi.object({
    did: Joi.string().required().pattern(/^did:ion:.+$/),
    data: Joi.string().required(),
    signature: Joi.string().required(),
    keyId: Joi.string().optional()
});

/**
 * Schema for transaction lookup
 */
export const transactionSchema = Joi.object({
    id: Joi.string().required()
});
