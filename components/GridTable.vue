<template>
  <InfoCard>
    <template #info>
      <q-table
          style="width: 100%;"
          :title="title"
          :columns="columns"
          :rows="rows"
          :row-key="rowKey"
          grid
          grid-header
          hide-header
          flat bordered
          no-data-label="I didn't find anything for you"
          :filter="filter"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
      </q-table>
    </template>
  </InfoCard>
</template>

<script setup lang="ts">
defineProps( {
  title: {
    type: String,
    default: 'Info',
  },
  rows: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array as PropType<Array<{
      name: string;
      label: string;
      field: string | ((row: any) => any);
      required?: boolean;
      align?: "left" | "right" | "center";
      sortable?: boolean;
      sort?: (a: any, b: any, rowA: any, rowB: any) => number; format?: (val: any, row: any) => any;
      style?: string | ((row: any) => any); classes?: string | ((row: any) => any);
      headerStyle?: string;
      headerClasses?: string; }>>,
    default: () => [],
  },
  rowKey: {
    type: String,
    default: 'label',
  },
} );

const filter = ref( '' );

</script>
