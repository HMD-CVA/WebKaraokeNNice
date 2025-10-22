import express from 'express'
import webRouter from './webRouter.js'
import apiRouter from './api/apiRouter.js'
const router = express.Router()

router.use('/', webRouter)
router.use('/api', apiRouter)

export default router