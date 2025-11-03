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

        // === PRODUCT & STOCK HELPERS ===
        getStockStatus: (quantity) => {
            if (quantity === 0) return 'outOfStock';
            if (quantity <= 10) return 'lowStock';
            return 'inStock';
        },

        getStockStatusText: (quantity) => {
            if (quantity === 0) return '🔴 Hết hàng';
            if (quantity <= 10) return '🟡 Sắp hết';
            return '🟢 Còn hàng';
        },

        getStockStatusIcon: (quantity) => {
            if (quantity === 0) return 'fa-times-circle';
            if (quantity <= 10) return 'fa-exclamation-triangle';
            return 'fa-check-circle';
        },

        isLowStock: (quantity, threshold = 10) => {
            return quantity > 0 && quantity <= threshold;
        },

        isOutOfStock: (quantity) => {
            return quantity === 0;
        },

        isInStock: (quantity, threshold = 10) => {
            return quantity > threshold;
        },

        // === PRODUCT SPECIFIC HELPERS ===
        getProductStatus: (product) => {
            if (!product || product.SoLuongTon === undefined) return 'unknown';
            if (product.SoLuongTon === 0) return 'outOfStock';
            if (product.SoLuongTon <= 10) return 'lowStock';
            return 'inStock';
        },

        formatProductPrice: (price, unit) => {
            if (price === null || price === undefined || isNaN(price)) return 'Liên hệ';
            const formattedPrice = new Intl.NumberFormat('vi-VN').format(price);
            return unit ? `${formattedPrice} VNĐ/${unit}` : `${formattedPrice} VNĐ`;
        },

        getProductBadgeClass: (quantity) => {
            if (quantity === 0) return 'badge-danger';
            if (quantity <= 10) return 'badge-warning';
            return 'badge-success';
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
                'reserved': 'ĐÃ ĐẶT',
                'inStock': 'CÒN HÀNG',
                'lowStock': 'SẮP HẾT',
                'outOfStock': 'HẾT HÀNG'
            };
            return statusMap[status] || status;
        },

        getStatusClass: (status) => {
            const classMap = {
                'Trống': 'status-available',
                'Đang sử dụng': 'status-busy',
                'Đang bảo trì': 'status-maintenance',
                'Đã đặt trước': 'status-reserved',
                'inStock': 'status-in-stock',
                'lowStock': 'status-low-stock',
                'outOfStock': 'status-out-of-stock'
            };
            return classMap[status] || 'status-unknown';
        },

        getStatusIcon: (status) => {
            const iconMap = {
                'Trống': 'fa-door-open',
                'Đang sử dụng': 'fa-microphone-alt',
                'Đang bảo trì': 'fa-tools',
                'Đã đặt trước': 'fa-calendar-check',
                'inStock': 'fa-check-circle',
                'lowStock': 'fa-exclamation-triangle',
                'outOfStock': 'fa-times-circle'
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

        formatTime: (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        },

        // === UTILITY HELPERS ===
        json: (obj) => {
            try {
                return JSON.stringify(obj);
            } catch {
                return '{}';
            }
        },

        // === ARRAY & OBJECT HELPERS ===
        contains: (array, value) => {
            if (!Array.isArray(array)) return false;
            return array.includes(value);
        },

        first: (array) => {
            if (!Array.isArray(array) || array.length === 0) return null;
            return array[0];
        },

        last: (array) => {
            if (!Array.isArray(array) || array.length === 0) return null;
            return array[array.length - 1];
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

        // === MATH HELPERS ===
        add: (a, b) => {
            a = parseFloat(a) || 0;
            b = parseFloat(b) || 0;
            return a + b;
        },

        subtract: (a, b) => {
            a = parseFloat(a) || 0;
            b = parseFloat(b) || 0;
            return a - b;
        },

        multiply: (a, b) => {
            a = parseFloat(a) || 0;
            b = parseFloat(b) || 0;
            return a * b;
        },

        divide: (a, b) => {
            a = parseFloat(a) || 0;
            b = parseFloat(b) || 1;
            return a / b;
        },

        // === LOGICAL HELPERS ===
        and: function () {
            const args = Array.prototype.slice.call(arguments, 0, -1);
            return args.every(arg => !!arg);
        },

        or: function () {
            const args = Array.prototype.slice.call(arguments, 0, -1);
            return args.some(arg => !!arg);
        },

        not: (value) => !value,

        // === STRING MANIPULATION ===
        truncate: (str, length) => {
            if (typeof str !== 'string') return str;
            if (str.length <= length) return str;
            return str.substring(0, length) + '...';
        },

        capitalize: (str) => {
            if (typeof str !== 'string') return str;
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },

        // === PRODUCT CATEGORY HELPERS ===
        getCategoryIcon: (category) => {
            const iconMap = {
                'Đồ uống': 'fa-wine-bottle',
                'Thức ăn': 'fa-utensils',
                'Đồ ăn nhẹ': 'fa-cookie',
                'Tráng miệng': 'fa-ice-cream',
                'Khác': 'fa-box'
            };
            return iconMap[category] || 'fa-box';
        },

        getCategoryColor: (category) => {
            const colorMap = {
                'Đồ uống': 'primary',
                'Thức ăn': 'success',
                'Đồ ăn nhẹ': 'warning',
                'Tráng miệng': 'info',
                'Khác': 'secondary'
            };
            return colorMap[category] || 'secondary';
        }
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
        const [phonghats, banggiaphongs, roomTypes] = await Promise.all([
            DataModel.Data_PhongHat_Model.find({}).lean().exec(),
            DataModel.Data_BangGiaPhong_Model.find({}).lean().exec(),
            DataModel.Data_BangGiaPhong_Model.distinct('LoaiPhong')
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
            GiaTien: giaThapNhat,   // Backup
        };
        });

        res.render('home', { 
            layout: 'HomeMain.handlebars',
            phonghats: phonghatsWithPrice,
            roomTypes: roomTypes
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

app.get('/admin/thietbi', async (req, res) => {
    try {
        const thietbis = await DataModel.Data_ThietBi_Model.find({}).lean();
        
        // Lấy danh sách mã phòng duy nhất từ thiết bị
        const uniqueMaPhongs = [...new Set(thietbis.map(item => item.MaPhong))];
        const loaiThietBis = [...new Set(thietbis.map(item => item.LoaiThietBi))];
        
        res.render('thietbi', { 
            layout: 'AdminMain', 
            title: 'Quản lý thiết bị', 
            thietbis,
            uniqueMaPhongs, // Truyền danh sách mã phòng duy nhất vào template
            loaiThietBis
        });
    } catch (err) {
        res.status(500).send('Lỗi server!');
    }
});

app.get('/api/thietbi/:maTB', async (req, res) => {
    try {
        const { maTB } = req.params;
        console.log('📦 Loại phòng nhận được:', maTB);

        const thietbis = await DataModel.Data_ThietBi_Model.findOne({
            MaThietBi: maTB
        }).lean();

        if (!thietbis) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thiết bị'
            });
        }
        
        res.json(thietbis);
    } catch (err) {
        res.status(500).send('Lỗi server!');
    }
});

app.get('/api/loaiphong/check-loai-phong/:loaiPhong', async (req, res) => {
    try {
        const { loaiPhong } = req.params;
        console.log('📦 Loại phòng nhận được:', loaiPhong);
        console.log('🔍 Kiểu dữ liệu:', typeof loaiPhong);
        
        // Kiểm tra xem có phòng nào đang sử dụng loại phòng này không
        const roomsUsingType = await DataModel.Data_BangGiaPhong_Model.find({ 
            LoaiPhong: loaiPhong 
        });
        
        res.json({ 
            isUsed: roomsUsingType.length > 0
        });
        
    } catch (err) {
        console.error('Lỗi kiểm tra loại phòng:', err);
        res.status(500).json({ error: err.message });
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


// Quản lý nhân viên
app.get('/admin/nhanvien', async (req, res) => {
    try {
        const nhanviens = await DataModel.Data_NhanVien_Model.find({}).lean();
        res.render('nhanvien', { layout: 'AdminMain', title: 'Quản lý nhân viên', nhanviens });
    } catch (err) {
        res.status(500).send('Lỗi server!');
    }
});

app.get('/api/nhanvien/:maNV', async (req, res) => {
    try {
        const { maNV } = req.params;
        console.log('🔍 Đang tìm nhân viên với mã:', maNV);
        const nhanVien = await DataModel.Data_NhanVien_Model.findOne({ 
            MaNV : maNV 
        }).lean().exec();
        
        res.json(nhanVien);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

app.get('/admin/hoadon', async (req, res) => {
    try {
        const [hoadons, chitiethoadons, khachhangs] = await Promise.all([
            DataModel.Data_HoaDon_Model.find({}).lean().exec(),
            DataModel.Data_ChiTietHD_Model.find({}).lean().exec(),
            DataModel.Data_KhachHang_Model.find({}).lean().exec()
        ]);
        
        // Tạo map để tra cứu nhanh
        const khachhangMap = {};
        khachhangs.forEach(kh => {
            khachhangMap[kh.MaKH] = kh;
        });

        const hoadonsWithDetails = hoadons.map(hoadon => {
            const chitietCuaHoadon = chitiethoadons.filter(ct => 
                ct.MaHoaDon.toString() === hoadon.MaHoaDon.toString()
            );
            
            // Lấy thông tin khách hàng
            const khachhang = khachhangMap[hoadon.MaKH];
            
            return {
                ...hoadon,
                ChiTiet: chitietCuaHoadon,
                KH: khachhang || {} // Đảm bảo KH luôn là object
            };
        });

        console.log(hoadonsWithDetails);

        res.render('hoadon', { 
            layout: 'AdminMain', 
            title: 'Quản lý hoá đơn', 
            hoadons: hoadonsWithDetails
        });
    } catch (err) {
        console.error('Lỗi server:', err);
        res.status(500).send('Lỗi server!');
    }
});

app.get('/admin/mathang', async (req, res) => {
    try {
        const mathangs = await DataModel.Data_MatHang_Model.find({}).lean();
        
        // Lấy danh sách loại hàng duy nhất
        const uniqueCategories = [...new Set(mathangs.map(item => item.LoaiHang))].filter(Boolean);
        console.log(uniqueCategories);
        
        res.render('mathang', { 
            layout: 'AdminMain', 
            title: 'Quản lý mặt hàng', 
            mathangs,
            uniqueCategories 
        });
    } catch (err) {
        console.error('Lỗi khi lấy dữ liệu mặt hàng:', err);
        res.status(500).send('Lỗi server!');
    }
});


app.get('/admin/datphong', async (req, res) => {
  try {
    const [khachhangs, datphongs] = await Promise.all([
        DataModel.Data_KhachHang_Model.find({}).lean().exec(),
        DataModel.Data_DatPhong_Model.find({}).lean().exec()
    ]);

    const datPhongKH = datphongs.map(datphong => {
        const datPhongWithKH = khachhangs.filter(kh => 
            kh.MaKH.toString() === datphong.MaKH.toString()
        );

        return {
            ...datphong,
            ChiTiet: datPhongWithKH,
        };
    });

    console.log(datPhongKH);    
    
    res.render('datphong', { 
        layout: 'AdminMain', title: 'Quản lý đặt phòng', 
        datPhongKH
    });

  } catch (error) {
    console.error('Lỗi đặt phòng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi get đặt phòng',
      error: error.message
    });
  }
});

app.get('/api/datphong/:maDatPhong', async (req, res) => {
    try {
        const { maDatPhong } = req.params;
        console.log('🔍 Tìm đặt phòng với mã:', maDatPhong);

        // Tìm đặt phòng theo mã - SỬA: dùng findOne thay vì find
        const datphong = await DataModel.Data_DatPhong_Model.findOne({ 
            MaDatPhong: maDatPhong 
        }).lean().exec();

        if (!datphong) {
            return res.status(404).json({ error: 'Không tìm thấy đặt phòng' });
        }

        // Tìm khách hàng tương ứng
        const khachhang = await DataModel.Data_KhachHang_Model.findOne({
            MaKH: datphong.MaKH
        }).lean().exec();

        // Kết hợp dữ liệu
        const result = {
            ...datphong,
            KhachHang: khachhang // Thêm thông tin khách hàng
        };

        console.log('📊 Tìm thấy đặt phòng và thông tin khách hàng');
        console.log(result);

        res.json(result); // Trả về object thay vì array

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});


app.get('/api/hoadon/:maHoaDon', async (req, res) => {
    try {
        const { maHoaDon } = req.params;
        console.log('🔍 Tìm hóa đơn với mã:', maHoaDon);

        const hoadons = await DataModel.Data_HoaDon_Model.findOne({ 
            MaHoaDon : maHoaDon 
        }).lean().exec();

        console.log(`📊 Tìm thấy ${hoadons.length} chi tiết`);
        console.log(hoadons);

        res.json(hoadons);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Lỗi server!');
    }
});

app.get('/api/chitiethoadon/:maHoaDon', async (req, res) => {
    try {
        const { maHoaDon } = req.params;
        console.log('🔍 Tìm chi tiết hóa đơn với mã:', maHoaDon);
        const ctHD = await DataModel.Data_ChiTietHD_Model.find({ 
            MaHoaDon : maHoaDon 
        }).lean().exec();

        const chiTietWithMatHang = await Promise.all(
            ctHD.map(async (chiTiet) => {
                const matHang = await DataModel.Data_MatHang_Model.findOne({
                    MaHang: chiTiet.MaHang
                }).lean().exec();

                return {
                    ...chiTiet,
                    TenHang: matHang?.TenHang || 'N/A',
                    DonViTinh: matHang?.DonViTinh || 'N/A',
                    SoLuongTon: matHang?.SoLuongTon || 0,
                    LinkAnh: matHang?.LinkAnh || ''
                };
            })
        );

        console.log(`📊 Tìm thấy ${chiTietWithMatHang.length} chi tiết`);
        console.log(chiTietWithMatHang);

        res.json(chiTietWithMatHang);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Lỗi server!');
    }
});

// GET /api/phong/:maPhong/banggia - Lấy bảng giá và khung giờ hoạt động của phòng
app.get('/api/phong/:maPhong/banggia', async (req, res) => {
    try {
        const { maPhong } = req.params;
        
        // Lấy thông tin phòng
        const phong = await DataModel.Data_PhongHat_Model.findOne({ MaPhong: maPhong });
        if (!phong) {
            return res.status(404).json({ error: 'Không tìm thấy phòng' });
        }
        
        // Lấy bảng giá cho loại phòng này
        const bangGia = await DataModel.Data_BangGiaPhong_Model.find({
            LoaiPhong: phong.LoaiPhong
        });
        
        // Xác định khung giờ hoạt động từ bảng giá
        let khungGioHoatDong = { start: '10:00', end: '22:00' }; // Mặc định
        
        if (bangGia.length > 0) {
            // Giả sử bảng giá có trường GioBatDau và GioKetThuc
            const gioBatDau = bangGia.map(g => g.GioBatDau).sort()[0];
            const gioKetThuc = bangGia.map(g => g.GioKetThuc).sort().reverse()[0];
            
            khungGioHoatDong = {
                start: gioBatDau || '10:00',
                end: gioKetThuc || '22:00'
            };
        }
        
        res.json({
            bangGia: bangGia,
            khungGioHoatDong: khungGioHoatDong,
            phong: {
                MaPhong: phong.MaPhong,
                TenPhong: phong.TenPhong,
                LoaiPhong: phong.LoaiPhong
            }
        });
        
    } catch (error) {
        console.error('❌ Lỗi API bảng giá phòng:', error);
        res.status(500).json({ error: error.message });
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

    const maNV = await generateCode('NV', DataModel.Data_NhanVien_Model, 'MaNV');

    const newEmployee = new DataModel.Data_NhanVien_Model({
      ...req.body,
      MaNV: maNV  // Tự động gán mã mới
    });

    await newEmployee.save();
    res.status(201).json({ 
      message: 'Thêm nhân viên thành công', 
      data: newEmployee 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
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

app.post('/api/thietbi', async (req, res) => {
    try {
        console.log('🎯 API /api/thietbi ĐƯỢC GỌI!');
        console.log('📦 Body received:', req.body);
        
        const formData = req.body;
        console.log('💾 FormData:', formData);

        // VALIDATION
        if (!formData.TenThietBi || !formData.MaPhong || !formData.LoaiThietBi) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: Tên thiết bị, Mã phòng, Loại thiết bị'
            });
        }

        // Tạo mã thiết bị tự động
        const maThietBi = await generateCode('TB', DataModel.Data_ThietBi_Model, 'MaThietBi');
        console.log('🔢 Mã thiết bị mới:', maThietBi);

        // Tạo thiết bị mới
        const newThietBi = new DataModel.Data_ThietBi_Model({
            MaThietBi: maThietBi,
            TenThietBi: formData.TenThietBi,
            MaPhong: formData.MaPhong,
            LoaiThietBi: formData.LoaiThietBi,
            TinhTrang: formData.TinhTrang || 'Tốt',
            NgayNhap: formData.NgayNhap || new Date(),
            LinkAnh: formData.LinkAnh || '',
            // Thêm các trường mặc định khác nếu cần
            // HangSanXuat: formData.HangSanXuat || '',
            // Model: formData.Model || '',
            // GiaTri: formData.GiaTri || 0,
            // ThoiGianBaoHanh: formData.ThoiGianBaoHanh || '',
            // GhiChu: formData.GhiChu || ''
        });

        console.log('💾 Đang lưu thiết bị:', newThietBi);

        // Lưu vào database
        const savedThietBi = await newThietBi.save();
        
        console.log('✅ Đã lưu thiết bị thành công:', savedThietBi);

        res.json({
            success: true,
            message: `Thiết bị "${formData.TenThietBi}" đã được thêm thành công với mã ${maThietBi}!`,
            data: savedThietBi
        });

    } catch (error) {
        console.error('❌ Lỗi lưu thiết bị:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lưu thiết bị: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});


app.post('/api/datphong', async (req, res) => {
  try {
    const { 
      maKH, tenKH, sdt, email, 
      maDatPhong, maPhong, tenPhong, giaTien, loaiPhong,
      thoiGianBatDau, thoiGianKetThuc, songuoi, ghiChu, trangThai 
    } = req.body;

    // 1. Kiểm tra xem khách hàng đã tồn tại chưa (dựa vào SDT)
    let khachHang = await DataModel.Data_KhachHang_Model.findOne({ SDT: sdt });

    const maKHs = await generateCode('KH', DataModel.Data_KhachHang_Model, 'MaKH');
    const maDatPhongs = await generateCode('DP', DataModel.Data_DatPhong_Model, 'MaDatPhong');
    
    if (!khachHang) {
      // Tạo khách hàng mới nếu chưa tồn tại
      khachHang = new DataModel.Data_KhachHang_Model({
        MaKH: maKHs,
        TenKH: tenKH,
        SDT: sdt,
        Email: email || '',
        createdAt: new Date()
      });
      await khachHang.save();
    }

    // 2. Tạo đơn đặt phòng
    const datPhong = new DataModel.Data_DatPhong_Model({
      MaDatPhong: maDatPhongs,
      MaKH: khachHang.MaKH,
      MaPhong: maPhong,
      ThoiGianBatDau: new Date(thoiGianBatDau),
      ThoiGianKetThuc: new Date(thoiGianKetThuc),
      SoNguoi: songuoi,
      TrangThai: trangThai,
      GhiChu: ghiChu || '',
      createdAt: new Date()
    });

    await datPhong.save();

    const phongCapNhat = await DataModel.Data_PhongHat_Model.findOneAndUpdate(
      { MaPhong: maPhong },
      { 
        TrangThai: 'Đã đặt trước',
        updatedAt: new Date()
      },
      { new: true } // Trả về document đã được cập nhật
    );

    if (!phongCapNhat) {
      console.warn(`⚠️ Không tìm thấy phòng với mã: ${maPhong}`);
      // Không throw error ở đây vì đơn đặt phòng đã được tạo thành công
    } else {
      console.log(`✅ Đã cập nhật trạng thái phòng ${maPhong} thành "Đã đặt"`);
    }

    res.status(201).json({
      success: true,
      message: 'Đặt phòng thành công',
      data: {
        maDatPhong: datPhong.MaDatPhong,
        maKH: khachHang.MaKH,
        tenKH: khachHang.TenKH,
        sdt: khachHang.SDT,
        tenPhong: tenPhong,
        loaiPhong: loaiPhong,
        giaTien: giaTien,
        thoiGianBatDau: datPhong.ThoiGianBatDau,
        thoiGianKetThuc: datPhong.ThoiGianKetThuc,
        songuoi: datPhong.SoNguoi,
        trangThai: datPhong.TrangThai,
        phongDaCapNhat: !!phongCapNhat
      }
    });

  } catch (error) {
    console.error('Lỗi đặt phòng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đặt phòng',
      error: error.message
    });
  }
});

// API hủy đặt phòng
app.put('/api/datphong/:maDatPhong/huy', async (req, res) => {
  try {
    const { maDatPhong } = req.params;

    // 1. Tìm đơn đặt phòng
    const datPhong = await DataModel.Data_DatPhong_Model.findOne({ MaDatPhong: maDatPhong });
    
    if (!datPhong) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn đặt phòng'
      });
    }

    // 2. Cập nhật trạng thái đơn đặt phòng thành "Đã hủy"
    datPhong.TrangThai = 'Đã hủy';
    datPhong.updatedAt = new Date();
    await datPhong.save();

    // 3. Cập nhật trạng thái phòng về "Trống"
    const phongCapNhat = await DataModel.Data_PhongHat_Model.findOneAndUpdate(
      { MaPhong: datPhong.MaPhong },
      { 
        TrangThai: 'Còn Trống',
        updatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Hủy đặt phòng thành công',
      data: {
        maDatPhong: datPhong.MaDatPhong,
        maPhong: datPhong.MaPhong,
        trangThaiPhong: phongCapNhat ? 'Trống' : 'Không thể cập nhật'
      }
    });

  } catch (error) {
    console.error('Lỗi hủy đặt phòng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy đặt phòng',
      error: error.message
    });
  }
});

app.post('/api/mathang', async (req, res) => {
    try {
    const { 
      TenHang, LoaiHang, DonGia, DonViTinh, SoLuongTon, LinkAnh
    } = req.body;

    const maMH = await generateCode('MH', DataModel.Data_MatHang_Model, 'MaHang');

    // 2. Tạo đơn đặt phòng
    const matHang = new DataModel.Data_MatHang_Model({
      MaHang: maMH,
      TenHang: TenHang,
      LoaiHang: LoaiHang,
      DonGia: DonGia,
      DonViTinh: DonViTinh,
      SoLuongTon: SoLuongTon,
      LinkAnh: LinkAnh,
      createdAt: new Date()
    });

    await matHang.save();

    res.status(201).json({
      success: true,
      message: 'Thêm mặt hàng thành công',
    });

  } catch (error) {
    console.error('Lỗi thêm mặt hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi thêm mặt hàng',
      error: error.message
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

// Thêm vào routes của bạn
app.put('/banggia/all', async (req, res) => {
    try {
        console.log('📥 NHẬN REQUEST TỪ CLIENT:', {
            body: req.body,
            headers: req.headers
        });

        const { bangGiaData } = req.body;
        
        if (!bangGiaData || !Array.isArray(bangGiaData)) {
            console.log('❌ Dữ liệu không hợp lệ - bangGiaData không phải mảng:', bangGiaData);
            return res.status(400).json({ 
                error: 'Dữ liệu bảng giá không hợp lệ',
                details: 'bangGiaData phải là mảng'
            });
        }

        console.log(`✅ Nhận ${bangGiaData.length} mục dữ liệu`);

        const results = [];
        
        // Nhóm dữ liệu theo loại phòng
        const groupedByRoomType = {};
        bangGiaData.forEach((item, index) => {
            console.log(`📊 Item ${index}:`, item);
            
            if (!item.LoaiPhong) {
                console.warn(`⚠️ Item ${index} thiếu LoaiPhong`);
                return;
            }
            
            if (!groupedByRoomType[item.LoaiPhong]) {
                groupedByRoomType[item.LoaiPhong] = [];
            }
            groupedByRoomType[item.LoaiPhong].push({
                KhungGio: item.KhungGio,
                GiaTien: item.GiaTien
            });
        });

        console.log('📦 Dữ liệu đã nhóm:', groupedByRoomType);

        // Lưu từng loại phòng
        for (const [loaiPhong, giaData] of Object.entries(groupedByRoomType)) {
            try {
                console.log(`🔄 Xử lý loại phòng: ${loaiPhong} với ${giaData.length} khung giờ`);
                
                // Xóa bảng giá cũ
                const deleteResult = await BangGia.deleteMany({ LoaiPhong: loaiPhong });
                console.log(`🗑️ Đã xóa ${deleteResult.deletedCount} bản ghi cũ của ${loaiPhong}`);
                
                // Thêm bảng giá mới
                const newPrices = giaData.map(gia => ({
                    LoaiPhong: loaiPhong,
                    KhungGio: gia.KhungGio,
                    GiaTien: gia.GiaTien
                }));
                
                console.log(`💾 Đang lưu ${newPrices.length} bản ghi mới cho ${loaiPhong}`);
                const insertResult = await BangGia.insertMany(newPrices);
                
                results.push({
                    loaiPhong,
                    success: true,
                    count: newPrices.length
                });
                
                console.log(`✅ Đã lưu thành công ${newPrices.length} khung giờ cho ${loaiPhong}`);
                
            } catch (error) {
                console.error(`❌ Lỗi khi xử lý ${loaiPhong}:`, error);
                results.push({
                    loaiPhong,
                    success: false,
                    error: error.message
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        console.log(`🎯 Kết quả tổng: ${successCount}/${totalCount} loại phòng thành công`);

        res.json({
            message: `Đã lưu bảng giá cho ${successCount}/${totalCount} loại phòng`,
            results,
            successCount,
            totalCount
        });

    } catch (error) {
        console.error('💥 Lỗi tổng khi lưu bảng giá:', error);
        res.status(500).json({ 
            error: 'Lỗi server khi lưu bảng giá',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});


app.put('/api/nhanvien/:maNV', async (req, res) => {
  try {
    const { maNV } = req.params;
    const updateData = { ...req.body };
    delete updateData.MaNV; // Không cho phép cập nhật mã NV
    delete updateData._id; // Không cho phép cập nhật _id
    console.log(maNV);
    console.log(updateData);

    const employee = await DataModel.Data_NhanVien_Model.findOneAndUpdate(
      { MaNV: maNV }, // Điều kiện tìm kiếm
      updateData,     // Dữ liệu cập nhật
      { 
        new: true,    // Trả về document sau khi cập nhật
        runValidators: true // Chạy validation
      }
    );
    if (!employee) {
      return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    }
    
    res.json({ 
      message: 'Cập nhật nhân viên thành công', 
      data: employee 
    });
  } catch (error) {
    console.error('Lỗi cập nhật nhân viên:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/thietbi/:maTB', async (req, res) => {
  try {
    const { maTB } = req.params;
    const updateData = { ...req.body };
    delete updateData.MaThietBi;
    delete updateData._id;

    const application = await DataModel.Data_ThietBi_Model.findOneAndUpdate(
      { MaThietBi: maTB }, // Điều kiện tìm kiếm
      updateData,
      { 
        message: true,    // Trả về document sau khi cập nhật
        runValidators: true // Chạy validation
      }
    );
    if (!application) {
      return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
    }
    
    res.json({ 
      message: 'Xoá thiết bị thành công', 
      data: application 
    });
  } catch (error) {
    console.error('Lỗi xoá thiết bị:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/thietbi/:id/status - Cập nhật trạng thái thiết bị
app.put('/api/thietbi/:maTB/status', async (req, res) => {
  try {
    const { maTB } = req.params;
    const { TinhTrang } = req.body;
    console.log(maTB, TinhTrang);
    // const { temp } = req.query;
    // console.log(temp);
    // Validate input
    if (!TinhTrang) {
      return res.status(400).json({
        success: false,
        error: 'Trạng thái là bắt buộc'
      });
    }

    // Danh sách trạng thái hợp lệ
    const validStatuses = ['Tốt', 'Đang bảo trì', 'Cần sửa chữa', 'Hỏng'];
    if (!validStatuses.includes(TinhTrang)) {
      return res.status(400).json({
        success: false,
        error: 'Trạng thái không hợp lệ'
      });
    }

    // Tìm và cập nhật thiết bị
    const updatedThietBi = await DataModel.Data_ThietBi_Model.findOneAndUpdate(
      { MaThietBi: maTB},
      { 
        TinhTrang: TinhTrang,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedThietBi) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thiết bị'
      });
    }

    // Ghi log lịch sử thay đổi trạng thái (tuỳ chọn)
    // await LichSuThayDoi.create({
    //   MaThietBi: updatedThietBi.MaThietBi,
    //   LoaiThayDoi: 'thay_doi_trang_thai',
    //   MoTa: `Thay đổi trạng thái từ ${updatedThietBi.TinhTrang} thành ${TinhTrang}`,
    //   ThoiGian: new Date(),
    //   NguoiThucHien: req.user?.userId || 'system' // Nếu có authentication
    // });

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: {
        TinhTrang: updatedThietBi.TinhTrang
      }
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái thiết bị:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server khi cập nhật trạng thái',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/datphong/:maDatPhong/checkin - Cập nhật
app.put('/api/datphong/:maDatPhong/checkin', async (req, res) => {
    try {
        const { maDatPhong } = req.params;
        
        // 1. Lấy thông tin đặt phòng
        const datPhong = await DataModel.Data_DatPhong_Model.findOne({ MaDatPhong: maDatPhong });
        if (!datPhong) {
            return res.status(404).json({ error: 'Không tìm thấy đặt phòng' });
        }
        
        // 2. Kiểm tra trạng thái và thời gian
        const now = new Date();
        const thoiGianBatDau = new Date(datPhong.ThoiGianBatDau);
        const thoiGianQuaHan = new Date(thoiGianBatDau.getTime() + 15 * 60000);
        
        // if (now > thoiGianQuaHan) {
        //     return res.status(400).json({ error: 'Đã quá thời gian cho phép check-in' });
        // }
        
        if (datPhong.TrangThai !== 'Đã đặt') {
            return res.status(400).json({ error: 'Chỉ có thể check-in đặt phòng đã đặt' });
        }

        // Tạo mã hoá đơn tự động
        const maHD = await generateCode('HD', DataModel.Data_HoaDon_Model, 'MaHoaDon');
        console.log('🔢 Mã hoá đơn mới:', maHD);

        // Lấy thông tin phòng để lấy giá
        // const phong = await DataModel.Data_BangGiaPhong_Model.findOne({ MaPhong: datPhong.MaPhong });
        const giaPhong = 10000; //phong ? phong.GiaPhong : 0;
        
        // 3. Tạo hóa đơn mới với trạng thái "Chưa thanh toán" (theo schema mặc định)
        const hoaDon = new DataModel.Data_HoaDon_Model({
            MaHoaDon: maHD,
            MaDatPhong: maDatPhong,
            MaKH: datPhong.MaKH, // Lưu ý: không cần ._id vì MaKH là String trong schema
            MaPhong: datPhong.MaPhong, // Tương tự
            ThoiGianBatDau: new Date(), // Bắt đầu từ thời điểm check-in
            ThoiGianKetThuc: null,
            TrangThai: "Chưa thanh toán", // Theo schema mặc định
            TongTien: 0, // Sẽ tính toán khi check-out
        });
        
        await hoaDon.save();

        // 4. Tạo chi tiết hóa đơn cho dịch vụ thuê phòng
        const maCTHD = await generateCode('CTHD', DataModel.Data_ChiTietHD_Model, 'MaCTHD');
        
        const chiTietThuePhong = new DataModel.Data_ChiTietHD_Model({
            MaCTHD: maCTHD,
            MaHoaDon: maHD,
            MaHang: datPhong.MaPhong, // Dịch vụ thuê phòng không có mã hàng
            SoLuong: 1, // 1 đơn vị là thuê phòng
            DonGia: giaPhong,
            ThanhTien: 0, // Sẽ tính khi check-out
            LoaiDichVu: "Thuê phòng"
        });

        await chiTietThuePhong.save();
        
        // 4. Cập nhật trạng thái đặt phòng thành "Đang sử dụng" (theo nghiệp vụ)
        await DataModel.Data_DatPhong_Model.findByIdAndUpdate(datPhong._id, { 
            TrangThai: 'Đang sử dụng',
            GhiChu: `Đã chuyển thành hóa đơn ${hoaDon.MaHoaDon}`
        });
        
        res.json({ 
            message: 'Check-in thành công và đã tạo hóa đơn',
            hoaDon: hoaDon 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/mathang/:maMH', async (req, res) => {
  try {
    const { maMH } = req.params;
    const { 
      TenHang, LoaiHang, DonGia, DonViTinh, SoLuongTon, LinkAnh
    } = req.body;

    console.log('Nhận: ', maMH, TenHang, LoaiHang, DonGia, DonViTinh, SoLuongTon, LinkAnh);

    const mh = await DataModel.Data_MatHang_Model.findOneAndUpdate(
        { MaHang: maMH },
        { 
            TenHang, 
            LoaiHang, 
            DonGia, 
            DonViTinh, 
            SoLuongTon, 
            LinkAnh,
            createdAt: new Date()
        },
        { new: true, runValidators: true }
    );
    
    if (!mh) {
        return res.status(404).json({ 
            success: false,
            error: 'Không tìm thấy mặt hàng' 
        });
    }
    

    res.status(201).json({
      success: true,
      message: 'Cập nhật mặt hàng thành công',
    });

  } catch (error) {
    console.error('Lỗi thêm mặt hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi thêm mặt hàng',
      error: error.message
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

app.delete('/api/banggiaphong/:loaiPhong', async (req, res) => {
    try {
        const { loaiPhong } = req.params;
        
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


app.delete('/api/phonghatt', async (req, res) => {
    try {
        
        const deleteResult = await DataModel.Data_BangGiaPhong_Model.deleteMany({ 
            GiaTien: null,
            KhungGio: null,
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

app.delete('/api/nhanvien/:maNV', async (req, res) => {
  try {
    const { maNV } = req.params;

    const employee = await DataModel.Data_NhanVien_Model.findOneAndDelete(
      { MaNV: maNV }, // Điều kiện tìm kiếm
      { 
        message: true,    // Trả về document sau khi cập nhật
        runValidators: true // Chạy validation
      }
    );
    if (!employee) {
      return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    }
    
    res.json({ 
      message: 'Xoá nhân viên thành công', 
      data: employee 
    });
  } catch (error) {
    console.error('Lỗi xoá nhân viên:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/thietbi/:maTB', async (req, res) => {
  try {
    const { maTB } = req.params;

    const application = await DataModel.Data_ThietBi_Model.findOneAndDelete(
      { MaThietBi: maTB }, // Điều kiện tìm kiếm
      { 
        message: true,    // Trả về document sau khi cập nhật
        runValidators: true // Chạy validation
      }
    );
    if (!application) {
      return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
    }
    
    res.json({ 
      message: 'Xoá thiết bị thành công', 
      data: application 
    });
  } catch (error) {
    console.error('Lỗi xoá thiết bị:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/mathang/:mhID', async (req, res) => {
  try {
    const { mhID } = req.params;

    const mh = await DataModel.Data_MatHang_Model.findByIdAndDelete(
      mhID, // Điều kiện tìm kiếm
      { 
        message: true,    // Trả về document sau khi cập nhật
        runValidators: true // Chạy validation
      }
    );
    if (!mh) {
      return res.status(404).json({ error: 'Không tìm thấy mặt hàng' });
    }
    
    res.json({ 
      message: 'Xoá mặt hàng thành công', 
      data: mh 
    });
  } catch (error) {
    console.error('Lỗi xoá mặt hàng:', error);
    res.status(400).json({ error: error.message });
  }
});









///////////////////////////////
//        START SERVER        //
///////////////////////////////
app.listen(3000, () => console.log('Server running on port 3000'));