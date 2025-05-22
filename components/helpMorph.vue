<template>
  <div class="q-pa-md relative-position" style="height: 280px; max-height: 80vh">
    <q-btn
      v-morph:btn:mygroup:300.resize="morphGroupModel"
      class="q-mt-md q-mb-md q-mr-md fixed-bottom-right"
      fab
      icon="help_outline"
      size="md"
      color="grey-8"
      text-color="white"
      @click="nextMorph"
    />

    <q-card
      v-if="morphGroupModel === 'card1'"
      v-morph:card1:mygroup:500.resize="morphGroupModel"
      class="fixed-bottom-right q-ma-md bg-grey-8 text-white"
      style="width: 300px; border-bottom-left-radius: 2em"
    >
      <q-card-section class="text-h6">
        {{ currentTip.title }}
      </q-card-section>

      <q-card-section class="text-subtitle1">
        <div v-if="Array.isArray(currentTip.body) || currentTip.list">
          <template v-if="Array.isArray(currentTip.body)">
            <template v-for="(part, idx) in currentTip.body" :key="'body-' + idx">
              <q-icon v-if="part.icon" :name="part.icon" :color="part.color" :size="part.size || 'sm'" class="q-ma-xs" />
              <q-btn v-else-if="part.btn" round :size="part.size || 'sm'" :icon="part.icon" :color="part.color" class="q-ma-xs" />
              <span v-else-if="part.text" v-html="part.text"></span>
              <span v-else>{{ part }}</span>
            </template>
          </template>
          <ul v-if="currentTip.list" style="margin: 0 0 0 1em; padding: 0;">
            <li v-for="(item, idx) in currentTip.list" :key="'list-' + idx" style="list-style: none; margin-bottom: 0.25em; display: flex; align-items: center;">
              <q-icon v-if="item.icon" :name="item.icon" :color="item.color" :size="item.size || 'sm'" class="q-ma-xs" />
              <q-btn v-else-if="item.btn" round :size="item.size || 'sm'" :icon="item.icon" :color="item.color" class="q-ma-xs" />
              <span v-if="item.text" v-html="item.text" style="margin-left: 0.25em;"></span>
            </li>
          </ul>
        </div>
        <span v-else v-html="currentTip.body"></span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" @click="nextMorph" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const nextMorphStep = {
  btn: 'card1',
  card1: 'btn'
}

// Define tips for each route or page
const tipsByRoute = {
  '/': {
    title: 'Welcome!',
    body: 'This is the dashboard home. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help UI page</a>.'
  },
  '/login': {
    title: 'Login',
    body: 'Sign in to access your dashboard. If you need help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.'
  },
  '/activity': {
    title: 'Server Activity',
    body: [
      'Monitor all server activity here. For more help, visit the ',
      { text: '<a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.' }
    ],
    list: [
      { icon: 'check', color: 'green', text: '- Complete' },
      { icon: 'play_arrow', color: 'blue', text: '- Running' },
      { icon: 'schedule', color: 'warning', text: '- Scheduled' },
      { icon: 'close', color: 'red', text: '- Failed' },
      { btn: true, icon: 'stop', color: 'red', text: '- Stop' },
      { btn: true, icon: 'refresh', color: 'secondary', text: '- Generate a contract' },
      { btn: true, icon: 'arrow_outward', color: 'orange', text: '- Inspect item' },
    ]
  },
  '/activity/tasks': {
    title: 'Task Executions',
    body: 'View and manage all task executions. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.',
    list: [
      { icon: 'check', color: 'green', text: '- Complete' },
      { icon: 'play_arrow', color: 'blue', text: '- Running' },
      { icon: 'schedule', color: 'warning', text: '- Scheduled' },
      { icon: 'close', color: 'red', text: '- Failed' },
      { btn: true, icon: 'stop', color: 'red', text: '- Stop' },
      { btn: true, icon: 'refresh', color: 'secondary', text: '- Generate a contract' },
      { btn: true, icon: 'arrow_outward', color: 'orange', text: '- Inspect item' }
    ]
  },
  '/activity/routines': {
    title: 'Routine Executions',
    body: 'View and manage all routine executions. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.',
    list: [
      { icon: 'check', color: 'green', text: '- Complete' },
      { icon: 'play_arrow', color: 'blue', text: '- Running' },
      { icon: 'schedule', color: 'warning', text: '- Scheduled' },
      { icon: 'close', color: 'red', text: '- Failed' },
      { btn: true, icon: 'stop', color: 'red', text: '- Stop' },
      { btn: true, icon: 'refresh', color: 'secondary', text: '- Generate a contract' },
      { btn: true, icon: 'arrow_outward', color: 'orange', text: '- Inspect item' }
    ]
  },
  '/activity/servers': {
    title: 'Servers',
    body: 'Inspect server details and status. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.'
  },
  '/assets': {
    title: 'Assets',
    body: 'Manage your static assets here. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.',
    list: [
      { icon: 'check', color: 'green', text: '- Complete' },
      { icon: 'play_arrow', color: 'blue', text: '- Running' },
      { icon: 'schedule', color: 'warning', text: '- Scheduled' },
      { icon: 'close', color: 'red', text: '- Failed' },
      { btn: true, icon: 'stop', color: 'red', text: '- Stop' },
      { btn: true, icon: 'refresh', color: 'secondary', text: '- Generate a contract' },
      { btn: true, icon: 'arrow_outward', color: 'orange', text: '- Inspect item' }
    ]
  },
  '/assets/tasks': {
    title: 'Static Tasks',
    body: 'Browse and manage static tasks. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.',
    list: [
      { icon: 'check', color: 'green', text: '- Complete' },
      { icon: 'play_arrow', color: 'blue', text: '- Running' },
      { icon: 'schedule', color: 'warning', text: '- Scheduled' },
      { icon: 'close', color: 'red', text: '- Failed' },
      { btn: true, icon: 'stop', color: 'red', text: '- Stop' },
      { btn: true, icon: 'refresh', color: 'secondary', text: '- Generate a contract' },
      { btn: true, icon: 'arrow_outward', color: 'orange', text: '- Inspect item' }
    ]
  },
  '/assets/routines': {
    title: 'Static Routines',
    body: 'Browse and manage static routines. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.',
    list: [
      { icon: 'check', color: 'green', text: '- Complete' },
      { icon: 'play_arrow', color: 'blue', text: '- Running' },
      { icon: 'schedule', color: 'warning', text: '- Scheduled' },
      { icon: 'close', color: 'red', text: '- Failed' },
      { btn: true, icon: 'stop', color: 'red', text: '- Stop' },
      { btn: true, icon: 'refresh', color: 'secondary', text: '- Generate a contract' },
      { btn: true, icon: 'arrow_outward', color: 'orange', text: '- Inspect item' }
    ]
  },
  '/agents': {
    title: 'Agents',
    body: 'View and manage your agents. For more help, visit the <a href="/help/faq" class="text-primary" style="text-decoration: underline;">FAQ</a>.',
    list: [
      { icon: 'check', color: 'green', text: '- Complete' },
      { icon: 'play_arrow', color: 'blue', text: '- Running' },
      { icon: 'schedule', color: 'warning', text: '- Scheduled' },
      { icon: 'close', color: 'red', text: '- Failed' },
      { btn: true, icon: 'stop', color: 'red', text: '- Stop' },
      { btn: true, icon: 'refresh', color: 'secondary', text: '- Generate a contract' },
      { btn: true, icon: 'arrow_outward', color: 'orange', text: '- Inspect item' }
    ]
  },
  '/agents/contracts': {
    title: 'Agent Contracts',
    body: 'View contracts for your agents. For more help, visit the <a href="/help/faq" class="text-primary" style="text-decoration: underline;">FAQ</a>.',
    list: [
      { icon: 'check', color: 'green', text: '- Complete' },
      { icon: 'play_arrow', color: 'blue', text: '- Running' },
      { icon: 'schedule', color: 'warning', text: '- Scheduled' },
      { icon: 'close', color: 'red', text: '- Failed' },
      { btn: true, icon: 'stop', color: 'red', text: '- Stop' },
      { btn: true, icon: 'refresh', color: 'secondary', text: '- Generate a contract' },
      { btn: true, icon: 'arrow_outward', color: 'orange', text: '- Inspect item' }
    ]
  },
  '/help': {
    title: 'Help',
    body: 'Find documentation, guides, and more. See also <a href="/help/faq" class="text-primary" style="text-decoration: underline;">FAQ</a> and <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Terminology</a>.'
  },
  '/help/faq': {
    title: 'FAQ',
    body: 'Frequently asked questions about the dashboard.'
  },
  '/help/terms': {
    title: 'Terminology',
    body: 'Learn about the terms used in this dashboard.'
  },
  '/help/tutorials': {
    title: 'Tutorials',
    body: 'Step-by-step guides to help you get started.'
  },
  '/help/examples': {
    title: 'Examples',
    body: 'See practical examples of how to use the dashboard.'
  },
  '/help/processingGraph': {
    title: 'Processing Graph Guide',
    body: 'Learn about processing graphs and their chapters.'
  },
  '/help/processingGraph/chapter1': {
    title: 'Processing Graph - Chapter 1',
    body: 'Introduction to processing graphs.'
  },
  '/help/processingGraph/chapter2': {
    title: 'Processing Graph - Chapter 2',
    body: 'Advanced processing graph concepts.'
  },
  '/help/processingGraph/chapter3': {
    title: 'Processing Graph - Chapter 3',
    body: 'Agent integration in processing graphs.'
  },
  '/help/processingGraph/chapter4': {
    title: 'Processing Graph - Chapter 4',
    body: 'More advanced topics in processing graphs.'
  },
  '/help/processingGraph/chapter5': {
    title: 'Processing Graph - Chapter 5',
    body: 'Final chapter on processing graphs.'
  },
  '/activity/tasks/[id]': {
    title: 'Task Execution Details',
    body: 'Detailed information about a specific task execution. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.'
  },
  '/activity/routines/[id]': {
    title: 'Routine Execution Details',
    body: 'Detailed information about a specific routine execution. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.'
  },
  '/activity/servers/[id]': {
    title: 'Server Details',
    body: 'Detailed information about a specific server. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.'
  },
  '/assets/[id]': {
    title: 'Asset Details',
    body: 'Detailed information about a specific asset. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.'
  },
  '/assets/tasks/[id]': {
    title: 'Static Task Details',
    body: 'Detailed information about a static task. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.'
  },
  '/assets/routines/[id]': {
    title: 'Static Routine Details',
    body: 'Detailed information about a static routine. For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help page</a>.'
  },
  '/agents/[id]': {
    title: 'Agent Details',
    body: 'Detailed information about a specific agent. For more help, visit the <a href="/help/faq" class="text-primary" style="text-decoration: underline;">FAQ</a>.'
  },
  '/agents/contracts/[id]': {
    title: 'Agent Contract Details',
    body: 'Detailed information about a specific agent contract. For more help, visit the <a href="/help/faq" class="text-primary" style="text-decoration: underline;">FAQ</a>.'
  },
}

export default {
  setup () {
    const morphGroupModel = ref('btn')
    const route = useRoute()

    // Find the best matching tip for the current route
    const currentTip = computed(() => {
      // Try exact match first
      if (tipsByRoute[route.path]) return tipsByRoute[route.path]
      // Try dynamic [id] match
      for (const key in tipsByRoute) {
        if (key.includes('[id]')) {
          const pattern = new RegExp('^' + key.replace('[id]', '[^/]+') + '$')
          if (pattern.test(route.path)) return tipsByRoute[key]
        }
      }
      const base = '/' + route.path.split('/')[1]
      if (tipsByRoute[base]) return tipsByRoute[base]
      // Default fallback
      return {
        title: 'No tips for this page',
        body: 'For more help, visit the <a href="/help/terms" class="text-primary" style="text-decoration: underline;">Help UI page</a>.'
      }
    })

    return {
      morphGroupModel,
      nextMorph () {
        morphGroupModel.value = nextMorphStep[ morphGroupModel.value ]
      },
      currentTip
    }
  }
}
</script>
