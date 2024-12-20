import {
  userSignup,
  userLogin
} from '../controllers/users.controller'
import express from 'express';
const authRouter = express.Router()

authRouter.post('/login', userLogin)
authRouter.post('/signup', userSignup)

export default authRouter;