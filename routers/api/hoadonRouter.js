import express from 'express'
import DataModel from '../../models/index.js'
const router = express.Router()

router.get('/', async (req, res, next) => {
    try {
        const hoasDons = await DataModel.Data_HoaDon_Model.find({})
        res.json(hoasDons)
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const hoaDon = await DataModel.Data_HoaDon_Model.findById(id)
        if (!hoaDon) return res.status(404).json({ message: 'Khong tim thay hoa don' })
        res.json(hoaDon)
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { DatPhongId } = req.body
        const datPhong = await DataModel.Data_DatPhong_Model.findById(DatPhongId)
        if(!datPhong) return res.status(404).json({message: 'DatPhongId khong ton tai'})
        await DataModel.Data_HoaDon_Model.create({ DatPhongId })
        res.json({ message: 'Tao hoa don thanh cong' })
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const { TongTien, TrangThai } = req.body
        const hoaDon = await DataModel.Data_HoaDon_Model.findById(id)
        if (!hoaDon) return res.status(404).json('Khong co hoa don')

        hoaDon.TongTien = TongTien ? TongTien : hoaDon.TongTien
        hoaDon.TrangThai = TrangThai ? TrangThai : hoaDon.TrangThai

        await hoaDon.save()
        res.json({ message: 'Cap nhat hoa don thanh cong' })
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const deleted = await DataModel.Data_HoaDon_Model.findByIdAndDelete(id)
        if (!deleted) return res.status(404).json({ message: 'Khong co hoa don can xoa' })
        res.json({ message: 'Xoa hoa don thanh cong' })
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

export default router
