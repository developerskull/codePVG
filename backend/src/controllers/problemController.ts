import { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import pool from '../utils/database';
import { Problem, TestCase, Example, AuthRequest } from '../types';

export const getProblems = async (req: Request, res: Response): Promise<any> => {
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
    
    const queryParams: any[] = [];
    const conditions: string[] = [];

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

    const result = await pool.query(queryText, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM problems p';
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));

    return res.json({
      problems: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get problems error:', error);
    // Return mock data for development when database isn't available
    // Check for various database connection errors
    const isDatabaseError = error.message && (
      error.message.includes('ECONNREFUSED') || 
      error.message.includes('relation "problems" does not exist') ||
      error.message.includes('database') ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND'
    );
    
    if (isDatabaseError) {
      const mockProblems = [];
      const difficulties = ['easy', 'medium', 'hard'];
      const topics = ['Array', 'String', 'Tree', 'Dynamic Programming', 'Linked List'];
      
      for (let i = 1; i <= Math.min(Number(limit), 12); i++) {
        // Use deterministic values based on i for consistent sorting
        const difficulty = difficulties[i % difficulties.length];
        const topic = topics[i % topics.length];
        const baseDate = new Date('2024-01-01');
        const createdDate = new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000)); // i days after base date
        
        mockProblems.push({
          id: `problem-${i}`,
          title: `Sample Problem ${i}`,
          description: `This is a sample problem description for problem ${i}. Solve this algorithmic challenge to improve your coding skills.`,
          difficulty: difficulty,
          topic: topic,
          examples: [
            { input: '1 2', output: '3', explanation: '1 + 2 = 3' },
            { input: '4 5', output: '9', explanation: '4 + 5 = 9' }
          ],
          constraints: ['1 ≤ n ≤ 100', 'All inputs are integers'],
          created_by: 'admin',
          created_by_name: 'Admin User',
          submission_count: (i * 3) % 50,
          accepted_count: (i * 2) % 30,
          created_at: createdDate.toISOString()
        });
      }
      
      // Apply filtering if needed
      let filteredProblems = mockProblems;
      if (difficulty) {
        filteredProblems = filteredProblems.filter(p => p.difficulty === difficulty);
      }
      if (topic) {
        filteredProblems = filteredProblems.filter(p => p.topic === topic);
      }

      return res.json({
        problems: filteredProblems,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredProblems.length,
          pages: Math.ceil(filteredProblems.length / Number(limit))
        }
      });
    }
    
    // For development, always return mock data if there's any error
    console.log('Returning mock data for development...');
    const mockProblems = [];
    const difficulties = ['easy', 'medium', 'hard'];
    const topics = ['Array', 'String', 'Tree', 'Dynamic Programming', 'Linked List'];
    
    for (let i = 1; i <= Math.min(Number(limit), 12); i++) {
      // Use deterministic values based on i for consistent sorting
      const difficulty = difficulties[i % difficulties.length];
      const topic = topics[i % topics.length];
      const baseDate = new Date('2024-01-01');
      const createdDate = new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000)); // i days after base date
      
      mockProblems.push({
        id: `problem-${i}`,
        title: `Sample Problem ${i}`,
        description: `This is a sample problem description for problem ${i}. Solve this algorithmic challenge to improve your coding skills.`,
        difficulty: difficulty,
        topic: topic,
        examples: [
          { input: '1 2', output: '3', explanation: '1 + 2 = 3' },
          { input: '4 5', output: '9', explanation: '4 + 5 = 9' }
        ],
        constraints: ['1 ≤ n ≤ 100', 'All inputs are integers'],
        created_by: 'admin',
        created_by_name: 'Admin User',
        submission_count: (i * 3) % 50,
        accepted_count: (i * 2) % 30,
        created_at: createdDate.toISOString()
      });
    }
    
    // Apply filtering if needed
    let filteredProblems = mockProblems;
    if (difficulty) {
      filteredProblems = filteredProblems.filter(p => p.difficulty === difficulty);
    }
    if (topic) {
      filteredProblems = filteredProblems.filter(p => p.topic === topic);
    }

    return res.json({
      problems: filteredProblems,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredProblems.length,
        pages: Math.ceil(filteredProblems.length / Number(limit))
      }
    });
  }
};

export const getProblemById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT p.*, u.name as created_by_name
      FROM problems p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    return res.json({ problem: result.rows[0] });
  } catch (error: any) {
    console.error('Get problem error:', error);
    console.error('Error type:', typeof error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Check for database connection errors
    const isDatabaseError = error.message && (
      error.message.includes('ECONNREFUSED') || 
      error.message.includes('relation "problems" does not exist') ||
      error.message.includes('database') ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND'
    );
    
    console.log('Is database error:', isDatabaseError);
    
    if (isDatabaseError) {
      console.log('Returning mock data for development...');
      const { id } = req.params;
      
      // Create mock problem data with deterministic values
      const problemNumber = parseInt(id.split('-')[1]) || 1;
      const difficulties = ['easy', 'medium', 'hard'];
      const topics = ['Array', 'String', 'Tree', 'Dynamic Programming', 'Linked List'];
      
      const mockProblem = {
        id: id,
        title: `Sample Problem ${problemNumber}`,
        description: `This is a detailed problem description for ${id}. The problem involves solving a specific algorithmic challenge that tests your understanding of data structures and algorithms.`,
        difficulty: difficulties[problemNumber % difficulties.length],
        topic: topics[problemNumber % topics.length],
        test_cases: [
          { input: '1 2 3', expected_output: '6', is_hidden: false },
          { input: '4 5 6', expected_output: '15', is_hidden: true }
        ],
        examples: [
          { input: '1 2', output: '3', explanation: '1 + 2 = 3' },
          { input: '4 5', output: '9', explanation: '4 + 5 = 9' }
        ],
        constraints: ['1 ≤ n ≤ 100', 'All inputs are integers', 'Time complexity: O(n)'],
        created_by: 'admin',
        created_by_name: 'Admin User',
        submission_count: (problemNumber * 3) % 50,
        accepted_count: (problemNumber * 2) % 30,
        created_at: new Date('2024-01-01').toISOString()
      };

      return res.json({ problem: mockProblem });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProblem = async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const authReq = req as unknown as AuthRequest;
    const { title, description, difficulty, topic, test_cases, examples, constraints } = req.body;

    const result = await pool.query(
      `INSERT INTO problems (title, description, difficulty, topic, test_cases, examples, constraints, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, difficulty, topic, test_cases, examples, constraints, authReq.user?.id]
    );

    return res.status(201).json({
      message: 'Problem created successfully',
      problem: result.rows[0]
    });
  } catch (error) {
    console.error('Create problem error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProblem = async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const authReq = req as unknown as AuthRequest;
    const { title, description, difficulty, topic, test_cases, examples, constraints } = req.body;

    // Check if problem exists and user has permission
    const existingProblem = await pool.query(
      'SELECT created_by FROM problems WHERE id = $1',
      [id]
    );

    if (existingProblem.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Check permissions (creator or admin/super-admin)
    if (existingProblem.rows[0].created_by !== authReq.user?.id && 
        !['admin', 'super-admin'].includes(authReq.user?.role || '')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const result = await pool.query(
      `UPDATE problems 
       SET title = $1, description = $2, difficulty = $3, topic = $4, 
           test_cases = $5, examples = $6, constraints = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, description, difficulty, topic, test_cases, examples, constraints, id]
    );

    return res.json({
      message: 'Problem updated successfully',
      problem: result.rows[0]
    });
  } catch (error) {
    console.error('Update problem error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProblem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const authReq = req as unknown as AuthRequest;

    // Check if problem exists and user has permission
    const existingProblem = await pool.query(
      'SELECT created_by FROM problems WHERE id = $1',
      [id]
    );

    if (existingProblem.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Check permissions (creator or super-admin)
    if (existingProblem.rows[0].created_by !== authReq.user?.id && 
        authReq.user?.role !== 'super-admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await pool.query('DELETE FROM problems WHERE id = $1', [id]);

    return res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Validation middleware
export const validateCreateProblem = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  body('topic').trim().isLength({ min: 2, max: 50 }).withMessage('Topic must be 2-50 characters'),
  body('test_cases').isArray({ min: 1 }).withMessage('At least one test case required'),
  body('examples').isArray({ min: 1 }).withMessage('At least one example required'),
  body('constraints').isArray().withMessage('Constraints must be an array')
];

export const validateUpdateProblem = validateCreateProblem;
