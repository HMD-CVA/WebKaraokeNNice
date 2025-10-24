import express from 'express'
import DataModel from '../../models/index.js'
const router = express.Router()

// Thêm sản phẩm
router.post('/', async (req, res) => {
    try {
        const { name, price, description, image, sale } = req.body;
        const sp = await DataModel.Data_SanPham_Model.create({ name, price, description, image, sale });
        res.status(200).json(sp);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Cập nhật sản phẩm
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, image, sale } = req.body;
        const sp = await DataModel.Data_SanPham_Model.findByIdAndUpdate(id, { name, price, description, image, sale }, { new: true });
        if (!sp) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        res.json(sp);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Xóa sản phẩm
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sp = await DataModel.Data_SanPham_Model.findByIdAndDelete(id);
        if (!sp) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        res.json({ message: 'Xóa sản phẩm thành công' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router