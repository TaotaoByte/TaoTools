---
id: git-commands
slug: git-commands
title: 常用 Git 命令清单
category: dev
cover: /covers/git-commands.jpg
summary: 开发中高频使用的 Git 命令，涵盖仓库初始化、分支管理、提交与推送。
date: 2025-01-18
readTime: 8 分钟
---

# 常用 Git 命令清单

## 仓库初始化

```bash
# 初始化仓库
git init

# 克隆远程仓库
git clone <repository-url>
```

## 基本操作

```bash
# 查看状态
git status

# 添加文件到暂存区
git add <file>
git add .

# 提交更改
git commit -m "提交信息"

# 推送至远程
git push origin <branch>
```

## 分支管理

```bash
# 查看分支
git branch

# 创建并切换分支
git checkout -b <branch-name>

# 切换分支
git checkout <branch-name>

# 合并分支
git merge <branch-name>

# 删除本地分支
git branch -d <branch-name>
```

## 查看历史

```bash
# 查看提交历史
git log --oneline

# 查看某文件的修改历史
git log -p <file>
```

## 撤销操作

```bash
# 撤销工作区修改
git checkout -- <file>

# 撤销暂存区
git reset HEAD <file>

# 回退到指定版本
git reset --hard <commit-id>
```
