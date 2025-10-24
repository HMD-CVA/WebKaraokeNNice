import express from 'express'
import DataModel from '../../models/index.js'
import { generateCode } from '../../utils/codeGenerator.js'
const router = express.Router()

// API kiểm tra loại phòng có đang được sử dụng không
router.get('/check-loai-phong/:loaiPhong', async (req, res) => {
    try {
        const { loaiPhong } = req.params;
        
        // Kiểm tra xem có phòng nào đang sử dụng loại phòng này không
        const roomsUsingType = await DataModel.Data_PhongHat_Model.find({ 
            LoaiPhong: loaiPhong 
        });
        
        const roomDetails = roomsUsingType.map(room => ({
            TenPhong: room.TenPhong,
            MaPhong: room.MaPhong,
            TrangThai: room.TrangThai
        }));
        
        res.json({ 
            isUsed: roomsUsingType.length > 0,
            loaiPhong,
            count: roomsUsingType.length,
            rooms: roomDetails
        });
        
    } catch (err) {
        console.error('Lỗi kiểm tra loại phòng:', err);
        res.status(500).json({ error: err.message });
    }
});

// Thêm phòng hát
router.post('/', async (req, res) => {
    try {
        const { TenPhong, LoaiPhong, SucChua, TrangThai, GhiChu, LinkAnh } = req.body;      
        
        console.log('📥 Nhận dữ liệu phòng:', TenPhong);

        // Tạo mã phòng tự động sử dụng hàm generateCode
        const maPhong = await generateCode('P', DataModel.Data_PhongHat_Model, 'MaPhong');
        
        const ph = await DataModel.Data_PhongHat_Model.create({ 
            MaPhong: maPhong,
            TenPhong, 
            LoaiPhong,  
            SucChua, 
            TrangThai, 
            GhiChu, 
            LinkAnh,
            createdAt: new Date()
        });
        
        console.log('✅ Đã thêm phòng:', ph.TenPhong);
        console.log('📝 Mã phòng được tạo:', ph.MaPhong);
        
        res.status(200).json({
            success: true,
            message: `Thêm phòng "${ph.TenPhong}" thành công với mã ${ph.MaPhong}!`,
            data: ph
        });
        
    } catch (err) {
        console.error('❌ Lỗi thêm phòng:', err);
        res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
});

// Cập nhật phòng hát
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { TenPhong, LoaiPhong, SucChua, TrangThai, GhiChu, LinkAnh } = req.body;
        
        console.log('📥 Cập nhật phòng ID:', id);
        
        // KHÔNG cập nhật MaPhong khi sửa, chỉ cập nhật các trường khác
        const ph = await DataModel.Data_PhongHat_Model.findByIdAndUpdate(
            id,
            { 
                TenPhong, 
                LoaiPhong, 
                SucChua, 
                TrangThai, 
                GhiChu, 
                LinkAnh,
                createdAt: new Date()
            },
            { new: true, runValidators: true }
        );
        
        if (!ph) {
            return res.status(404).json({ 
                success: false,
                error: 'Không tìm thấy phòng' 
            });
        }
        
        console.log('✅ Đã cập nhật phòng:', ph.TenPhong);
        
        res.status(200).json({
            success: true,
            message: `Cập nhật phòng "${ph.TenPhong}" thành công!`,
            data: ph
        });
        
    } catch (err) {
        console.error('❌ Lỗi cập nhật phòng:', err);
        res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
});

// Xóa phòng hát
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const ph = await DataModel.Data_PhongHat_Model.findByIdAndDelete(id);
        if (!ph) return res.status(404).json({ error: 'Không tìm thấy phòng hát' });
        res.json({ message: 'Xóa phòng hát thành công' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router