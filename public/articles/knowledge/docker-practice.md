---
id: docker-practice
slug: docker-practice
title: Docker 容器化部署实战指南
category: config
cover: /covers/docker-practice.jpg
summary: 从 Dockerfile 最佳实践到 docker-compose 编排，覆盖多阶段构建、镜像瘦身、数据持久化、网络模式与生产环境注意事项。
date: 2025-07-26
readTime: 13 分钟
order: 20
tags:
  - Docker
  - 容器化
  - DevOps
  - 部署
  - docker-compose
---

# Docker 容器化部署实战指南

容器化已经成为现代应用交付的标准方式。通过 Docker，开发者可以将应用及其运行环境打包为一致的镜像，从而解决「在我机器上能跑」的问题。相比传统虚拟机，容器具有启动快、资源占用低、环境一致性高等优势，特别适合微服务架构和 DevOps 实践。本文将从 Dockerfile 编写、Compose 编排、数据持久化、网络模式到生产环境注意事项，系统梳理容器化部署的实战经验。

## 一、Dockerfile 编写最佳实践

Dockerfile 是镜像构建的蓝图，其质量直接决定镜像体积、构建速度和运行安全。

### 1.1 选择合适的基础镜像

优先选择官方镜像的精简版本，例如 `node:20-alpine`、`python:3.12-slim`。Alpine 版本体积更小，但需要注意 musl libc 与 glibc 的兼容性问题。

```dockerfile
# 不推荐：镜像体积过大
FROM ubuntu:latest

# 推荐：基于 Alpine 的精简镜像
FROM node:20-alpine
```

### 1.2 多阶段构建

多阶段构建可以将构建依赖与运行环境分离，大幅减小最终镜像体积。

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

上例中，构建阶段需要的 `node_modules` 和源码不会进入最终镜像，仅保留构建产物。

### 1.3 优化层缓存

Docker 镜像由多层组成，合理利用缓存可以显著加快构建速度。将不常变动的指令放在前面，频繁变动的放在后面。

```dockerfile
# 先复制依赖文件并安装，利用缓存
COPY package*.json ./
RUN npm ci

# 再复制源码，源码改动不会导致依赖重新安装
COPY . .
RUN npm run build
```

### 1.4 减少镜像体积的其他技巧

- 合并 RUN 指令，减少层数；
- 安装依赖后清理缓存，如 `rm -rf /var/cache/apk/*`；
- 使用 `.dockerignore` 排除不需要的文件，如 `node_modules`、`.git`、日志文件等。

### 1.5 编写 .dockerignore

`.dockerignore` 的作用类似于 `.gitignore`，可以减少构建上下文大小，加快构建速度。

```dockerignore
node_modules
npm-debug.log
.git
.env
.vscode
coverage
dist
*.md
```

排除不必要的文件后，不仅构建更快，镜像也更安全，避免敏感信息意外被打包。

### 1.6 非 root 用户运行

默认情况下容器以 root 运行，存在安全风险。应在 Dockerfile 中创建普通用户并切换。

```dockerfile
FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app
COPY --chown=nextjs:nodejs . .
USER nextjs
CMD ["node", "server.js"]
```

### 1.7 多阶段构建的其他语言示例

多阶段构建同样适用于 Go、Python、Java 等语言。

```dockerfile
# Go 多阶段构建示例
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
CMD ["./main"]
```

最终镜像仅包含编译后的二进制文件，体积通常可以控制在几十 MB 以内。这种构建方式不仅提升了部署速度，也减少了攻击面，因为运行时镜像中不再包含编译器、源码和构建依赖。

## 二、docker-compose 编排 Web 应用

对于由多个服务组成的应用，docker-compose 是本地开发和测试环境的首选工具。

```yaml
version: "3.9"

services:
  web:
    build: ./web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/app
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  pgdata:
```

关键点：

- 使用 `depends_on` 控制启动顺序，但并不能保证服务已就绪，生产环境建议配合健康检查；
- 敏感信息不要直接写在 compose 文件中，可通过 `.env` 文件或 Docker Secrets 管理；
- 使用 `restart` 策略提升服务可用性。

### 2.1 多环境配置

通过 `docker-compose.override.yml` 或指定多个 compose 文件，可以方便地切换开发、测试、生产环境。

```bash
# 开发环境默认读取 docker-compose.yml 和 docker-compose.override.yml
docker-compose up -d

# 生产环境使用指定配置文件
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

生产配置文件通常会更注重资源限制、副本数、日志策略和网络安全，避免与开发配置混用。

## 三、数据持久化与卷管理

容器是临时性的，容器删除后内部数据会丢失。对于数据库、文件上传、会话缓存等场景，必须使用卷（Volume）或绑定挂载（Bind Mount）进行持久化。选择持久化方案时，应综合考虑数据重要性、备份策略和迁移需求。

| 方式 | 适用场景 | 特点 |
|------|----------|------|
| Volume | 数据库存储、应用状态 | 由 Docker 管理，跨容器共享方便 |
| Bind Mount | 开发环境热更新、配置文件 | 直接映射宿主机路径 |
| tmpfs | 敏感缓存、临时文件 | 存储在内存中，容器停止即丢失 |

常用命令：

```bash
# 创建卷
docker volume create my-data

# 查看卷
docker volume ls

# 删除未使用的卷
docker volume prune

# 备份卷
docker run --rm -v my-data:/data -v $(pwd):/backup alpine tar czf /backup/data.tar.gz -C /data .
```

## 四、网络模式选择

Docker 提供多种网络模式，理解它们的差异对服务间通信至关重要。

| 网络模式 | 说明 | 适用场景 |
|----------|------|----------|
| bridge | 默认模式，容器通过 Docker 网桥通信 | 单机多容器 |
| host | 共享宿主机网络栈 | 高性能网络需求 |
| none | 禁用网络 | 高隔离需求 |
| overlay | 跨主机容器通信 | Docker Swarm / Kubernetes |

在 docker-compose 中，默认会为项目创建一个 bridge 网络，服务之间可以通过服务名互相访问。例如 `web` 服务可以通过 `db` 这个主机名访问 PostgreSQL。

自定义网络示例：

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true

services:
  web:
    networks:
      - frontend
      - backend
  db:
    networks:
      - backend
```

通过 `internal: true` 可以让 backend 网络仅容器间通信，不暴露到外部，提升安全性。

## 五、镜像仓库与分发

构建好的镜像需要存储到镜像仓库中，才能在多台服务器上分发和部署。

```bash
# 登录 Docker Hub 或私有仓库
docker login registry.example.com

# 给镜像打标签
docker tag my-app:1.0 registry.example.com/my-app:1.0

# 推送镜像
docker push registry.example.com/my-app:1.0

# 拉取镜像
docker pull registry.example.com/my-app:1.0
```

常用镜像仓库包括 Docker Hub、阿里云容器镜像服务、Harbor 私有仓库等。对于企业场景，建议使用 Harbor 搭建私有仓库，支持镜像签名、漏洞扫描和权限控制。镜像标签建议使用语义化版本号或 Git 提交哈希，避免使用 `latest` 标签导致难以追踪线上运行的具体版本。

## 六、环境变量与配置管理

容器化应用通常需要根据不同的环境加载不同的配置。推荐通过环境变量传入配置，而不是将配置硬编码到镜像中。

```dockerfile
# Dockerfile 中定义默认值
ENV NODE_ENV=production
ENV PORT=3000
```

```bash
# 运行时覆盖
docker run -e NODE_ENV=development -e PORT=8080 my-app
```

对于敏感信息如数据库密码、API 密钥，应避免使用普通环境变量。Docker 提供了 Secrets 机制：

```bash
# 创建 secret
echo "my-secret" | docker secret create db_password -

# 在 Swarm 服务中使用
docker service create --name my-app --secret db_password my-app
```

## 七、生产环境注意事项

容器化进入生产环境时，需要关注以下方面。

### 7.1 镜像安全

- 使用官方镜像并定期更新基础镜像；
- 避免以 root 用户运行容器，Dockerfile 中可指定 `USER node`；
- 扫描镜像漏洞，工具如 Trivy、Snyk。

```bash
# 使用 Trivy 扫描镜像
trivy image my-app:1.0
```

### 7.2 资源限制

```bash
docker run -m 512m --cpus=1.0 my-app
```

通过 `-m` 限制内存、`--cpus` 限制 CPU，防止单个容器耗尽宿主机资源。

### 7.3 日志管理

容器日志默认存储在 JSON 文件中，长期运行可能占满磁盘。建议配置日志驱动和轮转策略。

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

也可以将日志直接发送到集中式日志系统，如 ELK、Fluentd 或 Loki。

### 7.4 健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

健康检查可以帮助编排工具自动重启异常容器。

### 7.5 编排与调度

单机 docker-compose 适合开发和测试，生产环境建议使用 Docker Swarm 或 Kubernetes 进行容器编排。它们提供服务发现、负载均衡、自动扩缩容、滚动更新等能力。

## 八、调试与排错

容器运行出现问题时，可以通过以下方式排查。

```bash
# 查看容器日志
docker logs -f --tail 100 app

# 进入运行中的容器
docker exec -it app /bin/sh

# 查看容器元数据
docker inspect app

# 查看容器资源使用
docker stats app

# 复制文件到容器或从容器复制文件
docker cp app:/var/log/app.log ./app.log
docker cp ./config.json app:/app/config.json
```

常见问题包括镜像构建失败、端口冲突、权限不足、环境变量未生效、卷挂载路径错误等。养成查看日志和使用 `docker inspect` 的习惯，可以大幅提升排错效率。

## 九、容器化与 CI/CD

将 Docker 集成到 CI/CD 流水线中，可以实现从代码提交到镜像构建的自动化。

```yaml
# GitHub Actions 示例
name: Build and Push Docker Image
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t my-app:${{ github.sha }} .
      - name: Run tests
        run: docker run my-app:${{ github.sha }} npm test
      - name: Push to registry
        run: |
          docker login -u ${{ secrets.DOCKER_USER }} -p ${{ secrets.DOCKER_PASS }}
          docker push my-app:${{ github.sha }}
```

流水线中建议包含镜像构建、测试、安全扫描和推送三个核心步骤。扫描结果应作为门禁条件，严重漏洞未修复不允许发布。

## 十、常见命令速查

```bash
# 构建镜像
docker build -t my-app:1.0 .

# 运行容器
docker run -d -p 3000:3000 --name app my-app:1.0

# 查看日志
docker logs -f app

# 进入容器
docker exec -it app /bin/sh

# 停止并删除容器
docker stop app && docker rm app

# 启动 compose 项目
docker-compose up -d

# 查看 compose 服务状态
docker-compose ps

# 重新构建并启动
docker-compose up -d --build

# 清理未使用的资源
docker system prune -a --volumes
```

## 十一、总结

Docker 让应用交付变得标准化和可预测。掌握 Dockerfile 多阶段构建、合理的镜像优化、docker-compose 编排、数据持久化策略以及生产环境的安全与资源管理，是每位后端和运维工程师的必修课。建议从一个小型 Web 应用开始实践，逐步引入 CI/CD、镜像仓库和服务编排，最终构建起完整的容器化交付链路。
