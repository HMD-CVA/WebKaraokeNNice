import Handlebars from 'handlebars'
import {pageSize} from '../middlewares/paginationMiddleware.js'

/**
 * @param {string} slug - Slug của trang (ví dụ: 'nhanvien', 'phonghat').
 * @param {number | string} currentPage - Trang hiện tại.
 * @param {number | string} totalPages - Tổng số trang.
 * @param {number | string} totalItems - Tổng số item (Bị lỗi trong code gốc của bạn).
 * @returns {string} - Mã HTML của phân trang.
 */
const pagination = (slug, currentPage, totalPages, totalItems) => {
    currentPage = Number(currentPage)
    totalPages = Number(totalPages)
    totalItems = Number(totalItems)

    if (totalPages <= 1) {
        return ''
    }

    const options = {
        nhanvien: 'nhân viên',
        phonghat: 'phòng',
        thietbi: 'thiết bị',
    }

    const prevPage = currentPage <= 1 ? totalPages : currentPage - 1
    const nextPage = currentPage >= totalPages ? 1 : currentPage + 1

    // ---- 3. Logic tạo dải số trang (Windowed Pagination) ----
    let pagesHtml = ''
    const pageWindow = 3

    const createPageLink = (page) => {
        if (page === currentPage) { 
            return `<span class="pagination-page active">${page}</span>`
        }
        return `<a href="/admin/${slug}?page=${page}" class="pagination-page">${page}</a>`
    }

    // Tính toán dải trang bắt đầu và kết thúc
    let startPage = Math.max(1, currentPage - Math.floor(pageWindow / 2))
    let endPage = Math.min(totalPages, startPage + pageWindow - 1)

    // Điều chỉnh lại dải trang nếu đang ở gần cuối
    // (để luôn đảm bảo hiển thị đủ 'pageWindow' nút nếu có thể)
    if (endPage - startPage + 1 < pageWindow) {
        startPage = Math.max(1, endPage - pageWindow + 1)
    }

    // --- Bắt đầu tạo HTML cho các nút số trang ---
    // Hiển thị nút "1" và "..." nếu dải trang không bắt đầu từ 1
    if (startPage > 1) {
        pagesHtml += createPageLink(1)
        if (startPage > 2) {
            pagesHtml += `<span class="pagination-ellipsis">...</span>`
        }
    }

    // Hiển thị các trang trong dải (window)
    for (let i = startPage; i <= endPage; i++) {
        pagesHtml += createPageLink(i)
    }

    // Hiển thị "..." và nút cuối cùng (totalPages) nếu dải trang không kết thúc ở cuối
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagesHtml += `<span class="pagination-ellipsis">...</span>`
        }
        pagesHtml += createPageLink(totalPages)
    }

    const minItem = Math.max(1, currentPage * pageSize - pageSize + 1)
    const maxItem = Math.min(totalItems, minItem + pageSize - 1)

    let html = `
        <div class="pagination-container" id="paginationContainer">
            <div class="pagination-info">
                Đang hiển thị <span id="currentRange">${minItem} - ${maxItem}</span> trên <span id="totalRoomsCount">${totalItems} ${options[slug]}</span>
            </div>
            <div class="pagination-controls">
                <a class="pagination-btn pagination-prev" href="/admin/${slug}?page=${prevPage}">
                    <i class=" fas fa-chevron-left"></i>
                </a>

                <div class="pagination-pages" id="paginationPages">
                    ${pagesHtml} 
                </div>

                <a class="pagination-btn pagination-next" href="/admin/${slug}?page=${nextPage}">
                    <i class=" fas fa-chevron-right"></i>
                </a>
            </div>
        </div>
    `

    return new Handlebars.SafeString(html)
}

export default pagination
