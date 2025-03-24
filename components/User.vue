<template>
  <div>
    <q-btn
  color="primary"
  :label="status"
  icon="account_circle"
  no-caps
  @click="status === 'Logout' ? appStore.setLoggedIn(false) : openDialog()"
/>

    <q-dialog v-model="dialog" :backdrop-filter="backdropFilter">
      <q-card>
        <div class="q-pa-md" style="max-width: 400px">

        <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >
      <q-input
        filled
        v-model="userName"
        label="User Name *"
        hint="User Name"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
      />

      <q-input
        filled
        v-model="password"
        label="Password *"
        hint="Password"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
      />

      <q-toggle v-model="accept" label="I accept the license and terms" />

      <div>
        <q-btn label="Login" type="submit" color="primary"/>
        <q-btn label="Cancel" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAppStore } from '~/stores/app';

const appStore = useAppStore();

const userName = ref('');
const password = ref('');
const accept = ref(false);
const dialog = ref(false);
const backdropFilter = ref('blur(2px) saturate(180%)');
const status = ref('Login');

watch(() => appStore.isLoggedIn, (newStatus) => {
  if (newStatus) {
    status.value = 'Logout';
  } else {
    status.value = 'Login';
  }
});

const onSubmit = async () => {
  if (accept.value) {
    appStore.setUserName(userName.value);
    appStore.setPassword(password.value);
    appStore.setLoggedIn(true);
    dialog.value = false;
  }
};

const onReset = () => {
  userName.value = '';
  password.value = '';
  accept.value = false;
};

const openDialog = () => {
  dialog.value = true;
};
</script>
