import express from 'express'
import DataModel from '../../models/index.js'
const router = express.Router()

router.get('/', async (req, res, next) => {
    try {
        const datPhongs = await DataModel.Data_DatPhong_Model.find({})
        res.json(datPhongs)
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const datPhong = await DataModel.Data_DatPhong_Model.findById(id)
        if (!datPhong) return res.status(404).json({ message: 'Khong tim thay don dat phong' })
        res.json(datPhong)
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { MaKH, MaPhong, ThoiGianBatDau } = req.body
        await DataModel.Data_DatPhong_Model.create({ MaKH, MaPhong, ThoiGianBatDau })
        res.json({ message: 'Dat phong thanh cong' })
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const { ThoiGianBatDau, ThoiGianKetThuc, TrangThai } = req.body
        const datPhong = await DataModel.Data_DatPhong_Model.findById(id)
        if (!datPhong) return res.status(404).json('Khong co don dat phong')

        datPhong.ThoiGianBatDau = ThoiGianBatDau ? ThoiGianBatDau : datPhong.ThoiGianBatDau
        datPhong.ThoiGianKetThuc = ThoiGianKetThuc ? ThoiGianKetThuc : datPhong.ThoiGianKetThuc
        datPhong.TrangThai = TrangThai ? TrangThai : datPhong.TrangThai

        await datPhong.save()
        res.json({ message: 'Cap nhat don dat phong thanh cong' })
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const deleted = await DataModel.Data_DatPhong_Model.findByIdAndDelete(id)
        if (!deleted) return res.status(404).json({ message: 'Khong co don dat phong can xoa' })
        res.json({ message: 'Xoa don dat phong thanh cong' })
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

export default router
