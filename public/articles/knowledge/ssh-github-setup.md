---
id: ssh-github-setup
slug: ssh-github-setup
title: SSH 密钥登录与 GitHub 配置
category: dev
summary: 从零生成 SSH 密钥、配置 GitHub 免密登录，解决 443 超时、多个密钥冲突等常见问题。
date: 2025-08-05
readTime: 8 分钟
tags:
  - SSH
  - GitHub
  - Git
---

# SSH 密钥登录与 GitHub 配置

使用 SSH 协议与 GitHub 通信，可以免去每次 push / pull 都输入账号密码的麻烦，也更安全。本文将带你完成 SSH 密钥从生成到配置的全流程，并梳理几个国内用户常见的问题。

## 一、为什么用 SSH

相比 HTTPS，SSH 有两个明显优势：

- **免密认证**：配置一次，之后无需重复输入密码或 Token。
- **更稳定**：国内访问 GitHub 时，HTTPS 的 443 端口偶尔超时，而 SSH 的 22 端口通常更稳定，必要时还可切换到 443 端口。

## 二、检查是否已有密钥

在你开始生成之前，先看看本机是否已经存在密钥：

```bash
ls -al ~/.ssh
```

如果存在 `id_ed25519.pub` 或 `id_rsa.pub`，说明你已经拥有密钥，可以直接复用，不必重新生成。

## 三、生成 SSH 密钥

推荐使用更安全、性能更好的 Ed25519 算法：

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

按提示一路回车即可（建议为密钥设置一个易记的路径，默认 `~/.ssh/id_ed25519`）。

如果你的环境不支持 Ed25519（某些老旧系统），回退到 RSA：

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

## 四、将公钥添加到 GitHub

1. 查看公钥内容：

```bash
cat ~/.ssh/id_ed25519.pub
```

2. 复制整行输出（以 `ssh-ed25519` 或 `ssh-rsa` 开头）。

3. 打开 GitHub，进入 **Settings → SSH and GPG keys → New SSH key**，粘贴并保存。

> 注意复制的是 `.pub` 公钥文件，私钥（无 `.pub` 后缀）绝不能外泄。

## 五、测试连接

```bash
ssh -T git@github.com
```

首次连接会提示确认 host 指纹，输入 `yes`。看到下面这行就表示成功：

```
Hi <username>! You've successfully authenticated.
```

## 六、让 Git 使用 SSH

如果你的仓库原本是用 HTTPS 克隆的，可以切换为 SSH 地址：

```bash
# 查看当前远程地址
git remote -v

# 切换为 SSH 地址（替换用户名与仓库名）
git remote set-url origin git@github.com:username/repo.git
```

新克隆仓库时，直接使用 SSH 地址即可：

```bash
git clone git@github.com:username/repo.git
```

## 七、国内常见问题

### 7.1 22 端口连接超时

部分网络环境下 22 端口被限制，可以通过 SSH over HTTPS 走 443 端口。编辑 `~/.ssh/config`：

```text
Host github.com
    Hostname ssh.github.com
    Port 443
    User git
```

保存后重新测试 `ssh -T git@github.com`。

### 7.2 多个 GitHub 账号 / 多密钥冲突

当你同时使用个人账号和公司账号时，可以为不同账号配置不同 Host 别名：

```text
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal

Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
```

克隆时使用对应别名：

```bash
git clone git@github-personal:username/repo.git
```

### 7.3 permission denied (publickey)

如果报错 `permission denied (publickey)`，按顺序排查：

1. 公钥是否已添加到 GitHub；
2. `ssh-add -l` 确认密钥是否已加载到 ssh-agent；
3. 私钥文件权限是否过松（Linux/Mac 下应为 `600`）：

```bash
chmod 600 ~/.ssh/id_ed25519
chmod 700 ~/.ssh
```

## 八、总结

配置一次 SSH，后续的 Git 操作会顺畅很多。核心步骤就是三个：**生成密钥 → 添加公钥到 GitHub → 测试连接**。遇到连接问题时，优先尝试 443 端口方案；遇到多账号冲突，用 `~/.ssh/config` 的 Host 别名来区分。