<template>
  <q-card class="custom-card q-ma-md">
    <div class="col flex-grow q-pa-md" style="min-width: 400px; max-width: 50dvw;">
      <div class="row text-h3">
        <slot name="title" />
      </div>
      <div class="row">
        <slot name="info" />
      </div>
    </div>
  </q-card>
</template>

<style>
.custom-card {
  border-radius: 20px !important;
}
</style>
