# TaoTools

一站式工具导航与知识分享平台。

TaoTools 是一个聚合实用工具、精选资源、效率软件、AI 内容与开发知识的个人网站。项目采用 React 18 + Vite + Tailwind CSS 构建，输出为静态文件，适合部署到任意静态托管服务或 Nginx 服务器。

## 功能特性

- **工具箱**：内置文本对比、JSON 格式化/压缩/转义、Base64 编解码、时间戳转换、正则测试、颜色转换器、密码生成器、文本字数统计等实用小工具。
- **资源库**：精选设计模板、视频素材、图片壁纸、图标字体与学习资源，支持收藏。
- **软件推荐**：开发、办公、设计、系统、媒体类软件推荐，含平台与价格标签。
- **AI 中心**：主流大模型排名对比、AI 教学文章、Prompt 模板一键复制。
- **知识库**：Markdown 语法、开发笔记、软件配置、效率技巧等文章，支持分类筛选与目录导航。
- **主题切换**：浅色/深色模式，默认跟随系统，localStorage 保存偏好。
- **响应式设计**：适配桌面、平板、移动端。
- **性能优化**：路由懒加载、组件按需加载、滚动渐入动画。

## 技术栈

- 前端框架：[React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- 样式方案：[Tailwind CSS](https://tailwindcss.com/)
- 路由：[React Router](https://reactrouter.com/)（Hash 模式）
- 图标：[Lucide React](https://lucide.dev/)
- 动画：[Framer Motion](https://www.framer.com/motion/)
- Markdown 渲染：[react-markdown](https://github.com/remarkjs/react-markdown) + [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- 部署：Nginx 静态托管

## 本地开发

```bash
# 克隆仓库
git clone git@github.com:TaotaoByte/TaoTools.git
cd TaoTools

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发服务器默认运行在 http://localhost:5173。

## 构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录，可直接部署到 Nginx 或任意静态托管服务。

## Nginx 部署

将 `dist/` 目录上传到服务器，例如 `/var/www/taotools`。

复制 `nginx/taotools.conf` 到 `/etc/nginx/sites-available/taotools` 并启用：

```bash
sudo cp nginx/taotools.conf /etc/nginx/sites-available/taotools
sudo ln -s /etc/nginx/sites-available/taotools /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

配置示例已包含 gzip 压缩、缓存策略与单页应用刷新回退。

## 项目结构

```
TaoTools/
├── public/
│   ├── articles/           # Markdown 文章源文件
│   │   ├── knowledge/
│   │   └── ai/
│   └── covers/             # 文章封面图
├── scripts/                # 数据生成与管理脚本
│   ├── build-data.cjs      # 扫描 Markdown 生成 JSON
│   └── add-item.cjs        # 交互式添加工具/资源/软件/文章
├── src/
│   ├── components/         # 可复用组件
│   ├── contexts/           # React Context
│   ├── data/               # JSON 数据文件
│   ├── hooks/              # 自定义 Hooks
│   ├── pages/              # 路由页面
│   ├── tools/              # 内置工具组件
│   ├── utils/              # 工具函数
│   ├── App.jsx             # 路由与布局
│   ├── main.jsx            # 应用入口
│   └── index.css           # 全局样式
├── nginx/
│   └── taotools.conf       # Nginx 配置示例
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

## 内容管理

### 文章（知识库 / AI 教学）

文章使用 Markdown 文件管理，存放在：

- `public/articles/knowledge/` - 知识库文章
- `public/articles/ai/` - AI 教学文章

每篇文章顶部使用 YAML frontmatter 定义元数据：

```yaml
---
id: markdown-basic
slug: markdown-basic
title: Markdown 基础语法速查
category: markdown
cover: /covers/markdown-basic.jpg
summary: Markdown 常用语法速查表。
date: 2025-01-10
readTime: 5 分钟
---
```

新增或修改文章后，运行以下命令重新生成 JSON 数据：

```bash
npm run build:data
```

### 工具 / 资源 / 软件

提供交互式命令行脚本，自动写入对应 JSON 文件：

```bash
npm run add
```

按提示选择类型并填写字段即可。完成后直接构建部署。

### 完整发布流程

```bash
# 1. 添加文章 Markdown 文件或运行 npm run add 添加工具/资源/软件
# 2. 重新生成文章数据
npm run build:data

# 3. 构建
npm run build

# 4. 部署 dist/ 目录到服务器
```

## 许可证

MIT License © 2025 TaoTools
