<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import ChatWidget from './components/ChatWidget.vue'
import ParticleBackground from './components/ParticleBackground.vue'
import RadarChart from './components/RadarChart.vue'

const questionText = ref('')
const imageUrl = ref('')
const isAnalyzing = ref(false)
const showResult = ref(false)

const resultData = ref(null)

const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width))
          width = maxWidth
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const handleUploadChange = async (uploadFile) => {
  const raw = uploadFile.raw
  if (!raw) return
  if (!raw.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return
  }
  try {
    ElMessage.info('正在压缩图片...')
    imageUrl.value = await compressImage(raw)
    ElMessage.success('图片上传成功')
  } catch {
    ElMessage.error('图片处理失败')
  }
}

const removeImage = () => {
  imageUrl.value = ''
}

const solutionSteps = computed(() => {
  if (!resultData.value?.solution) return []
  return resultData.value.solution
    .split(/\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
})

const startAnalysis = async () => {
  if (!questionText.value.trim() && !imageUrl.value) {
    ElMessage.warning('请上传图片或输入题目内容')
    return
  }

  isAnalyzing.value = true
  showResult.value = false

  try {
    const payload = {
      question: questionText.value.trim()
    }
    if (imageUrl.value) {
      payload.image = imageUrl.value
    }

    const { data } = await axios.post('https://romantic-charm-production-93bd.up.railway.app/api/analyze', payload)

    if (data.success && data.data) {
      resultData.value = data.data
      showResult.value = true
      ElMessage.success('分析完成')
    } else {
      ElMessage.error(data.message || '分析失败')
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '请求失败'
    ElMessage.error(msg)
  } finally {
    isAnalyzing.value = false
  }
}

// 按钮波纹效果
const createRipple = (event) => {
  const button = event.currentTarget
  const circle = document.createElement('span')
  const rect = button.getBoundingClientRect()
  const diameter = Math.max(rect.width, rect.height)
  const radius = diameter / 2
  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.left = `${event.clientX - rect.left - radius}px`
  circle.style.top = `${event.clientY - rect.top - radius}px`
  circle.classList.add('ripple')
  const existing = button.getElementsByClassName('ripple')[0]
  if (existing) existing.remove()
  button.appendChild(circle)
  setTimeout(() => circle.remove(), 600)
}

const handleAnalyzeClick = (e) => {
  createRipple(e)
  startAnalysis()
}

// 雷达图数据（基于分析结果）
const radarData = computed(() => {
  if (!resultData.value?.knowledge) {
    return [
      { subject: '函数', score: 75 },
      { subject: '几何', score: 60 },
      { subject: '概率', score: 85 },
      { subject: '代数', score: 70 },
      { subject: '数列', score: 55 },
      { subject: '三角函数', score: 80 }
    ]
  }
  const subjects = resultData.value.knowledge.split(/[,，、]/).map(s => s.trim()).filter(s => s)
  if (subjects.length < 3) {
    // 如果知识点太少，补充默认维度
    const defaults = ['基础概念', '计算能力', '逻辑推理', '应用能力', '审题能力', '解题技巧']
    return defaults.map((sub, i) => ({
      subject: sub,
      score: Math.max(35, Math.min(95, 60 + Math.sin(i * 1.5) * 25))
    }))
  }
  return subjects.map((sub, i) => ({
    subject: sub,
    score: Math.max(40, Math.min(95, 75 + (i % 3 - 1) * 20))
  }))
})
</script>

<template>
  <ParticleBackground />
  <div class="app-container">
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <el-icon size="28" color="#409EFF"><Cpu /></el-icon>
        <h1>AI错题诊断助手</h1>
      </div>
      <p class="subtitle">智能识别 · 精准分析 · 高效提升</p>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Input Section -->
      <section class="input-section">
        <el-card shadow="hover" class="input-card">
          <template #header>
            <div class="card-header">
              <el-icon><EditPen /></el-icon>
              <span>题目录入</span>
            </div>
          </template>

          <!-- Image Upload -->
          <div class="upload-area">
            <p class="area-label">
              <el-icon><Picture /></el-icon>
              图片上传
            </p>
            <el-upload
              v-if="!imageUrl"
              drag
              action="#"
              accept="image/*"
              :auto-upload="false"
              :on-change="handleUploadChange"
              :show-file-list="false"
              class="image-uploader"
            >
              <el-icon size="48" color="#C0C4CC"><Upload /></el-icon>
              <div class="el-upload__text">
                拖拽图片到此处，或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 JPG、PNG 格式图片
                </div>
              </template>
            </el-upload>
            <div v-else class="image-preview-wrapper">
              <el-image
                :src="imageUrl"
                fit="contain"
                class="image-preview"
              />
              <el-button
                type="danger"
                circle
                size="small"
                class="remove-image-btn"
                @click="removeImage"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>

          <el-divider>
            <span class="divider-text">或手动输入</span>
          </el-divider>

          <!-- Text Input -->
          <div class="text-input-area">
            <p class="area-label">
              <el-icon><Document /></el-icon>
              题目文本
            </p>
            <el-input
              v-model="questionText"
              type="textarea"
              :rows="6"
              placeholder="请在此输入题目内容..."
              resize="none"
            />
          </div>

          <!-- Analyze Button -->
          <div class="action-area">
            <el-button
              type="primary"
              size="large"
              :loading="isAnalyzing"
              @click="handleAnalyzeClick"
              class="analyze-btn"
            >
              <el-icon v-if="!isAnalyzing"><Search /></el-icon>
              {{ isAnalyzing ? '正在分析...' : '开始分析' }}
            </el-button>
          </div>
        </el-card>
      </section>

      <!-- Result Section -->
      <section v-if="showResult && resultData" class="result-section">
        <el-card shadow="hover" class="result-card">
          <template #header>
            <div class="card-header result-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>诊断报告</span>
              <el-tag type="success" effect="light" class="status-tag">已完成</el-tag>
            </div>
          </template>

          <!-- Radar Chart -->
          <div class="result-block result-block-1">
            <h3>
              <el-icon><DataAnalysis /></el-icon>
              知识点掌握度
            </h3>
            <RadarChart :data="radarData" />
          </div>

          <el-divider />

          <!-- Knowledge Point -->
          <div class="result-block result-block-2">
            <h3>
              <el-icon><Reading /></el-icon>
              知识点
            </h3>
            <el-tag size="large" effect="plain" type="primary" class="knowledge-tag">
              {{ resultData.knowledge }}
            </el-tag>
          </div>

          <el-divider />

          <!-- Error Reason -->
          <div class="result-block result-block-3">
            <h3>
              <el-icon><Warning /></el-icon>
              错因分析
            </h3>
            <p class="analysis-text">{{ resultData.reason }}</p>
          </div>

          <el-divider />

          <!-- Solution Steps -->
          <div class="result-block result-block-4">
            <h3>
              <el-icon><CircleCheck /></el-icon>
              解题步骤
            </h3>
            <div v-if="solutionSteps.length" class="solution-list">
              <div
                v-for="(step, index) in solutionSteps"
                :key="index"
                class="solution-item"
              >
                <span class="step-index">{{ index + 1 }}</span>
                <span class="step-text">{{ step }}</span>
              </div>
            </div>
            <p v-else class="analysis-text">{{ resultData.solution }}</p>
          </div>

          <el-divider />

          <!-- Similar Exercise -->
          <div class="result-block result-block-5">
            <h3>
              <el-icon><Collection /></el-icon>
              相似题
            </h3>
            <div class="exercise-card">
              <p class="exercise-text">{{ resultData.exercise }}</p>
            </div>
          </div>

          <el-divider />

          <!-- Learning Suggestion -->
          <div class="result-block result-block-6">
            <h3>
              <el-icon><Lightning /></el-icon>
              学习建议
            </h3>
            <div class="suggestion-card">
              <p class="suggestion-text">{{ resultData.suggestion }}</p>
            </div>
          </div>
        </el-card>
      </section>
    </main>
  </div>
  <ChatWidget />
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  padding-bottom: 60px;
}

.header {
  text-align: center;
  padding: 40px 20px 20px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo h1 {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  letter-spacing: 2px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  letter-spacing: 6px;
  margin: 0;
}

.main-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-card,
.result-card {
  border-radius: 12px;
  border: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.result-header {
  justify-content: flex-start;
}

.status-tag {
  margin-left: auto;
}

.upload-area {
  margin-bottom: 8px;
}

.area-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin: 0 0 12px;
}

.image-uploader {
  width: 100%;
}

.image-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
  border-radius: 8px;
  background: #fafafa;
  border: 2px dashed #dcdfe6;
  transition: all 0.3s;
}

.image-uploader :deep(.el-upload-dragger:hover) {
  border-color: #409EFF;
  background: #f0f9ff;
}

.image-preview-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.image-preview {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
}

.remove-image-btn {
  position: absolute;
  top: -10px;
  right: -10px;
}

.divider-text {
  font-size: 12px;
  color: #909399;
}

.text-input-area {
  margin-bottom: 20px;
}

.action-area {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.analyze-btn {
  width: 200px;
  height: 44px;
  font-size: 16px;
  border-radius: 22px;
  background: linear-gradient(90deg, #409EFF, #53a8ff);
  border: none;
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.4);
  transition: all 0.3s;
}

.analyze-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.5);
}

.result-section {
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-block {
  margin-bottom: 16px;
}

.result-block h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
}

.knowledge-tag {
  font-size: 14px;
  padding: 0 16px;
  height: 34px;
}

.analysis-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin: 0;
}

.solution-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.solution-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 8px;
}

.step-index {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #409EFF;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 50%;
}

.step-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  padding-top: 2px;
}

.exercise-card,
.suggestion-card {
  background: #f0f9ff;
  border-left: 4px solid #409EFF;
  padding: 16px;
  border-radius: 0 8px 8px 0;
}

.exercise-text,
.suggestion-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin: 0;
}

.suggestion-card {
  background: #f6ffed;
  border-left-color: #67C23A;
}

@media (max-width: 768px) {
  .logo h1 {
    font-size: 24px;
  }
}

/* ========== 动效样式 ========== */

/* 按钮波纹效果 */
.analyze-btn {
  position: relative;
  overflow: hidden;
}

.analyze-btn .ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0);
  animation: ripple-effect 0.6s linear;
  pointer-events: none;
}

@keyframes ripple-effect {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* 结果卡片依次滑入 */
.result-block {
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.5s ease forwards;
}

.result-block-1 { animation-delay: 0.1s; }
.result-block-2 { animation-delay: 0.2s; }
.result-block-3 { animation-delay: 0.3s; }
.result-block-4 { animation-delay: 0.4s; }
.result-block-5 { animation-delay: 0.5s; }
.result-block-6 { animation-delay: 0.6s; }

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 知识点标签弹跳 */
.knowledge-tag {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 确保内容在粒子背景上方 */
.app-container {
  position: relative;
  z-index: 1;
}
</style>
