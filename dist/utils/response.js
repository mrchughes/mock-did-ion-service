"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, statusCode = 200) {
    const response = {
        success: true,
        data,
        timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
}
function sendError(res, error, statusCode = 500) {
    const response = {
        success: false,
        error: typeof error === 'string' ? error : error.message,
        timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
}
//# sourceMappingURL=response.js.map