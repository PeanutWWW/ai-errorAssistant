const app = require('./src/app')
const config = require('./src/config')

app.listen(config.port, () => {
  console.log(`[Server] 运行在 http://localhost:${config.port}`)
  console.log(`[ENV] 端口: ${config.port}`)
  console.log(`[ENV] DeepSeek API Key: ${config.deepseek.apiKey ? '已配置' : '未配置'}`)
})
