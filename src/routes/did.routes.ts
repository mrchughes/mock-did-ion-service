import { Router } from 'express';
import { DIDController } from '../controllers/did.controller';
import { DIDService } from '../services/did.service';

const router = Router();
const didService = new DIDService();
const didController = new DIDController(didService);

// Core DID operations (as per OpenAPI spec)
router.post('/create', didController.createDID);
router.get('/resolve/:did', didController.resolveDID);
router.post('/verify', didController.verifySignature);

// Additional endpoints for testing and management
router.get('/list', didController.listDIDs);
router.delete('/:did', didController.deactivateDID);

export default router;
