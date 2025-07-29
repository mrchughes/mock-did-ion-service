import { Response } from 'express';
import { ApiError } from '../types/api.types';
export declare function sendSuccess<T>(res: Response, data: T, statusCode?: number): Response;
export declare function sendError(res: Response, error: string | ApiError, statusCode?: number): Response;
//# sourceMappingURL=response.d.ts.map