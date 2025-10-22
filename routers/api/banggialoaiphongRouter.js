import express from 'express'
import DataModel from '../../app/models/index.js'
import { generateCode } from '../../app/utils/codeGenerator.js'

const router = express.Router()

router.get('/banggia/:loaiPhong', async (req, res) => {
    try {
        const { loaiPhong } = req.params
        const bangGia = await DataModel.Data_BangGiaPhong_Model.find({
            LoaiPhong: loaiPhong,
        })
            .lean()
            .exec()

        res.json(bangGia)
    } catch (err) {
        console.error('Error:', err)
        res.status(500).json({ error: 'Lỗi server!' })
    }
})

// API để lưu bảng giá
router.post('/banggia/:loaiPhong', async (req, res) => {
    try {
        const { loaiPhong, bangGia } = req.body;      
        
        console.log('📥 Nhận dữ liệu bảng giá:', {
            loaiPhong: loaiPhong,
            soKhungGio: bangGia ? bangGia.length : 0
        });

        // Validate dữ liệu đầu vào
        if (!loaiPhong || !bangGia || !Array.isArray(bangGia)) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ: thiếu loaiPhong hoặc bangGia'
            });
        }

        if (bangGia.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng thêm ít nhất một khung giờ'
            });
        }

        // Validate từng khung giờ
        for (let i = 0; i < bangGia.length; i++) {
            const gia = bangGia[i];
            if (!gia.KhungGio || gia.GiaTien === undefined || gia.GiaTien === null) {
                return res.status(400).json({
                    success: false,
                    message: `Khung giờ thứ ${i + 1} thiếu thông tin KhungGio hoặc GiaTien`
                });
            }
            if (gia.GiaTien < 1000) {
                return res.status(400).json({
                    success: false,
                    message: `Khung giờ "${gia.KhungGio}" có giá tiền không hợp lệ (phải từ 1,000 VNĐ)`
                });
            }
        }

        console.log('🗑️ Đang xóa khung giờ cũ cho loại phòng:', loaiPhong);
        
        // Xóa các khung giờ cũ - GIỮ NGUYÊN LOGIC CŨ
        const deleteResult = await DataModel.Data_BangGiaPhong_Model.deleteMany({ 
            LoaiPhong: loaiPhong 
        });
        
        console.log('✅ Đã xóa:', deleteResult.deletedCount, 'khung giờ cũ');

        // Tạo mã cho từng khung giờ - GIỮ NGUYÊN LOGIC CŨ
        const newBangGia = [];
        
        // Lấy mã cuối cùng một lần để tối ưu - GIỮ NGUYÊN LOGIC CŨ
        const lastMaGia = await generateCode('PG', DataModel.Data_BangGiaPhong_Model, 'MaGia');
        const lastNumber = parseInt(lastMaGia.replace('PG', '')) || 0;
        
        console.log('🔢 Mã cuối cùng:', lastMaGia, 'Số:', lastNumber);

        // Tạo dữ liệu mới - GIỮ NGUYÊN LOGIC CŨ
        for (let i = 0; i < bangGia.length; i++) {
            const gia = bangGia[i];
            const newNumber = lastNumber + i + 1;
            const maGia = `PG${newNumber.toString().padStart(3, '0')}`;
            
            newBangGia.push({
                MaGia: maGia,
                LoaiPhong: loaiPhong,
                KhungGio: gia.KhungGio,
                GiaTien: parseInt(gia.GiaTien),
                createdAt: new Date()
            });

            console.log(`📝 Tạo khung giờ ${i + 1}:`, {
                maGia: maGia,
                khungGio: gia.KhungGio,
                giaTien: gia.GiaTien
            });
        }

        console.log('💾 Đang lưu', newBangGia.length, 'khung giờ mới...');
        
        // Lưu dữ liệu mới - GIỮ NGUYÊN LOGIC CŨ
        const result = await DataModel.Data_BangGiaPhong_Model.insertMany(newBangGia);
        
        console.log('✅ Đã thêm thành công:', result.length, 'khung giờ');
        console.log('📋 Mã được tạo:', result.map(item => item.MaGia));
        
        // Response - GIỮ NGUYÊN LOGIC CŨ + THÊM THÔNG TIN
        res.json({
            success: true,
            message: `Cập nhật thành công ${result.length} khung giờ cho loại phòng "${loaiPhong}"!`,
            data: {
                soKhungGio: result.length,
                maGiaList: result.map(item => item.MaGia),
                bangGia: result
            }
        });

    } catch (error) {
        console.error('❌ Lỗi lưu bảng giá:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lưu bảng giá: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

router.post('/loaiphong', async (req, res) => {
    try {
        console.log('=== 🚨 API /api/loaiphong ===')
        console.log('📦 Request body:', req.body)

        const { TenLoaiPhong, Action, OldRoomType } = req.body

        // VALIDATION
        if (!TenLoaiPhong || !Action) {
            return res.status(400).json({
                error: 'Thiếu thông tin bắt buộc: TenLoaiPhong và Action',
            })
        }

        if (Action === 'add') {
            console.log('🔍 Kiểm tra loại phòng tồn tại:', TenLoaiPhong)

            // Kiểm tra trùng
            const existing = await DataModel.Data_BangGiaPhong_Model.findOne({
                LoaiPhong: TenLoaiPhong,
            })

            if (existing) {
                console.log('❌ Loại phòng đã tồn tại')
                return res.status(400).json({ error: 'Loại phòng đã tồn tại!' })
            }

            console.log('💾 Đang tạo loại phòng mới...')

            const lastMaGia = await generateCode('PG', DataModel.Data_BangGiaPhong_Model, 'MaGia')
            const lastNumber = parseInt(lastMaGia.replace('PG', '')) || 0

            const newNumber = lastNumber + 1
            const maGia = `PG${newNumber.toString().padStart(3, '0')}`

            // Tạo loại phòng mới với bảng giá rỗng
            const newRoomType = new DataModel.Data_BangGiaPhong_Model({
                MaGia: maGia,
                LoaiPhong: TenLoaiPhong,
                BangGia: [],
                CreatedAt: new Date(),
                UpdatedAt: new Date(),
            })

            await newRoomType.save()
            console.log('✅ Đã lưu loại phòng mới thành công')

            res.json({
                success: true,
                message: `Đã thêm loại phòng "${TenLoaiPhong}" thành công!`,
                data: newRoomType,
            })
        } else if (Action === 'edit') {
            // SỬA LOẠI PHÒNG - CẬP NHẬT TẤT CẢ DOCUMENTS
            if (!OldRoomType) {
                return res.status(400).json({ error: 'Thiếu thông tin loại phòng cũ!' })
            }

            console.log(`✏️ Đang đổi "${OldRoomType}" thành "${TenLoaiPhong}"`)

            // Kiểm tra trùng tên mới
            if (TenLoaiPhong !== OldRoomType) {
                const existing = await DataModel.Data_BangGiaPhong_Model.findOne({
                    LoaiPhong: TenLoaiPhong,
                })

                if (existing) {
                    return res.status(400).json({ error: 'Tên loại phòng mới đã tồn tại!' })
                }
            }

            // Cập nhật TRONG TẤT CẢ document có LoaiPhong cũ
            const bangGiaResult = await DataModel.Data_BangGiaPhong_Model.updateMany(
                { LoaiPhong: OldRoomType },
                {
                    $set: {
                        LoaiPhong: TenLoaiPhong,
                        UpdatedAt: new Date(),
                    },
                }
            )

            console.log(`📊 Đã cập nhật ${bangGiaResult.modifiedCount} document trong Data_BangGiaPhong_Model`)

            // Cập nhật trong collection phòng hát
            const phongHatResult = await DataModel.Data_PhongHat_Model.updateMany({ LoaiPhong: OldRoomType }, { $set: { LoaiPhong: TenLoaiPhong } })

            console.log(`📊 Đã cập nhật ${phongHatResult.modifiedCount} phòng trong Data_PhongHat_Model`)

            if (bangGiaResult.modifiedCount === 0 && phongHatResult.modifiedCount === 0) {
                return res.status(404).json({ error: 'Không tìm thấy loại phòng để sửa!' })
            }

            res.json({
                success: true,
                message: `Đã đổi loại phòng "${OldRoomType}" thành "${TenLoaiPhong}"! (${bangGiaResult.modifiedCount} bảng giá, ${phongHatResult.modifiedCount} phòng)`,
                data: {
                    old: OldRoomType,
                    new: TenLoaiPhong,
                    bangGiaUpdated: bangGiaResult.modifiedCount,
                    phongHatUpdated: phongHatResult.modifiedCount,
                },
            })
        } else if (Action === 'delete') {
            // XÓA LOẠI PHÒNG - XÓA TẤT CẢ DOCUMENTS
            console.log(`🗑️ Đang xóa loại phòng: ${TenLoaiPhong}`)

            // Kiểm tra xem loại phòng có đang được sử dụng không
            const usedRooms = await DataModel.Data_PhongHat_Model.find({
                LoaiPhong: TenLoaiPhong,
            })

            if (usedRooms.length > 0) {
                return res.status(400).json({
                    error: `Không thể xóa! Có ${usedRooms.length} phòng đang sử dụng loại phòng "${TenLoaiPhong}".`,
                })
            }

            // Xóa TẤT CẢ document có LoaiPhong này
            const result = await DataModel.Data_BangGiaPhong_Model.deleteMany({
                LoaiPhong: TenLoaiPhong,
            })

            console.log(`📊 Đã xóa ${result.deletedCount} document trong Data_BangGiaPhong_Model`)

            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Không tìm thấy loại phòng để xóa!' })
            }

            res.json({
                success: true,
                message: `Đã xóa loại phòng "${TenLoaiPhong}" thành công! (${result.deletedCount} bảng giá)`,
                data: { deletedCount: result.deletedCount },
            })
        } else {
            return res.status(400).json({ error: 'Action không hợp lệ!' })
        }
    } catch (err) {
        console.error('💥 LỖI SERVER CHI TIẾT:')
        console.error('Message:', err.message)
        console.error('Stack:', err.stack)

        res.status(500).json({
            error: 'Lỗi server: ' + err.message,
        })
    }
})


router.put('/banggia/:loaiPhong', async (req, res) => {
    try {
        const { loaiPhong, bangGia } = req.body

        console.log('📥 Nhận dữ liệu bảng giá:', {
            loaiPhong: loaiPhong,
            soKhungGio: bangGia ? bangGia.length : 0,
        })

        // Validate dữ liệu đầu vào
        if (!loaiPhong || !bangGia || !Array.isArray(bangGia)) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ: thiếu loaiPhong hoặc bangGia',
            })
        }

        if (bangGia.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng thêm ít nhất một khung giờ',
            })
        }

        // Validate từng khung giờ
        for (let i = 0; i < bangGia.length; i++) {
            const gia = bangGia[i]
            if (!gia.KhungGio || gia.GiaTien === undefined || gia.GiaTien === null) {
                return res.status(400).json({
                    success: false,
                    message: `Khung giờ thứ ${i + 1} thiếu thông tin KhungGio hoặc GiaTien`,
                })
            }
            if (gia.GiaTien < 1000) {
                return res.status(400).json({
                    success: false,
                    message: `Khung giờ "${gia.KhungGio}" có giá tiền không hợp lệ (phải từ 1,000 VNĐ)`,
                })
            }
        }

        console.log('🗑️ Đang xóa khung giờ cũ cho loại phòng:', loaiPhong)

        // Xóa các khung giờ cũ - GIỮ NGUYÊN LOGIC CŨ
        const deleteResult = await DataModel.Data_BangGiaPhong_Model.deleteMany({
            LoaiPhong: loaiPhong,
        })

        console.log('✅ Đã xóa:', deleteResult.deletedCount, 'khung giờ cũ')

        // Tạo mã cho từng khung giờ - GIỮ NGUYÊN LOGIC CŨ
        const newBangGia = []

        // Lấy mã cuối cùng một lần để tối ưu - GIỮ NGUYÊN LOGIC CŨ
        const lastMaGia = await generateCode('PG', DataModel.Data_BangGiaPhong_Model, 'MaGia')
        const lastNumber = parseInt(lastMaGia.replace('PG', '')) || 0

        console.log('🔢 Mã cuối cùng:', lastMaGia, 'Số:', lastNumber)

        // Tạo dữ liệu mới - GIỮ NGUYÊN LOGIC CŨ
        for (let i = 0; i < bangGia.length; i++) {
            const gia = bangGia[i]
            const newNumber = lastNumber + i + 1
            const maGia = `PG${newNumber.toString().padStart(3, '0')}`

            newBangGia.push({
                MaGia: maGia,
                LoaiPhong: loaiPhong,
                KhungGio: gia.KhungGio,
                GiaTien: parseInt(gia.GiaTien),
                createdAt: new Date(),
            })

            console.log(`📝 Tạo khung giờ ${i + 1}:`, {
                maGia: maGia,
                khungGio: gia.KhungGio,
                giaTien: gia.GiaTien,
            })
        }

        console.log('💾 Đang lưu', newBangGia.length, 'khung giờ mới...')

        // Lưu dữ liệu mới - GIỮ NGUYÊN LOGIC CŨ
        const result = await DataModel.Data_BangGiaPhong_Model.insertMany(newBangGia)

        console.log('✅ Đã thêm thành công:', result.length, 'khung giờ')
        console.log(
            '📋 Mã được tạo:',
            result.map((item) => item.MaGia)
        )

        // Response - GIỮ NGUYÊN LOGIC CŨ + THÊM THÔNG TIN
        res.json({
            success: true,
            message: `Cập nhật thành công ${result.length} khung giờ cho loại phòng "${loaiPhong}"!`,
            data: {
                soKhungGio: result.length,
                maGiaList: result.map((item) => item.MaGia),
                bangGia: result,
            },
        })
    } catch (error) {
        console.error('❌ Lỗi lưu bảng giá:', error)
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lưu bảng giá: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        })
    }
})

// Xóa loại phòng
router.delete('/banggia/:loaiPhong', async (req, res) => {
    try {
        const { loaiPhong } = req.params;
        
        console.log('🗑️ Đang xóa bảng giá cho:', loaiPhong);

        const roomsUsingType = await DataModel.Data_PhongHat_Model.find({ 
            LoaiPhong: loaiPhong 
        });
        
        if (roomsUsingType.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Không thể xóa loại phòng "${loaiPhong}"! Có ${roomsUsingType.length} phòng đang sử dụng loại phòng này.`
            });
        }
        
        const deleteResult = await DataModel.Data_BangGiaPhong_Model.deleteMany({ 
            LoaiPhong: loaiPhong 
        });
        
        console.log('✅ Đã xóa:', deleteResult.deletedCount, 'khung giờ');
        
        res.json({
            success: true,
            message: `Đã xóa ${deleteResult.deletedCount} khung giờ`,
            deletedCount: deleteResult.deletedCount
        });

    } catch (error) {
        console.error('❌ Lỗi xóa bảng giá:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa bảng giá: ' + error.message
        });
    }
});

export default router