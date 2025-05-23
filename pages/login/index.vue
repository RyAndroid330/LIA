<template>
  <div class="login-page polka-container" :class="polkaClass">
    <div class="welcome-message">
      <h1>Welcome to the Dashboard</h1>
    </div>
    <GoogleLogin/>
    <form @submit.prevent="handleLogin" class="signup-form q-ma-sm flex-col justify-center items-center">
      <q-input
        v-model="signinUsername"
        label="Username"
        outlined
        required
        class="q-ma-sm"
      />
      <q-input
        v-model="signinPassword"
        label="Password"
        type="password"
        outlined
        required
        class="q-ma-sm"
      />
      <div class="flex justify-center items-center">
        <q-btn class="login-button q-ma-md" type="submit" label="Login" color="primary" />
      </div>
    </form>
    <q-btn class="login-button q-ma-md" label="Sign Up" color="primary" @click="showSignUpDialog = true" />
    <q-dialog v-model="showSignUpDialog">
      <q-card>
        <form @submit.prevent="handleSignUp" class="signup-form q-ma-sm flex-col justify-center items-center">
          <q-input v-model="signupUsername" label="Username" outlined required class="q-ma-sm" />
          <q-input v-model="signupEmail" label="Email" type="email" outlined required class="q-ma-sm" />
          <q-input v-model="signupPassword" label="Password" type="password" outlined required class="q-ma-sm" />
          <div class="flex justify-center items-center">
            <q-btn class="login-button q-ma-md" type="submit" label="Sign Up" color="primary" />
          </div>
        </form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAppStore } from "~/stores/app.js";
const $q = useQuasar();
const { signIn } = useAuth();

// dynamic polka class
const polkaClass = computed(() => {
  return $q.dark.isActive ? 'polka-dark' : 'polka-light';
});

const signinUsername = ref('');
const signinPassword = ref('');

const signupUsername = ref('');
const signupEmail = ref('');
const signupPassword = ref('');

const showSignUpDialog = ref(false);

onMounted(() => {
  const appStore = useAppStore();
  appStore.setCurrentSection('');
  appStore.setLoggedIn(false);
});

async function handleSignUp() {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: signupUsername.value,
        email: signupEmail.value,
        password: signupPassword.value,
      }),
    });


    const result = await response.json();
    if (result.success) {
      window.location.href = '/login';
    } else {
      alert(result.message);
    }
  } catch (error) {
    alert('An unexpected error occurred during sign-up. Please try again.');
  }
}

function handleLogin() {
  signIn('Credentials', { username: signinUsername, password: signinPassword, callbackUrl: '/' })
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
