"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const simpleAuthController_1 = require("../controllers/simpleAuthController");
const mockAuth_1 = require("../middleware/mockAuth");
const router = (0, express_1.Router)();
router.post('/register', simpleAuthController_1.validateRegister, simpleAuthController_1.register);
router.post('/login', simpleAuthController_1.validateLogin, simpleAuthController_1.login);
router.get('/profile', mockAuth_1.authenticateToken, simpleAuthController_1.getProfile);
router.put('/profile', mockAuth_1.authenticateToken, simpleAuthController_1.validateUpdateProfile, simpleAuthController_1.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map