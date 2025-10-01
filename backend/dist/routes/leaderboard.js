"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaderboardController_1 = require("../controllers/leaderboardController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', leaderboardController_1.validateLeaderboardQuery, leaderboardController_1.getLeaderboard);
router.get('/my-rank', auth_1.authenticateToken, leaderboardController_1.validateLeaderboardQuery, leaderboardController_1.getUserRank);
router.get('/stats', auth_1.authenticateToken, leaderboardController_1.getStats);
exports.default = router;
//# sourceMappingURL=leaderboard.js.map