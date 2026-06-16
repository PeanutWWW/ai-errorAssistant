const OpenAI = require('openai')
const config = require('../config')

const client = new OpenAI({
  apiKey: config.ai.apiKey,
  baseURL: config.ai.baseURL
})

const SYSTEM_PROMPT = `你是一位专业的中学数学辅导老师，擅长分析初中和高中数学题目。

请根据用户提供的数学题目，严格按照以下JSON格式输出分析结果，只输出JSON，不要任何其他内容：

{"knowledge":"核心知识点名称","reason":"学生最可能出错的原因分析","solution":"详细的正确解题步骤","exercise":"同类练习题","suggestion":"学习建议"}

规则说明：
1. 必须输出合法JSON格式，确保引号配对正确
2. knowledge: 提取题目涉及的1-2个核心数学知识点，如"一元二次方程"、"三角函数"
3. reason: 分析学生解题时常见的思维误区或计算错误点，要具体
4. solution: 分步骤给出完整正确的解题过程，逻辑清晰
5. exercise: 生成一道难度相近的同类练习题，用于巩固
6. suggestion: 针对该知识点的学习建议，帮助学生避免再次出错
7. 所有内容使用中文，面向初中和高中学生理解水平
`

const DEFAULT_PROMPT = '请分析图片中的这道题目，给出详细的诊断分析。'

/**
 * 调用 Qwen-VL API 分析错题（支持图片+文字多模态）
 * @param {string} question 题目文本
 * @param {string} image 图片 base64 data URL（可选）
 * @returns {Promise<Object>} 解析后的 JSON 对象
 */
async function analyzeQuestion(question, image) {
  const content = []

  // 文字提示
  const promptText = (question && question.trim())
    ? `请分析以下错题：\n\n${question.trim()}`
    : DEFAULT_PROMPT
  content.push({ type: 'text', text: promptText })

  // 图片（如提供）
  if (image) {
    content.push({
      type: 'image_url',
      image_url: { url: image }
    })
  }

  console.log('[Qwen-VL] request model:', config.ai.model, '| content items:', content.length)

  try {
    const response = await client.chat.completions.create({
      model: config.ai.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content }
      ],
      temperature: 0.7,
      max_tokens: 2048
    })

    const contentText = response.choices[0]?.message?.content || ''
    console.log('[Qwen-VL] response length:', contentText.length)

    // 尝试提取 JSON（兼容代码块包裹的情况）
    const jsonMatch = contentText.match(/```json\s*([\s\S]*?)\s*```/) || contentText.match(/```\s*([\s\S]*?)\s*```/)
    const jsonString = jsonMatch ? jsonMatch[1].trim() : contentText.trim()

    try {
      return JSON.parse(jsonString)
    } catch (err) {
      console.error('[Qwen-VL] JSON parse failed. Raw content:', contentText.substring(0, 200))
      throw new Error('AI 返回内容无法解析为 JSON: ' + err.message)
    }
  } catch (err) {
    console.error('[Qwen-VL] API call failed:', err.message)
    console.error('[Qwen-VL] Error details:', err.status, err.code, err.type)
    throw err
  }
}

module.exports = {
  analyzeQuestion
}
