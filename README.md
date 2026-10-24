# Skill Sky

深蓝星空主题皮肤，为 **DeepSeek Harness** 桌面端定制。

> A deep-blue starfield skin for the DeepSeek Harness desktop UI.

![license](https://img.shields.io/badge/license-MIT-blue)

---

## 效果

| 部件 | 说明 |
|---|---|
| **配色** | 荧光深蓝：正文 `#dcebff`、次要 `#b9d2ff`、强调 `#64a4ff`，三层蓝白辉光 |
| **底色** | 深蓝近黑（`#070a14` / `#04070e`） |
| **星空** | 12 颗恒定星 + 32 颗按 8 组不同周期呼吸的星点 + 2 层深蓝星云 |
| **星云** | 8 层白色星云，按「近大远小」分层：近景 48vmin / 0.16，远景 13vmin / 0.05 |
| **四芒星** | 6 颗，各自独立周期（2.4–5.0s）闪烁，每颗有独立的光晕、光散与光刺尺寸 |
| **品牌星** | 软糖五角星：白核 → 边框蓝渐变，5 层辉光 + 呼吸光晕 |
| **字标** | `SKY // DEEP BLUE`：斜体 900 字重 + 上下渐变填充；侧栏只留 `SKY` |
| **侧栏文字** | 按文本内容识别（不依赖类名）：15.5px / 600 字重 / `#eef7ff` / 过冲回弹 |
| **顶部标签** | `对话` `轨迹` `应用` `编辑` 统一同款样式 |
| **侧栏时钟** | 玻璃质感表盘（角向蓝白晕染 + 左上高光弧），秒针平滑扫动 |
| **数字时间** | 七段数码管 `HH:MM`，冒号两秒一周期呼吸 |
| **输入框** | 底部输入框：4px 亮白描边 + 三层辉光 + 顶部玻璃高光；聚焦时更亮 |
| **分栏分割线** | 鼠标靠近才出现，钻石颗粒质感 |

---

## 安装

```sh
dsh plugin --profile desktop add https://github.com/Lizhixuxu/skill-sky
```

或本地路径：

```sh
dsh plugin --profile desktop add file:C:/path/to/skill-sky
```

安装后**完全退出并重新启动** DSH。

> 客户端的 bundle URL 内嵌版本哈希并带 `immutable` 缓存头，所以 **Ctrl+R 刷新不够**，必须重启进程。

---

## 卸载

```sh
dsh plugin --profile desktop remove skill-sky
```

---

## 可调参数

全部集中在 `lib/client.js`。

### 文字色（主题令牌）

```js
'--dsw-alias-label-primary':   { light: '#dcebff', dark: '#dcebff' }
'--dsw-alias-label-secondary': { light: '#b9d2ff', dark: '#b9d2ff' }
'--dsw-alias-label-tertiary':  { light: '#c4d8f6', dark: '#c4d8f6' }
'--dsw-alias-label-caption':   { light: '#a9c2e4', dark: '#a9c2e4' }
'--dsw-alias-label-dimmed':    { light: '#8aa6c9', dark: '#8aa6c9' }
'--dsw-alias-brand-primary':   { light: '#64a4ff', dark: '#64a4ff' }
```

### 字号

```css
html, body {
  --dsh-content-font-size: 16px !important;   /* 产品所有字号都由它派生 */
}
```

### 文字辉光

```css
text-shadow: 0 0 2px  rgba(240, 248, 255, 0.95),
             0 0 12px rgba(110, 175, 255, 0.72),
             0 0 26px rgba(50, 120, 255, 0.36);
```

### 星空与星云

`body::before` 的 22 层背景。星点用「单点 + 独立平铺尺寸」堆叠（每层平铺尺寸不同，靠这个打散网格感）；星云用 `vmin` 尺寸与透明度分层做景深。

### 四芒星

六条 `#skill-sky-flares-N` 规则，每条 5 层：`光晕 / 白热核心 / 光散 / 横向光刺 / 纵向光刺`。

### 品牌星

```js
const starPts = /* 外半径 44 / 内半径 21 的五角星 */;
strokeWidth: 16   // 粗描边 + strokeLinejoin: round 把尖角磨圆
```

### 时钟

- 表盘几何全部按半径比例（`R × 系数`），任意尺寸不失真；
- 环身是 13 段 `createConicGradient` 蓝白不规则晕染；
- 秒针用 `getMilliseconds()` 做亚秒插值，平滑扫动；
- 数字时间用七段数码管（`SEG_MAP`）逐段绘制。

---

## 实现要点

### 不依赖产品类名

产品的组件类名是构建时生成的哈希（如 `_footer_4ub78_62`），改版就会变。本皮肤用两种方式规避：

1. **按文本内容匹配** —— XPath `//*[not(*) and (normalize-space(.)='新会话' or …)]`；
2. **按几何位置定位** —— 从左侧边缘取点向上找「宽 > 120 且高 > 屏幕 35%」的容器即侧栏；从 `<textarea>` 里挑屏幕下半部分最靠下的那个即底部输入框。

### 性能

- 画布尺寸跟随容器，所有几何按半径比例计算；
- 标签扫描每 1200ms 一次，用 XPath 的 `not(*)` 只取叶子节点；
- 时钟绘制约 30fps（`33ms` 节流）。

### 代码块保护

全局文字统一规则用 `:not(pre *)` 排除了 `pre` / `code` 及其后代，避免语法高亮被加粗和辉光糊掉。

---

## 已知限制

- 皮肤锚定少量产品生成的类名哈希（`[class*="_footer_4ub78"]`、`[class*="_splitRow_"]`），改版若更换哈希，对应规则会静默失效，但主题主体仍正常。
- 侧栏时钟依赖页脚容器；若容器结构变化，会自动退化为左下角悬浮模式。
- 侧栏与顶部标签按中文文案匹配，切换到其他语言界面时这些规则不生效。

---

## 致谢与许可

本皮肤派生自 [amber-forge](https://github.com/HCGuo2000/hcguo-public/tree/main/plugins/amber-forge)（作者 HCGuo2000，MIT）。在此基础上重绘配色、重做背景分层，并新增星空、四芒星闪烁、品牌星、侧栏时钟、数字时间、分栏线与输入框。

以 MIT 许可发布，详见 [LICENSE](LICENSE)。
