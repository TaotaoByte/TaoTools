# TaoTools 服务器部署指南

本文档介绍如何将 TaoTools 部署到一台 Ubuntu 24.04 服务器上，使用 Nginx 托管静态构建产物，并可选配置 HTTPS。

## 环境要求

- 操作系统：Ubuntu 24.04 LTS
- 服务器配置：最低 1 核 1G 内存即可运行
- 域名：可选。如果没有域名，可直接通过服务器 IP 访问（HTTP）

## 1. 服务器基础准备

使用 SSH 登录到服务器：

```bash
ssh user@your-server-ip
```

更新系统软件包：

```bash
sudo apt update
sudo apt upgrade -y
```

## 2. 安装 Node.js 与 npm

TaoTools 使用 Vite 构建，需要 Node.js 18 或以上版本。

```bash
# 安装 NodeSource 源并安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v
npm -v
```

## 3. 安装 Nginx

```bash
sudo apt install -y nginx

# 启动 Nginx 并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证 Nginx 是否运行
sudo systemctl status nginx
```

在浏览器中访问服务器 IP，应能看到 Nginx 默认欢迎页。

## 4. 拉取项目代码

项目将部署到 `/home/tao/TaoTools` 目录下：

```bash
# 进入用户主目录
cd ~

# 克隆项目
git clone git@github.com:TaotaoByte/TaoTools.git

# 进入项目目录
cd TaoTools
```

如果服务器没有配置 GitHub SSH Key，也可以使用 HTTPS 地址：

```bash
git clone https://github.com/TaotaoByte/TaoTools.git
```

## 5. 安装依赖并构建

```bash
# 安装项目依赖
npm install

# 重新生成文章数据（如果有新增或修改 Markdown 文章）
npm run build:data

# 构建生产版本
npm run build
```

构建完成后，静态文件会输出到 `dist/` 目录。

## 6. 配置 Nginx

项目已提供 Nginx 配置示例 `nginx/taotools.conf`，默认已通过 `server_name _;` 支持无域名 IP 访问。如果你已有域名，可将 `server_name` 改为你自己的域名。

```bash
# 复制配置文件
sudo cp nginx/taotools.conf /etc/nginx/sites-available/taotools

# 如需使用域名，编辑配置文件修改 server_name
sudo nano /etc/nginx/sites-available/taotools
```

配置文件内容参考：

```nginx
server {
    listen 80;
    listen [::]:80;

    # 无域名时保留 `_`，通过服务器 IP 访问
    # 有域名时改为：server_name example.com www.example.com;
    server_name _;

    root /home/tao/TaoTools/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|otf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 单页应用路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

启用站点配置：

```bash
# 创建符号链接启用站点
sudo ln -s /etc/nginx/sites-available/taotools /etc/nginx/sites-enabled/

# 检查配置是否正确
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

现在访问 `http://<你的服务器IP>` 即可看到 TaoTools 网站。如果配置了域名，则访问 `http://your-domain.com`。

## 7. 配置 HTTPS（可选，需要域名）

> 注意：Let's Encrypt 申请证书必须有域名，无法为裸 IP 签发证书。如果你的服务器只有 IP，可跳过本节，使用 HTTP 访问。

如果你已有域名并解析到服务器，可使用 Let's Encrypt 免费证书，通过 Certbot 自动配置 HTTPS。

```bash
# 安装 Certbot 和 Nginx 插件
sudo apt install -y certbot python3-certbot-nginx

# 申请并自动配置证书
sudo certbot --nginx -d example.com -d www.example.com
```

按提示操作，选择是否强制 HTTP 重定向到 HTTPS（建议选择是）。

验证证书是否自动续期：

```bash
sudo certbot renew --dry-run
```

Certbot 默认会安装定时任务自动续期证书，无需额外配置。

## 8. 后续更新部署

当代码有更新时，执行以下命令重新部署：

```bash
cd /home/tao/TaoTools

# 拉取最新代码
git pull origin main

# 安装依赖（如有新增依赖）
npm install

# 重新生成文章数据
npm run build:data

# 重新构建
npm run build

# 可选：清理 Nginx 缓存
sudo systemctl reload nginx
```

如果你使用 `npm run add` 添加了新的工具/资源/软件，直接构建即可：

```bash
cd /home/tao/TaoTools
npm install
npm run build
sudo systemctl reload nginx
```

## 9. 常见问题排查

### 9.1 访问网站显示 404

检查 Nginx 配置文件中的 `root` 路径是否指向 `dist` 目录：

```bash
ls /home/tao/TaoTools/dist
```

确认 `location /` 块中配置了 `try_files $uri $uri/ /index.html;`，因为 TaoTools 使用 Hash Router，刷新页面需要回退到 `index.html`。

### 9.2 构建失败

检查 Node.js 版本：

```bash
node -v
```

确保版本不低于 18。如果提示依赖错误，尝试删除 `node_modules` 重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
```

### 9.3 样式或图标未生效

可能是浏览器缓存了旧版本资源。尝试强制刷新：

```
Ctrl + Shift + R
```

或在 Nginx 配置中缩短静态资源缓存时间，部署完成后再恢复。

### 9.4 HTTPS 证书过期

检查 Certbot 自动续期状态：

```bash
sudo certbot certificates
sudo systemctl status certbot.timer
```

手动续期：

```bash
sudo certbot renew
sudo systemctl reload nginx
```

## 10. 可选优化

### 10.1 使用 PM2 守护构建脚本（非必须）

如果你希望将构建流程自动化，可以编写一个部署脚本：

```bash
sudo nano /usr/local/bin/deploy-taotools
```

内容如下：

```bash
#!/bin/bash
set -e

cd /home/tao/TaoTools
git pull origin main
npm install
npm run build:data
npm run build
sudo systemctl reload nginx

echo "TaoTools 部署完成"
```

赋予执行权限：

```bash
sudo chmod +x /usr/local/bin/deploy-taotools
```

之后只需运行：

```bash
deploy-taotools
```

### 10.2 配置 GitHub Webhook 自动部署（进阶）

可以在服务器上部署一个 Webhook 服务，当 GitHub 仓库收到 push 事件时自动执行 `deploy-taotools` 脚本。常用工具包括 [webhook](https://github.com/adnanh/webhook) 或自行编写 Node.js 服务。

---

部署完成后，你的 TaoTools 网站就可以通过域名正常访问了。
