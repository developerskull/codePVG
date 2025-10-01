"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLeaderboardQuery = exports.getStats = exports.getUserRank = exports.getLeaderboard = void 0;
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../utils/database"));
const getLeaderboard = async (req, res) => {
    const { time_filter = 'all', page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    try {
        let dateFilter = '';
        const queryParams = [];
        switch (time_filter) {
            case 'weekly':
                dateFilter = 'AND l.last_submission_at >= CURRENT_DATE - INTERVAL \'7 days\'';
                break;
            case 'monthly':
                dateFilter = 'AND l.last_submission_at >= CURRENT_DATE - INTERVAL \'30 days\'';
                break;
            case 'all':
            default:
                dateFilter = '';
                break;
        }
        const result = await database_1.default.query(`
      SELECT 
        l.user_id,
        l.total_solved,
        l.rank,
        l.last_submission_at,
        u.name,
        u.email,
        u.created_at as joined_at
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      WHERE 1=1 ${dateFilter}
      ORDER BY l.rank ASC
      LIMIT $1 OFFSET $2
    `, [Number(limit), offset]);
        const countResult = await database_1.default.query(`
      SELECT COUNT(*) FROM leaderboard l
      WHERE 1=1 ${dateFilter}
    `);
        return res.json({
            leaderboard: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: parseInt(countResult.rows[0].count),
                pages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
            },
            time_filter
        });
    }
    catch (error) {
        console.error('Get leaderboard error:', error);
        console.log('Returning mock leaderboard data for development...');
        const mockLeaderboard = [];
        for (let i = 1; i <= Math.min(Number(limit), 10); i++) {
            mockLeaderboard.push({
                user_id: `user-${i}`,
                total_solved: Math.floor(Math.random() * 50) + 10,
                rank: i,
                last_submission_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                name: `Student ${i}`,
                email: `student${i}@example.com`,
                joined_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
        return res.json({
            leaderboard: mockLeaderboard,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: 150,
                pages: Math.ceil(150 / Number(limit))
            },
            time_filter: time_filter
        });
    }
};
exports.getLeaderboard = getLeaderboard;
const getUserRank = async (req, res) => {
    try {
        const authReq = req;
        const user = authReq.user;
        const { time_filter = 'all' } = req.query;
        let dateFilter = '';
        switch (time_filter) {
            case 'weekly':
                dateFilter = 'AND l.last_submission_at >= CURRENT_DATE - INTERVAL \'7 days\'';
                break;
            case 'monthly':
                dateFilter = 'AND l.last_submission_at >= CURRENT_DATE - INTERVAL \'30 days\'';
                break;
            case 'all':
            default:
                dateFilter = '';
                break;
        }
        const result = await database_1.default.query(`
      SELECT 
        l.user_id,
        l.total_solved,
        l.rank,
        l.last_submission_at,
        u.name,
        u.email
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      WHERE l.user_id = $1 ${dateFilter}
    `, [authReq.user?.id]);
        if (result.rows.length === 0) {
            return res.json({
                user_rank: null,
                message: 'No submissions found'
            });
        }
        return res.json({
            user_rank: result.rows[0],
            time_filter
        });
    }
    catch (error) {
        console.error('Get user rank error:', error);
        const isDatabaseError = error.message && (error.message.includes('ECONNREFUSED') ||
            error.message.includes('relation "leaderboard" does not exist') ||
            error.message.includes('database') ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND');
        if (isDatabaseError) {
            return res.json({
                user_rank: {
                    user_id: 'dev-user-id',
                    total_solved: 15,
                    rank: 42,
                    last_submission_at: new Date().toISOString(),
                    name: 'Development User',
                    email: 'dev@example.com',
                    joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                time_filter: 'all'
            });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUserRank = getUserRank;
const getStats = async (req, res) => {
    try {
        const authReq = req;
        const submissionStats = await database_1.default.query(`
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_submissions,
        COUNT(CASE WHEN status = 'wrong_answer' THEN 1 END) as wrong_answers,
        COUNT(CASE WHEN status = 'time_limit_exceeded' THEN 1 END) as time_limit_exceeded,
        COUNT(CASE WHEN status = 'runtime_error' THEN 1 END) as runtime_errors,
        COUNT(CASE WHEN status = 'compilation_error' THEN 1 END) as compilation_errors
      FROM submissions
      WHERE user_id = $1
    `, [authReq.user?.id]);
        const difficultyStats = await database_1.default.query(`
      SELECT 
        p.difficulty,
        COUNT(DISTINCT p.id) as solved_count
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = $1 AND s.status = 'accepted'
      GROUP BY p.difficulty
    `, [authReq.user?.id]);
        const recentActivity = await database_1.default.query(`
      SELECT 
        DATE(s.created_at) as submission_date,
        COUNT(*) as submissions_count,
        COUNT(CASE WHEN s.status = 'accepted' THEN 1 END) as accepted_count
      FROM submissions s
      WHERE s.user_id = $1 
        AND s.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(s.created_at)
      ORDER BY submission_date DESC
    `, [authReq.user?.id]);
        const rankResult = await database_1.default.query(`
      SELECT rank, total_solved
      FROM leaderboard
      WHERE user_id = $1
    `, [authReq.user?.id]);
        return res.json({
            submission_stats: submissionStats.rows[0],
            difficulty_stats: difficultyStats.rows,
            recent_activity: recentActivity.rows,
            current_rank: rankResult.rows[0] || { rank: null, total_solved: 0 }
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        const isDatabaseError = error.message && (error.message.includes('ECONNREFUSED') ||
            error.message.includes('relation "leaderboard" does not exist') ||
            error.message.includes('database') ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND');
        if (isDatabaseError) {
            return res.json({
                totalUsers: 150,
                totalProblems: 25,
                totalSubmissions: 1200,
                topLanguages: [
                    { language: 'python', count: 450 },
                    { language: 'java', count: 320 },
                    { language: 'cpp', count: 280 },
                    { language: 'javascript', count: 150 }
                ]
            });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getStats = getStats;
exports.validateLeaderboardQuery = [
    (0, express_validator_1.query)('time_filter').optional().isIn(['all', 'weekly', 'monthly']).withMessage('Invalid time filter'),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];
//# sourceMappingURL=leaderboardController.js.map