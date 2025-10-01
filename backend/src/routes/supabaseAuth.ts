import { Router } from 'express'
import { login, signup, validateLogin, validateSignup, getProfile, updateProfile, verifySupabaseToken } from '../controllers/supabaseAuthController'

const router = Router()

router.post('/signup', validateSignup, signup)
router.post('/login', validateLogin, login)

// Protected routes
router.get('/profile', verifySupabaseToken, getProfile)
router.put('/profile', verifySupabaseToken, updateProfile)

export default router


