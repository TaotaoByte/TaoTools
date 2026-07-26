# TaoTools 实施计划

## 目标

按设计规格文档完成 TaoTools 全栈工具导航网站的开发、构建并推送到 GitHub 仓库。

## 文件与目录结构

```
TaoTools/
├── docs/
│   └── superpowers/
│       ├── specs/2026-07-26-TaoTools-design.md
│       └── plans/2026-07-26-TaoTools-implementation-plan.md
├── public/
│   └── favicon.svg
├── src/
│   ├── components/         # 可复用组件
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── AnimatedCounter.jsx
│   │   ├── ScrollReveal.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── MobileMenu.jsx
│   │   ├── Card.jsx
│   │   ├── SectionTitle.jsx
│   │   ├── LoadingScreen.jsx
│   │   └── MarkdownRenderer.jsx
│   ├── contexts/
│   │   └── ThemeContext.jsx
│   ├── data/               # JSON 数据文件
│   │   ├── stats.json
│   │   ├── categories.json
│   │   ├── tools.json
│   │   ├── resources.json
│   │   ├── software.json
│   │   ├── aiModels.json
│   │   ├── aiTutorials.json
│   │   ├── aiTips.json
│   │   ├── knowledge.json
│   │   └── latest.json
│   ├── pages/              # 路由页面
│   │   ├── Home.jsx
│   │   ├── Tools.jsx
│   │   ├── Resources.jsx
│   │   ├── Software.jsx
│   │   ├── AI.jsx
│   │   ├── Knowledge.jsx
│   │   └── KnowledgeDetail.jsx
│   ├── tools/              # 内置工具组件
│   │   ├── TextDiff.jsx
│   │   ├── JsonTool.jsx
│   │   ├── Base64Tool.jsx
│   │   ├── TimestampTool.jsx
│   │   ├── RegexTool.jsx
│   │   ├── ColorTool.jsx
│   │   ├── PasswordTool.jsx
│   │   └── WordCountTool.jsx
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   └── useScrollReveal.js
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── nginx/
│   └── taotools.conf
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── .gitignore
└── README.md
```

## 实施步骤

### 阶段 1：环境准备

1. 删除旧文件：`pr.html`、`tools_jihe.html`、`个人网站要求.md`
2. 初始化 Vite 项目：`npm create vite@latest . -- --template react`
3. 安装依赖：Tailwind CSS、PostCSS、Autoprefixer、React Router、Framer Motion、Lucide React、react-markdown、react-syntax-highlighter、clsx、tailwind-merge
4. 配置 Tailwind（含 darkMode: 'class'）、PostCSS、Vite

### 阶段 2：核心系统

1. 实现 ThemeContext：默认跟随系统，localStorage 保存，class 模式切换 dark
2. 实现 Navbar：Logo、slogan、导航链接、主题切换、移动端汉堡菜单
3. 实现 Footer：简介、联系方式、备案占位、友链占位、版权
4. 实现 LoadingScreen：Logo 简洁动画
5. 实现 App.jsx：HashRouter + 路由懒加载 + Suspense + 页面切换动画

### 阶段 3：组件库

1. AnimatedCounter：数字从 0 滚动到目标值，持续 1.5s
2. ScrollReveal：元素进入视口时 fade-in + translateY
3. Card：统一卡片样式，hover 上浮 + 阴影
4. SectionTitle：统一区块标题
5. ThemeToggle：太阳/月亮图标切换按钮
6. MarkdownRenderer：Markdown + 代码高亮

### 阶段 4：首页（Home）

1. Hero 区域：标题、副标题、介绍、CTA 按钮、淡渐变背景
2. 数据统计区：4 个数据卡片 + AnimatedCounter
3. 板块快捷入口：6 个大卡片网格
4. 最新更新/推荐区：3-4 个内容卡片

### 阶段 5：工具箱（Tools）

1. 工具列表页：搜索框、分类标签、工具卡片网格
2. 内置工具弹窗/独立区域：
   - 文本对比
   - JSON 格式化/压缩/转义
   - Base64 编解码
   - 时间戳转换
   - 正则表达式测试
   - 颜色转换器
   - 密码生成器
   - 文本字数统计
3. 外部工具卡片：标注"外部工具 ↗"，新标签页打开

### 阶段 6：资源库（Resources）

1. 分类筛选：设计模板、视频素材、图片壁纸、图标字体、学习资源
2. 资源卡片：名称、图标、介绍、标签、跳转链接
3. 收藏功能：localStorage 存储收藏状态

### 阶段 7：软件推荐（Software）

1. 分类筛选：开发工具、效率办公、设计创作、系统工具、媒体播放
2. 软件卡片：图标、名称、平台标签、推荐语、官网链接、价格标签

### 阶段 8：AI 中心（AI）

1. AI 大模型排名：表格展示模型名、厂商、上下文长度、特点、官网链接、免费额度
2. AI 教学：文章列表，含标题、标签、摘要、阅读时间
3. AI 实用技巧：Prompt 模板卡片，一键复制按钮

### 阶段 9：知识库（Knowledge）

1. 文章列表页：分类筛选
2. 文章详情页：Markdown 渲染、代码高亮、目录导航

### 阶段 10：数据文件

1. 在 `src/data/` 下创建所有 JSON 文件
2. 填充真实可用的示例数据

### 阶段 11：优化与部署文件

1. 图片懒加载
2. 路由懒加载已包含
3. 响应式适配检查
4. 编写 README.md
5. 编写 nginx/taotools.conf

### 阶段 12：构建与推送

1. 运行 `npm run build` 验证构建
2. 初始化 git 仓库（如需要）
3. 添加远程 `git@github.com:TaotaoByte/TaoTools.git`
4. 提交并推送到 main 分支

## 风险与注意事项

- 保持组件文件精简，单文件不超过合理行数
- 优先编辑现有文件，避免不必要的文件创建
- 深色模式下确保文字对比度
- 移动端触摸区域至少 44px
- 避免引入重型依赖
