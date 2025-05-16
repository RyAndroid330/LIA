<template>
  <InfoCard>
    <template v-slot:title>
      <slot name="title">{{ title }}</slot>
    </template>

    <template #info>
      <q-table
        class="my-sticky-last-column-table"
        style="max-height: 45dvh; width: 100%;"
        :title="title"
        :columns="formattedColumns"
        :rows="rows"
        :row-key="rowKey"
        flat
       virtual-scroll
      :virtual-scroll-item-size="53"
      :virtual-scroll-sticky-size-start="53"
      :pagination="pagination"
      :rows-per-page-options="[0]"
      @virtual-scroll="onScroll"
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
            <q-th auto-width class="text-right">Actions</q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" :class="{ 'text-red': props.row.referer?.trim().toLowerCase() === 'errored' }">
            <q-td auto-width>
              <q-btn size="sm" dense @click="props.expand = !props.expand" :icon="props.expand ? 'expand_more' : 'chevron_right'" />
            </q-td>

            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              <template v-if="col.name === 'status'">
                <q-icon
                  size="sm"
                  :name="props.row[col.name]"
                  :color="props.row[col.name] === 'check' ? 'green' : props.row[col.name] === 'play_arrow' ? 'blue' : props.row[col.name] === 'close' ? 'red' : 'orange'"
                />
              </template>
              <template v-else>
                {{ props.row[col.name] }}
              </template>
            </q-td>

            <q-td v-if="rowInspection" auto-width class="text-right sticky-actions">
              <q-btn
                v-if="props.row.isRunning"
                size="sm"
                color="red"
                round
                icon="stop"
                class="q-ma-xs"
                @click="showStopDialog = true"
              />
              <q-btn
                v-if="!hideGenerateContractButton"
                size="sm"
                color="secondary"
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
                icon="arrow_outward"
                class="q-ma-xs"
                @click="inspectRow(props.row)"
                @contextmenu.prevent="inspectRowInNewTab(props.row)"
              >
                <q-tooltip anchor="top middle" self="bottom middle">
                  Right click to open in new tab
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>

          <q-tr v-show="props.expand" :props="props">
            <q-td colspan="100%">
              <div class="text-left">ID: {{ props.row.uuid }}</div>
              <div class="text-left" v-if="props.row.description">Description: {{ props.row.description }}</div>
              <div class="text-left" v-if="props.row.concurrency !== undefined">Concurrency: {{ props.row.concurrency }}</div>
              <div class="text-left" v-if="props.row.referer">Referer: {{ props.row.referer }}</div>
              <div class="text-left" v-if="props.row.product">Product: {{ props.row.product }}</div>
              <div class="text-left">
                <span v-if="props.row.contract" class="text-secondary cursor-pointer" @click="navigateToItem(`/contracts/${props.row.contract}`)">Contract</span>
              </div>
              <div class="text-left">
                <span v-if="props.row.processingGraph" class="text-warning cursor-pointer" @click="navigateToItem(`/activity/${props.row.processingGraph}`)">{{ props.row.server }}</span>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <!-- Dialogs -->
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
import { ref, computed, nextTick, watch } from 'vue';
const router = useRouter();
const appStore = useAppStore();
const inspectButtonColor = computed(() => appStore.currentSection === 'assets' ? 'primary' : appStore.currentSection === 'serverActivity' ? 'warning' : 'secondary');

const props = defineProps({
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
  lastPage: {
    type: Number,
    required: true,
  },
});

const filter = ref(props.externalFilter);

// Define the pagination object
const pagination = ref({
  page: 1,
  rowsPerPage: 50,
});
const emit = defineEmits(['inspectRow', 'inspectRowInNewTab', 'load-more-data']);
function inspectRow(item: any) {
  emit('inspectRow', item);
}
function inspectRowInNewTab(item: any) {
  emit('inspectRowInNewTab', item);
}
const navigateToItem = (route: string) => {
  router.push(route);
};
const computedFilter = computed(() => filter.value || props.externalFilter);

const formattedColumns = computed(() => {
  if (!props.columns) {
    return undefined;
  }

  const columns = props.columns.slice();
  columns.unshift({
    name: 'expand',
    label: '',
    field: 'expand',
    required: true,
    sortable: false,
  });

  return columns;
});

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

// Dynamic loading and virtual scrolling logic
const allRows = ref(props.rows);
const loading = ref(false);
const rows = computed(() => props.rows);

function onScroll(details: { index: number; from: number; to: number; direction: "increase" | "decrease"; ref: any }) {
  const { to, ref } = details;
  const tableRef = ref as { refresh: () => void };
  const lastIndex = rows.value.length - 1;
  if (!loading.value && to >= lastIndex && props.rows.length > 0) {
    loading.value = true;
    setTimeout(() => {
      nextTick(() => {
        tableRef.refresh();
        loading.value = false;
        emit('load-more-data');
      });
    }, 500);
  }
}

watch(() => props.rows, (newRows) => {
  allRows.value = newRows;
});

watch(() => props.rows, (newRows) => {
  console.log('Rows updated:', newRows);
});
</script>
<style scoped>
.my-sticky-last-column-table {
  max-width: 100%;
}

.my-sticky-last-column-table thead tr:last-child th:last-child,
.my-sticky-last-column-table td:last-child {
  background-color: #404142;
}

.my-sticky-last-column-table th:last-child,
.my-sticky-last-column-table td:last-child,
.sticky-actions {
  position: sticky;
  right: 0;
  z-index: 1;
  background-color: #404142;
}
</style>
