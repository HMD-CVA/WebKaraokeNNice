import express from 'express'
import { engine } from 'express-handlebars'
import db from './config/server.js'
import router from './routers/index.js'
import sessionMiddleware from './middlewares/sessionMiddleware.js'
import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'
import DataModel from './models/index.js'

db.connectDB()
const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(sessionMiddleware)

//-------- setup passport
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, { id: user._id }) // lưu _id tài khoản vào session
    })
})

passport.deserializeUser(function (user, cb) {
    process.nextTick(async function () {
        return cb(null, user)
    })
})

passport.use(
    new GoogleStrategy(
        {
            clientID: '1031291160965-tfl0t251fcdjhk8l562q0hh3fbd04vim.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'http://localhost:3000/auth/google/callback',
        },
        async function (accessToken, refreshToken, profile, cb) {
            try {
                const GoogleId = profile.id
                let user = await DataModel.Data_TaiKhoan_Model.findOne({ GoogleId })
                if (!user) {
                    user = await DataModel.Data_TaiKhoan_Model.create({ GoogleId })
                    await DataModel.Data_ThongTinTaiKhoan_Model.create({
                        TaiKhoanId: user._id,
                        HoTen: profile.displayName,
                        Email: profile._json.email,
                    })
                }
                cb(null, user)
            } catch (error) {
                cb(error)
            }
        }
    )
)

// Handlebars setup
app.engine(
    'handlebars',
    engine({
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
            uppercase: (str) => (typeof str === 'string' ? str.toUpperCase() : str),
            lowercase: (str) => (typeof str === 'string' ? str.toLowerCase() : str),
            length: (array) => (Array.isArray(array) ? array.length : 0),

            // === NUMBER & CURRENCY HELPERS ===
            formatNumber: (num) => {
                if (num === null || num === undefined || isNaN(num)) return '0'
                return new Intl.NumberFormat('vi-VN').format(num)
            },

            formatCurrency: (num, currency = 'VNĐ') => {
                if (num === null || num === undefined || isNaN(num)) return `0 ${currency}`
                return `${new Intl.NumberFormat('vi-VN').format(num)} ${currency}`
            },

            // === PRICE SPECIFIC HELPERS ===
            getGiaTheoGio: (bangGia, khungGio) => {
                if (!bangGia || !Array.isArray(bangGia)) return 0
                const gia = bangGia.find((g) => g.KhungGio === khungGio)
                return gia ? gia.GiaTien : 0
            },

            showKhoangGia: (giaThapNhat, giaCaoNhat) => {
                if (!giaThapNhat && !giaCaoNhat) return 'Liên hệ'
                if (giaThapNhat === giaCaoNhat) {
                    return new Intl.NumberFormat('vi-VN').format(giaThapNhat) + ' VNĐ/H'
                }
                return new Intl.NumberFormat('vi-VN').format(giaThapNhat) + ' - ' + new Intl.NumberFormat('vi-VN').format(giaCaoNhat) + ' VNĐ/H'
            },

            showTatCaGia: (bangGia) => {
                if (!bangGia || !Array.isArray(bangGia)) return ''

                return bangGia.map((gia) => `${gia.KhungGio}: ${new Intl.NumberFormat('vi-VN').format(gia.GiaTien)} VNĐ`).join(' | ')
            },

            getGiaThapNhat: (bangGia) => {
                if (!bangGia || !Array.isArray(bangGia) || bangGia.length === 0) return 0
                return Math.min(...bangGia.map((g) => g.GiaTien))
            },

            getGiaCaoNhat: (bangGia) => {
                if (!bangGia || !Array.isArray(bangGia) || bangGia.length === 0) return 0
                return Math.max(...bangGia.map((g) => g.GiaTien))
            },

            // === STATUS HELPERS ===
            getStatusText: (status) => {
                const statusMap = {
                    Trống: 'CÒN TRỐNG',
                    'Đang sử dụng': 'ĐANG SỬ DỤNG',
                    'Đang bảo trì': 'BẢO TRÌ',
                    'Đã đặt trước': 'ĐÃ ĐẶT',
                    available: 'CÒN TRỐNG',
                    busy: 'ĐANG SỬ DỤNG',
                    maintenance: 'BẢO TRÌ',
                    reserved: 'ĐÃ ĐẶT',
                }
                return statusMap[status] || status
            },

            getStatusClass: (status) => {
                const classMap = {
                    Trống: 'status-available',
                    'Đang sử dụng': 'status-busy',
                    'Đang bảo trì': 'status-maintenance',
                    'Đã đặt trước': 'status-reserved',
                }
                return classMap[status] || 'status-unknown'
            },

            getStatusIcon: (status) => {
                const iconMap = {
                    Trống: 'fa-door-open',
                    'Đang sử dụng': 'fa-microphone-alt',
                    'Đang bảo trì': 'fa-tools',
                    'Đã đặt trước': 'fa-calendar-check',
                }
                return iconMap[status] || 'fa-question-circle'
            },

            // === DATE HELPERS ===
            formatDate: (date) => {
                if (!date) return ''
                try {
                    return new Date(date).toLocaleDateString('vi-VN')
                } catch {
                    return ''
                }
            },

            formatDateTime: (date) => {
                if (!date) return ''
                try {
                    return new Date(date).toLocaleString('vi-VN')
                } catch {
                    return ''
                }
            },

            // === UTILITY HELPERS ===
            json: (obj) => {
                try {
                    return JSON.stringify(obj, null, 2)
                } catch {
                    return ''
                }
            },

            // === CONDITIONAL HELPERS ===
            ifCond: function (v1, operator, v2, options) {
                switch (operator) {
                    case '==':
                        return v1 == v2 ? options.fn(this) : options.inverse(this)
                    case '===':
                        return v1 === v2 ? options.fn(this) : options.inverse(this)
                    case '!=':
                        return v1 != v2 ? options.fn(this) : options.inverse(this)
                    case '!==':
                        return v1 !== v2 ? options.fn(this) : options.inverse(this)
                    case '<':
                        return v1 < v2 ? options.fn(this) : options.inverse(this)
                    case '<=':
                        return v1 <= v2 ? options.fn(this) : options.inverse(this)
                    case '>':
                        return v1 > v2 ? options.fn(this) : options.inverse(this)
                    case '>=':
                        return v1 >= v2 ? options.fn(this) : options.inverse(this)
                    case '&&':
                        return v1 && v2 ? options.fn(this) : options.inverse(this)
                    case '||':
                        return v1 || v2 ? options.fn(this) : options.inverse(this)
                    default:
                        return options.inverse(this)
                }
            },
        },
    })
)

app.set('view engine', 'handlebars')
app.set('views', './views')

// Routers
app.use('/', router)

///////////////////////////////
//        START SERVER        //
///////////////////////////////
app.listen(3000, () => console.log('Server running on port 3000'))
