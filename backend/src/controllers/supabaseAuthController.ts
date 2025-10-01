import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { supabaseAnon, supabaseAdmin } from '../utils/supabase'

export const validateSignup = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').isString().isLength({ min: 1 }).withMessage('Name is required'),
]

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      email,
      password,
      name,
      username,
      prn,
      batch,
      department,
      college_id,
      year_of_study,
      bio,
    } = req.body

    // 1) Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: { name, username },
      },
    })
    if (authError || !authData?.user) {
      return res.status(400).json({ error: authError?.message || 'Failed to create user' })
    }

    const authUserId = authData.user.id

    // 2) Create profile row in public.users via Supabase (service role bypasses RLS)
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authUserId,
        email,
        name,
        username: username || null,
        prn: prn || null,
        batch: batch || null,
        department: department || null,
        college_id: college_id || null,
        year_of_study: year_of_study || null,
        bio: bio || null,
        approval_status: 'pending',
        role: 'student',
      })
      .select()
      .single()

    if (insErr) {
      return res.status(400).json({ error: insErr.message })
    }

    return res.status(201).json({
      message: 'Signup successful. Please verify your email if required.',
      user: inserted,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Supabase signup error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // 1) Sign in via Supabase Auth
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password })
    if (error || !data?.user || !data?.session) {
      return res.status(401).json({ error: error?.message || 'Invalid credentials' })
    }

    const authUserId = data.user.id

    // 2) Fetch profile from users via Supabase
    const { data: profile, error: profErr } = await supabaseAdmin
      .from('users')
      .select('id, name, email, username, role, approval_status, verified, created_at')
      .eq('auth_user_id', authUserId)
      .single()

    if (profErr || !profile) {
      return res.status(404).json({ error: profErr?.message || 'User profile not found' })
    }

    // 3) Return Supabase session access token and profile
    return res.json({
      message: 'Login successful',
      user: profile,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Supabase login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}


