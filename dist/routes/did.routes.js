"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const did_controller_1 = require("../controllers/did.controller");
const did_service_1 = require("../services/did.service");
const router = (0, express_1.Router)();
const didService = new did_service_1.DIDService();
const didController = new did_controller_1.DIDController(didService);
router.post('/create', didController.createDID);
router.get('/resolve/:did', didController.resolveDID);
router.post('/verify', didController.verifySignature);
router.get('/list', didController.listDIDs);
router.delete('/:did', didController.deactivateDID);
exports.default = router;
//# sourceMappingURL=did.routes.js.map