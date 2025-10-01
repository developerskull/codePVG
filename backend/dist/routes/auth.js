"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', authController_1.validateRegister, authController_1.register);
router.post('/login', authController_1.validateLogin, authController_1.login);
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    router.get('/linkedin', passport_1.default.authenticate('linkedin', { state: 'SOME_STATE' }));
    router.get('/linkedin/callback', passport_1.default.authenticate('linkedin', { failureRedirect: '/auth/login', session: false }), authController_1.linkedinCallback);
}
else {
    router.get('/linkedin', (req, res) => {
        res.status(503).json({ error: 'LinkedIn OAuth is not configured. Please contact the administrator.' });
    });
    router.get('/linkedin/callback', (req, res) => {
        res.status(503).json({ error: 'LinkedIn OAuth is not configured. Please contact the administrator.' });
    });
}
router.get('/colleges', authController_1.getColleges);
router.get('/profile', auth_1.authenticateToken, authController_1.getProfile);
router.put('/profile', auth_1.authenticateToken, authController_1.validateUpdateProfile, authController_1.updateProfile);
router.get('/users', auth_1.authenticateToken, auth_1.requireAdmin, authController_1.getAllUsers);
router.put('/users/:id', auth_1.authenticateToken, auth_1.requireAdmin, authController_1.validateUpdateUser, authController_1.updateUser);
router.get('/approvals/pending', auth_1.authenticateToken, auth_1.requireAdmin, authController_1.getPendingApprovals);
router.put('/approvals/:id', auth_1.authenticateToken, auth_1.requireAdmin, authController_1.updateApprovalStatus);
router.delete('/users/:id', auth_1.authenticateToken, auth_1.requireSuperAdmin, authController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=auth.js.map