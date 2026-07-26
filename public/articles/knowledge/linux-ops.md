---
id: linux-ops
slug: linux-ops
title: Linux 服务器运维常用命令与安全基线
category: config
cover: /covers/linux-ops.jpg
summary: 系统梳理 Linux 服务器运维中的文件、权限、进程、网络、日志命令，以及 systemd、防火墙、SSH 加固、crontab 和性能排查思路。
date: 2025-07-26
readTime: 14 分钟
order: 30
tags:
  - Linux
  - 运维
  - 安全
  - 服务器
  - Shell
---

# Linux 服务器运维常用命令与安全基线

Linux 服务器是大多数 Web 应用、数据库和中间件的运行底座。熟练掌握常用运维命令和安全基线配置，不仅能提高排障效率，还能有效降低服务器被攻击的风险。无论是自建机房、云服务器还是容器化环境，Linux 命令行都是运维工程师最核心的工具。本文将从日常操作、服务管理、安全加固和性能排查四个维度，整理一线运维经验。

## 一、文件与目录操作

文件管理是运维最基础的能力。除了常见的 `ls`、`cd`、`cp`、`mv`、`rm`，以下命令在服务器环境中更为常用。

```bash
# 查看目录大小
du -sh /var/log

# 查找大文件
find / -type f -size +100M -exec ls -lh {} \;

# 按名称查找文件
find /etc -name "*.conf" -type f

# 查看文件系统磁盘使用情况
df -h

# 实时查看文件尾部日志
tail -f /var/log/nginx/access.log

# 查看文件开头
cat /etc/os-release

# 合并多个文件并去重
sort file1.txt file2.txt | uniq > result.txt
```

对于需要频繁操作的目录，可以使用 `pushd` 和 `popd` 在多个路径之间快速切换。熟练掌握 `find`、`grep`、`awk`、`sed` 等工具，可以在日志分析和配置管理中大幅提升效率。

## 二、权限与用户管理

Linux 权限模型是安全的第一道防线。理解 `rwx`、属主、属组以及特殊权限位非常重要。

```bash
# 修改文件权限
chmod 644 file.txt

# 递归修改目录权限
chmod -R 755 /var/www

# 修改文件属主
chown www-data:www-data file.txt

# 添加用户并加入 sudo 组
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy

# 切换到普通用户
su - deploy
```

生产环境中应尽量避免使用 root 账户直接登录，日常操作通过普通用户配合 `sudo` 完成。

## 三、进程管理

进程管理用于定位异常进程、控制服务运行状态以及排查资源占用问题。

```bash
# 查看进程树
ps auxf

# 按 CPU 排序查看进程
top -o %CPU

# 更友好的交互式进程查看器
htop

# 查找指定进程
pgrep nginx

# 结束进程
kill -15 <pid>
kill -9 <pid>  # 强制结束，慎用

# 查看进程打开的文件
lsof -p <pid>
```

## 四、网络诊断

网络问题是线上故障的高发领域，掌握常用诊断命令可以快速定位问题。

```bash
# 查看网络接口和 IP 地址
ip addr

# 查看路由表
ip route

# 测试网络连通性
ping 8.8.8.8

# 查看端口监听状态
ss -tlnp

# 查看 TCP 连接
ss -s

# 追踪路由路径
traceroute example.com

# DNS 解析测试
nslookup example.com
dig example.com
```

`ss` 命令已逐步替代 `netstat`，在大多数现代 Linux 发行版中更为高效。

## 五、日志管理

日志是排查问题的关键依据。Systemd 系统使用 `journalctl` 统一管理服务日志。

```bash
# 查看所有日志
journalctl

# 查看指定服务的日志
journalctl -u nginx

# 实时跟踪日志
journalctl -u nginx -f

# 查看最近一小时的日志
journalctl --since "1 hour ago"

# 按日志级别过滤
journalctl -p err
```

对于 Nginx、Apache 等应用日志，建议按日期切割，并结合 `logrotate` 进行归档和清理。

## 六、systemd 服务管理

systemd 是现代 Linux 的主流初始化系统，服务管理围绕 `systemctl` 展开。

```bash
# 启动服务
sudo systemctl start nginx

# 停止服务
sudo systemctl stop nginx

# 重启服务
sudo systemctl restart nginx

# 重载配置
sudo systemctl reload nginx

# 设置开机自启
sudo systemctl enable nginx

# 禁用开机自启
sudo systemctl disable nginx

# 查看服务状态
sudo systemctl status nginx
```

自定义服务时，可以在 `/etc/systemd/system/` 下创建 `.service` 文件，内容例如：

```ini
[Unit]
Description=My Node App
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

修改后需要执行 `sudo systemctl daemon-reload` 使其生效。systemd 还支持定时器（timer）替代 crontab，提供更精确的触发条件和执行日志。

## 七、防火墙配置

防火墙是服务器安全的重要组成部分。Ubuntu 常用 `ufw`，CentOS/RHEL 常用 `firewalld`。

### ufw 常用命令

```bash
# 启用防火墙
sudo ufw enable

# 默认拒绝入站，允许出站
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 允许 SSH、HTTP、HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 查看规则
sudo ufw status verbose
```

### firewalld 常用命令

```bash
# 启动 firewalld
sudo systemctl start firewalld

# 放行端口
sudo firewall-cmd --permanent --add-port=8080/tcp

# 放行服务
sudo firewall-cmd --permanent --add-service=https

# 重载配置
sudo firewall-cmd --reload

# 查看当前规则
sudo firewall-cmd --list-all
```

## 八、SSH 安全加固

SSH 是服务器管理的主要入口，也是攻击者重点扫描的目标。建议采取以下加固措施。

```bash
# 编辑 SSH 配置文件
sudo nano /etc/ssh/sshd_config
```

关键配置项：

| 配置项 | 建议值 | 说明 |
|--------|--------|------|
| `PermitRootLogin` | `no` | 禁止 root 登录 |
| `PasswordAuthentication` | `no` | 使用密钥认证 |
| `PubkeyAuthentication` | `yes` | 启用公钥认证 |
| `Port` | 非 22 | 修改默认端口，降低扫描风险 |
| `MaxAuthTries` | `3` | 限制尝试次数 |
| `ClientAliveInterval` | `300` | 检测空闲连接 |

修改后必须验证配置并重启服务：

```bash
sudo sshd -t
sudo systemctl restart sshd
```

同时建议启用 fail2ban，自动封禁暴力破解 IP。

## 九、定时任务 crontab

crontab 用于按计划执行脚本，如备份、日志清理、健康检查等。

```bash
# 编辑当前用户的定时任务
crontab -e

# 查看定时任务
crontab -l

# 系统级定时任务目录
ls /etc/cron.d/
```

时间格式示例：

```bash
# 每天凌晨 2 点执行备份
0 2 * * * /opt/scripts/backup.sh

# 每 5 分钟检查一次服务状态
*/5 * * * * /opt/scripts/health-check.sh
```

建议将脚本输出重定向到日志文件，便于排查执行失败的问题。

## 十、性能排查思路

当服务器出现卡顿、响应慢或负载高时，可按以下顺序排查。

1. **整体负载**：`uptime`、`top`、`htop` 查看 CPU、内存、负载平均值。
2. **磁盘 IO**：`iostat -x 1`、`iotop` 判断是否存在磁盘瓶颈。
3. **网络 IO**：`iftop`、`nload` 查看实时流量。
4. **内存使用**：`free -h`、`vmstat` 分析内存和交换分区。
5. **进程详情**：`pidstat`、`strace` 定位具体进程的异常行为。

| 命令 | 用途 |
|------|------|
| `vmstat 1 5` | CPU、内存、IO 综合采样 |
| `iostat -x 1` | 磁盘 IO 详细统计 |
| `netstat -tunlp` / `ss -tlnp` | 端口与连接 |
| `dmesg` | 内核日志，硬件或驱动问题 |

## 十一、包管理与系统更新

保持系统补丁更新是安全运维的基础工作。

### Ubuntu/Debian

```bash
# 更新包索引
sudo apt update

# 升级已安装包
sudo apt upgrade

# 升级系统并处理依赖变化
sudo apt dist-upgrade

# 搜索包
apt search nginx

# 查看包信息
apt show nginx
```

### CentOS/RHEL

```bash
# 更新系统
sudo yum update
# 或
sudo dnf update

# 安装包
sudo dnf install nginx

# 查看已安装包
rpm -qa | grep nginx
```

更新前建议在测试环境验证，并做好快照或备份，防止升级导致服务异常。

## 十二、磁盘与文件系统管理

磁盘空间不足是常见的线上问题，需要定期监控和清理。

```bash
# 查看磁盘分区使用情况
df -hT

# 查找当前目录下最大的目录
du -h --max-depth=1 | sort -hr

# 查找大于 1GB 的文件
find / -type f -size +1G -exec ls -lh {} \;

# 查看 inode 使用情况
df -i
```

对于日志增长过快的场景，应配置 `logrotate` 进行自动轮转。

```bash
# /etc/logrotate.d/myapp
/var/log/myapp/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    sharedscripts
    postrotate
        systemctl reload myapp
    endscript
}
```

## 十三、备份策略

没有备份的运维是不可靠的。建议根据数据重要性制定备份策略：

- **数据库备份**：使用 `mysqldump`、`pg_dump` 或物理备份工具，每日全量加增量备份；
- **配置文件备份**：定期备份 `/etc`、应用配置和 systemd 服务文件；
- **远程备份**：将备份数据同步到异地或云存储，防止单点故障；
- **备份验证**：定期演练恢复流程，确保备份可用。

```bash
# MySQL 备份示例
mysqldump -u root -p --all-databases > backup.sql

# 使用 rsync 同步到远程服务器
rsync -avz --delete /backup/ user@remote:/backup/
```

## 十四、安全审计与加固

除了 SSH 和防火墙，还应关注系统层面的安全配置。

- **最小权限原则**：仅安装必要的软件和服务，关闭不使用的端口；
- **SELinux/AppArmor**：启用强制访问控制，限制进程权限；
- **审计日志**：使用 `auditd` 记录关键文件和系统调用；
- **入侵检测**：部署 fail2ban 或 OSSEC，检测异常行为；
- **定期扫描**：使用 Lynis 等工具进行系统安全扫描。

```bash
# 安装并运行 Lynis
sudo apt install lynis
sudo lynis audit system
```

## 十五、典型故障排查场景

### 15.1 网站无法访问

1. 检查服务是否运行：`systemctl status nginx`；
2. 检查端口监听：`ss -tlnp | grep 80`；
3. 检查防火墙是否放行：`ufw status` 或 `firewall-cmd --list-all`；
4. 查看应用日志和 Nginx 错误日志定位具体错误。

### 15.2 磁盘空间不足

1. 使用 `df -h` 定位满载分区；
2. 使用 `du -h --max-depth=1` 查找大目录；
3. 清理过期日志或临时文件；
4. 检查是否有大文件被删除但仍被进程占用：`lsof +L1`。

### 15.3 CPU 使用率过高

1. `top` 或 `htop` 查看占用 CPU 最高的进程；
2. 使用 `pidstat -u -p <pid> 1` 持续观察；
3. 结合应用日志分析是否有异常请求或死循环。

### 15.4 内存不足导致 OOM

1. `free -h` 查看内存和交换分区使用；
2. `dmesg | grep -i "out of memory"` 查看 OOM 日志；
3. 调整服务内存限制或增加物理内存/交换分区。

掌握这些典型场景的排查思路，可以在故障发生时快速定位根因，减少业务影响。

## 十六、总结

Linux 运维的核心在于理解系统资源、服务状态和网络安全三者之间的关系。通过熟练使用文件、进程、网络、日志命令，配合 systemd、防火墙、SSH 加固和定时任务，可以构建一条可靠的服务器运维基线。遇到性能问题时，遵循从整体到局部、从系统到进程的排查思路，往往能事半功倍。安全无小事，建议定期审查权限、更新补丁、备份关键数据，并将操作脚本化、可审计化。
