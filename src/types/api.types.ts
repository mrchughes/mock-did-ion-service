export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: any;
}
