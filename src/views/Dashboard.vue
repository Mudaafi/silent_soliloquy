<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
function autoLogout() {
  if (!authStore.isAuth) router.push({ name: 'login' })
}
onMounted(() => authStore.awaitVerification(autoLogout))
</script>

<template>
  <h1 class="green">Welcome Friend</h1>
</template>

<style scoped>
h1 {
  font-size: 3rem;
  font-weight: 500;
  font-style: italic;
}
</style>
