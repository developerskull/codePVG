"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const problemController_1 = require("../controllers/problemController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', problemController_1.getProblems);
router.get('/:id', problemController_1.getProblemById);
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, problemController_1.validateCreateProblem, problemController_1.createProblem);
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, problemController_1.validateUpdateProblem, problemController_1.updateProblem);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, problemController_1.deleteProblem);
exports.default = router;
//# sourceMappingURL=problems.js.map