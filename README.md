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
├── public/                 # 静态资源
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

## 数据维护

所有展示数据集中在 `src/data/` 目录下的 JSON 文件中，修改对应文件即可更新网站内容，无需改动组件代码。

## 许可证

MIT License © 2025 TaoTools
