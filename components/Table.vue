<template>
<InfoCard>
  <template #info>
    <q-table
        style="max-height: 45dvh; width: 100%;"
        :title="title"
        :columns="columns"
        :rows="rows"
        :row-key="rowKey"
        flat
        virtual-scroll
        no-data-label="I didn't find anything for you"
        :filter="filter"
        :rows-per-page-options="[ 20, 50 ]"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
          >
            {{ col.label }}
          </q-th>
          <q-th auto-width />
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn size="sm" color="primary" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
          </q-td>
          <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
          >
            {{ col.value }}
          </q-td>
          <q-td v-if="rowInspection" auto-width>
            <q-btn size="sm" round @click="inspectRow(props.row)" icon="arrow_outward" />
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="text-left">ID: {{ props.row.uuid }}.</div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </template>
</InfoCard>
</template>

<script setup lang="ts">

const props = defineProps( {
  title: {
    type: String,
    default: undefined,
  },
  rows: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    default: undefined,
  },
  rowKey: {
    type: String,
    default: 'label',
  },
  rowInspection: {
    type: Boolean,
    default: true,
  },
} );

const filter = ref( '' );

const emit = defineEmits( [ 'inspectRow' ] );

function inspectRow( item ) {
  console.log( item );
  emit( 'inspectRow', item );
}

const formattedColumns = computed( () => {
  if ( !props.columns ) {
    return undefined;
  }

  const columns = props.columns.slice();
  columns.unshift( {
    name: 'expand',
    label: '',
    required: true,
    sortable: false,
  } );

  if ( props.rowInspection ) {
    columns.push( {
      name: 'inspect',
      label: 'Inspect',
      required: true,
      sortable: false,
    } );
  }

  return columns;
} );

</script>
