<script setup>
import { ref, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Close, ArrowDown } from '@element-plus/icons-vue'
import axios from 'axios'

const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref([
  {
    role: 'assistant',
    content: '你好！我是你的AI数学辅导助手，有任何数学问题都可以随时问我~'
  }
])
const isLoading = ref(false)
const messagesContainer = ref(null)

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const closeChat = () => {
  isOpen.value = false
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => messages.value.length, scrollToBottom)

const sendMessage = async () => {
  const text = inputMessage.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({ role: 'user', content: text })
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
      messages.value.push({ role: 'assistant', content: data.data.reply })
    } else {
      ElMessage.error(data.message || 'AI响应失败')
      messages.value.push({
        role: 'assistant',
        content: '抱歉，我暂时无法回答这个问题，请稍后再试。'
      })
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '网络请求失败')
    messages.value.push({
      role: 'assistant',
      content: '抱歉，网络出了点问题，请检查网络后重试。'
    })
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
  <div class="chat-widget">
    <!-- 悬浮球 -->
    <div
      v-if="!isOpen"
      class="chat-bubble"
      @click="toggleChat"
    >
      <el-icon :size="28"><ChatDotRound /></el-icon>
      <span class="chat-bubble-text">AI辅导</span>
    </div>

    <!-- 对话窗口 -->
    <transition name="chat-fade">
      <div v-if="isOpen" class="chat-window">
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
              <div class="chat-text" v-html="msg.content.replace(/\n/g, '<br>')"></div>
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
    </transition>
  </div>
</template>

<style scoped>
.chat-widget {
  position: fixed;
  right: 20px;
  top: 30%;
  z-index: 1000;
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

/* 过渡动画 */
.chat-fade-enter-active,
.chat-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chat-fade-enter-from,
.chat-fade-leave-to {
  opacity: 0;
  transform: scale(0.85) translateY(20px);
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
