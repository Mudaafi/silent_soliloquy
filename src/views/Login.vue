<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

var authStore = useAuthStore()
let router = useRouter()

function uponVerificationCallback() {
  if (authStore.isAuth == true) router.push({ name: 'dashboard' })
}

function resetAuth() {
  authStore.$reset
}

onMounted(async () => {
  await authStore.createSeshId()
  await authStore.awaitVerification(uponVerificationCallback)
})
</script>

<template>
  <div class="container" :class="{ hide: authStore.isAccessed }">
    <router-link
      :to="{ name: 'login-redirect', params: { seshId: authStore.seshId } }"
      target="_blank"
      :seshId="authStore.seshId"
    >
      <div>
        <img
          alt="Vue logo"
          class="logo"
          src="@/assets/logo.svg"
          width="125"
          height="125"
        />
      </div>
      <h1 class="green">Log in via Telegram Bot</h1>
    </router-link>
    <div class="instructions">
      <h2>1) Scan/click the QR Code</h2>
      <h2>2) Press the <code>/start</code> button in the bot</h2>
      <h2>3) Check if the code matches!</h2>
    </div>
    <h3>Session ID: {{ authStore.seshId }}</h3>
  </div>
  <div class="container" :class="{ hide: !authStore.isAccessed }">
    <h1 class="green">{{ authStore.seshVerificationKey }}</h1>
    <div class="instructions">
      <h2>Does the above code match the one on Telegram?</h2>
      <h2>If yes, tap confirm on Telegram</h2>
      <h2>If not, click <a @click="resetAuth">Here</a> to restart</h2>
    </div>
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
.hide {
  display: none;
}
h1 {
  font-weight: 500;
  font-size: 2.5rem;
}
.instructions {
  margin: 0 auto;
}
h2 {
  font-size: 1.2rem;
  margin-bottom: 4px;
  text-align: left;
}
.underlined {
  text-decoration: underline;
}
</style>
