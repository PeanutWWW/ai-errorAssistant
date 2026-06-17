<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let width = window.innerWidth
  let height = window.innerHeight

  canvas.width = width
  canvas.height = height

  const particleCount = Math.min(60, Math.floor(width * height / 15000))
  const particles = []

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1
    })
  }

  const animate = () => {
    ctx.clearRect(0, 0, width, height)

    particles.forEach(p => {
      p.x += p.dx
      p.y += p.dy

      if (p.x < 0 || p.x > width) p.dx *= -1
      if (p.y < 0 || p.y > height) p.dy *= -1

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(30, 111, 219, ${p.opacity})`
      ctx.fill()
    })

    // 连线
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 120) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(30, 111, 219, ${0.12 * (1 - dist / 120)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    animationId = requestAnimationFrame(animate)
  }

  animate()

  const handleResize = () => {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width
    canvas.height = height
  }

  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', handleResize)
  })
})
</script>

<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
