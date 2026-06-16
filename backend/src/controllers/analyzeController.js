const deepseekService = require('../services/deepseekService')

/**
 * POST /api/analyze
 * 分析错题
 */
async function analyze(req, res, next) {
  try {
    const { question, image } = req.body

    const hasQuestion = question && typeof question === 'string' && question.trim().length > 0
    const hasImage = image && typeof image === 'string' && image.trim().length > 0

    if (!hasQuestion && !hasImage) {
      return res.status(400).json({
        success: false,
        message: '请上传题目图片或输入题目内容'
      })
    }

    if (!hasQuestion && hasImage) {
      return res.status(400).json({
        success: false,
        message: 'AI 暂不支持直接识别图片，请补充输入题目文字或描述图片内容'
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
