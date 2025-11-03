const pageSize = 6

const paginationMiddleware = (model) => {
    return async (req, res, next) => {
        try {
            let page = req.query.page
            if (!page) page = 1
            else if (isNaN(page)) page = 1
            else if (page < 1) page = 1

            const totalItems = await model.countDocuments()
            const totalPages = Math.ceil(totalItems / pageSize)

            if (page > totalPages) page = 1

            const items = await model
                .find({})
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .lean()

            res.items = items
            res.page = page
            res.totalPages = totalPages
            res.totalItems = totalItems

            next()
        } catch (err) {
            next(err)
        }
    }
}

export default paginationMiddleware 
export {pageSize}