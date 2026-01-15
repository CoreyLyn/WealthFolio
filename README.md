# WealthFolio 💎

**WealthFolio** 是一款现代化的家庭资产管理工具，帮助您轻松追踪资产与负债，通过精美的可视化图表掌握家庭财务健康状况。

> 🔐 **云端同步**：数据安全存储在 Supabase 云端，支持多设备同步，随时随地管理您的财务。

## ✨ 核心功能

- **🔑 用户认证**: 邮箱密码注册登录，数据安全隔离
- **📊 资产全景**: 实时计算总资产、总负债及家庭净资产
- **💰 多维度账户管理**:
  - **资产**: 现金、存款、股票、基金、房产、车辆、保险等
  - **负债**: 房贷、车贷、信用卡、消费贷等
- **📈 深度可视化**:
  - **配置透视**: 饼图展示各类资产与负债的占比结构
  - **趋势追踪**: 净资产历史走势图，见证财富增长
- **📸 时光快照**: 记录特定时间点的财务快照，留存历史数据
- **🌓 暗色模式**: 支持明/暗主题切换，保护您的眼睛
- **📱 响应式设计**: 完美适配桌面与移动端

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | React 19 + TypeScript 5.9 |
| **构建** | Vite 7 |
| **样式** | TailwindCSS 3.4 + shadcn/ui |
| **后端** | Supabase (Auth + PostgreSQL) |
| **图表** | Chart.js + react-chartjs-2 |
| **主题** | next-themes (暗色模式) |

## 🚀 快速开始

### 1. 克隆代码

```bash
git clone <repository-url>
cd wealth-folio
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 初始化数据库

在 Supabase Dashboard → SQL Editor 中执行 `supabase/schema.sql`

### 5. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 开始使用。

## 📦 可用命令

```bash
npm run dev       # 启动开发服务器
npm run build     # 构建生产版本
npm run preview   # 预览生产构建
npm run lint      # ESLint 代码检查
```

## 📂 目录结构

```
src/
├── components/       # React 组件
│   ├── ui/          # shadcn/ui 基础组件
│   ├── AccountForm  # 账户表单
│   ├── AccountList  # 账户列表
│   ├── AuthForm     # 登录/注册表单
│   └── *Chart       # 图表组件
├── contexts/        # React Context (AuthContext)
├── hooks/           # 自定义 Hooks (useAppState)
├── lib/             # 工具库 (Supabase 客户端, cn())
├── types/           # TypeScript 类型定义
├── App.tsx          # 主应用组件
└── main.tsx         # 应用入口
```

## 🗄️ 数据库结构

| 表名 | 说明 |
|------|------|
| `assets` | 资产账户 (存款、股票、房产等) |
| `liabilities` | 负债账户 (房贷、信用卡等) |
| `snapshots` | 财务快照 (历史净资产记录) |

所有表均启用 **Row Level Security (RLS)**，确保用户数据完全隔离。

## 🔒 安全特性

- ✅ Supabase 认证 (邮箱/密码)
- ✅ Row Level Security 数据隔离
- ✅ 环境变量管理敏感配置
- ✅ 仅使用 Anon Key (无服务端密钥暴露)

## 🤝 贡献指南

欢迎提交 Issue 或 Pull Request！

开发前请阅读 [AGENTS.md](./AGENTS.md) 了解代码规范。

## 📄 许可证

[MIT License](./LICENSE)
