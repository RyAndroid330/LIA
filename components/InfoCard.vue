<template>
  <q-card class="custom-card q-mb-md overflow-auto">
    <div class="col flex-grow q-pa-md">
      <div class="row text-h5">
        <slot name="title" />
      </div>
      <div class="row">
        <slot name="info" />
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">

</script>

<style>
.custom-card {
  border-radius: 20px !important;
  min-width: 39dvw;
  max-width: 100dvw;
  max-height: 48dvh;
}
</style>
