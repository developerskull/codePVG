"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateProblem = exports.validateCreateProblem = exports.deleteProblem = exports.updateProblem = exports.createProblem = exports.getProblemById = exports.getProblems = void 0;
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../utils/database"));
const getProblems = async (req, res) => {
    const { difficulty, topic, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    try {
        let queryText = `
      SELECT p.*, u.name as created_by_name,
      COUNT(s.id) as submission_count,
      COUNT(CASE WHEN s.status = 'accepted' THEN 1 END) as accepted_count
      FROM problems p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN submissions s ON p.id = s.problem_id
    `;
        const queryParams = [];
        const conditions = [];
        if (difficulty) {
            conditions.push(`p.difficulty = $${queryParams.length + 1}`);
            queryParams.push(difficulty);
        }
        if (topic) {
            conditions.push(`p.topic = $${queryParams.length + 1}`);
            queryParams.push(topic);
        }
        if (conditions.length > 0) {
            queryText += ` WHERE ${conditions.join(' AND ')}`;
        }
        queryText += `
      GROUP BY p.id, u.name
      ORDER BY p.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
        queryParams.push(Number(limit), offset);
        const result = await database_1.default.query(queryText, queryParams);
        let countQuery = 'SELECT COUNT(*) FROM problems p';
        if (conditions.length > 0) {
            countQuery += ` WHERE ${conditions.join(' AND ')}`;
        }
        const countResult = await database_1.default.query(countQuery, queryParams.slice(0, -2));
        return res.json({
            problems: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: parseInt(countResult.rows[0].count),
                pages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get problems error:', error);
        const isDatabaseError = error.message && (error.message.includes('ECONNREFUSED') ||
            error.message.includes('relation "problems" does not exist') ||
            error.message.includes('database') ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND');
        if (isDatabaseError) {
            const mockProblems = [];
            for (let i = 1; i <= Math.min(Number(limit), 5); i++) {
                mockProblems.push({
                    id: `problem-${i}`,
                    title: `Sample Problem ${i}`,
                    description: `This is a sample problem description for problem ${i}.`,
                    difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
                    topic: ['Arrays', 'Strings', 'Trees', 'Dynamic Programming'][Math.floor(Math.random() * 4)],
                    examples: [
                        { input: '1 2', output: '3', explanation: '1 + 2 = 3' },
                        { input: '4 5', output: '9', explanation: '4 + 5 = 9' }
                    ],
                    constraints: ['1 ≤ n ≤ 100', 'All inputs are integers'],
                    created_by: 'admin',
                    created_by_name: 'Admin User',
                    submission_count: Math.floor(Math.random() * 50),
                    accepted_count: Math.floor(Math.random() * 30),
                    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
                });
            }
            return res.json({
                problems: mockProblems,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: 25,
                    pages: Math.ceil(25 / Number(limit))
                }
            });
        }
        console.log('Returning mock data for development...');
        const mockProblems = [];
        for (let i = 1; i <= Math.min(Number(limit), 5); i++) {
            mockProblems.push({
                id: `problem-${i}`,
                title: `Sample Problem ${i}`,
                description: `This is a sample problem description for problem ${i}.`,
                difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
                topic: ['Arrays', 'Strings', 'Trees', 'Dynamic Programming'][Math.floor(Math.random() * 4)],
                examples: [
                    { input: '1 2', output: '3', explanation: '1 + 2 = 3' },
                    { input: '4 5', output: '9', explanation: '4 + 5 = 9' }
                ],
                constraints: ['1 ≤ n ≤ 100', 'All inputs are integers'],
                created_by: 'admin',
                created_by_name: 'Admin User',
                submission_count: Math.floor(Math.random() * 50),
                accepted_count: Math.floor(Math.random() * 30),
                created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
        return res.json({
            problems: mockProblems,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: 25,
                pages: Math.ceil(25 / Number(limit))
            }
        });
    }
};
exports.getProblems = getProblems;
const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query(`
      SELECT p.*, u.name as created_by_name
      FROM problems p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = $1
    `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        return res.json({ problem: result.rows[0] });
    }
    catch (error) {
        console.error('Get problem error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProblemById = getProblemById;
const createProblem = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const authReq = req;
        const { title, description, difficulty, topic, test_cases, examples, constraints } = req.body;
        const result = await database_1.default.query(`INSERT INTO problems (title, description, difficulty, topic, test_cases, examples, constraints, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`, [title, description, difficulty, topic, test_cases, examples, constraints, authReq.user?.id]);
        return res.status(201).json({
            message: 'Problem created successfully',
            problem: result.rows[0]
        });
    }
    catch (error) {
        console.error('Create problem error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createProblem = createProblem;
const updateProblem = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const authReq = req;
        const { title, description, difficulty, topic, test_cases, examples, constraints } = req.body;
        const existingProblem = await database_1.default.query('SELECT created_by FROM problems WHERE id = $1', [id]);
        if (existingProblem.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        if (existingProblem.rows[0].created_by !== authReq.user?.id &&
            !['admin', 'super-admin'].includes(authReq.user?.role || '')) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        const result = await database_1.default.query(`UPDATE problems 
       SET title = $1, description = $2, difficulty = $3, topic = $4, 
           test_cases = $5, examples = $6, constraints = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`, [title, description, difficulty, topic, test_cases, examples, constraints, id]);
        return res.json({
            message: 'Problem updated successfully',
            problem: result.rows[0]
        });
    }
    catch (error) {
        console.error('Update problem error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateProblem = updateProblem;
const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const authReq = req;
        const existingProblem = await database_1.default.query('SELECT created_by FROM problems WHERE id = $1', [id]);
        if (existingProblem.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        if (existingProblem.rows[0].created_by !== authReq.user?.id &&
            authReq.user?.role !== 'super-admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        await database_1.default.query('DELETE FROM problems WHERE id = $1', [id]);
        return res.json({ message: 'Problem deleted successfully' });
    }
    catch (error) {
        console.error('Delete problem error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteProblem = deleteProblem;
exports.validateCreateProblem = [
    (0, express_validator_1.body)('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    (0, express_validator_1.body)('description').trim().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
    (0, express_validator_1.body)('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
    (0, express_validator_1.body)('topic').trim().isLength({ min: 2, max: 50 }).withMessage('Topic must be 2-50 characters'),
    (0, express_validator_1.body)('test_cases').isArray({ min: 1 }).withMessage('At least one test case required'),
    (0, express_validator_1.body)('examples').isArray({ min: 1 }).withMessage('At least one example required'),
    (0, express_validator_1.body)('constraints').isArray().withMessage('Constraints must be an array')
];
exports.validateUpdateProblem = exports.validateCreateProblem;
//# sourceMappingURL=problemController.js.map