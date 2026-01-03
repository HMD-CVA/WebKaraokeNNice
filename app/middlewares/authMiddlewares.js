import jwt from 'jsonwebtoken'

const ROLE_MANAGER = 'Quản lý'

// kiểm tra đăng nhập, phân quyền     Mật khẩu nhân viên là: 123456
const requireLogin = (req, res, next) => {
    try {
        const token = req.cookies.authToken
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = decoded

        // Tạo biến locals để views sử dụng
        res.locals.isManager = decoded.vaiTro === ROLE_MANAGER

        next()
    } catch (error) {
        res.redirect('/admin-login')
    }
}

const requireManager = (req, res, next) => {
    const token = req.cookies.authToken
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    if (decoded.vaiTro === ROLE_MANAGER) next()
    else res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' })
}

export { requireLogin, requireManager }
