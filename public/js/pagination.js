// // ===== PAGINATION =====
// function showCurrentPage() {
//     allRooms.forEach((room) => {
//         room.style.display = 'none'
//     })

//     const startIndex = (currentPage - 1) * CONFIG.roomsPerPage
//     const endIndex = startIndex + CONFIG.roomsPerPage

//     for (let i = startIndex; i < endIndex && i < filteredRooms.length; i++) {
//         if (filteredRooms[i]) {
//             filteredRooms[i].style.display = 'block'
//         }
//     }

//     updatePaginationInfo()
// }

// function updatePaginationInfo() {
//     const currentRange = document.getElementById('currentRange')
//     const totalRoomsCount = document.getElementById('totalRoomsCount')

//     if (!currentRange || !totalRoomsCount) return

//     const totalFilteredRooms = filteredRooms.length
//     const totalPages = Math.ceil(totalFilteredRooms / CONFIG.roomsPerPage)

//     const start = totalFilteredRooms === 0 ? 0 : (currentPage - 1) * CONFIG.roomsPerPage + 1
//     const end = Math.min(currentPage * CONFIG.roomsPerPage, totalFilteredRooms)

//     currentRange.textContent = totalFilteredRooms === 0 ? '0-0' : `${start}-${end}`
//     totalRoomsCount.textContent = totalFilteredRooms

//     updatePaginationControls(totalPages)
// }

// function updatePaginationControls(totalPages) {
//     const paginationPages = document.getElementById('paginationPages')
//     const prevBtn = document.querySelector('.pagination-prev')
//     const nextBtn = document.querySelector('.pagination-next')

//     if (!paginationPages) return

//     if (prevBtn) prevBtn.disabled = currentPage === 1
//     if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0

//     paginationPages.innerHTML = ''
//     if (totalPages <= 1) return

//     addPageButton(1, paginationPages, totalPages)

//     if (currentPage > 3) {
//         addEllipsis(paginationPages)
//     }

//     const startPage = Math.max(2, currentPage - 1)
//     const endPage = Math.min(totalPages - 1, currentPage + 1)

//     for (let i = startPage; i <= endPage; i++) {
//         if (i !== 1 && i !== totalPages) {
//             addPageButton(i, paginationPages, totalPages)
//         }
//     }

//     if (currentPage < totalPages - 2) {
//         addEllipsis(paginationPages)
//     }

//     if (totalPages > 1) {
//         addPageButton(totalPages, paginationPages, totalPages)
//     }
// }

// function addPageButton(pageNumber, container, totalPages) {
//     const pageBtn = document.createElement('button')
//     pageBtn.className = `pagination-page ${pageNumber === currentPage ? 'active' : ''}`
//     pageBtn.textContent = pageNumber
//     pageBtn.onclick = () => goToPage(pageNumber)
//     container.appendChild(pageBtn)
// }

// function addEllipsis(container) {
//     const ellipsis = document.createElement('span')
//     ellipsis.className = 'pagination-ellipsis'
//     ellipsis.textContent = '...'
//     container.appendChild(ellipsis)
// }

// function goToPage(page) {
//     const totalPages = Math.ceil(filteredRooms.length / CONFIG.roomsPerPage)
//     if (page < 1 || page > totalPages || totalPages === 0) return

//     currentPage = page
//     showCurrentPage()
// }

// function changePage(direction) {
//     const totalPages = Math.ceil(filteredRooms.length / CONFIG.roomsPerPage)
//     const newPage = currentPage + direction

//     if (newPage < 1 || newPage > totalPages || totalPages === 0) return

//     currentPage = newPage
//     showCurrentPage()
// }

// function togglePaginationVisibility() {
//     const paginationContainer = document.getElementById('paginationContainer')
//     if (!paginationContainer) return

//     const shouldShow = filteredRooms.length > CONFIG.roomsPerPage

//     if (shouldShow) {
//         paginationContainer.classList.remove('hidden')
//         paginationContainer.style.display = 'flex'
//     } else {
//         paginationContainer.classList.add('hidden')
//         paginationContainer.style.display = 'none'
//     }
// }
