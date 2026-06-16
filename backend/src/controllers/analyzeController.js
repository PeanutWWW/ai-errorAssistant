const deepseekService = require('../services/deepseekService')

/**
 * POST /api/analyze
 * 分析错题
 */
async function analyze(req, res, next) {
  try {
    const { question } = req.body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误：question 不能为空'
      })
    }

    const result = await deepseekService.analyzeQuestion(question.trim())

    return res.json({
      success: true,
      data: result
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  analyze
}
