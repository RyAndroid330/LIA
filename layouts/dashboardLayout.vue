<template >
  <q-page-container
    class="q-pa-none"
    style="position: relative; height: 90vh; width: 88vw; padding-top: 10px !important; padding-left: 10px !important;"
  >
    <div class="polka" style="height: 90dvh; width: 88vw;">
      <div class="q-pa-none q-ma-xs-md" style="height: 100%; display: flex; flex-direction: column;">
        <div class="q-gutter-xs" style="display: flex; align-items: center; min-height: 30px; max-height: 20px;">
          <div class="q-gutter-xs flex-grow-1" style="overflow: auto;">
            <q-breadcrumbs separator="---" class="text-orange transparent-background q-pa-sm" active-color="primary">
              <q-breadcrumbs-el :to="'/'" icon="home" />
              <q-breadcrumbs-el
                v-for="(breadcrumb, index) in breadcrumbs"
                :key="index"
                :to="breadcrumb.to"
                :label="breadcrumb.label"
                :class="{ 'active-breadcrumb': index === breadcrumbs.length - 1 }"
              />
            </q-breadcrumbs>
          </div>
          <div class="q-gutter-xs q-pa-sm transparent-background" style="position: absolute; right: 0; top: 0;">
            Link
          </div>
        </div>
        <div class="q-pa-md" style="margin: 0 16px; font-size: 1.5rem;">
          <slot name="title" />
        </div>
        <div class="q-pa-md flex-grow-1" style="overflow: auto;">
          <slot />
        </div>
      </div>
    </div>
  </q-page-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const breadcrumbs = computed(() => {
  const pathArray = route.path.split('/').filter(segment => segment);

  return pathArray.map((segment, index) => {
    const cleanSegment = segment.replace('-sub', '');
    return {
      label: formatBreadcrumbLabel(cleanSegment),
      to: index === pathArray.length - 1 ? null : '/' + pathArray.slice(0, index + 1).join('/').replace('-sub', ''),
    };
  });
});

function formatBreadcrumbLabel(segment) {
  if (segment === 'assets') return 'Assets';
  if (segment === 'active') return 'Server Activity';
  if (segment === 'tasks') return 'Tasks';
  if (segment === 'routines') return 'Routines';
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
}
</script>

<style scoped>
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

.transparent-background {
  background-color: rgba(221, 240, 248, 0.781) !important;
  box-shadow: none !important;
  border-radius: 20px !important;
}
</style>
