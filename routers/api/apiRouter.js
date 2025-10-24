import express from 'express'
import DataModel from '../../models/index.js'
import banggialoaiphongRouter from './banggialoaiphongRouter.js'
import khachhangRouter from './khachhangRouter.js'
import nhanvienRouter from './nhanvienRouter.js'
import phonghatRouter from './phonghatRouter.js'
import sanphamRouter from './sanphamRouter.js'
import mathangRouter from './mathangRouter.js'
import datphongRouter from './datphongRouter.js'
import hoadonRouter from './hoadonRouter.js'
const router = express.Router()

// Admin login
router.post('/admin-login', async (req, res) => {
    const { username, password } = req.body
    try {
        const admin = await DataModel.Data_Admin_Model.findOne({ username, password })
        if (admin) {
            req.session.isAdmin = true
            return res.redirect('/admin')
        }
        res.send('Sai tài khoản hoặc mật khẩu!')
    } catch (err) {
        res.status(500).send('Lỗi server!')
    }
})

router.use('/khachhang', khachhangRouter)
router.use('/nhanvien', nhanvienRouter)
router.use('/phonghat', phonghatRouter)
router.use('/sanpham', sanphamRouter)
router.use('/mathang', mathangRouter)
router.use('/datphong', datphongRouter)
router.use('/hoadon', hoadonRouter)
router.use('/', banggialoaiphongRouter)

export default router