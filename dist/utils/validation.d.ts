import Joi from 'joi';
export declare const didCreateSchema: Joi.ObjectSchema<any>;
export declare const didResolveSchema: Joi.ObjectSchema<any>;
export declare const verifySignatureSchema: Joi.ObjectSchema<any>;
export declare function validateRequest<T>(schema: Joi.ObjectSchema<T>, data: unknown): T;
//# sourceMappingURL=validation.d.ts.map