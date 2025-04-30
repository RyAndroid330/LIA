<template>
  <div>
    <q-btn
      color="primary"
      no-caps
      @mouseover="onHover = true"
      @mouseleave="onHover = false"
      @click="signOut()"
    >
      <template v-if="!onHover">
        <q-avatar q-ma-md size="32px">
          <q-icon v-if="!data.user.image" name="person" />
          <img v-if="data.user.image" :src="data.user.image" alt="User Avatar"  />
        </q-avatar>
        <div class="q-ml-sm">
          {{ data.user.name || data.user.email }}
        </div>
      </template>
      <template v-else>
        Logout
        <q-icon name="logout" class="q-ml-xs" />
      </template>
    </q-btn>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAppStore } from '~/stores/app';

const { signOut } = useAuth()
const appStore = useAppStore();
const { data } = useAuth();
const onHover = ref(false);
const defaultUserIcon = '/public/default-user-icon.png'; // Path to default user icon
</script>
