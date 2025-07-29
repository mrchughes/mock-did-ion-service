import { Response } from 'express';
import { ApiResponse, ApiError } from '../types/api.types';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
    const response: ApiResponse<T> = {
        success: true,
        data,
        timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
}

export function sendError(res: Response, error: string | ApiError, statusCode = 500): Response {
    const response: ApiResponse = {
        success: false,
        error: typeof error === 'string' ? error : error.message,
        timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
}
