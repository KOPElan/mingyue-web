# mingyue-web 工作区指令

## 项目概述

本项目是 [mingyue-go](https://github.com/KOPElan/mingyue-go) 的 Web 可视化管理界面。mingyue-go 是一个运行在 Linux 宿主机上的系统操作代理，以 HTTP+JSON RESTful API 提供系统监控、进程管理、磁盘管理、文件管理、共享管理（Samba/NFS）、网络管理、ACL 管理等能力。

本 Web UI 的职责：通过调用 mingyue-go 提供的 REST API，为用户提供可视化界面，简化宿主机管理操作。

## 语言约定

- **首选语言：简体中文** — 本仓库文档、开发说明与与本项目相关的 AI 聊天回复首选使用中文（简体）。
- **英文使用**：如果确实需要使用英文，请同时添加中文注释。


## 后端 API 约定（必读）

> 完整 API 文档：[mingyue-go docs/web-integration.md](https://github.com/KOPElan/mingyue-go/blob/main/docs/web-integration.md)
> OpenAPI 规范：[docs/api/openapi.yaml](https://github.com/KOPElan/mingyue-go/blob/main/docs/api/openapi.yaml)

### 基础信息

| 项目 | 值 |
|------|-----|
| Base URL | `http://<agent-host>:7070` |
| 路径前缀 | `/api/v1` |
| Content-Type | `application/json` |
| 认证方式 | `Authorization: Bearer <api-key>` |

### 认证与角色

所有 API（除 `/health`、`/version` 外）均需 Bearer Token：

- `viewer`：只读操作（监控、列表、查询）
- `operator`：读写操作（文件写/删、共享 CRUD、ACL 设置），排除网络变更
- `admin`：全部操作（含网络接口 up/down/dhcp）

缺少 Token → `401`，权限不足 → `403`。

### 核心 API 端点速查

| 模块 | 关键端点 |
|------|---------|
| 健康检查 | `GET /health`（无需认证） |
| 系统监控 | `GET /system/overview` |
| 进程管理 | `GET /processes`、`GET /processes/{pid}`、`DELETE /processes/{pid}` |
| 磁盘/挂载 | `GET /disks/devices`、`GET /disks/mounts`、`POST /disks/mounts`、`DELETE /disks/mounts/{mountpoint}` |
| 磁盘健康 | `GET /disks/{device}/smart`、`GET /disks/{device}/power`、`POST /disks/{device}/power` |
| 文件管理 | `GET /files?path=`、`GET /files/stat?path=`、`GET /files/read?path=`、`POST /files`、`PUT /files/move`、`PUT /files/copy`、`DELETE /files` |
| Samba 共享 | `GET/POST /smb/shares`、`GET/PUT/DELETE /smb/shares/{name}` |
| Samba 用户 | `GET/POST /smb/users`、`PUT /smb/users/{username}/password`、`DELETE /smb/users/{username}` |
| NFS 导出 | `GET/POST /nfs/exports`、`GET/PUT/DELETE /nfs/exports/{name}` |
| 网络管理 | `GET /network/interfaces`、`GET /network/interfaces/{name}`、`PUT /network/interfaces/{name}` |
| ACL 管理 | `GET /acl?path=`、`PUT /acl` |

### 关键注意事项

- **文件内容 Base64 编码**：`GET /files/read` 的 `content` 字段为 Base64，读取时用 `atob()`，写入时用 `btoa()`
- **挂载点 URL 编码**：`DELETE /disks/mounts/{mountpoint}` 中路径需 `encodeURIComponent()`  
- **CIFS 凭据安全**：挂载 CIFS 时 `username`/`password` 字段绝不能在前端持久化或日志中出现
- **统一错误结构**：`{ "code": "NOT_FOUND", "message": "..." }`，错误码：`UNAUTHORIZED`、`FORBIDDEN`、`NOT_FOUND`、`INVALID_INPUT`、`CONFLICT`、`INTERNAL`
- **CORS**：agent 未内置 CORS，跨域请求需通过反向代理（nginx/caddy）处理

### 多 Agent 场景

Web UI 需支持同时管理多台宿主机，每台独立的 agent 有自己的地址和 API Key。agent 发现方式：
- UDP 多播 `224.0.0.251:7071`（每 3 秒一次），格式 `{ "hostname": "...", "addr": ":7070", "version": "..." }`
- 浏览器无法直接接收 UDP，需后端代理或手动输入

## API Key 安全原则

- 绝不将 API Key 硬编码在源码中
- 绝不将 API Key 存入 `localStorage` / `sessionStorage`（XSS 风险）
- 遵循最小权限：只读功能用 `viewer` key，写操作用 `operator`/`admin` key
- 推荐通过后端代理转发请求，前端不直接持有 key
- 环境变量名约定：`MINGYUE_API_KEY`、`MINGYUE_BASE_URL`

## 开发约定

> 注意：本项目尚处于早期阶段，以下为待确定或推荐的技术栈约定。确定后请更新本文件。

### 状态管理模式

- API 请求错误统一处理，识别 `code === 'UNAUTHORIZED'` 时跳转到配置页/提示重新输入 API Key
- 403 错误提示权限不足，不静默失败

### 组件边界建议

| 功能区 | 说明 |
|--------|------|
| 仪表板 | 系统概览（CPU/内存/运行时间）、快速状态卡片 |
| 进程管理 | 分页列表、搜索过滤、终止进程（需确认对话框） |
| 磁盘管理 | 设备列表、挂载点管理、SMART 健康信息展示 |
| 文件管理器 | 目录树 + 文件列表、预览/读写/上传/下载 |
| 共享管理 | Samba/NFS 共享 CRUD，用户管理（Samba） |
| 网络 | 接口状态卡片、up/down/dhcp 操作（admin 专用） |
| ACL 管理 | 文件权限查询与 POSIX ACL 设置 |
| 设置 | agent 地址 + API Key 配置，多 agent 管理 |

### 关键开发陷阱

1. **文件内容必须 Base64**：`POST /files` 的 `content` 字段要求 `btoa()` 编码；读取后需 `atob()` 解码
2. **挂载点 DELETE 路径需编码**：`/mnt/data` → `DELETE /disks/mounts/%2Fmnt%2Fdata`
3. **网络变更仅 admin 可用**：`PUT /network/interfaces/{name}` 的 `up`/`down`/`dhcp` 操作需 admin 角色，UI 需根据角色动态禁用按钮
4. **ACL 条目格式**：`setfacl` 约定 `[u|g|o|m]:[qualifier]:[rwx-]`，如 `u:alice:rwx`
5. **健康检查无需 Token**：轮询 `GET /health` 检测 agent 在线状态时不需要传递认证头

## 相关资源

- [mingyue-go 仓库](https://github.com/KOPElan/mingyue-go)
- [Web 前端接入指南](https://github.com/KOPElan/mingyue-go/blob/main/docs/web-integration.md)
- [API 路由契约](https://github.com/KOPElan/mingyue-go/blob/main/specs/001-linux-ops-agent/contracts/api-routes.md)
- [OpenAPI v3 规范](https://github.com/KOPElan/mingyue-go/blob/main/docs/api/openapi.yaml)
