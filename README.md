# Skill Sky

深蓝星空主题皮肤，为 **DeepSeek Harness** 桌面端定制。

> A deep-blue starfield skin for the DeepSeek Harness desktop UI.

![license](https://img.shields.io/badge/license-MIT-blue)

---

## 效果

| 部件 | 说明 |
|---|---|
| **配色** | 荧光深蓝：正文 `#dcebff`、次要 `#b9d2ff`、强调 `#64a4ff`，带三层蓝白辉光 |
| **底色** | 深蓝近黑（`#070a14` / `#04070e`），非绿色、非中性 |
| **星空** | 12 颗恒定星 + 32 颗按 8 组不同周期呼吸的星点 + 2 层深蓝星云 |
| **星云** | 8 层白色星云，按「近大远小」分层：近景 48vmin / 0.16，远景 13vmin / 0.05 |
| **四芒星** | 6 颗，各自独立周期（2.4–5.0s）闪烁，每颗有独立的光晕、光散与光刺尺寸 |
| **侧栏时钟** | 88px 玻璃质感表盘，秒针平滑扫动；下方七段数码管数字时间，冒号呼吸 |
| **分栏分割线** | 鼠标靠近才出现，钻石颗粒质感，悬停变粗 |

---

## 安装

```sh
dsh plugin --profile desktop add https://github.com/<你>/skill-sky
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

全部集中在 `lib/client.js`：

### 文字色（主题令牌）

```js
'--dsw-alias-label-primary':   { light: '#dcebff', dark: '#dcebff' }
'--dsw-alias-label-secondary': { light: '#b9d2ff', dark: '#b9d2ff' }
'--dsw-alias-brand-primary':   { light: '#64a4ff', dark: '#64a4ff' }
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

闪烁：

```css
@keyframes skillSkyTwinkle { 0%, 100% { opacity: 0.12; } 50% { opacity: 1; } }
```

### 时钟

- 表盘几何全部按半径比例（`R × 系数`），任意尺寸不失真；
- 环身为 `createConicGradient` 的 13 段蓝白不规则晕染；
- 秒针用 `getMilliseconds()` 做亚秒插值，平滑扫动；
- 数字时间用七段数码管（`SEG_MAP`）逐段绘制。

### 分割线

`#skill-sky-splitline`，位置由 `elementFromPoint` 实测侧栏右边界得出，不依赖产品内部类名。

---

## 已知限制

- 皮肤锚定若干产品生成的类名哈希（`[class*="_footer_4ub78"]`、`[class*="_splitRow_"]` 等）。产品改版若更换哈希，对应规则会静默失效，但主题主体仍正常。
- 侧栏时钟依赖页脚容器；若容器结构变化，会自动退化为左下角悬浮模式。

---

## 致谢与许可

本皮肤派生自 [amber-forge](https://github.com/HCGuo2000/hcguo-public/tree/main/plugins/amber-forge)（作者 HCGuo2000，MIT）。在此基础上重绘配色、重做背景分层，并新增星空、四芒星闪烁、侧栏时钟、数字时间与分割线。

以 MIT 许可发布，详见 [LICENSE](LICENSE)。
