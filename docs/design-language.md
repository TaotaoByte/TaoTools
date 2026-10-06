# TaoTools 视觉语言（改版约束）

> 本次改版的目标：**去掉模板化的「AI 味」**，做成一个有人工痕迹、信息密度合理、克制的开发者工具站。
> 所有页面改动都必须遵守本文档。改完后请通读一遍，确认没有残留旧写法。

## 1. 为什么之前「AI 味」很重

旧版集中了这类模板特征，全部要清掉：

| 旧写法 | 问题 |
| --- | --- |
| 首页 5 个 `blur-3xl` 彩色光斑 + 紫蓝渐变 | 最典型的 AI 生成页头 |
| `Sparkles` / `Wand2` 装饰图标 | 「AI 感」标志物 |
| `rounded-2xl` / `rounded-3xl` 大圆角 | 泡泡感 |
| 卡片一律 `hover:-translate-y-1 hover:shadow-xl` | 全站弹跳，廉价 |
| 图标底色按 index 轮换 blue/emerald/violet/rose | 无理由的彩虹配色 |
| `bg-gradient-to-br from-x to-y` 图标块 | 模板化 |
| 玻璃拟态 `backdrop-blur` 大量使用 | 模板化 |
| 文案「把每一个工具与资源，真正变成你的能力」 | 空泛、口号化 |
| `whileInView` 把内容先藏起来再淡入 | 内容长期不可见，且是模板特征 |

## 2. 颜色：纸 / 墨 / 朱砂

- `slate` 已在 `tailwind.config.js` 中被**重映射为暖灰阶**（等同 Tailwind `stone`）。所以直接用 `slate-*` 就是暖色，不要再引入 `gray` / `zinc` / `neutral`，也不要写死十六进制。
- `primary` 是朱砂红（`primary-600 = #b84a2b`）。**它只用于**：主按钮、当前导航项、链接 hover、重点数字/序号、焦点环。
- **禁止**：彩色渐变（`bg-gradient-to-*` 只允许用于极少量功能性遮罩，默认不用）、`blur-3xl` 光斑、彩虹配色轮换、多种强调色混用。
- 状态色可以保留但要用淡色：`emerald`（成功/免费）、`amber`（提醒）、`red`（错误）。不要用 `violet` / `fuchsia` / `pink` / `cyan`。

## 3. 形状与层次

- 圆角：卡片 `rounded-lg`（8px），按钮/输入 `rounded-md`（6px），标签 `rounded`（5px）。**不要 `rounded-2xl` / `rounded-3xl` / `rounded-full`**（除非是真的圆形头像/圆点）。
- 卡片：`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700`，**默认无阴影**。
- 悬浮：只改描边色（`hover:border-slate-300 dark:hover:border-slate-600`）。**不要位移、不要放大、不要大阴影**。图片 hover 允许 `scale-105`，但必须带 `overflow-hidden` 且不超过 500ms。
- 分区之间用**发丝分隔线**（`border-t border-slate-200 dark:border-slate-800`）+ 留白，不要用色块背景交替。
- 需要强调层次时用 `shadow-sm`，不要用 `shadow-lg` / `shadow-xl`。

## 4. 排版

- 字体：系统字体栈，已配置好 `font-sans` / `font-mono`。**不要再引入 Google Fonts 或任何外链字体。**
- 字号收敛：正文 `text-[13px]` / `text-sm`，卡片标题 `text-[15px] font-medium`，分区标题 `text-xl sm:text-2xl font-semibold tracking-tight`，页面主标题最大 `text-4xl sm:text-5xl`。
- **不要** `text-6xl` / `text-7xl` / `text-8xl`。
- 字重：标题 `font-semibold`，卡片标题 `font-medium`。**不要满屏 `font-bold`**。
- 技术感信息（日期、序号、来源、键值、代码）统一用 `.label-mono` 或 `font-mono`，数字加 `tnum`（等宽数字）。
- 中文行高：正文 `leading-relaxed`。

## 5. 图标

- 只从 `lucide-react` 导入具体图标，或使用现有 `<Icon name="..." />`。
- 图标尺寸：内联 `w-4 h-4`，卡片 `w-[18px] h-[18px]`，大号 `w-5 h-5`。**不要 `w-8 h-8` 以上。**
- 图标容器写成：

```jsx
<span className="w-10 h-10 shrink-0 rounded-md border border-slate-200 dark:border-slate-700
                 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors
                 group-hover:border-primary-300 dark:group-hover:border-primary-800
                 group-hover:text-primary-700 dark:group-hover:text-primary-400">
  <Icon name={item.icon} className="w-[18px] h-[18px]" />
</span>
```

- **禁止**装饰性图标：`Sparkles`、`Wand2`、`Zap`、`Rocket`、`Stars` 等。图标必须有实际语义。

## 6. 动效

- 默认**没有**滚动动画。需要淡入时用 `<ScrollReveal>`（已改成纯 CSS，内容始终可见）。
- 页面切换不再做整页位移。
- 过渡时长：`duration-150` ~ `duration-300`。
- **禁止** `animate-pulse`、无限循环动画、`hover:scale-110`。

## 7. 文案

- 说具体的事，不说口号。
  - ❌「把每一个工具与资源，真正变成你的能力」
  - ✅「17 个在浏览器本地运行的小工具，数据不上传」
- 不要「一站式」「赋能」「智能」「极致」「全新升级」这类词。
- 按钮用动词短语：「打开工具箱」「复制」「查看源码」。
- 空状态要给出下一步动作。

## 8. 可复用的现成类（`src/index.css`）

| 类名 | 用途 |
| --- | --- |
| `.btn-primary` | 主按钮（朱砂底、白字、`rounded-md`） |
| `.btn-secondary` | 次按钮（白底 + 发丝描边） |
| `.card-hover` | 卡片悬浮（只变描边） |
| `.label-mono` | 小号等宽大写标签 |
| `.page-container` | 页面外层（`max-w-6xl` + 内边距） |
| `.section-padding` | 仅左右内边距 |
| `.bg-dotgrid` | 图纸点阵底纹（只用于首屏局部） |
| `.tnum` | 等宽数字 |
| `.mask-fade-b` | 向下淡出遮罩 |

## 9. 页面骨架参考

```jsx
export default function SomePage() {
  return (
    <div className="page-container space-y-12">
      <header>
        <p className="label-mono">Section</p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          页面标题
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          一句话说明这个页面能做什么。
        </p>
      </header>

      <section>
        <SectionTitle index="01" title="分区标题" subtitle="可选说明" />
        {/* 网格用 gap-3 / gap-4，不要 gap-6 以上的大间距 */}
      </section>
    </div>
  )
}
```

## 10. 深色模式

每个前景色/背景色都要有 `dark:` 版本。深色背景用 `slate-900`（页面）/ `slate-800`（卡片），描边用 `slate-800` / `slate-700`。
