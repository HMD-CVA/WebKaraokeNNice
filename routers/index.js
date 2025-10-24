import express from 'express'
import webRouter from './webRouter.js'
import apiRouter from './api/apiRouter.js'
import authRouter from './authRouter.js'
const router = express.Router()

router.use('/', webRouter)
router.use('/api', apiRouter)
router.use('/auth', authRouter)

export default router