import express from 'express'
import DataModel from '../../app/models/index.js'
const router = express.Router()

// Thêm nhân viên
router.post('/', async (req, res) => {
    try {
        const { name, email, age } = req.body;
        const nv = await DataModel.Data_NhanVien_Model.create({ name, email, age });
        res.status(200).json(nv);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router