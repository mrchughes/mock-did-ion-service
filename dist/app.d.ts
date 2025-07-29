import { Application } from 'express';
export declare class App {
    app: Application;
    constructor();
    private initializeMiddleware;
    private initializeRoutes;
    private initializeErrorHandling;
    listen(port: number): void;
}
//# sourceMappingURL=app.d.ts.map