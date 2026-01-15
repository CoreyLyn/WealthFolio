# WealthFolio 💎

**WealthFolio** 是一款现代化、隐私优先的家庭资产管理工具。它可以帮助您轻松追踪资产与负债，通过精美的可视化图表掌握家庭财务健康状况。

> 🔒 **隐私承诺**：您的所有财务数据仅存储在您浏览器的 LocalStorage 中，不会上传至任何服务器，安全且私密。

## ✨ 核心功能

- **📊 资产全景**: 实时计算总资产、总负债及家庭净资产，核心指标一目了然。
- **💰 多维度账户管理**:
  - **资产**: 支持现金、存款、股票、基金、房产、车辆、保险等多种类型。
  - **负债**: 轻松管理房贷、车贷、信用卡欠款等。
- **📈 深度可视化**:
  - **配置透视**: 饼图直观展示各类资产与负债的占比结构。
  - **趋势追踪**: 自动生成净资产历史走势图，见证财富增长。
- **📸 时光快照**: 支持手动记录特定时间点的财务“快照”，留存历史数据以便回溯。
- **⚡️ 极速体验**: 极简设计，无广告，加载迅速，操作流畅。

## 🛠️ 技术栈

本项目基于最新的前端生态构建，旨在提供极致的性能与开发体验：

- **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build**: [Vite 6](https://vitejs.dev/)
- **Visuals**: [Chart.js](https://www.chartjs.org/) + [React-chartjs-2](https://react-chartjs-2.js.org/)
- **Styling**: Native CSS Variables + Responsive Design

## 🚀 快速开始

在本地运行本项目非常简单：

### 1. 获取代码

```bash
git clone <repository-url>
cd wealth-folio
```

### 2. 安装依赖

推荐使用 `npm` 或 `pnpm`：

```bash
npm install
```

### 3. 启动开发环境

```bash
npm run dev
```

启动后，访问浏览器控制台输出的地址（通常是 `http://localhost:5173`）即可使用。

### 4. 构建生产版本

```bash
npm run build
```

构建产物将输出至 `dist` 目录，可直接部署至任何静态网站托管服务（如 Vercel, Netlify, GitHub Pages）。

## 📂 目录结构

```
src/
├── components/    # 业务组件 (图表、表单、账户列表等)
├── hooks/         # 核心逻辑 (useAppState - 状态与存储管理)
├── types/         # TypeScript 类型定义与数据模型
├── utils/         # 格式化与辅助函数
├── App.tsx        # 主界面布局
└── main.tsx       # 应用入口
```

## 🤝 贡献与反馈

欢迎提交 Issue 或 Pull Request 来改进 WealthFolio！无论是新功能建议、Bug 修复还是文档改进，我们都非常感谢。

## 📄 许可证

[MIT License](./LICENSE)
