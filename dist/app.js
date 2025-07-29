"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const did_routes_1 = __importDefault(require("./routes/did.routes"));
const response_1 = require("./utils/response");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddleware() {
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
            credentials: true
        }));
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }
    initializeRoutes() {
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'Mock DID:ION Service',
                version: '1.0.0'
            });
        });
        this.app.use('/did', did_routes_1.default);
        this.app.get('/', (req, res) => {
            res.json({
                service: 'Mock DID:ION Service',
                version: '1.0.0',
                description: 'A mock service for simulating DID:ION functionality',
                endpoints: {
                    'POST /did/create': 'Create a new DID:ION',
                    'GET /did/resolve/:did': 'Resolve a DID document',
                    'POST /did/verify': 'Verify a signature',
                    'GET /did/list': 'List all DIDs (testing)',
                    'DELETE /did/:did': 'Deactivate a DID (testing)',
                    'GET /health': 'Health check'
                }
            });
        });
        this.app.use('*', (req, res) => {
            (0, response_1.sendError)(res, `Route not found: ${req.method} ${req.path}`, 404);
        });
    }
    initializeErrorHandling() {
        this.app.use((error, req, res, next) => {
            console.error('Global error handler:', error);
            (0, response_1.sendError)(res, 'Internal server error', 500);
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });
    }
    listen(port) {
        this.app.listen(port, () => {
            console.log(`Mock DID:ION Service listening on port ${port}`);
        });
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map