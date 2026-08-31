---
id: devtools-tips
slug: devtools-tips
title: Chrome DevTools 调试技巧
category: dev
summary: 掌握 Elements、Console、Network、Sources、Performance 等面板的高效用法，提升前端调试效率。
date: 2025-08-18
readTime: 9 分钟
tags:
  - DevTools
  - 调试
  - 前端
---

# Chrome DevTools 调试技巧

Chrome 的开发者工具（DevTools）是前端工程师每天都要用的调试利器。熟练运用它能大幅缩短排查问题的时间。本文按面板介绍最实用的功能与快捷键。

## 一、快速打开方式

| 操作 | 快捷键 |
|------|--------|
| 打开/切换 DevTools | `F12` 或 `Ctrl + Shift + I` |
| 打开 Elements 面板 | `Ctrl + Shift + C` |
| 打开 Console | `Ctrl + Shift + J` |
| 聚焦搜索框（全局命令） | `Ctrl + Shift + P` |

`Ctrl + Shift + P` 打开的「命令面板」是宝藏功能，几乎可以执行所有操作，例如输入 `screenshot` 即可截图。

## 二、Elements 面板

- **审查元素**：点击面板左上角的箭头图标（或 `Ctrl + Shift + C`），再点击页面元素即可定位。
- **实时编辑**：选中元素后可直接修改 HTML、CSS，刷新即恢复，适合快速试样式。
- **Styles 面板**：可以勾选/取消单个 CSS 属性来排查样式来源，点击属性值可快速修改。
- **Computed**：查看元素最终生效的样式，点开可反向定位到具体规则。
- **事件监听器**：在元素上可以查看已绑定的事件处理函数。

## 三、Console 面板

Console 不仅能打印日志，还能直接执行 JavaScript：

```javascript
// 选中元素后，在 Console 中可用 $0 引用它
$0.style.color = 'red'

// 查找匹配选择器的一组元素
$$('a')   // 返回 NodeList

// 计时器
console.time('loop')
// ... 执行代码
console.timeEnd('loop')
```

`console.log` 之外的常用方法：

- `console.table(data)`：以表格形式打印数组/对象，查看数据结构非常直观。
- `console.trace()`：打印调用堆栈。
- `console.dir(element)`：以对象形式查看 DOM 元素属性。

## 四、Network 面板

网络面板用于分析接口请求与资源加载：

- **时间轴**：拖拽可以只看某段时间内的请求。
- **过滤**：按类型（XHR、JS、CSS、图片等）过滤，XHR/Fetch 用于看接口。
- **请求详情**：查看请求头、响应头、参数、响应内容，是排查接口问题的第一步。
- **断网模拟**：在 Network 的「Throttling」中选择 Offline，测试离线表现。
- **筛选慢请求**：点击 Size 列可按大小排序，找出性能瓶颈。

## 五、Sources 面板

Sources 用于查看源码、设置断点：

- **断点**：点击行号设置断点，代码执行到该行会暂停。
- **条件断点**：右键行号选择「Add conditional breakpoint」，满足条件才暂停，避免无效暂停。
- **Debugger 语句**：在代码中直接写 `debugger;`，运行时自动在此暂停。
- **Watch**：添加表达式，实时观察变量值。
- **调用堆栈**：查看函数调用顺序，快速定位问题来源。

## 六、Performance 面板

性能面板用于分析页面运行性能：

1. 点击录制按钮，执行要分析的操作，再停止录制。
2. 查看 Main 线程的长任务（红色标记），判断是否存在卡顿。
3. 观察 FPS、CPU、网络等指标变化。

对于首次加载性能，更推荐配合 Lighthouse 面板做综合评分和优化建议。

## 七、常用快捷键汇总

| 功能 | 快捷键 |
|------|--------|
| 格式化压缩代码 | 在 Sources 中按 `{}` 按钮或 `Ctrl + Shift + P` 搜 format |
| 刷新（带缓存跳过） | `Ctrl + Shift + R` |
| 切换设备模拟 | `Ctrl + Shift + M` |
| 清空 Console | `Ctrl + L` |
| 打印当前选中元素 | Console 输入 `$0` |

## 八、总结

DevTools 的高效用法可以总结为三点：**善用命令面板**（`Ctrl + Shift + P`）、**善用过滤与断点**、**善用 Console 直接执行代码**。不必一次记全所有快捷键，先掌握 Elements、Console、Network 三个最常用的面板，就能覆盖日常 80% 的调试场景。