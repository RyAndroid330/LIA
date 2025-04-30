<script setup lang="ts">
const { signIn } = useAuth()
</script>

<template>
  <q-btn
    class="login-button q-ma-md"
    color="primary"
    @click="signIn('google',{
      callbackUrl: '/',
    })"
  >
    Login with Google
  </q-btn>
</template>
