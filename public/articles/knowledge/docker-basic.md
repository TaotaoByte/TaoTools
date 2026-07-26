---
id: docker-basic
slug: docker-basic
title: Docker 常用命令入门
category: dev
cover: /covers/docker-basic.png
summary: Docker 基础命令速查，包括镜像、容器、卷和网络管理。
date: 2025-02-20
readTime: 9 分钟
---

# Docker 常用命令入门

## 镜像管理

```bash
# 拉取镜像
docker pull nginx:latest

# 查看本地镜像
docker images

# 删除镜像
docker rmi <image-id>
```

## 容器管理

```bash
# 运行容器
docker run -d -p 80:80 --name my-nginx nginx

# 查看运行中的容器
docker ps

# 停止容器
docker stop my-nginx

# 删除容器
docker rm my-nginx

# 进入容器内部
docker exec -it my-nginx /bin/bash
```

## 数据卷

```bash
# 创建卷
docker volume create my-data

# 挂载卷运行容器
docker run -v my-data:/data nginx
```

## Docker Compose

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f
```
