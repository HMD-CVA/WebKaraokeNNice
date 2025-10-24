import { RedisStore } from 'connect-redis'
import session from 'express-session'
import { createClient } from 'redis'

// Initialize client.
const redisClient = createClient({
    username: 'default',
    password: '3sWHBAcVuXfqTsOg57zCBG2UW9ZoXije',
    socket: {
        host: 'redis-13564.c1.ap-southeast-1-1.ec2.redns.redis-cloud.com',
        port: 13564,
    },
})
redisClient.connect().catch(console.error)
// Initialize store.
const redisStore = new RedisStore({
    client: redisClient,
})

// Initialize session storage.
const sessionMiddleware = session({
    store: redisStore,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: 'matkhau',
    cookie: {
        secure: false, // true nếu dùng HTTPS
        httpOnly: true,
        sameSite: 'lax', // tốt cho login OAuth
        maxAge: 1000 * 60 * 60 * 24, // 1 ngày
    },
})

export default sessionMiddleware
