<template>
<InfoCard>
  <template v-slot:title>
        <slot name="title">{{ title }}</slot>
      </template>
  <template #info>
    <q-table
        style="max-height: 45dvh; width: 100%;"
        :title="title"
        :columns="formattedColumns"
        :rows="rows"
        :row-key="rowKey"
        flat
        no-data-label="I didn't find anything for you"
        :filter="computedFilter"
        :rows-per-page-options="[ 20, 50, 100 ]"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props" >
          <q-th auto-width />
          <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
          >
            {{ col.label }}
          </q-th>
          <q-th auto-width class="text-right">Actions</q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
  <q-tr :props="props" :class="{'text-red': props.row.referer === 'Errored'}">
    <q-td auto-width>
      <q-btn size="sm"  dense @click="props.expand = !props.expand" :icon="props.expand ? 'expand_more' : 'chevron_right'" />
    </q-td>
    <q-td
        v-for="col in props.cols"
        :key="col.name"
        :props="props"
    >
      <template v-if="col.name === 'status'">
        <q-icon :name="props.row[col.name]" :color="props.row[col.name] === 'check' ? 'green' : props.row[col.name] === 'play_arrow' ? 'blue' : 'orange'" />
      </template>
      <template v-else>
        {{ col.value }}
      </template>
    </q-td>
    <q-td v-if="rowInspection" auto-width class="text-right">
      <q-btn
        v-if="props.row.isRunning"
        size="sm"
        :color="'red'"
        round
        icon="stop"
        class="q-ma-xs"
        @click="showStopDialog = true"
      />
      <q-btn
        v-if="!hideGenerateContractButton"
        size="sm"
        :color="'secondary'"
        round
        icon="refresh"
        class="q-ma-xs"
        @click="showGenerateDialog = true"
      >
        <q-tooltip anchor="top middle" self="bottom middle">
          Generate a contract from this point
        </q-tooltip>
      </q-btn>
      <q-btn
      size="sm"
      :color="inspectButtonColor"
      round
      @click="inspectRow(props.row)"
      icon="arrow_outward"
      class="q-ma-xs"
      @contextmenu.prevent="inspectRowInNewTab(props.row)">
        <q-tooltip anchor="top middle" self="bottom middle">
          Right click to open in new tab
        </q-tooltip>
      </q-btn>
    </q-td>
  </q-tr>
  <q-tr v-show="props.expand" :props="props">
    <q-td colspan="100%">
      <div class="text-left">ID: {{ props.row.uuid }}.</div>
      <div class="text-left">{{ props.row.description ? 'Description: ' + props.row.description : '' }}</div>
      <div class="text-left">
        {{ props.row.concurrency !== undefined && props.row.concurrency !== null ? 'Concurrency: ' + props.row.concurrency : '' }}
      </div>
      <div class="text-left">{{ props.row.referer ? 'Referer: ' + props.row.referer : '' }}</div>
      <div class="text-left">{{ props.row.product ? 'Product: ' + props.row.product : '' }}</div>
      <div class="text-left" @click="navigateToItem( `/contracts/${ props.row.contract }` )">
        <span class="text-secondary cursor-pointer">{{ props.row.contract ? 'Contract' : '' }}</span>
      </div>
      <div class="text-left" @click="navigateToItem( `/activity/${ props.row.processingGraph }` )">
        <span class="text-warning cursor-pointer">{{ props.row.processingGraph ? props.row.server : '' }}</span>
      </div>
    </q-td>
  </q-tr>
</template>
    </q-table>

    <!-- Stop Confirmation Dialog -->
    <q-dialog v-model="showStopDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Stop</div>
          <div>Are you sure you want to stop this process?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showStopDialog = false" />
          <q-btn flat label="Confirm" color="red" @click="confirmStop" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Generate Confirmation Dialog -->
    <q-dialog v-model="showGenerateDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Generate</div>
          <div>Are you sure you want to generate a contract?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showGenerateDialog = false" />
          <q-btn flat label="Confirm" color="secondary" @click="confirmGenerate" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </template>
</InfoCard>
</template>

<script setup lang="ts">
import { useRouter } from '#vue-router';

const router = useRouter();
const appStore = useAppStore();
const inspectButtonColor = computed(() => appStore.currentSection === 'assets' ? 'primary': appStore.currentSection === 'serverActivity' ? 'warning' : 'secondary');

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
    type: Array as PropType<Array<{ name: string; label: string; field: string | ((row: any) => any); required?: boolean; align?: "right" | "left" | "center"; sortable?: boolean; sort?: ((a: any, b: any, rowA: any, rowB: any) => number); headerClasses?: string }>>,
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
  externalFilter: {
    type: String,
    default: '',
  },
  hideGenerateContractButton: {
    type: Boolean,
    default: false,
  },
} );

const filter = ref( props.externalFilter );

const emit = defineEmits( [ 'inspectRow','inspectRowInNewTab' ] );
function inspectRow( item: any ) {
  emit( 'inspectRow', item );
}
function inspectRowInNewTab(item: any) {
  emit( 'inspectRowInNewTab', item );
}
const navigateToItem = ( route: string ) => {
  router.push(route);
};
const computedFilter = computed(() => filter.value || props.externalFilter);

const formattedColumns = computed( () => {
  if ( !props.columns ) {
    return undefined;
  }

  const columns = props.columns.slice();
  columns.unshift( {
    name: 'expand',
    label: '',
    field: 'expand',
    required: true,
    sortable: false,
  } );


  return columns;
} );

const showStopDialog = ref(false);
const showGenerateDialog = ref(false);

function confirmStop() {
  showStopDialog.value = false;
  // Add logic to handle stopping the process
}

function confirmGenerate() {
  showGenerateDialog.value = false;
  // Add logic to handle generating the contract
}

</script>
