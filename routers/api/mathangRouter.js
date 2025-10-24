import express from 'express'
import DataModel from '../../models/index.js'
const router = express.Router()

router.get('/', async (req, res, next) => {
    try {
        const matHangs = await DataModel.Data_MatHang_Model.find({})
        res.json(matHangs)
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const matHang = await DataModel.Data_MatHang_Model.findById(id)
        if (!matHang) return res.status(404).json({ message: 'Khong tim thay mat hang' })
        res.json(matHang)
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { TenHang, DonGia, DonViTinh, SoLuongTon, LinkAnh } = req.body
        await DataModel.Data_MatHang_Model.create({ TenHang, DonGia, DonViTinh, SoLuongTon, LinkAnh })
        res.json({ message: 'Them mat hang thanh cong' })
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const { TenHang, DonGia, DonViTinh, SoLuongTon, LinkAnh } = req.body
        const matHang = await DataModel.Data_MatHang_Model.findById(id)
        if (!matHang) return res.status(404).json('Khong co mat hang')

        matHang.TenHang = TenHang ? TenHang : matHang.TenHang
        matHang.DonGia = DonGia ? DonGia : matHang.DonGia
        matHang.DonViTinh = DonViTinh ? DonViTinh : matHang.DonViTinh
        matHang.SoLuongTon = SoLuongTon ? SoLuongTon : matHang.SoLuongTon
        matHang.LinkAnh = LinkAnh ? LinkAnh : matHang.LinkAnh

        await matHang.save()
        res.json({ message: 'Cap nhat mat hang thanh cong' })
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const deleted = await DataModel.Data_MatHang_Model.findByIdAndDelete(id)
        if (!deleted) return res.status(404).json({ message: 'Khong co mat hang can xoa' })
        res.json({ message: 'Xoa mat hang thanh cong' })
    } catch (error) {
        res.status(500).json({ message: 'Loi server', error: error.message })
    }
})

export default router
