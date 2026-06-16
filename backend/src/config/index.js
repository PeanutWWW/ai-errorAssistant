require('dotenv').config()

const config = {
  port: process.env.PORT || 3000,
  ai: {
    apiKey: process.env.DASHSCOPE_API_KEY || process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-vl-plus'
  }
}

if (!config.ai.apiKey || config.ai.apiKey === 'your_api_key_here') {
  console.warn('[WARN] API Key 未配置，请在 .env 文件中设置 DASHSCOPE_API_KEY')
}

module.exports = config
