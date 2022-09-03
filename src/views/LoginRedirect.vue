<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
const store = useAuthStore()
const props = defineProps(['seshId'])
onMounted(async () => {
  await store.markAccessed()
  setTimeout(() => {
    window.location.href = `https://t.me/silent_soliloquy_bot?start=${props.seshId}`
  }, 2000)
})
</script>

<template>
  <div class="container">
    <div>
      <img
        alt="Vue logo"
        class="logo"
        src="@/assets/logo.svg"
        width="125"
        height="125"
      />
    </div>
    <h1 class="green">Redirecting you to Telegram...</h1>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  text-align: center;
  row-gap: 20px;
}
h1 {
  font-weight: 500;
  font-size: 2.6rem;
}
</style>
