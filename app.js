import express from 'express';
import { engine } from 'express-handlebars';
import db from './config/server.js';
import DataModel from './app/model/index.js';
import { generateCode } from './app/utils/codeGenerator.js'

db.connectDB();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Handlebars setup
app.engine('handlebars', engine({
    defaultLayout: 'AdminMain',
    helpers: {
        // === COMPARISON HELPERS ===
        eq: (a, b) => a === b,
        neq: (a, b) => a !== b,
        gt: (a, b) => a > b,
        gte: (a, b) => a >= b,
        lt: (a, b) => a < b,
        lte: (a, b) => a <= b,

        // === STRING & ARRAY HELPERS ===
        uppercase: (str) => typeof str === 'string' ? str.toUpperCase() : str,
        lowercase: (str) => typeof str === 'string' ? str.toLowerCase() : str,
        length: (array) => Array.isArray(array) ? array.length : 0,

        // === NUMBER & CURRENCY HELPERS ===
        formatNumber: (num) => {
            if (num === null || num === undefined || isNaN(num)) return '0';
            return new Intl.NumberFormat('vi-VN').format(num);
        },

        formatCurrency: (num, currency = 'VNĐ') => {
            if (num === null || num === undefined || isNaN(num)) return `0 ${currency}`;
            return `${new Intl.NumberFormat('vi-VN').format(num)} ${currency}`;
        },

        // === PRICE SPECIFIC HELPERS ===
        getGiaTheoGio: (bangGia, khungGio) => {
            if (!bangGia || !Array.isArray(bangGia)) return 0;
            const gia = bangGia.find(g => g.KhungGio === khungGio);
            return gia ? gia.GiaTien : 0;
        },

        showKhoangGia: (giaThapNhat, giaCaoNhat) => {
            if (!giaThapNhat && !giaCaoNhat) return 'Liên hệ';
            if (giaThapNhat === giaCaoNhat) {
                return new Intl.NumberFormat('vi-VN').format(giaThapNhat) + ' VNĐ/H';
            }
            return new Intl.NumberFormat('vi-VN').format(giaThapNhat) + ' - ' + 
                new Intl.NumberFormat('vi-VN').format(giaCaoNhat) + ' VNĐ/H';
        },

        showTatCaGia: (bangGia) => {
            if (!bangGia || !Array.isArray(bangGia)) return '';
            
            return bangGia.map(gia => 
                `${gia.KhungGio}: ${new Intl.NumberFormat('vi-VN').format(gia.GiaTien)} VNĐ`
            ).join(' | ');
        },

        getGiaThapNhat: (bangGia) => {
            if (!bangGia || !Array.isArray(bangGia) || bangGia.length === 0) return 0;
            return Math.min(...bangGia.map(g => g.GiaTien));
        },

        getGiaCaoNhat: (bangGia) => {
            if (!bangGia || !Array.isArray(bangGia) || bangGia.length === 0) return 0;
            return Math.max(...bangGia.map(g => g.GiaTien));
        },

        // === STATUS HELPERS ===
        getStatusText: (status) => {
            const statusMap = {
                'Trống': 'CÒN TRỐNG',
                'Đang sử dụng': 'ĐANG SỬ DỤNG',
                'Đang bảo trì': 'BẢO TRÌ',
                'Đã đặt trước': 'ĐÃ ĐẶT',
                'available': 'CÒN TRỐNG',
                'busy': 'ĐANG SỬ DỤNG',
                'maintenance': 'BẢO TRÌ',
                'reserved': 'ĐÃ ĐẶT'
            };
            return statusMap[status] || status;
        },

        getStatusClass: (status) => {
            const classMap = {
                'Trống': 'status-available',
                'Đang sử dụng': 'status-busy',
                'Đang bảo trì': 'status-maintenance',
                'Đã đặt trước': 'status-reserved'
            };
            return classMap[status] || 'status-unknown';
        },

        getStatusIcon: (status) => {
            const iconMap = {
                'Trống': 'fa-door-open',
                'Đang sử dụng': 'fa-microphone-alt',
                'Đang bảo trì': 'fa-tools',
                'Đã đặt trước': 'fa-calendar-check'
            };
            return iconMap[status] || 'fa-question-circle';
        },

        // === DATE HELPERS ===
        formatDate: (date) => {
            if (!date) return '';
            try {
                return new Date(date).toLocaleDateString('vi-VN');
            } catch {
                return '';
            }
        },

        formatDateTime: (date) => {
            if (!date) return '';
            try {
                return new Date(date).toLocaleString('vi-VN');
            } catch {
                return '';
            }
        },

        // === UTILITY HELPERS ===
        json: (obj) => {
            try {
                return JSON.stringify(obj, null, 2);
            } catch {
                return '';
            }
        },

        // === CONDITIONAL HELPERS ===
        ifCond: function (v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '!==':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        },
    }
}));

app.set('view engine', 'handlebars');
app.set('views', './views');

///////////////////////////////
//         GET ROUTES         //
///////////////////////////////

// Trang chủ
app.get('/', async (req, res) => {
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
app.get('/admin', (req, res) => {
    try {
        res.render('AD_Dashboard', { layout: 'AdminMain' , dashboardPage: true});
    } catch (err) {
        res.status(500).send('Lỗi server!');
    }
});

// Admin logout
app.get('/logout', (req, res) => {
    res.redirect('/');
});


// Quản lý phòng hát
app.get('/admin/phonghat', async (req, res) => {
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
app.get('/admin/loaiphong', async (req, res) => {
    try {
        const loaiphongs = await DataModel.Data_BangGiaPhong_Model.find({}).lean();
        res.render('loaiphong', { layout: 'AdminMain', title: 'Quản lý loại và giá phòng', loaiphongs });
    } catch (err) {
        res.status(500).send('Lỗi server!');
    }
});

// API kiểm tra loại phòng có đang được sử dụng không
app.get('/api/phonghat/check-loai-phong/:loaiPhong', async (req, res) => {
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

app.get('/api/banggia/:loaiPhong', async (req, res) => {
    try {
        const { loaiPhong } = req.params;
        const bangGia = await DataModel.Data_BangGiaPhong_Model.find({ 
            LoaiPhong: loaiPhong 
        }).lean().exec();
        
        res.json(bangGia);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});


// Quản lý khách hàng
app.get('/admin/khachhang', async (req, res) => {
    try {
        const khachhangs = await DataModel.Data_KhachHang_Model.find({}).lean();
        res.render('khachhang', { layout: 'AdminMain', title: 'Quản lý khách hàng', khachhangs });
    } catch (err) {
        res.status(500).send('Lỗi server!');
    }
});

// Admin login page
app.get('/admin-login', (req, res) => res.redirect('/'));

///////////////////////////////
//         POST ROUTES        //
///////////////////////////////

// Admin login
app.post('/admin-login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await DataModel.Data_Admin_Model.findOne({ username, password });
        if (admin) {
            req.session.isAdmin = true;
            return res.redirect('/admin');
        }
        res.send('Sai tài khoản hoặc mật khẩu!');
    } catch (err) {
        res.status(500).send('Lỗi server!');
    }
});

// Thêm khách hàng
app.post('/api/khachhang', async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const kh = await DataModel.Data_KhachHang_Model.create({ name, phone, address });
        res.status(200).json(kh);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Thêm nhân viên
app.post('/api/nhanvien', async (req, res) => {
    try {
        const { name, email, age } = req.body;
        const nv = await DataModel.Data_NhanVien_Model.create({ name, email, age });
        res.status(200).json(nv);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Thêm sản phẩm
app.post('/api/sanpham', async (req, res) => {
    try {
        const { name, price, description, image, sale } = req.body;
        const sp = await DataModel.Data_SanPham_Model.create({ name, price, description, image, sale });
        res.status(200).json(sp);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Thêm phòng hát
app.post('/api/phonghat', async (req, res) => {
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

// API để lưu bảng giá
app.post('/api/banggia/:loaiPhong', async (req, res) => {
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



app.post('/api/loaiphong', async (req, res) => {
    try {
        console.log('=== 🚨 API /api/loaiphong ===');
        console.log('📦 Request body:', req.body);
        
        const { TenLoaiPhong, Action, OldRoomType } = req.body;
        
        // VALIDATION
        if (!TenLoaiPhong || !Action) {
            return res.status(400).json({ 
                error: 'Thiếu thông tin bắt buộc: TenLoaiPhong và Action' 
            });
        }

        if (Action === 'add') {
            console.log('🔍 Kiểm tra loại phòng tồn tại:', TenLoaiPhong);
            
            // Kiểm tra trùng
            const existing = await DataModel.Data_BangGiaPhong_Model.findOne({ 
                LoaiPhong: TenLoaiPhong 
            });
            
            if (existing) {
                console.log('❌ Loại phòng đã tồn tại');
                return res.status(400).json({ error: 'Loại phòng đã tồn tại!' });
            }

            console.log('💾 Đang tạo loại phòng mới...');

            const lastMaGia = await generateCode('PG', DataModel.Data_BangGiaPhong_Model, 'MaGia');
            const lastNumber = parseInt(lastMaGia.replace('PG', '')) || 0;
            
            const newNumber = lastNumber + 1;
            const maGia = `PG${newNumber.toString().padStart(3, '0')}`;
            
            // Tạo loại phòng mới với bảng giá rỗng
            const newRoomType = new DataModel.Data_BangGiaPhong_Model({
                MaGia: maGia,
                LoaiPhong: TenLoaiPhong,
                BangGia: [],
                CreatedAt: new Date(),
                UpdatedAt: new Date()
            });
            
            await newRoomType.save();
            console.log('✅ Đã lưu loại phòng mới thành công');
            
            res.json({ 
                success: true, 
                message: `Đã thêm loại phòng "${TenLoaiPhong}" thành công!`,
                data: newRoomType 
            });

        } else if (Action === 'edit') {
            // SỬA LOẠI PHÒNG - CẬP NHẬT TẤT CẢ DOCUMENTS
            if (!OldRoomType) {
                return res.status(400).json({ error: 'Thiếu thông tin loại phòng cũ!' });
            }

            console.log(`✏️ Đang đổi "${OldRoomType}" thành "${TenLoaiPhong}"`);

            // Kiểm tra trùng tên mới
            if (TenLoaiPhong !== OldRoomType) {
                const existing = await DataModel.Data_BangGiaPhong_Model.findOne({ 
                    LoaiPhong: TenLoaiPhong 
                });
                
                if (existing) {
                    return res.status(400).json({ error: 'Tên loại phòng mới đã tồn tại!' });
                }
            }

            // Cập nhật TRONG TẤT CẢ document có LoaiPhong cũ
            const bangGiaResult = await DataModel.Data_BangGiaPhong_Model.updateMany(
                { LoaiPhong: OldRoomType },
                { 
                    $set: { 
                        LoaiPhong: TenLoaiPhong,
                        UpdatedAt: new Date()
                    } 
                }
            );

            console.log(`📊 Đã cập nhật ${bangGiaResult.modifiedCount} document trong Data_BangGiaPhong_Model`);

            // Cập nhật trong collection phòng hát
            const phongHatResult = await DataModel.Data_PhongHat_Model.updateMany(
                { LoaiPhong: OldRoomType },
                { $set: { LoaiPhong: TenLoaiPhong } }
            );

            console.log(`📊 Đã cập nhật ${phongHatResult.modifiedCount} phòng trong Data_PhongHat_Model`);

            if (bangGiaResult.modifiedCount === 0 && phongHatResult.modifiedCount === 0) {
                return res.status(404).json({ error: 'Không tìm thấy loại phòng để sửa!' });
            }

            res.json({ 
                success: true, 
                message: `Đã đổi loại phòng "${OldRoomType}" thành "${TenLoaiPhong}"! (${bangGiaResult.modifiedCount} bảng giá, ${phongHatResult.modifiedCount} phòng)`,
                data: { 
                    old: OldRoomType, 
                    new: TenLoaiPhong,
                    bangGiaUpdated: bangGiaResult.modifiedCount,
                    phongHatUpdated: phongHatResult.modifiedCount
                }
            });

        } else if (Action === 'delete') {
            // XÓA LOẠI PHÒNG - XÓA TẤT CẢ DOCUMENTS
            console.log(`🗑️ Đang xóa loại phòng: ${TenLoaiPhong}`);

            // Kiểm tra xem loại phòng có đang được sử dụng không
            const usedRooms = await DataModel.Data_PhongHat_Model.find({ 
                LoaiPhong: TenLoaiPhong 
            });
            
            if (usedRooms.length > 0) {
                return res.status(400).json({ 
                    error: `Không thể xóa! Có ${usedRooms.length} phòng đang sử dụng loại phòng "${TenLoaiPhong}".` 
                });
            }

            // Xóa TẤT CẢ document có LoaiPhong này
            const result = await DataModel.Data_BangGiaPhong_Model.deleteMany({ 
                LoaiPhong: TenLoaiPhong 
            });

            console.log(`📊 Đã xóa ${result.deletedCount} document trong Data_BangGiaPhong_Model`);

            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Không tìm thấy loại phòng để xóa!' });
            }

            res.json({ 
                success: true, 
                message: `Đã xóa loại phòng "${TenLoaiPhong}" thành công! (${result.deletedCount} bảng giá)`,
                data: { deletedCount: result.deletedCount }
            });

        } else {
            return res.status(400).json({ error: 'Action không hợp lệ!' });
        }
        
    } catch (err) {
        console.error('💥 LỖI SERVER CHI TIẾT:');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        
        res.status(500).json({ 
            error: 'Lỗi server: ' + err.message 
        });
    }
});


///////////////////////////////
//         PUT ROUTES         //
///////////////////////////////

// Cập nhật khách hàng
app.put('/api/khachhang/:id', async (req, res) => {
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

// Cập nhật sản phẩm
app.put('/api/sanpham/:id', async (req, res) => {
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

// Cập nhật phòng hát
app.put('/api/phonghat/:id', async (req, res) => {
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

app.put('/api/banggia/:loaiPhong', async (req, res) => {
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




///////////////////////////////
//        DELETE ROUTES       //
///////////////////////////////

// Xóa khách hàng
app.delete('/api/khachhang/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const kh = await DataModel.Data_KhachHang_Model.findByIdAndDelete(id);
        if (!kh) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
        res.json({ message: 'Xóa khách hàng thành công' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Xóa sản phẩm
app.delete('/api/sanpham/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sp = await DataModel.Data_SanPham_Model.findByIdAndDelete(id);
        if (!sp) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        res.json({ message: 'Xóa sản phẩm thành công' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Xóa phòng hát
app.delete('/api/phonghat/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const ph = await DataModel.Data_PhongHat_Model.findByIdAndDelete(id);
        if (!ph) return res.status(404).json({ error: 'Không tìm thấy phòng hát' });
        res.json({ message: 'Xóa phòng hát thành công' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Xóa loại phòng
app.delete('/api/banggia/:loaiPhong', async (req, res) => {
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



















///////////////////////////////
//        START SERVER        //
///////////////////////////////
app.listen(3000, () => console.log('Server running on port 3000'));