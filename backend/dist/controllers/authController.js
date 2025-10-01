"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateUser = exports.validateUpdateProfile = exports.validateLogin = exports.validateRegister = exports.getColleges = exports.updateApprovalStatus = exports.getPendingApprovals = exports.linkedinCallback = exports.deleteUser = exports.getAllUsers = exports.updateUser = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../utils/database"));
const prnValidation_1 = require("../utils/prnValidation");
const register = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password, username, prn, batch, department, college_id, year_of_study, role = 'student' } = req.body;
        const existingUser = await database_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        if (prn) {
            const prnValidation = await (0, prnValidation_1.validatePRN)(prn);
            if (!prnValidation.valid) {
                return res.status(400).json({ error: prnValidation.message });
            }
        }
        if (username) {
            const existingUsername = await database_1.default.query('SELECT id FROM users WHERE username = $1', [username]);
            if (existingUsername.rows.length > 0) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }
        const saltRounds = 12;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        const approvalStatus = (prn || college_id) ? 'pending' : 'approved';
        const result = await database_1.default.query(`INSERT INTO users (
        name, email, password_hash, username, prn, batch, 
        department, college_id, year_of_study, role, approval_status, verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING id, name, email, username, role, approval_status, created_at`, [
            name, email, passwordHash, username, prn, batch,
            department, college_id, year_of_study, role, approvalStatus, false
        ]);
        const user = result.rows[0];
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        return res.status(201).json({
            message: approvalStatus === 'pending'
                ? 'Registration successful. Awaiting admin approval.'
                : 'User created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                approval_status: user.approval_status,
                created_at: user.created_at
            },
            token,
            needsApproval: approvalStatus === 'pending'
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error.message && error.message.includes('ECONNREFUSED')) {
            return res.status(201).json({
                message: 'Registration successful (development mode)',
                user: {
                    id: 'dev-user-id',
                    name: req.body.name,
                    email: req.body.email,
                    role: req.body.role || 'student',
                    approval_status: 'approved',
                    created_at: new Date().toISOString()
                },
                token: 'dev-jwt-token',
                needsApproval: false
            });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const result = await database_1.default.query('SELECT id, name, email, username, password_hash, role, approval_status, verified, created_at FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        if (!user.password_hash) {
            return res.status(401).json({ error: 'Please login using LinkedIn' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.approval_status === 'pending') {
            return res.status(403).json({
                error: 'Your account is pending admin approval. Please wait for approval.',
                approval_status: 'pending'
            });
        }
        if (user.approval_status === 'rejected') {
            return res.status(403).json({
                error: 'Your account has been rejected. Please contact support.',
                approval_status: 'rejected'
            });
        }
        if (user.linkedin_id && !user.linkedin_url) {
            try {
                await database_1.default.query('UPDATE users SET linkedin_url = $1 WHERE id = $2', [`https://linkedin.com/in/${user.linkedin_id}`, user.id]);
                user.linkedin_url = `https://linkedin.com/in/${user.linkedin_id}`;
            }
            catch (updateError) {
                console.error('Error updating LinkedIn URL:', updateError);
            }
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        return res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                github_link: user.github_link,
                linkedin_url: user.linkedin_url,
                bio: user.bio,
                resume_link: user.resume_link,
                portfolio_link: user.portfolio_link,
                privacy_settings: user.privacy_settings,
                role: user.role,
                approval_status: user.approval_status,
                verified: user.verified,
                created_at: user.created_at
            },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        if (error.message && error.message.includes('ECONNREFUSED')) {
            return res.json({
                message: 'Login successful (development mode)',
                user: {
                    id: 'dev-user-id',
                    name: 'Development User',
                    email: req.body?.email || 'dev@example.com',
                    role: 'student',
                    approval_status: 'approved',
                    verified: true,
                    created_at: new Date().toISOString()
                },
                token: 'dev-jwt-token'
            });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const authReq = req;
        const user = authReq.user;
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        return res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                github_link: user.github_link,
                linkedin_url: user.linkedin_url,
                bio: user.bio,
                resume_link: user.resume_link,
                portfolio_link: user.portfolio_link,
                privacy_settings: user.privacy_settings,
                role: user.role,
                created_at: user.created_at
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        if (error.message && error.message.includes('ECONNREFUSED')) {
            return res.json({
                user: {
                    id: 'dev-user-id',
                    name: 'Development User',
                    email: 'dev@example.com',
                    role: 'student',
                    created_at: new Date().toISOString()
                }
            });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const authReq = req;
        const userId = authReq.user?.id;
        const { username, github_link, linkedin_url, bio, resume_link, portfolio_link, privacy_settings, current_password, new_password } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const userResult = await database_1.default.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({ error: 'Current password required to set new password' });
            }
            const isValidPassword = await bcryptjs_1.default.compare(current_password, userResult.rows[0].password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
        }
        if (username) {
            const existingUsername = await database_1.default.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, userId]);
            if (existingUsername.rows.length > 0) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;
        if (username !== undefined) {
            updateFields.push(`username = $${paramCount}`);
            updateValues.push(username || null);
            paramCount++;
        }
        if (github_link !== undefined) {
            updateFields.push(`github_link = $${paramCount}`);
            updateValues.push(github_link || null);
            paramCount++;
        }
        if (linkedin_url !== undefined) {
            updateFields.push(`linkedin_url = $${paramCount}`);
            updateValues.push(linkedin_url || null);
            paramCount++;
        }
        if (bio !== undefined) {
            updateFields.push(`bio = $${paramCount}`);
            updateValues.push(bio || null);
            paramCount++;
        }
        if (resume_link !== undefined) {
            updateFields.push(`resume_link = $${paramCount}`);
            updateValues.push(resume_link || null);
            paramCount++;
        }
        if (portfolio_link !== undefined) {
            updateFields.push(`portfolio_link = $${paramCount}`);
            updateValues.push(portfolio_link || null);
            paramCount++;
        }
        if (privacy_settings !== undefined) {
            updateFields.push(`privacy_settings = $${paramCount}`);
            updateValues.push(JSON.stringify(privacy_settings));
            paramCount++;
        }
        if (new_password) {
            const saltRounds = 12;
            const passwordHash = await bcryptjs_1.default.hash(new_password, saltRounds);
            updateFields.push(`password_hash = $${paramCount}`);
            updateValues.push(passwordHash);
            paramCount++;
        }
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(userId);
        const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, username, github_link, linkedin_url, bio, resume_link, portfolio_link, privacy_settings, role, created_at, updated_at
    `;
        const result = await database_1.default.query(query, updateValues);
        return res.json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        if (error.message && error.message.includes('ECONNREFUSED')) {
            return res.json({
                message: 'Profile updated successfully (development mode)',
                user: {
                    id: 'dev-user-id',
                    name: 'Development User',
                    email: 'dev@example.com',
                    username: req.body.username || 'devuser',
                    github_link: req.body.github_link || null,
                    linkedin_url: req.body.linkedin_url || null,
                    bio: req.body.bio || null,
                    resume_link: req.body.resume_link || null,
                    portfolio_link: req.body.portfolio_link || null,
                    privacy_settings: req.body.privacy_settings || {
                        show_email: false,
                        show_github: true,
                        show_linkedin: true,
                        show_bio: true,
                        show_resume: false,
                        show_portfolio: true
                    },
                    role: 'student',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateProfile = updateProfile;
const updateUser = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const authReq = req;
        const { id } = req.params;
        const { name, email, role, password } = req.body;
        const userResult = await database_1.default.query('SELECT id, role FROM users WHERE id = $1', [id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const targetUser = userResult.rows[0];
        if (authReq.user?.role === 'admin') {
            if (targetUser.role === 'admin' || targetUser.role === 'super-admin') {
                return res.status(403).json({ error: 'Admins cannot update other admins or super-admins' });
            }
            if (role && (role === 'admin' || role === 'super-admin')) {
                return res.status(403).json({ error: 'Admins cannot promote users to admin or super-admin' });
            }
        }
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;
        if (name) {
            updateFields.push(`name = $${paramCount}`);
            updateValues.push(name);
            paramCount++;
        }
        if (email) {
            const emailCheck = await database_1.default.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
            if (emailCheck.rows.length > 0) {
                return res.status(400).json({ error: 'Email already in use' });
            }
            updateFields.push(`email = $${paramCount}`);
            updateValues.push(email);
            paramCount++;
        }
        if (role) {
            updateFields.push(`role = $${paramCount}`);
            updateValues.push(role);
            paramCount++;
        }
        if (password) {
            const saltRounds = 12;
            const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
            updateFields.push(`password_hash = $${paramCount}`);
            updateValues.push(passwordHash);
            paramCount++;
        }
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(id);
        const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, created_at, updated_at
    `;
        const result = await database_1.default.query(query, updateValues);
        return res.json({
            message: 'User updated successfully',
            user: result.rows[0]
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateUser = updateUser;
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let queryText = 'SELECT id, name, email, role, created_at, updated_at FROM users WHERE 1=1';
        const queryParams = [];
        let paramCount = 1;
        if (role) {
            queryText += ` AND role = $${paramCount}`;
            queryParams.push(role);
            paramCount++;
        }
        if (search) {
            queryText += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }
        queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        queryParams.push(Number(limit), offset);
        const result = await database_1.default.query(queryText, queryParams);
        let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
        const countParams = [];
        let countParamCount = 1;
        if (role) {
            countQuery += ` AND role = $${countParamCount}`;
            countParams.push(role);
            countParamCount++;
        }
        if (search) {
            countQuery += ` AND (name ILIKE $${countParamCount} OR email ILIKE $${countParamCount})`;
            countParams.push(`%${search}%`);
        }
        const countResult = await database_1.default.query(countQuery, countParams);
        return res.json({
            users: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: parseInt(countResult.rows[0].count),
                pages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get all users error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAllUsers = getAllUsers;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const authReq = req;
        if (id === authReq.user?.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        const userResult = await database_1.default.query('SELECT id FROM users WHERE id = $1', [id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        await database_1.default.query('DELETE FROM users WHERE id = $1', [id]);
        return res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteUser = deleteUser;
const linkedinCallback = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=authentication_failed`);
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        if (user.approval_status === 'pending') {
            return res.redirect(`${process.env.FRONTEND_URL}/auth/pending-approval?token=${token}`);
        }
        return res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
    }
    catch (error) {
        console.error('LinkedIn callback error:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=server_error`);
    }
};
exports.linkedinCallback = linkedinCallback;
const getPendingApprovals = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const result = await database_1.default.query(`SELECT u.id, u.name, u.email, u.username, u.prn, u.batch, u.department, 
              u.year_of_study, u.linkedin_id, u.created_at, c.name as college_name
       FROM users u
       LEFT JOIN colleges c ON u.college_id = c.id
       WHERE u.approval_status = 'pending'
       ORDER BY u.created_at ASC
       LIMIT $1 OFFSET $2`, [Number(limit), offset]);
        const countResult = await database_1.default.query('SELECT COUNT(*) FROM users WHERE approval_status = $1', ['pending']);
        return res.json({
            requests: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: parseInt(countResult.rows[0].count),
                pages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get pending approvals error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPendingApprovals = getPendingApprovals;
const updateApprovalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be approved or rejected' });
        }
        const userResult = await database_1.default.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const result = await database_1.default.query(`UPDATE users 
       SET approval_status = $1, verified = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, username, approval_status, verified`, [status, status === 'approved', id]);
        return res.json({
            message: `User ${status} successfully`,
            user: result.rows[0]
        });
    }
    catch (error) {
        console.error('Update approval status error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateApprovalStatus = updateApprovalStatus;
const getColleges = async (req, res) => {
    try {
        const search = req.query.search || '';
        let queryText = 'SELECT id, name, city, state FROM colleges';
        const queryParams = [];
        if (search) {
            queryText += ' WHERE name ILIKE $1';
            queryParams.push(`%${search}%`);
        }
        queryText += ' ORDER BY name ASC';
        const result = await database_1.default.query(queryText, queryParams);
        return res.json({
            colleges: result.rows
        });
    }
    catch (error) {
        console.error('Get colleges error:', error);
        if (error.message && error.message.includes('ECONNREFUSED')) {
            const mockColleges = [
                { id: '1', name: 'MIT College of Engineering', city: 'Pune', state: 'Maharashtra' },
                { id: '2', name: 'VIT Pune', city: 'Pune', state: 'Maharashtra' },
                { id: '3', name: 'Sinhgad College', city: 'Pune', state: 'Maharashtra' },
                { id: '4', name: 'PCCOE', city: 'Pune', state: 'Maharashtra' }
            ];
            const searchTerm = req.query.search;
            const filteredColleges = searchTerm
                ? mockColleges.filter(college => college.name.toLowerCase().includes(searchTerm.toLowerCase()))
                : mockColleges;
            return res.json({
                colleges: filteredColleges
            });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getColleges = getColleges;
exports.validateRegister = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('username').optional().trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-50 alphanumeric characters or underscores'),
    (0, express_validator_1.body)('prn').optional().trim().isLength({ min: 6, max: 20 }).withMessage('PRN must be 6-20 characters'),
    (0, express_validator_1.body)('batch').optional().trim().isLength({ max: 20 }).withMessage('Batch must be max 20 characters'),
    (0, express_validator_1.body)('department').optional().trim().isLength({ max: 100 }).withMessage('Department must be max 100 characters'),
    (0, express_validator_1.body)('college_id').optional().isUUID().withMessage('Invalid college ID'),
    (0, express_validator_1.body)('year_of_study').optional().isInt({ min: 1, max: 6 }).withMessage('Year of study must be 1-6'),
    (0, express_validator_1.body)('role').optional().isIn(['student', 'admin', 'super-admin']).withMessage('Invalid role')
];
exports.validateLogin = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password required')
];
exports.validateUpdateProfile = [
    (0, express_validator_1.body)('username').optional().trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-50 alphanumeric characters or underscores'),
    (0, express_validator_1.body)('github_link').optional().isURL().withMessage('GitHub link must be a valid URL'),
    (0, express_validator_1.body)('linkedin_url').optional().isURL().withMessage('LinkedIn URL must be a valid URL'),
    (0, express_validator_1.body)('bio').optional().isLength({ max: 500 }).withMessage('Bio must be max 500 characters'),
    (0, express_validator_1.body)('resume_link').optional().isURL().withMessage('Resume link must be a valid URL'),
    (0, express_validator_1.body)('portfolio_link').optional().isURL().withMessage('Portfolio link must be a valid URL'),
    (0, express_validator_1.body)('privacy_settings').optional().isObject().withMessage('Privacy settings must be an object'),
    (0, express_validator_1.body)('current_password').optional().isString().withMessage('Current password must be a string'),
    (0, express_validator_1.body)('new_password').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];
exports.validateUpdateUser = [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('role').optional().isIn(['student', 'admin', 'super-admin']).withMessage('Invalid role'),
    (0, express_validator_1.body)('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];
//# sourceMappingURL=authController.js.map