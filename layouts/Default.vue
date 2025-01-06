<template>
  <q-layout view="hHh LpR lFf" class="overflow-auto">
    <q-header elevated>
      <q-toolbar
        :class="[
          'navContainer',
          toolbarClass,
          'flex',
          'justify-content-between'
        ]"
      >
        <q-img
          src='logoipsum-260.svg'
          style="max-height: 50px; max-width: 200px; z-index: 500; margin: 5px"
        />

        <q-btn flat to='/' @click="setSection('home')"> Home </q-btn>
        <q-btn flat to='/assets' @click="() => setSection('assets')"> Assets </q-btn>
        <q-btn flat to='/activity' @click="() => setSection('serverActivity')"> Server Activity </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      class='q-pa-lg'
      :width="220"
      v-model='drawerOpen'
      persistent
      side='left'
      elevated
      :style="{ background: toolbarClassLight }"
    >
      <q-expansion-item
        expand-separator
        label='Assets'
        header-class='text-primary'
        v-model='showAssets'
        @click="() => setSection('assets')"
        to='/assets'
        hide-expand-icon
      >
        <q-item>
          <q-btn
            flat
            color='primary'
            to='/assets/routines'
            @click="() => setSection('assets')"
          >
            Routines
          </q-btn>
        </q-item>
        <q-item>
          <q-btn
            flat
            color='primary'
            to='/assets/tasks'
            @click="() => setSection('assets')"
          >
            Tasks
          </q-btn>
        </q-item>
      </q-expansion-item>

      <q-expansion-item
        expand-separator
        label='Server Activity'
        header-class='text-warning'
        v-model='showServerActivity'
        @click="() => setSection('serverActivity')"
        to='/activity'
        hide-expand-icon
      >
        <q-item>
          <q-btn
            flat
            color='warning'
            to='/activity/routines'
            @click="() => setSection('serverActivity')"
          >
            Routines
          </q-btn>
        </q-item>
        <q-item>
          <q-btn
            flat
            color='warning'
            to='/activity/tasks'
            @click="() => setSection('serverActivity')"
          >
            Tasks
          </q-btn>
        </q-item>
      </q-expansion-item>
    </q-drawer>

    <q-page-container class="window-width window-height polka">
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from
'vue';
import { colors } from 'quasar';
import { useAppStore } from '~/stores/app';

// State
const showAssets = ref(false);
const showServerActivity = ref(false);
const drawerOpen = ref(true);
const appStore = useAppStore();
const { currentSection } = storeToRefs(appStore);

// Methods
const setSection = (section) => {
  appStore.setCurrentSection(section);
  showAssets.value = section === 'assets';
  showServerActivity.value = section === 'serverActivity';
};


// dynamic toolbar color
const toolbarClass = computed(() => {
  switch (currentSection.value) {
    case 'assets':
      return 'bg-primary';
    case 'serverActivity':
      return 'bg-warning';
    default:
      return 'bg-secondary';
  }
});

const toolbarClassLight = computed(() => {
  switch (currentSection.value) {
    case 'assets':
      return colors.changeAlpha(colors.getPaletteColor('primary'), 0.1);
    case 'serverActivity':
      return colors.changeAlpha(colors.getPaletteColor('warning'), 0.1);
    default:
      return colors.changeAlpha(colors.getPaletteColor('secondary'), 0.1);
  }
});

watch(currentSection, (newSection) => {
  setSection(newSection || 'home'); // Set 'home' if newSection is undefined
}, { immediate: true }); // immediate: true ensures the watcher is triggered on initial load

</script>

<style>
.polka {
  background-image: radial-gradient(rgb(168, 167, 167) 5%, transparent 5%);
  background-position: 4px 4px;
  background-size: 19px 19px;
  background-color: rgb(255, 255, 255);
  height: 110vh;
  width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
