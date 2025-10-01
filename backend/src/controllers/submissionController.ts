import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../utils/database';
import { Judge0Submission, Judge0Result, AuthRequest } from '../types';

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
  python: 71,
  java: 62,
  cpp: 54,
  c: 50
};

export const submitCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const authReq = req as unknown as AuthRequest;
    const { problem_id, code, language } = req.body;

    // Get problem details
    const problemResult = await pool.query(
      'SELECT test_cases FROM problems WHERE id = $1',
      [problem_id]
    );

    if (problemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const testCases = problemResult.rows[0].test_cases;

    // Create submission record
    const submissionResult = await pool.query(
      `INSERT INTO submissions (user_id, problem_id, code, language, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [authReq.user?.id, problem_id, code, language]
    );

    const submission = submissionResult.rows[0];

    // Process submission asynchronously
    processSubmission(submission.id, code, language, testCases);

    return res.status(202).json({
      message: 'Submission received',
      submission: {
        id: submission.id,
        status: submission.status,
        created_at: submission.created_at
      }
    });
  } catch (error) {
    console.error('Submit code error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const authReq = req as unknown as AuthRequest;

    const result = await pool.query(
      `SELECT s.*, p.title as problem_title
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       WHERE s.id = $1 AND s.user_id = $2`,
      [id, authReq.user?.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    return res.json({ submission: result.rows[0] });
  } catch (error) {
    console.error('Get submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserSubmissions = async (req: Request, res: Response): Promise<any> => {
  try {
    const authReq = req as unknown as AuthRequest;
    const { page = 1, limit = 10, problem_id } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = `
      SELECT s.*, p.title as problem_title
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = $1
    `;
    
    const queryParams: any[] = [authReq.user?.id];

    if (problem_id) {
      queryText += ` AND s.problem_id = $${queryParams.length + 1}`;
      queryParams.push(problem_id);
    }

    queryText += ` ORDER BY s.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(Number(limit), offset);

    const result = await pool.query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM submissions WHERE user_id = $1';
    const countParams: any[] = [authReq.user?.id];
    
    if (problem_id) {
      countQuery += ' AND problem_id = $2';
      countParams.push(problem_id);
    }

    const countResult = await pool.query(countQuery, countParams);

    return res.json({
      submissions: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get user submissions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const processSubmission = async (submissionId: string, code: string, language: string, testCases: any[]) => {
  try {
    // Update status to processing
    await pool.query(
      'UPDATE submissions SET status = $1 WHERE id = $2',
      ['processing', submissionId]
    );

    let allPassed = true;
    let runtime = 0;
    let memory = 0;

    // Test against each test case
    for (const testCase of testCases) {
      const submission: Judge0Submission = {
        source_code: code,
        language_id: LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS],
        stdin: testCase.input,
        expected_output: testCase.expected_output
      };

      const result = await executeCode(submission);
      
      if (result.status?.id !== 3) { // Not accepted
        allPassed = false;
        break;
      }

      runtime = Math.max(runtime, parseFloat(result.time || '0') * 1000);
      memory = Math.max(memory, result.memory || 0);
    }

    // Update submission with results
    const status = allPassed ? 'accepted' : 'wrong_answer';
    await pool.query(
      `UPDATE submissions 
       SET status = $1, runtime = $2, memory = $3 
       WHERE id = $4`,
      [status, Math.round(runtime), memory, submissionId]
    );

    // Update leaderboard if accepted
    if (allPassed) {
      await updateLeaderboard(submissionId);
    }

  } catch (error) {
    console.error('Process submission error:', error);
    await pool.query(
      'UPDATE submissions SET status = $1 WHERE id = $2',
      ['runtime_error', submissionId]
    );
  }
};

const executeCode = async (submission: Judge0Submission): Promise<Judge0Result> => {
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

  const result = await response.json() as Judge0Result;
  
  // Poll for result
  let attempts = 0;
  const maxAttempts = 30;

  while (result.status?.id !== undefined && result.status.id <= 2 && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const statusResponse = await fetch(`${process.env.JUDGE0_API_URL}/submissions/${result.token}`);
    const statusResult = await statusResponse.json() as Judge0Result;
    
    if (statusResult.status?.id !== undefined && statusResult.status.id > 2) {
      return statusResult;
    }
    
    attempts++;
  }

  return result;
};

const updateLeaderboard = async (submissionId: string) => {
  try {
    // Get submission details
    const submissionResult = await pool.query(
      'SELECT user_id, problem_id FROM submissions WHERE id = $1',
      [submissionId]
    );

    if (submissionResult.rows.length === 0) return;

    const { user_id, problem_id } = submissionResult.rows[0];

    // Check if this is the first accepted submission for this problem by this user
    const existingAccepted = await pool.query(
      `SELECT id FROM submissions 
       WHERE user_id = $1 AND problem_id = $2 AND status = 'accepted' AND id != $3
       LIMIT 1`,
      [user_id, problem_id, submissionId]
    );

    if (existingAccepted.rows.length > 0) return; // Already solved

    // Update leaderboard
    await pool.query(`
      INSERT INTO leaderboard (user_id, total_solved, last_submission_at)
      VALUES ($1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        total_solved = leaderboard.total_solved + 1,
        last_submission_at = CURRENT_TIMESTAMP
    `, [user_id]);

    // Update ranks
    await pool.query(`
      UPDATE leaderboard 
      SET rank = subquery.rank
      FROM (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_solved DESC, last_submission_at ASC) as rank
        FROM leaderboard
      ) subquery
      WHERE leaderboard.user_id = subquery.user_id
    `);

  } catch (error) {
    console.error('Update leaderboard error:', error);
  }
};

// Validation middleware
export const validateSubmitCode = [
  body('problem_id').isUUID().withMessage('Valid problem ID required'),
  body('code').trim().isLength({ min: 1 }).withMessage('Code cannot be empty'),
  body('language').isIn(['python', 'java', 'cpp', 'c']).withMessage('Invalid language')
];
