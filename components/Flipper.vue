<template>
  <InfoCard style="background: linear-gradient(to top, rgba(128, 128, 128, 0.25), rgba(128, 128, 128, 0) 50%);">
    <template #info>
      <div>
        <div id="scroller" @swipeleft="scroll('next')" @swiperight="scroll('prev')" @wheel="handleWheel">
          <a v-for="(row, index) in rows" :key="index" class="item" :href="row.href">
            <q-card elevated bordered class="data-card">
              <q-card-section>
                <div class="text">
                  <h4>{{ row[columns[0].field] }}</h4>
                  <p v-for="column in columns.slice(1)" :key="column.name">{{ column.label }}: {{ row[column.field] }}</p>
                </div>
              </q-card-section>
            </q-card>
          </a>
        </div>
        <q-pagination
          v-model="currentPage"
          :max="rows.length"
          boundary-numbers
          @update:model-value="handlePageChange"
          class="pagination"
        />
      </div>
    </template>
  </InfoCard>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps } from 'vue';
import { QCard, QCardSection, QPagination } from 'quasar';

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  },
});

const itemPositions = ref([]);
const currentPage = ref(1);

function assignPositions() {
  const numberOfItems = props.rows.length;
  itemPositions.value = props.rows.map((_, i) =>
    i === 0 ? 'left-hidden' :
    i === 1 ? 'left' :
    i === 2 ? 'middle' :
    i === 3 ? 'right' : 'right-hidden'
  );
  applyClasses();
}

function scroll(direction) {
  if (direction === 'prev') {
    itemPositions.value.push(itemPositions.value.shift());
    currentPage.value = currentPage.value > 1 ? currentPage.value - 1 : props.rows.length;
  } else if (direction === 'next') {
    itemPositions.value.unshift(itemPositions.value.pop());
    currentPage.value = currentPage.value < props.rows.length ? currentPage.value + 1 : 1;
  }
  applyClasses();
}

function applyClasses() {
  document.querySelectorAll('#scroller .item').forEach((el, index) => {
    el.className = `item ${itemPositions.value[index]}`;
  });
}

function handleWheel(event) {
  event.preventDefault();
  if (event.deltaY < 0) {
    scroll('prev');
  } else {
    scroll('next');
  }
}

function preventScroll(event) {
  event.preventDefault();
}

function handlePageChange(page) {
  const direction = page > currentPage.value ? 'next' : 'prev';
  currentPage.value = page;
  scroll(direction);
}

onMounted(() => {
  assignPositions();
  const scroller = document.getElementById('scroller');
  scroller.addEventListener('wheel', preventScroll, { passive: false });
  scroller.addEventListener('touchmove', preventScroll, { passive: false });
});

onBeforeUnmount(() => {
  const scroller = document.getElementById('scroller');
  scroller.removeEventListener('wheel', preventScroll);
  scroller.removeEventListener('touchmove', preventScroll);
});
</script>

<style scoped>
#scroller {
  width: 75dvw;
  height: 55dvh;
  margin: 25px auto;
  perspective: 75dvw;
  overflow: hidden; /* Prevent default scrolling */
  position: relative; /* Make positioning relative to this element */

}

#scroller .item {
  width: 30dvw;
  height: 40dvh;
  display: block;
  position: absolute;
  border-radius: 10px;
  transition: all 0.4s ease-in-out;
  z-index: 0;
}

.data-card {
  width: 100%;
  height: 100%;
}

.left {
  transform: rotateY(25deg) translateX(-5dvw) skewY(-5deg) scale(0.4, 0.6);
}
.middle {
  z-index: 1;
  transform: rotateY(0deg) translateX(20dvw) skewY(0) scale(1);
}
.right {
  transform: rotateY(-25deg) translateX(45dvw) skewY(5deg) scale(0.4, 0.6);
}
.left-hidden, .right-hidden {
  opacity: 0;
  z-index: -1;
}

.pagination {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
