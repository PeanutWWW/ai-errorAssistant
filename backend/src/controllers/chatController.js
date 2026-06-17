const deepseekService = require('../services/deepseekService')

/**
 * POST /api/chat
 * AI 对话
 */
async function chat(req, res, next) {
  try {
    const { message, history } = req.body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '消息内容不能为空'
      })
    }

    const result = await deepseekService.chat(message.trim(), history || [])

    return res.json({
      success: true,
      data: result
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  chat
}
