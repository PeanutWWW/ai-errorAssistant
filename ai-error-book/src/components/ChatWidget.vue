<script setup>
import { ref, nextTick, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Close, ArrowDown } from '@element-plus/icons-vue'
import axios from 'axios'

const isOpen = ref(false)
const isFlipping = ref(false)
const inputMessage = ref('')
const messages = ref([
  {
    role: 'assistant',
    content: '你好！我是你的AI数学辅导助手，有任何数学问题都可以随时问我~',
    typed: true
  }
])
const isLoading = ref(false)
const messagesContainer = ref(null)

// 打字机效果：存储每条消息的当前显示文本
const typingMap = ref(new Map())
const typingCursor = ref(new Map())

const toggleChat = () => {
  if (isFlipping.value) return
  isFlipping.value = true
  setTimeout(() => {
    isOpen.value = !isOpen.value
    setTimeout(() => {
      isFlipping.value = false
    }, 600)
  }, 300)
}

const closeChat = () => {
  if (isFlipping.value) return
  isFlipping.value = true
  setTimeout(() => {
    isOpen.value = false
    setTimeout(() => {
      isFlipping.value = false
    }, 600)
  }, 300)
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => messages.value.length, scrollToBottom)

// 打字机效果
const typeWriter = (index, fullText, speed = 30) => {
  typingMap.value.set(index, '')
  typingCursor.value.set(index, true)
  let i = 0
  const timer = setInterval(() => {
    typingMap.value.set(index, fullText.substring(0, i + 1))
    i++
    scrollToBottom()
    if (i >= fullText.length) {
      clearInterval(timer)
      typingCursor.value.set(index, false)
      messages.value[index].typed = true
    }
  }, speed)
}

const getDisplayText = (msg, index) => {
  if (msg.role === 'user' || msg.typed) {
    return msg.content
  }
  const typed = typingMap.value.get(index)
  return typed !== undefined ? typed : msg.content
}

const isTyping = (index) => {
  return typingCursor.value.get(index) || false
}

const sendMessage = async () => {
  const text = inputMessage.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({ role: 'user', content: text, typed: true })
  inputMessage.value = ''
  isLoading.value = true

  try {
    const { data } = await axios.post(
      'https://romantic-charm-production-93bd.up.railway.app/api/chat',
      {
        message: text,
        history: messages.value.slice(0, -1).map(m => ({
          role: m.role,
          content: m.content
        }))
      }
    )

    if (data.success) {
      const idx = messages.value.length
      messages.value.push({ role: 'assistant', content: data.data.reply, typed: false })
      typeWriter(idx, data.data.reply, 25)
    } else {
      ElMessage.error(data.message || 'AI响应失败')
      const idx = messages.value.length
      messages.value.push({ role: 'assistant', content: '抱歉，我暂时无法回答这个问题，请稍后再试。', typed: false })
      typeWriter(idx, '抱歉，我暂时无法回答这个问题，请稍后再试。', 25)
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '网络请求失败')
    const idx = messages.value.length
    messages.value.push({ role: 'assistant', content: '抱歉，网络出了点问题，请检查网络后重试。', typed: false })
    typeWriter(idx, '抱歉，网络出了点问题，请检查网络后重试。', 25)
  } finally {
    isLoading.value = false
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="chat-widget" :class="{ flipping: isFlipping }">
    <div class="chat-flipper" :class="{ flipped: isOpen }">
      <!-- 悬浮球（正面） -->
      <div
        v-if="!isOpen"
        class="chat-bubble chat-front"
        @click="toggleChat"
      >
        <el-icon :size="28"><ChatDotRound /></el-icon>
        <span class="chat-bubble-text">AI辅导</span>
      </div>

      <!-- 对话窗口（背面） -->
      <div v-if="isOpen" class="chat-window chat-back">
        <!-- 头部 -->
        <div class="chat-header">
          <div class="chat-title">
            <el-icon :size="20"><ChatDotRound /></el-icon>
            <span>AI数学辅导</span>
          </div>
          <div class="chat-actions">
            <el-button text circle size="small" @click="closeChat">
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <el-button text circle size="small" @click="closeChat">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div ref="messagesContainer" class="chat-messages">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['chat-message', msg.role === 'user' ? 'chat-message-user' : 'chat-message-assistant']"
          >
            <div class="chat-avatar">
              <el-avatar
                :size="32"
                :src="msg.role === 'user'
                  ? 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
                  : 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
              />
            </div>
            <div class="chat-bubble-content">
              <div class="chat-text">
                <span v-html="getDisplayText(msg, index).replace(/\n/g, '<br>')"></span>
                <span v-if="isTyping(index)" class="typing-cursor">|</span>
              </div>
            </div>
          </div>

          <!-- 加载中 -->
          <div v-if="isLoading" class="chat-message chat-message-assistant">
            <div class="chat-avatar">
              <el-avatar
                :size="32"
                src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
              />
            </div>
            <div class="chat-bubble-content">
              <div class="chat-loading">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="chat-input-area">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="2"
            placeholder="输入你的数学问题，回车发送..."
            resize="none"
            @keydown="handleKeydown"
          />
          <el-button
            type="primary"
            :loading="isLoading"
            :disabled="!inputMessage.trim()"
            @click="sendMessage"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-widget {
  position: fixed;
  right: 20px;
  top: 30%;
  z-index: 1000;
  perspective: 1000px;
}

.chat-flipper {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.chat-flipper.flipped {
  transform: rotateY(180deg);
}

/* 悬浮球 */
.chat-bubble {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e6fdb 0%, #409eff 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(30, 111, 219, 0.35);
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
  backface-visibility: hidden;
}

.chat-bubble:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 24px rgba(30, 111, 219, 0.45);
}

.chat-bubble-text {
  font-size: 10px;
  margin-top: 2px;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 4px 16px rgba(30, 111, 219, 0.35); }
  50% { box-shadow: 0 4px 24px rgba(30, 111, 219, 0.55); }
}

/* 对话窗口 */
.chat-window {
  width: 380px;
  height: 520px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backface-visibility: hidden;
  transform: rotateY(180deg);
}

.chat-header {
  padding: 14px 18px;
  background: linear-gradient(135deg, #1e6fdb 0%, #409eff 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.chat-actions {
  display: flex;
  gap: 4px;
}

.chat-actions .el-button {
  color: #fff;
}

/* 消息列表 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: linear-gradient(180deg, #f8fbff 0%, #f0f7ff 100%);
}

.chat-message {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  align-items: flex-start;
  animation: messageSlideIn 0.3s ease;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message-user {
  flex-direction: row-reverse;
}

.chat-message-user .chat-bubble-content {
  background: linear-gradient(135deg, #1e6fdb 0%, #409eff 100%);
  color: #fff;
  border-radius: 14px 14px 2px 14px;
}

.chat-message-assistant .chat-bubble-content {
  background: #fff;
  color: #1f2937;
  border-radius: 14px 14px 14px 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chat-bubble-content {
  padding: 10px 14px;
  max-width: 260px;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.6;
}

/* 打字机光标 */
.typing-cursor {
  display: inline-block;
  color: #1e6fdb;
  font-weight: bold;
  animation: cursorBlink 0.8s infinite;
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 加载动画 */
.chat-loading {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
}

.chat-loading .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1e6fdb;
  animation: bounce 1.4s infinite ease-in-out;
}

.chat-loading .dot:nth-child(1) { animation-delay: 0s; }
.chat-loading .dot:nth-child(2) { animation-delay: 0.2s; }
.chat-loading .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* 输入区 */
.chat-input-area {
  padding: 12px 14px;
  background: #fff;
  border-top: 1px solid #eef2f7;
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.chat-input-area .el-textarea {
  flex: 1;
}

.chat-input-area .el-button {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .chat-widget {
    right: 12px;
    top: auto;
    bottom: 80px;
  }

  .chat-window {
    width: calc(100vw - 24px);
    height: 60vh;
    max-height: 500px;
  }

  .chat-bubble-content {
    max-width: calc(100vw - 120px);
  }
}
</style>
