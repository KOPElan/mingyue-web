# mingyue-web

**明月 Web** - Linux 服务器管理 Web 界面

mingyue-web 是 [mingyue-go](https://github.com/KOPElan/mingyue-go) 的 Web 可视化管理界面，为 Linux 服务器提供友好的图形化管理体验。

## 功能特性

- 🖥️ **系统监控** - 实时查看 CPU、内存、运行时间等系统状态
- ⚙️ **进程管理** - 查看和管理运行中的进程
- 💾 **磁盘管理** - 磁盘设备查看、挂载点管理、SMART 健康监控
- 📁 **文件管理** - 浏览、查看、编辑服务器文件
- 🔗 **共享管理** - Samba 和 NFS 共享配置
- 🌐 **网络管理** - 网络接口配置（需管理员权限）
- 🔒 **ACL 管理** - POSIX ACL 权限管理
- 🔐 **多 Agent 支持** - 同时管理多台服务器
- 🎭 **角色权限** - 支持 viewer、operator、admin 三种角色

## 技术栈

- **前端框架**: Vue 3.5+ (Composition API)
- **构建工具**: Vite 6.x
- **UI 样式**: Tailwind CSS v4
- **状态管理**: Pinia 3.x
- **路由**: Vue Router 4
- **语言**: TypeScript 5.x (strict mode)
- **测试**: Vitest + Playwright
- **HTTP 客户端**: Axios

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm run test:unit
npm run test:e2e
```

## 许可证

[MIT License](LICENSE)
