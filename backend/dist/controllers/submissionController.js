"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSubmitCode = exports.getUserSubmissions = exports.getSubmission = exports.submitCode = void 0;
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../utils/database"));
const LANGUAGE_IDS = {
    python: 71,
    java: 62,
    cpp: 54,
    c: 50
};
const submitCode = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const authReq = req;
        const { problem_id, code, language } = req.body;
        const problemResult = await database_1.default.query('SELECT test_cases FROM problems WHERE id = $1', [problem_id]);
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        const testCases = problemResult.rows[0].test_cases;
        const submissionResult = await database_1.default.query(`INSERT INTO submissions (user_id, problem_id, code, language, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`, [authReq.user?.id, problem_id, code, language]);
        const submission = submissionResult.rows[0];
        processSubmission(submission.id, code, language, testCases);
        return res.status(202).json({
            message: 'Submission received',
            submission: {
                id: submission.id,
                status: submission.status,
                created_at: submission.created_at
            }
        });
    }
    catch (error) {
        console.error('Submit code error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.submitCode = submitCode;
const getSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const authReq = req;
        const result = await database_1.default.query(`SELECT s.*, p.title as problem_title
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       WHERE s.id = $1 AND s.user_id = $2`, [id, authReq.user?.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        return res.json({ submission: result.rows[0] });
    }
    catch (error) {
        console.error('Get submission error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getSubmission = getSubmission;
const getUserSubmissions = async (req, res) => {
    try {
        const authReq = req;
        const { page = 1, limit = 10, problem_id } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let queryText = `
      SELECT s.*, p.title as problem_title
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = $1
    `;
        const queryParams = [authReq.user?.id];
        if (problem_id) {
            queryText += ` AND s.problem_id = $${queryParams.length + 1}`;
            queryParams.push(problem_id);
        }
        queryText += ` ORDER BY s.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(Number(limit), offset);
        const result = await database_1.default.query(queryText, queryParams);
        let countQuery = 'SELECT COUNT(*) FROM submissions WHERE user_id = $1';
        const countParams = [authReq.user?.id];
        if (problem_id) {
            countQuery += ' AND problem_id = $2';
            countParams.push(problem_id);
        }
        const countResult = await database_1.default.query(countQuery, countParams);
        return res.json({
            submissions: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: parseInt(countResult.rows[0].count),
                pages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get user submissions error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUserSubmissions = getUserSubmissions;
const processSubmission = async (submissionId, code, language, testCases) => {
    try {
        await database_1.default.query('UPDATE submissions SET status = $1 WHERE id = $2', ['processing', submissionId]);
        let allPassed = true;
        let runtime = 0;
        let memory = 0;
        for (const testCase of testCases) {
            const submission = {
                source_code: code,
                language_id: LANGUAGE_IDS[language],
                stdin: testCase.input,
                expected_output: testCase.expected_output
            };
            const result = await executeCode(submission);
            if (result.status?.id !== 3) {
                allPassed = false;
                break;
            }
            runtime = Math.max(runtime, parseFloat(result.time || '0') * 1000);
            memory = Math.max(memory, result.memory || 0);
        }
        const status = allPassed ? 'accepted' : 'wrong_answer';
        await database_1.default.query(`UPDATE submissions 
       SET status = $1, runtime = $2, memory = $3 
       WHERE id = $4`, [status, Math.round(runtime), memory, submissionId]);
        if (allPassed) {
            await updateLeaderboard(submissionId);
        }
    }
    catch (error) {
        console.error('Process submission error:', error);
        await database_1.default.query('UPDATE submissions SET status = $1 WHERE id = $2', ['runtime_error', submissionId]);
    }
};
const executeCode = async (submission) => {
    const response = await fetch(`${process.env.JUDGE0_API_URL}/submissions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '',
        },
        body: JSON.stringify(submission)
    });
    if (!response.ok) {
        throw new Error('Judge0 API error');
    }
    const result = await response.json();
    let attempts = 0;
    const maxAttempts = 30;
    while (result.status?.id !== undefined && result.status.id <= 2 && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const statusResponse = await fetch(`${process.env.JUDGE0_API_URL}/submissions/${result.token}`);
        const statusResult = await statusResponse.json();
        if (statusResult.status?.id !== undefined && statusResult.status.id > 2) {
            return statusResult;
        }
        attempts++;
    }
    return result;
};
const updateLeaderboard = async (submissionId) => {
    try {
        const submissionResult = await database_1.default.query('SELECT user_id, problem_id FROM submissions WHERE id = $1', [submissionId]);
        if (submissionResult.rows.length === 0)
            return;
        const { user_id, problem_id } = submissionResult.rows[0];
        const existingAccepted = await database_1.default.query(`SELECT id FROM submissions 
       WHERE user_id = $1 AND problem_id = $2 AND status = 'accepted' AND id != $3
       LIMIT 1`, [user_id, problem_id, submissionId]);
        if (existingAccepted.rows.length > 0)
            return;
        await database_1.default.query(`
      INSERT INTO leaderboard (user_id, total_solved, last_submission_at)
      VALUES ($1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        total_solved = leaderboard.total_solved + 1,
        last_submission_at = CURRENT_TIMESTAMP
    `, [user_id]);
        await database_1.default.query(`
      UPDATE leaderboard 
      SET rank = subquery.rank
      FROM (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_solved DESC, last_submission_at ASC) as rank
        FROM leaderboard
      ) subquery
      WHERE leaderboard.user_id = subquery.user_id
    `);
    }
    catch (error) {
        console.error('Update leaderboard error:', error);
    }
};
exports.validateSubmitCode = [
    (0, express_validator_1.body)('problem_id').isUUID().withMessage('Valid problem ID required'),
    (0, express_validator_1.body)('code').trim().isLength({ min: 1 }).withMessage('Code cannot be empty'),
    (0, express_validator_1.body)('language').isIn(['python', 'java', 'cpp', 'c']).withMessage('Invalid language')
];
//# sourceMappingURL=submissionController.js.map