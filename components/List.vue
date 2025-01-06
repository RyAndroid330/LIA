<template>
  <q-card elevated class='list-card q-mr-md q-mb-md'>
    <q-intersection transition="scale" class="q-pa-md">
      <div class="q-ma-sm">
        <label class='text-h5' for='q-list'>{{ listLabel }}</label>
      </div>
      <div class="flex-inline q-mx-md">
        <label v-for="colum in columns" :key="colum" class="list-column q-mr-lg">{{ colum }}</label>
      </div>
      <div class="q-separator" style="height: 2px"></div>
      <q-virtual-scroll
        :items="items"
        :item-size="60"
        virtual-scroll-item-key="label"
        style="height: 100%;"
      >
        <template v-slot="{ item, index }">
          <q-item
            :key="index"
            clickable
            v-ripple
            @click="$emit('item-selected', item)"
          >
            <q-item-section>
              <div class="flex-inline">
                <span class='q-mr-lg'>{{ item.label }}</span>
                <span class='text-caption q-mr-lg'>{{ formatDate( item.started ) }}</span>
              </div>
              <q-linear-progress
                v-if="item.progress !== undefined"
                :value="parseFloat( item.progress )"
                :color="getProgressBarColor( item.progress, item.errored )"
                track-color="grey-5"
                class="q-ma-xs"
              >
                <span>{{ item.progress }}%</span>
              </q-linear-progress>
            </q-item-section>
          </q-item>
        </template>
      </q-virtual-scroll>
    </q-intersection>
  </q-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
  listLabel: {
    type: String,
    required: true
  },
  columns: {
    type: Array,
    default: () => [ 'Name', 'Date' ],
  },
  items: {
    type: Array,
    required: true
  }
});

function formatDate( date: string ) {
  const datetime = new Date( date );
  return `${ datetime.toDateString() } ${ datetime.toLocaleTimeString() }`;
}

function getProgressBarColor( progress: number, error: boolean = false ) {
  if ( error ) {
    return 'red';
  }
  return progress < 1.0 ? 'blue' : 'green';
}

const getAvatarColorClass = (type) => {
  switch (type.toLowerCase()) {
    case 'routine':
      return 'bg-warning';
    case 'task':
      return 'bg-primary';
    case 'server':
      return 'bg-secondary';
    default:
      return 'bg-grey';
  }
};
</script>

<style scoped>
.list-card {
  border-radius: 20px !important;
  min-width: 39dvw;
  max-width: 70dvw;
  max-height: 50dvh;
  overflow-y: auto;
}
</style>
