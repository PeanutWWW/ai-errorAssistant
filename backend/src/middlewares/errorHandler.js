/**
 * 全局错误处理中间件
 */
function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message)

  // DeepSeek API 相关错误
  if (err.status || err.code) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || '外部服务调用失败'
    })
  }

  // 通用服务器错误
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  })
}

module.exports = errorHandler
