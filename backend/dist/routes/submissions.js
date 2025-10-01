"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submissionController_1 = require("../controllers/submissionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/submit', submissionController_1.validateSubmitCode, submissionController_1.submitCode);
router.get('/:id', submissionController_1.getSubmission);
router.get('/', submissionController_1.getUserSubmissions);
exports.default = router;
//# sourceMappingURL=submissions.js.map