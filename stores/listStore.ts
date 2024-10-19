import { defineStore } from 'pinia';

interface ListItem {
  type: string;
  label: string;
  progress?: number;
  startDate: Date;
  status: 'running' | 'complete' | 'in queue';
  processingServer: string;
  endDate: Date;
}

interface ServerInfo {
  name: string;
  ip: string;
  status: string;
  uptime: string;
  processor: number;
  ram: number;
  queueCapacity: number;
}

export const useListStore = defineStore('list', {
  state: () => ({
    items: [
      {
        type: 'routine',
        label: 'Render Image 1',
        progress: 50,
        startDate: '2024-03-10T09:00:00',
        status: 'running',
        processingServer: 'Server1',
        endDate: '2024-03-10T09:03:00'
      },
      {
        type: 'task',
        label: 'Compress Files 1',
        progress: 80,
        startDate: '2024-03-10T10:30:00',
        status: 'running',
        processingServer: 'Server2',
        endDate: '2024-03-10T10:35:00'
      },
      {
        type: 'task',
        label: 'Convert File Type 1',
        progress: 30,
        startDate: '2024-03-10T11:15:00',
        status: 'running',
        processingServer: 'Server3',
        endDate: '2024-03-10T11:18:00'
      },
      {
        type: 'routine',
        label: 'Generate 3D Model 1',
        progress: 60,
        startDate: '2024-03-10T13:00:00',
        status: 'running',
        processingServer: 'Server4',
        endDate: '2024-03-10T13:03:00'
      },
      {
        type: 'routine',
        label: 'Process Data 1',
        progress: 40,
        startDate: '2024-03-10T14:30:00',
        status: 'running',
        processingServer: 'Server1',
        endDate: '2024-03-10T14:32:00'
      },
      {
        type: 'task',
        label: 'Backup Database 1',
        progress: 70,
        startDate: '2024-03-10T15:45:00',
        status: 'running',
        processingServer: 'Server2',
        endDate: '2024-03-10T15:49:00'
      },
      {
        type: 'task',
        label: 'Optimize Code 1',
        progress: 20,
        startDate: '2024-03-10T16:30:00',
        status: 'running',
        processingServer: 'Server3',
        endDate: '2024-03-10T16:34:00'
      },
      {
        type: 'routine',
        label: 'Run Tests 1',
        progress: 90,
        startDate: '2024-03-10T17:15:00',
        status: 'running',
        processingServer: 'Server4',
        endDate: '2024-03-10T17:18:00'
      },
      {
        type: 'task',
        label: 'Deploy Application 1',
        progress: 10,
        startDate: '2024-03-10T18:00:00',
        status: 'running',
        processingServer: 'Server1',
        endDate: '2024-03-10T18:02:00'
      },
      {
        type: 'routine',
        label: 'Update Dependencies 1',
        progress: 5,
        startDate: '2024-03-10T19:30:00',
        status: 'running',
        processingServer: 'Server2',
        endDate: '2024-03-10T19:32:00'
      },
      {
        type: 'routine',
        label: 'Render Image 2',
        progress: 50,
        startDate: '2024-03-11T09:00:00',
        status: 'running',
        processingServer: 'Server1',
        endDate: '2024-03-11T09:03:00'
      },
      {
        type: 'task',
        label: 'Compress Files 2',
        progress: 80,
        startDate: '2024-03-11T10:30:00',
        status: 'running',
        processingServer: 'Server2',
        endDate: '2024-03-11T10:35:00'
      },
      {
        type: 'task',
        label: 'Convert File Type 2',
        progress: 30,
        startDate: '2024-03-11T11:15:00',
        status: 'running',
        processingServer: 'Server3',
        endDate: '2024-03-11T11:19:00'
      },
      {
        type: 'routine',
        label: 'Generate 3D Model 2',
        progress: 60,
        startDate: '2024-03-11T13:00:00',
        status: 'running',
        processingServer: 'Server4',
        endDate: '2024-03-11T13:04:00'
      },
      {
        type: 'routine',
        label: 'Process Data 2',
        progress: 40,
        startDate: '2024-03-11T14:30:00',
        status: 'running',
        processingServer: 'Server1',
        endDate: '2024-03-11T14:32:00'
      },
      {
        type: 'task',
        label: 'Backup Database 2',
        progress: 70,
        startDate: '2024-03-11T15:45:00',
        status: 'running',
        processingServer: 'Server2',
        endDate: '2024-03-11T15:48:00'
      },
      {
        type: 'task',
        label: 'Optimize Code 2',
        progress: 20,
        startDate: '2024-03-11T16:30:00',
        status: 'running',
        processingServer: 'Server3',
        endDate: '2024-03-11T16:34:00'
      },
      {
        type: 'routine',
        label: 'Run Tests 2',
        progress: 90,
        startDate: '2024-03-11T17:15:00',
        status: 'running',
        processingServer: 'Server4',
        endDate: '2024-03-11T17:19:00'
      },
      {
        type: 'task',
        label: 'Deploy Application 2',
        progress: 10,
        startDate: '2024-03-11T18:00:00',
        status: 'running',
        processingServer: 'Server1',
        endDate: '2024-03-11T18:03:00'
      },
      {
        type: 'routine',
        label: 'Update Dependencies 2',
        progress: 5,
        startDate: '2024-03-11T19:30:00',
        status: 'running',
        processingServer: 'Server2',
        endDate: '2024-03-11T19:34:00'
      }
    ] as unknown as ListItem[],
    servers: [
      {
        name: 'Server1',
        ip: '192.168.0.1',
        status: 'Running',
        uptime: '72 hours',
        processor: 67,
        ram: 78,
        queueCapacity: 52
      },
      {
        name: 'Server2',
        ip: '192.168.0.2',
        status: 'Idle',
        uptime: '48 hours',
        processor: 23,
        ram: 45,
        queueCapacity: 10
      },
      {
        name: 'Server3',
        ip: '192.168.0.3',
        status: 'Running',
        uptime: '72 hours',
        processor: 62,
        ram: 72,
        queueCapacity: 72
      },
      {
        name: 'Server4',
        ip: '192.168.0.4',
        status: 'Idle',
        uptime: '48 hours',
        processor: 43,
        ram: 75,
        queueCapacity: 40
      }
    ] as ServerInfo[]
  }),
  getters: {
    getItems: (state) => state.items,
    getServers: (state) => state.servers,
    getServerNames: (state) => state.servers.map((server) => server.name)
  }
});
