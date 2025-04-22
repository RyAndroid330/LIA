<template>
  <div class="login-page polka-container" :class="polkaClass">
    <div class="welcome-message">
      <h1>Welcome to the Dashboard</h1>
    </div>
    <q-btn class="login-button" label="Login with Google" color="primary" @click="handleGoogleLogin" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useQuasar } from 'quasar';
const $q = useQuasar();

// dynamic polka class
const polkaClass = computed(() => {
  return $q.dark.isActive ? 'polka-dark' : 'polka-light';
});

function handleGoogleLogin() {
  // Redirect to the correct Google sign-in endpoint
  window.location.href = '/api/auth/signin/google';
}
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: var(--primary);
}

.welcome-message {
  text-align: center;
  margin-bottom: 20px;
}

.polka-light {
  background-image: radial-gradient(rgb(168, 167, 167) 5%, transparent 5%);
  background-position: 4px 4px;
  background-size: 19px 19px;
  background-color: rgb(255, 255, 255);
}
</style>
