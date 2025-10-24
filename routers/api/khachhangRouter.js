import express from 'express'
import DataModel from '../../models/index.js'
const router = express.Router()

// Thêm khách hàng
router.post('/', async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const kh = await DataModel.Data_KhachHang_Model.create({ name, phone, address });
        res.status(200).json(kh);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Cập nhật khách hàng
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address } = req.body;
        const kh = await DataModel.Data_KhachHang_Model.findByIdAndUpdate(id, { name, phone, address }, { new: true });
        if (!kh) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
        res.json(kh);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Xóa khách hàng
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const kh = await DataModel.Data_KhachHang_Model.findByIdAndDelete(id);
        if (!kh) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
        res.json({ message: 'Xóa khách hàng thành công' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router