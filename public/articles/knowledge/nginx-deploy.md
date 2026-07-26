---
id: nginx-deploy
slug: nginx-deploy
title: Nginx 部署静态网站配置
category: config
cover: /covers/nginx-deploy.png
summary: 使用 Nginx 部署 React/Vite 构建的静态网站，包含基础配置与常见问题。
date: 2025-02-05
readTime: 10 分钟
---

# Nginx 部署静态网站配置

## 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 基础配置

编辑站点配置文件：

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

## 启用配置

```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
```

## 使用 HTTPS

推荐使用 Certbot 申请免费证书：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
```

## 注意事项

- 确保防火墙放行 80/443 端口
- 静态资源建议开启 gzip 压缩
- 单页应用需要配置 `try_files` 回退到 index.html
