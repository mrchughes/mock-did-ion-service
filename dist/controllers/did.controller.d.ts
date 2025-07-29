import { Request, Response } from 'express';
import { DIDService } from '../services/did.service';
export declare class DIDController {
    private didService;
    constructor(didService: DIDService);
    createDID: (req: Request, res: Response) => Promise<Response>;
    resolveDID: (req: Request, res: Response) => Promise<Response>;
    verifySignature: (req: Request, res: Response) => Promise<Response>;
    listDIDs: (req: Request, res: Response) => Promise<Response>;
    deactivateDID: (req: Request, res: Response) => Promise<Response>;
}
//# sourceMappingURL=did.controller.d.ts.map