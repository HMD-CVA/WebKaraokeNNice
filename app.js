import express from 'express';
import { engine } from 'express-handlebars';
import db from './server.js';
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
        eq: (a, b) => a===b,
        formatNumber: (num) => {
            return new Intl.NumberFormat('vi-VN').format(num);
        }
    },
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

///////////////////////////////
//         GET ROUTES         //
///////////////////////////////

// Trang chủ
app.get('/', (req, res) => {
    Promise.all([
        DataModel.Data_Admin_Model.find({}).lean().exec(),
        DataModel.Data_KhachHang_Model.find({}).lean().exec(),
        DataModel.Data_NhanVien_Model.find({}).lean().exec(),
        DataModel.Data_SanPham_Model.find({}).lean().exec(),
        DataModel.Data_SanPham_Model.find({ sale: true }).lean().exec(),
        DataModel.Data_PhongHat_Model.find({}).lean().exec()
    ])
    .then(([admins, khachhangs, nhanviens, sanphams, spSale, phonghats]) => {
        const phonghatsWithStatus = phonghats.map(room => ({
            ...room,
            statusText: room.TrangThai === 1 ? 'CÒN TRỐNG' : 
                        room.TrangThai === 0 ? 'ĐANG SỬ DỤNG' : 
                        room.TrangThai === 2 ? 'ĐÃ ĐẶT' : 
                        room.TrangThai === -1 ? 'ĐÃ XOÁ': 'KHÔNG XÁC ĐỊNH'
        }));
        res.render('home', { layout: 'HomeMain.handlebars', admins, khachhangs, nhanviens, sanphams, spSale, phonghatsWithStatus });
    })
    .catch(err => res.status(500).send(err));
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