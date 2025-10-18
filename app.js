import express from 'express';
import { engine } from 'express-handlebars';
import db from './config/server.js';
import DataModel from './app/model/index.js';

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

// Quản lý sản phẩm
app.get('/admin/sanpham', async (req, res) => {
    try {
        const sanphams = await DataModel.Data_SanPham_Model.find({}).lean();
        res.render('sanpham', { layout: 'AdminMain', title: 'Quản lý sản phẩm', sanphams });
    } catch (err) {
        res.status(500).send('Lỗi server!');
    }
});

// Quản lý phòng hát
app.get('/admin/phonghat', async (req, res) => {
    try {
        const phonghats = await DataModel.Data_PhongHat_Model.find({}).lean();
        const phonghatsWithStatus = phonghats.map(room => ({
            ...room,
            statusText: room.TrangThai === 1 ? 'CÒN TRỐNG' : 
                        room.TrangThai === 0 ? 'ĐANG SỬ DỤNG' : 
                        room.TrangThai === 2 ? 'ĐÃ ĐẶT' : 
                        room.TrangThai === -1 ? 'ĐÃ XOÁ': 'KHÔNG XÁC ĐỊNH'
        }));
        res.render('phonghat', { layout: 'AdminMain', title: 'Quản lý phòng hát', phonghats: phonghatsWithStatus,phonghatPage: true });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Lỗi server!');
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
        const { TenPhong, LoaiPhong, GiaPhong, SucChua, TrangThai, MoTa, AnhPhong } = req.body;
        const ph = await DataModel.Data_PhongHat_Model.create({ TenPhong, LoaiPhong, GiaPhong, SucChua, TrangThai, MoTa, AnhPhong });
        res.status(200).json(ph);
    } catch (err) {
        res.status(400).json({ error: err.message });
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
        const { TenPhong, LoaiPhong, GiaPhong, SucChua, TrangThai, MoTa, AnhPhong } = req.body;
        const ph = await DataModel.Data_PhongHat_Model.findByIdAndUpdate(id, { TenPhong, LoaiPhong, GiaPhong, SucChua, TrangThai, MoTa, AnhPhong }, { new: true });
        if (!ph) return res.status(404).json({ error: 'Không tìm thấy phòng hát' });
        res.json(ph);
    } catch (err) {
        res.status(400).json({ error: err.message });
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

///////////////////////////////
//        START SERVER        //
///////////////////////////////
app.listen(3000, () => console.log('Server running on port 3000'));