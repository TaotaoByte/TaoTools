# TaoTools

一个放在浏览器里的开发者工具站：本地运行的小工具、自动同步的 AI 模型榜单，以及持续整理的中文技术笔记。

项目采用 React + Vite + Tailwind CSS 构建，输出为纯静态文件，可部署到任意静态托管服务或 Nginx。所有内置工具都在浏览器本地执行，不上传任何数据。

## 功能特性

- **工具箱**：内置文本对比、JSON 格式化/压缩/转义、Base64 编解码、时间戳转换、正则测试、颜色转换器、密码生成器、文本字数统计等工具，全部本地运行。
- **AI 模型榜单**：自动抓取并展示 LMArena、Artificial Analysis、SWE-bench、LiveBench 等权威榜单，标注出处、榜单日期与评分口径，**不需要人工维护**（详见下文）。
- **资源库**：设计模板、视频素材、图片壁纸、图标字体与学习资源，支持收藏。
- **软件推荐**：开发、办公、设计、系统、媒体类软件推荐，含平台与价格标签。
- **AI 教程与 Prompt 模板**：AI 教学文章、即拿即用的 Prompt 模板一键复制。
- **技术笔记**：Markdown 语法、开发笔记、软件配置、效率技巧等文章，支持分类筛选与目录导航。
- **AI 对话**：自带 API Key，支持多会话、流式输出与 Markdown 渲染，历史记录仅存本地。
- **小游戏**：内置 2048、贪吃蛇、扫雷、记忆翻牌。
- **主题切换**：浅色/深色模式，localStorage 保存偏好。
- **响应式设计**：适配桌面、平板、移动端。

## 视觉规范

界面遵循 [`docs/design-language.md`](docs/design-language.md) 中定义的规范：纸／墨／朱砂配色、发丝描边、克制的圆角与阴影、系统字体栈（**不依赖 Google Fonts**，国内访问不会阻塞渲染）。

改动界面请先读这份文档，避免重新引入渐变光斑、大圆角、玻璃拟态、装饰性图标这类模板化写法。

## 技术栈

- 前端框架：[React](https://react.dev/) + [Vite](https://vitejs.dev/)
- 样式方案：[Tailwind CSS](https://tailwindcss.com/)
- 路由：[React Router](https://reactrouter.com/)（Hash 模式）
- 图标：[Lucide React](https://lucide.dev/)
- Markdown 渲染：[react-markdown](https://github.com/remarkjs/react-markdown) + [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- 榜单抓取：[hyparquet](https://github.com/hyparam/hyparquet)（解析 LMArena 的 Parquet 数据集，仅构建期使用）
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

## AI 模型榜单（自动更新）

`src/data/leaderboards.json` 由 `scripts/fetch-leaderboards.mjs` 自动生成，**不要手工编辑**。

### 数据来源

| 榜单 | 来源 | 说明 |
| --- | --- | --- |
| 综合能力 / 中文能力 / 编程能力 | LMArena（原 Chatbot Arena） | 真人盲测 Elo，官方数据集，CC BY 4.0 |
| 智能指数（两份） | OpenRouter / Artificial Analysis | Artificial Analysis Intelligence Index |
| 代码修复能力 | SWE-bench Verified | 真实 GitHub issue 的解决率 |
| 多任务综合 | LiveBench | 7 大类均值的平均 |

### 更新方式

**自动（推荐）**：仓库内的 GitHub Actions 工作流 `.github/workflows/update-leaderboards.yml` 每周一自动抓取、验证构建、并提交变更。也可以到 Actions 页面手动触发（可指定只抓某一个源）。

**手动**：

```bash
npm run update:leaderboards        # 抓取并写入 src/data/leaderboards.json
npm run update:leaderboards:check  # 只抓取并打印结果，不写文件
```

### 设计要点

- **单源失败不影响整体**：任一数据源抓取失败时会保留上一次的缓存并标记 `stale`，页面上会提示「本次同步失败，显示的是上一次缓存」，构建不会中断。
- **字段校验**：每个源都校验关键字段是否存在，结构变化时丢弃该源而不是写入坏数据。
- **镜像回退**：部分网络会按 TLS SNI 阻断 `huggingface.co`，脚本会先试官方地址再回退到镜像。
- **名字规范化**：统一处理版本号（`claude-opus-4-5` → `Claude Opus 4.5`）、厂商前缀、推理档位去重。

## Nginx 部署

将 `dist/` 目录上传到服务器，例如 `/home/tao/TaoTools`。

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
├── .github/workflows/
│   └── update-leaderboards.yml  # 每周自动更新榜单的 workflow
├── docs/
│   └── design-language.md       # 视觉规范（改界面前必读）
├── public/
│   ├── articles/           # Markdown 文章源文件
│   │   ├── knowledge/
│   │   └── ai/
│   ├── covers/             # 文章封面图（由 scripts/generate-cover-art.py 生成）
│   └── favicons/           # 外部资源站点的本地图标
├── scripts/                # 数据生成与管理脚本
│   ├── build-data.cjs      # 扫描 Markdown 生成 JSON
│   ├── fetch-leaderboards.mjs   # 抓取 AI 榜单
│   ├── generate-cover-art.py    # 生成文章封面
│   ├── check-icons.mjs     # 校验数据里的图标名在 lucide 中存在
│   └── add-item.cjs        # 交互式添加工具/资源/软件/文章
├── src/
│   ├── components/         # 可复用组件
│   ├── contexts/           # React Context
│   ├── data/               # JSON 数据文件
│   ├── games/              # 内置小游戏组件
│   ├── hooks/              # 自定义 Hooks
│   ├── pages/              # 路由页面
│   ├── tools/              # 内置工具组件
│   ├── utils/              # 工具函数
│   ├── App.jsx             # 路由与布局
│   ├── main.jsx            # 应用入口
│   └── index.css           # 全局样式与设计令牌
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

**两个容易踩的坑（脚本已经做了防护，但最好知道）：**

1. **换行符必须是 LF。** 仓库里带了 `.gitattributes`（`* text=auto eol=lf`），正常检出就是 LF。
   如果你的编辑器把 markdown 存成了 CRLF，frontmatter 有可能会解析失败 —— 脚本现在会
   先把 `\r\n` 归一化，所以不会再出问题，但保持 LF 更稳妥。
2. **`cover` 字段别漏写。** 如果 frontmatter 里没有 `cover`，重新生成会把它清空。
   脚本现在会沿用上一次生成的封面并打印警告，但正确的做法是在 frontmatter 里写清楚。

如果重新生成后 `git diff` 里出现了"标题变成未命名文章""封面变空"这类改动，先别提交，
检查一下对应 markdown 的换行符和 frontmatter 是否完整。

### 工具 / 资源 / 软件

提供交互式命令行脚本，自动写入对应 JSON 文件：

```bash
npm run add
```

按提示选择类型并填写字段即可。完成后直接构建部署。

### 调整展示顺序

**工具 / 资源 / 软件**

直接编辑对应 JSON 文件中 `items` 数组内对象的顺序即可，数组中越靠前展示越靠前：

- `src/data/tools.json`
- `src/data/resources.json`
- `src/data/software.json`

**文章（知识库 / AI 教学）**

在 Markdown 文件的 frontmatter 中添加 `order` 字段，数字越小排序越靠前：

```yaml
---
order: 1
date: 2025-01-10
---
```

未设置 `order` 的文章默认按 `date` 日期从早到晚排序。修改后运行 `npm run build:data` 生效。

### 完整发布流程

```bash
# 1. 添加文章 Markdown 文件或运行 npm run add 添加工具/资源/软件
# 2. 重新生成文章数据与搜索索引
npm run build:data

# 3.（可选）手动刷新 AI 榜单；平时由 GitHub Actions 每周自动更新
npm run update:leaderboards

# 4. 校验数据里的图标名都存在
node scripts/check-icons.mjs

# 5. 构建
npm run build

# 6. 部署 dist/ 目录到服务器
```

## 许可证

MIT License © 2026 TaoTools
