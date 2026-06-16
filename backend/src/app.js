const express = require('express')
const cors = require('cors')
const analyzeRouter = require('./routes/analyze')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 业务路由
app.use('/api/analyze', analyzeRouter)

// 404 处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' })
})

// 全局错误处理
app.use(errorHandler)

module.exports = app
