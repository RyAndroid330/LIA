<template>
  <q-card elevated class='custom-card q-ma-md' style='min-width: 15dvw; max-width: 50dvw; max-height: 59dvh; overflow-y: auto'>
    <q-intersection transition="scale" class="example-item q-pa-md">
      <label class='text-md q-ma-xs' for='q-list'>{{ listLabel }}</label>
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
            <q-item-section avatar>
              <q-avatar :class="getAvatarColorClass(item.type)" text-color='white' class='text-caption'>
                {{ item.type[0].toUpperCase() }}
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <span class='text-caption'>{{ item.label }}</span>
              <q-linear-progress
                v-if="item.progress !== undefined"
                :value="item.progress / 100"
                color="primary"
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

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  listLabel: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    required: true
  }
});

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

<style>
.custom-card {
  border-radius: 20px !important;
}
</style>
