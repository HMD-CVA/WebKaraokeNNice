import express from 'express'
import DataModel from '../app/models/index.js'
const router = express.Router()


// Trang chủ
router.get('/', async (req, res) => {
try {
    const [phonghats, banggiaphongs] = await Promise.all([
    DataModel.Data_PhongHat_Model.find({}).lean().exec(),
    DataModel.Data_BangGiaPhong_Model.find({}).lean().exec()
    ]);

    // Gắn giá phòng - Lấy giá THẤP NHẤT để hiển thị
    const phonghatsWithPrice = phonghats.map(room => {
    const giaPhong = banggiaphongs.filter(bg => bg.LoaiPhong === room.LoaiPhong);
    
    // Tính giá thấp nhất, cao nhất và giá hiện tại
    const giaValues = giaPhong.map(g => g.GiaTien);
    const giaThapNhat = giaValues.length > 0 ? Math.min(...giaValues) : 0;
    const giaCaoNhat = giaValues.length > 0 ? Math.max(...giaValues) : 0;
    
    // Lấy giá hiện tại dựa trên thời gian thực (hoặc giá thấp nhất)
    const gioHienTai = new Date().getHours();
    const giaHienTai = giaPhong.find(g => {
        const [gioBatDau, gioKetThuc] = g.KhungGio.split('-').map(Number);
        return gioHienTai >= gioBatDau && gioHienTai < gioKetThuc;
    })?.GiaTien || giaThapNhat;

    return {
        ...room,
        // Giá để hiển thị
        GiaHienTai: giaHienTai,
        GiaThapNhat: giaThapNhat,
        GiaCaoNhat: giaCaoNhat,
        // Toàn bộ bảng giá
        BangGia: giaPhong,
        // Compatible với template cũ
        GiaPhong: giaThapNhat, // Hiển thị giá thấp nhất
        GiaTien: giaThapNhat   // Backup
    };
    });

    res.render('home', { 
    layout: 'HomeMain.handlebars',
    phonghats: phonghatsWithPrice 
    });

} catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    res.status(500).send("Lỗi khi tải dữ liệu: " + error.message);
}
});

// Trang admin dashboard
router.get('/admin', (req, res) => {
    try {
        res.render('AD_Dashboard', { layout: 'AdminMain' , dashboardPage: true});
    } catch (err) {
        res.status(500).send('Lỗi server!');
    }
});

// Admin logout
router.get('/logout', (req, res) => {
    res.redirect('/');
});


// Quản lý phòng hát
router.get('/admin/phonghat', async (req, res) => {
    try {
        const [phonghats, bangGiaList, roomTypes] = await Promise.all([
            DataModel.Data_PhongHat_Model.find({}).lean().exec(),
            DataModel.Data_BangGiaPhong_Model.find({}).lean().exec(),
            DataModel.Data_BangGiaPhong_Model.distinct('LoaiPhong')
        ]);

        // Tạo map để tra cứu nhanh bảng giá theo LoaiPhong
        const phonghatsWithPrice = phonghats.map(phong => {
            const bangGiaCungLoai = bangGiaList.filter(banggia => 
                banggia.LoaiPhong === phong.LoaiPhong
            );

            return {
                ...phong,
                BangGia: bangGiaCungLoai,
            };
        });
        
        // Chuẩn bị dữ liệu cho phần chỉnh sửa
        const editBangGia = bangGiaList.map(gia => {
            const [startTime = '', endTime = ''] = gia.KhungGio.split('-');
            return {
                ...gia,
                startTime,
                endTime
            };
        });

        // Tính toán thống kê
        const totalRooms = phonghats.length;
        const countAvailable = phonghats.filter(p => p.TrangThai === 'Trống').length;
        const countBusy = phonghats.filter(p => p.TrangThai === 'Đang sử dụng').length;
        const countReserved = phonghats.filter(p => p.TrangThai === 'Đã đặt trước').length;
        
        res.render('phonghat', { 
            layout: 'AdminMain', 
            title: 'Quản lý phòng hát & bảng giá', 
            phonghats: phonghatsWithPrice,
            roomTypes: roomTypes,
            currentBangGia: bangGiaList, // Dữ liệu hiện tại
            editBangGia: editBangGia,    // Dữ liệu để chỉnh sửa
            totalRooms: totalRooms,
            countAvailable: countAvailable,
            countBusy: countBusy,
            countReserved: countReserved,
            phonghatPage: true,
            helpers: {
                formatNumber: function(price) {
                    return new Intl.NumberFormat('vi-VN').format(price);
                },
                json: function(context) {
                    return JSON.stringify(context);
                },
                eq: function(a, b) {
                    return a === b;
                }
            }
        });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Lỗi server!');
    }
});

// Quản lý giá phong
router.get('/admin/loaiphong', async (req, res) => {
    try {
        const loaiphongs = await DataModel.Data_BangGiaPhong_Model.find({}).lean();
        res.render('loaiphong', { layout: 'AdminMain', title: 'Quản lý loại và giá phòng', loaiphongs });
    } catch (err) {
        res.status(500).send('Lỗi server!');
    }
});

// Quản lý khách hàng
router.get('/admin/khachhang', async (req, res) => {
    try {
        const khachhangs = await DataModel.Data_KhachHang_Model.find({}).lean();
        res.render('khachhang', { layout: 'AdminMain', title: 'Quản lý khách hàng', khachhangs });
    } catch (err) {
        res.status(500).send('Lỗi server!');
    }
});

// Admin login page
router.get('/admin-login', (req, res) => res.redirect('/'));





export default router