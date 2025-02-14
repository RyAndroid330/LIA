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
          src='/logoipsum-260.svg'
          style="max-height: 50px; max-width: 200px; z-index: 500; margin: 5px"
        />

        <q-btn flat to='/' @click="setSection('home')"> Home </q-btn>
        <q-btn flat to='/contracts' @click="() => setSection('contracts')"> Contracts </q-btn>
        <q-btn flat to='/assets' @click="() => setSection('assets')"> Assets </q-btn>
        <q-btn flat to='/activity' @click="() => setSection('serverActivity')"> Server Activity </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      class='q-pa-lg'
      :width="220"
      v-model='drawerOpen'
      :mini="miniState"
      :mini-to-overlay="false"
      behavior="default"
      :breakpoint="0"
      side='left'
      elevated
      :style="{ background: toolbarClassLight }"
    >

    <div class="q-mini-drawer-show absolute" style="top: 50%; transform: translateY(-50%); right: 0">
          <q-btn
            dense
            square
            unelevated
            color="grey-6"
            :icon="miniState ? 'chevron_right' : 'chevron_left'"
            @click="toggleDrawer"
          />
        </div>

    <q-expansion-item
        expand-separator
        label='Contracts'
        header-class='text-secondary'
        v-model='showContracts'
        to='/contracts'
        hide-expand-icon
        round dense icon="menu"
      >
        <q-item>
          <q-btn
            flat
            color='secondary'
            to='/contracts/agents'
            @click="() => setSection('contracts', true)"
          >
            Agents
          </q-btn>
        </q-item>
      </q-expansion-item>
      <q-expansion-item
        expand-separator
        label='Assets'
        header-class='text-primary'
        v-model='showAssets'
        to='/assets'
        hide-expand-icon
        round dense icon="menu"
      >
        <q-item>
          <q-btn
            flat
            color='primary'
            to='/assets/routines'
            @click="() => setSection('assets', true)"
          >
            Routines
          </q-btn>
        </q-item>
        <q-item>
          <q-btn
            flat
            color='primary'
            to='/assets/tasks'
            @click="() => setSection('assets', true)"
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
        to='/activity'
        hide-expand-icon
        round dense icon="menu"
      >
        <q-item>
          <q-btn
            flat
            color='warning'
            to='/activity/routines'
            @click="() => setSection('serverActivity', true)"
          >
            Routines
          </q-btn>
        </q-item>
        <q-item>
          <q-btn
            flat
            color='warning'
            to='/activity/tasks'
            @click="() => setSection('serverActivity', true)"
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { colors } from 'quasar';
import { useAppStore } from '~/stores/app';

// State
const showContracts = ref(false);
const showAssets = ref(false);
const showServerActivity = ref(false);
const drawerOpen = ref(true);
const miniState = ref(false);
const appStore = useAppStore();
const { currentSection } = storeToRefs(appStore);

// Methods
const setSection = (section, disableMini = false) => {
  appStore.setCurrentSection(section);
  showContracts.value = section === 'contracts';
  showAssets.value = section === 'assets';
  showServerActivity.value = section === 'serverActivity';
  if (disableMini) {
    miniState.value = false;
  }
};

const toggleDrawer = () => {
  miniState.value = !miniState.value;
};

const handleResize = () => {
  if (window.innerWidth < 1024) {
    miniState.value = true;
  } else {
    miniState.value = false;
  }
};

// dynamic toolbar color
const toolbarClass = computed(() => {
  switch (currentSection.value) {
    case 'assets':
      return 'bg-primary';
    case 'serverActivity':
      return 'bg-warning';
      case 'contracts':
      return 'bg-secondary';
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
      case 'contracts':
      return colors.changeAlpha(colors.getPaletteColor('secondary'), 0.1);
    default:
      return colors.changeAlpha(colors.getPaletteColor('secondary'), 0.1);
  }
});

watch(currentSection, (newSection) => {
  setSection(newSection || 'home'); // Set 'home' if newSection is undefined
}, { immediate: true }); // immediate: true ensures the watcher is triggered on initial load

onMounted(() => {
  window.addEventListener('resize', handleResize);
  handleResize(); // Initial check
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

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
