import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import didRoutes from './routes/did.routes';
import { sendError } from './utils/response';

export class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddleware(): void {
        // Security middleware
        this.app.use(helmet());

        // CORS middleware
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
            credentials: true
        }));

        // Body parsing middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging middleware
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    private initializeRoutes(): void {
        // Health check endpoint
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'Mock DID:ION Service',
                version: '1.0.0'
            });
        });

        // API routes
        this.app.use('/did', didRoutes);

        // Root endpoint with service info
        this.app.get('/', (req: Request, res: Response) => {
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

        // 404 handler
        this.app.use('*', (req: Request, res: Response) => {
            sendError(res, `Route not found: ${req.method} ${req.path}`, 404);
        });
    }

    private initializeErrorHandling(): void {
        // Global error handler
        this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
            console.error('Global error handler:', error);
            sendError(res, 'Internal server error', 500);
        });

        // Unhandled promise rejection handler
        process.on('unhandledRejection', (reason: any, promise: any) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        // Uncaught exception handler
        process.on('uncaughtException', (error: any) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });
    }

    public listen(port: number): void {
        this.app.listen(port, () => {
            console.log(`Mock DID:ION Service listening on port ${port}`);
        });
    }
}
