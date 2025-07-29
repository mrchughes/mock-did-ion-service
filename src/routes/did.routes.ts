import { Router } from 'express';
import { DIDController } from '../controllers/did.controller';
import { DIDService } from '../services/did.service';

const router = Router();
const didService = new DIDService();
const didController = new DIDController(didService);

// Core DID operations (as per OpenAPI spec)
router.post('/create', didController.createDID);
router.post('/update', didController.updateDID);
router.post('/recover', didController.recoverDID);
router.post('/deactivate', didController.deactivateDID);
router.get('/resolve/:did', didController.resolveDID);
router.post('/verify', didController.verifySignature);

// Transaction related endpoints
router.get('/transaction/:id', didController.getTransactionStatus);
router.get('/:did/operations', didController.getDIDOperations);

// Additional endpoints for testing and management
router.get('/list', didController.listDIDs);

// Legacy endpoints (for backward compatibility)
router.delete('/:did', didController.legacyDeactivateDID);

export default router;
