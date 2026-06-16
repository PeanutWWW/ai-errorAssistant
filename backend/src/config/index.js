require('dotenv').config()

const config = {
  port: process.env.PORT || 3000,
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat'
  }
}

if (!config.deepseek.apiKey || config.deepseek.apiKey === 'your_deepseek_api_key_here') {
  console.warn('[WARN] DEEPSEEK_API_KEY 未配置，请在 .env 文件中设置')
}

module.exports = config
