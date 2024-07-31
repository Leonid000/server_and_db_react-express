const {express,app,server} = require('./WebSocket/socket')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const PORT = process.env.PORT
const CLIENT_URL = process.env.CLIENT_URL


const connectMongoDB = require('./mongoose/ConnectMongoDB')
const authRouter = require('./auth.module/auth.routes')
const roleRouter = require('./roles.module/role.routes')
const usersRouter = require('./users.module/users.routes')
const chatRouter = require('./chat.module/chat.routes')
const postsRouter = require('./posts.module/posts.routes')
const commentsRouter = require('./comments.module/comments.routes')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: CLIENT_URL
}))

app.use('/images/profileImages', express.static(path.join(__dirname,'/images/profileImages')))
app.use('/images/postsImages', express.static(path.join(__dirname,'/images/postsImages')))


app.use('/auth', authRouter)
app.use('/roles', roleRouter) /// Инициализировать роли 
app.use('/users', usersRouter)
app.use('/chat', chatRouter)
app.use('/posts', postsRouter)
app.use('/comments',commentsRouter)

const serverStart = async () => {
    await connectMongoDB()
    server.listen(PORT, () => {
        console.log(`Server listening PORT:${PORT}`)
    })
}
serverStart()