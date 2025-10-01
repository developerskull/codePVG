import { Router } from 'express'
import { login, signup, validateLogin, validateSignup } from '../controllers/supabaseAuthController'

const router = Router()

router.post('/signup', validateSignup, signup)
router.post('/login', validateLogin, login)

export default router


