<template>
  <div>
    <q-btn
      color="primary"
      :label="data.user.name"
      no-caps
      @click="openDialog"
    >
    <q-avatar q-ma-md size="32px">
        <img :src="data.user.image" alt="User Avatar">
    </q-avatar></q-btn>

    <q-dialog v-model="dialog" :backdrop-filter="backdropFilter">
      <q-card>
            <div>
              <q-btn label="Cancel" type="cancel" color="primary" flat class="q-ml-sm" @click="onCancel" />
              <q-btn label="Sign Out" color="primary" @click="signOutUser" />
            </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAppStore } from '~/stores/app';


const appStore = useAppStore();
const { data } = useAuth()
const backdropFilter = ref('blur(2px) saturate(180%)');
const dialog = ref(false);

const signOutUser = async () => {
  try {
    const response = await fetch('/api/auth/signout', { method: 'POST' });
    if (response.ok) {
      console.log('Signed out successfully');
      dialog.value = false;
      window.location.href = '/api/auth/signout/google';
    } else {
      console.error('Failed to sign out');
    }
  } catch (error) {
    console.error('Error during sign out:', error);
  }
};

const onCancel = () => {
  dialog.value = false;
};

const openDialog = () => {
  dialog.value = true;
};
</script>
