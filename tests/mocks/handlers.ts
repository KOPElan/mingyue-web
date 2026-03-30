/**
 * MSW Mock Handlers
 * 用于测试环境模拟 mingyue-go API 响应
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:7070/api/v1'

export const handlers = [
  // Health Check
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({
      status: 'ok',
      version: '0.1.0',
    })
  }),

  // System Overview
  http.get(`${API_BASE}/system/overview`, () => {
    return HttpResponse.json({
      hostname: 'test-server',
      uptime: 86400,
      load: {
        load1: 0.5,
        load5: 0.6,
        load15: 0.7,
      },
      cpu: {
        cores: 4,
        usage: 25.5,
      },
      memory: {
        total: 8589934592,
        used: 4294967296,
        free: 4294967296,
        available: 4294967296,
        usagePercent: 50.0,
      },
      swap: {
        total: 2147483648,
        used: 0,
        free: 2147483648,
        usagePercent: 0.0,
      },
    })
  }),

  // Processes
  http.get(`${API_BASE}/processes`, () => {
    return HttpResponse.json({
      processes: [
        {
          pid: 1,
          name: 'systemd',
          user: 'root',
          state: 'S',
          cpuPercent: 0.1,
          memPercent: 0.5,
          vsz: 225916,
          rss: 9472,
          tty: '',
          startTime: '2024-01-01 00:00:00',
          cmdline: '/sbin/init',
        },
      ],
      total: 1,
    })
  }),

  http.delete(`${API_BASE}/processes/:pid`, () => {
    return HttpResponse.json({ success: true })
  }),

  // Disks
  http.get(`${API_BASE}/disks/devices`, () => {
    return HttpResponse.json({
      devices: [
        {
          name: 'sda',
          path: '/dev/sda',
          size: 500107862016,
          model: 'Samsung SSD 860',
          serial: 'S3Z9NB0K123456',
          type: 'ssd',
          removable: false,
        },
      ],
    })
  }),

  http.get(`${API_BASE}/disks/mounts`, () => {
    return HttpResponse.json({
      mounts: [
        {
          device: '/dev/sda1',
          mountpoint: '/',
          fstype: 'ext4',
          options: ['rw', 'relatime'],
          total: 500107862016,
          used: 250053931008,
          free: 250053931008,
          usagePercent: 50.0,
        },
      ],
    })
  }),
]
