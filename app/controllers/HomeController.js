import DataModel from '../model/index.js';

class HomeController {
    // GET / - Trang chủ
    async renderHomePage(req, res) {
        try {
            const [phonghats, banggiaphongs, roomTypes] = await Promise.all([
                DataModel.Data_PhongHat_Model.find({}).lean().exec(),
                DataModel.Data_BangGiaPhong_Model.find({}).lean().exec(),
                DataModel.Data_BangGiaPhong_Model.distinct('LoaiPhong'),
            ]);

            // Gắn giá phòng - Lấy giá THẤP NHẤT để hiển thị
            const phonghatsWithPrice = phonghats.map((room) => {
                const giaPhong = banggiaphongs.filter(
                    (bg) => bg.LoaiPhong === room.LoaiPhong
                );

                // Tính giá thấp nhất, cao nhất và giá hiện tại
                const giaValues = giaPhong.map((g) => g.GiaTien);
                const giaThapNhat = giaValues.length > 0 ? Math.min(...giaValues) : 0;
                const giaCaoNhat = giaValues.length > 0 ? Math.max(...giaValues) : 0;

                // Lấy giá hiện tại dựa trên thời gian thực (hoặc giá thấp nhất)
                const giaHienTai =
                    giaPhong.find((g) => {
                        const [startTime, endTime] = g.KhungGio.split('-');
                        const [startHour, startMinute] = startTime.split(':').map(Number);
                        const [endHour, endMinute] = endTime.split(':').map(Number);

                        const now = new Date();
                        const currentHour = now.getHours();
                        const currentMinute = now.getMinutes();

                        const currentTotalMinutes = currentHour * 60 + currentMinute;
                        const startTotalMinutes = startHour * 60 + startMinute;
                        const endTotalMinutes = endHour * 60 + endMinute;

                        return (
                            currentTotalMinutes >= startTotalMinutes &&
                            currentTotalMinutes < endTotalMinutes
                        );
                    })?.GiaTien || giaCaoNhat;

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
                    GiaTien: giaHienTai, // Backup
                };
            });

            const phonghatHome = phonghatsWithPrice.filter(
                (phong) => phong.TrangThai === 'Trống'
            );

            res.render('home', {
                layout: 'HomeMain.handlebars',
                phonghats: phonghatsWithPrice,
                roomTypes: roomTypes,
                phonghatsH: phonghatHome,
            });
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            res.status(500).send('Lỗi khi tải dữ liệu: ' + error.message);
        }
    }

    // GET /about - Trang giới thiệu
    async renderAboutPage(req, res) {
        try {
            res.render('about', {
                layout: 'HomeMain.handlebars',
            });
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            res.status(500).send('Lỗi khi tải dữ liệu: ' + error.message);
        }
    }

    // GET /services - Trang dịch vụ
    async renderServicesPage(req, res) {
        try {
            res.render('services', {
                layout: 'HomeMain.handlebars',
            });
        } catch (error) {
            console.error('Lỗi khi tải trang dịch vụ:', error);
            res.status(500).send('Lỗi khi tải trang dịch vụ: ' + error.message);
        }
    }

    // GET /admin-login - Trang đăng nhập admin
    renderLoginPage(req, res) {
        res.render('login', {
            layout: false,
        });
    }

    // GET /admin - Admin Dashboard
    async renderDashboard(req, res) {
        try {
            const now = new Date();
            const startDate = new Date('2025-11-01'); // Ngày bắt đầu 01/11/2025

            // 1) Doanh thu theo ngày (từ 01/11/2025 đến nay)
            const [dailyRevenueAgg, prevPeriodRevenueAgg] = await Promise.all([
                // Doanh thu từ 01/11/2025 đến nay
                DataModel.Data_HoaDon_Model.aggregate([
                    {
                        $match: {
                            TrangThai: 'Đã thanh toán',
                            createdAt: { $gte: startDate, $lte: now },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' },
                                day: { $dayOfMonth: '$createdAt' },
                            },
                            total: { $sum: '$TongTien' },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
                ]),
                // Doanh thu kỳ trước (01/10/2025 - 31/10/2025) để so sánh
                DataModel.Data_HoaDon_Model.aggregate([
                    {
                        $match: {
                            TrangThai: 'Đã thanh toán',
                            createdAt: {
                                $gte: new Date('2025-10-01'),
                                $lte: new Date('2025-10-31'),
                            },
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$TongTien' } } },
                ]),
            ]);

            // Tính tổng doanh thu từ 01/11/2025
            const revenueThisPeriod = dailyRevenueAgg.reduce((sum, day) => sum + day.total, 0);
            const revenuePrevPeriod = prevPeriodRevenueAgg[0]?.total || 0;
            const revenueMoM = revenuePrevPeriod > 0
                ? ((revenueThisPeriod - revenuePrevPeriod) / revenuePrevPeriod) * 100
                : revenueThisPeriod > 0 ? 100 : 0;

            // 2) Khách hàng theo ngày
            const [custTotal, custThisPeriod, custPrevPeriod] = await Promise.all([
                DataModel.Data_KhachHang_Model.estimatedDocumentCount(),
                DataModel.Data_KhachHang_Model.countDocuments({
                    createdAt: { $gte: startDate, $lte: now },
                }),
                DataModel.Data_KhachHang_Model.countDocuments({
                    createdAt: {
                        $gte: new Date('2025-10-01'),
                        $lte: new Date('2025-10-31'),
                    },
                }),
            ]);
            const custMoM = custPrevPeriod > 0
                ? ((custThisPeriod - custPrevPeriod) / custPrevPeriod) * 100
                : custThisPeriod > 0 ? 100 : 0;

            // 3) Đơn hàng theo ngày
            const [ordersThisPeriod, ordersPrevPeriod] = await Promise.all([
                DataModel.Data_HoaDon_Model.countDocuments({
                    TrangThai: 'Đã thanh toán',
                    createdAt: { $gte: startDate, $lte: now },
                }),
                DataModel.Data_HoaDon_Model.countDocuments({
                    TrangThai: 'Đã thanh toán',
                    createdAt: {
                        $gte: new Date('2025-10-01'),
                        $lte: new Date('2025-10-31'),
                    },
                }),
            ]);
            const ordersMoM = ordersPrevPeriod > 0
                ? ((ordersThisPeriod - ordersPrevPeriod) / ordersPrevPeriod) * 100
                : ordersThisPeriod > 0 ? 100 : 0;

            // 4) Phòng hát
            const [roomsTotal, roomsActive] = await Promise.all([
                DataModel.Data_PhongHat_Model.estimatedDocumentCount(),
                DataModel.Data_PhongHat_Model.countDocuments({ TrangThai: 'Đang sử dụng' }),
            ]);

            // 5) Dữ liệu biểu đồ doanh thu theo ngày
            const dailyRevenueData = await DataModel.Data_HoaDon_Model.aggregate([
                {
                    $match: {
                        TrangThai: 'Đã thanh toán',
                        createdAt: { $gte: startDate, $lte: now },
                    },
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' },
                        },
                        total: { $sum: '$TongTien' },
                        date: { $first: '$createdAt' },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
            ]);

            // 6) Dữ liệu biểu đồ phân loại doanh thu
            const revenueByCategoryData = await DataModel.Data_ChiTietHD_Model.aggregate([
                {
                    $lookup: {
                        from: 'hoadons',
                        localField: 'MaHoaDon',
                        foreignField: 'MaHoaDon',
                        as: 'hoadonInfo',
                    },
                },
                { $unwind: '$hoadonInfo' },
                {
                    $match: {
                        'hoadonInfo.TrangThai': 'Đã thanh toán',
                        'hoadonInfo.createdAt': { $gte: startDate, $lte: now },
                    },
                },
                {
                    $group: {
                        _id: '$LoaiDichVu',
                        total: { $sum: '$ThanhTien' },
                    },
                },
            ]);

            // 7) Hoạt động gần đây
            const recentHoaDons = await DataModel.Data_HoaDon_Model.find({
                createdAt: { $gte: startDate, $lte: now },
            })
                .sort({ createdAt: -1 })
                .limit(4)
                .lean();

            const formatTimeAgo = (date) => {
                const nowTime = new Date();
                const diffMs = nowTime - new Date(date);
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);

                if (diffMins < 1) return 'Vừa xong';
                if (diffMins < 60) return `${diffMins} phút trước`;
                if (diffHours < 24) return `${diffHours} giờ trước`;
                if (diffDays === 1) return 'Hôm qua';
                return `${diffDays} ngày trước`;
            };

            const activityData = recentHoaDons.map((activity) => {
                let icon = 'shopping-cart';
                let iconColor = 'success';
                let title = 'Đơn hàng mới';

                const formatCurrencyTemp = (num) => {
                    if (num === null || num === undefined || isNaN(num)) return '0 VNĐ';
                    return new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ';
                };

                let description = `Hóa đơn ${activity.MaHoaDon} - ${formatCurrencyTemp(activity.TongTien || 0)}`;

                if (activity.TrangThai === 'Chưa thanh toán') {
                    icon = 'clock';
                    iconColor = 'warning';
                    title = 'Hóa đơn chờ thanh toán';
                } else if (activity.TrangThai === 'Đã thanh toán') {
                    icon = 'check-circle';
                    iconColor = 'success';
                    title = 'Hóa đơn đã thanh toán';
                }

                return {
                    icon,
                    iconColor,
                    title,
                    description,
                    time: formatTimeAgo(activity.createdAt),
                };
            });

            // 8) Sản phẩm phổ biến từ 01/11/2025
            const topProductsAgg = await DataModel.Data_ChiTietHD_Model.aggregate([
                {
                    $lookup: {
                        from: 'hoadons',
                        localField: 'MaHoaDon',
                        foreignField: 'MaHoaDon',
                        as: 'hoadonInfo',
                    },
                },
                { $unwind: '$hoadonInfo' },
                {
                    $match: {
                        'hoadonInfo.TrangThai': 'Đã thanh toán',
                        'hoadonInfo.createdAt': { $gte: startDate, $lte: now },
                        MaHang: { $ne: null },
                    },
                },
                {
                    $group: {
                        _id: '$MaHang',
                        totalSold: { $sum: '$SoLuong' },
                    },
                },
                { $sort: { totalSold: -1 } },
                { $limit: 3 },
            ]);

            const topProducts = await Promise.all(
                topProductsAgg.map(async (item) => {
                    const product = await DataModel.Data_MatHang_Model.findOne({
                        MaHang: item._id,
                    }).lean();
                    if (product) {
                        return {
                            ...product,
                            soLuongBan: item.totalSold,
                        };
                    }
                    return null;
                })
            ).then((products) => products.filter((p) => p !== null));

            // Dữ liệu mặc định nếu không có sản phẩm
            const finalTopProducts = topProducts.length > 0 ? topProducts : [
                {
                    TenHang: 'Bia Tiger',
                    LoaiHang: 'Đồ uống',
                    DonGia: 125000,
                    LinkAnh: 'https://via.placeholder.com/60x60/4361ee/ffffff?text=P1',
                    soLuongBan: 284,
                },
                {
                    TenHang: 'Snack',
                    LoaiHang: 'Đồ ăn nhẹ',
                    DonGia: 25000,
                    LinkAnh: 'https://via.placeholder.com/60x60/f72585/ffffff?text=P2',
                    soLuongBan: 542,
                },
                {
                    TenHang: 'Nước suối',
                    LoaiHang: 'Đồ uống',
                    DonGia: 15000,
                    LinkAnh: 'https://via.placeholder.com/60x60/4cc9f0/ffffff?text=P3',
                    soLuongBan: 892,
                },
            ];

            // Helper function để lấy trạng thái phòng
            const getRoomStatusData = async () => {
                const roomStatusData = await DataModel.Data_PhongHat_Model.aggregate([
                    {
                        $group: {
                            _id: '$TrangThai',
                            count: { $sum: 1 },
                        },
                    },
                ]);
                return roomStatusData.map((item) => ({
                    label: item._id,
                    count: item.count,
                }));
            };

            // Chuẩn bị dữ liệu biểu đồ
            const chartData = {
                dailyRevenue: dailyRevenueData.map((item) => ({
                    label: `${item._id.day}/${item._id.month}/${item._id.year}`,
                    value: item.total,
                    date: item.date,
                })),
                revenueByCategory: revenueByCategoryData.map((item) => ({
                    label: item._id,
                    value: item.total,
                })),
                roomStatus: await getRoomStatusData(),
            };

            // Helper function format date
            const formatDate = (date) => {
                return new Date(date).toLocaleDateString('vi-VN');
            };

            // Stats cho cards
            const stats = {
                // Doanh thu từ 01/11/2025
                totalRevenue: revenueThisPeriod,
                momPercent: revenueMoM,
                momIsUp: revenueMoM >= 0,

                // Khách hàng từ 01/11/2025
                totalCustomers: custTotal,
                customersThisPeriod: custThisPeriod,
                customersMoM: custMoM,
                customersIsUp: custMoM >= 0,

                // Đơn hàng từ 01/11/2025
                ordersThisPeriod: ordersThisPeriod,
                ordersMoM: ordersMoM,
                ordersIsUp: ordersMoM >= 0,

                // Phòng
                roomsTotal,
                roomsActive,

                // Thông tin period
                periodStart: '01/11/2025',
                periodEnd: formatDate(now),
            };

            res.render('AD_Dashboard', {
                layout: 'AdminMain',
                dashboardPage: true,
                stats,
                recentActivities: activityData,
                topProducts: finalTopProducts,
                chartData: JSON.stringify(chartData),
            });
        } catch (err) {
            console.error('Lỗi dashboard:', err);
            res.status(500).send('Lỗi server!');
        }
    }
}

export default new HomeController();
