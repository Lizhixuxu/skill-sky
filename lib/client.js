/* Skill Sky — deep-blue starfield skin for DeepSeek Harness.
 * Derived from amber-forge (c) HCGuo2000, MIT licensed:
 *   https://github.com/HCGuo2000/hcguo-public/tree/main/plugins/amber-forge
 * Repainted, re-layered and extended (starfield, twinkling flares, sidebar clock,
 * digital readout, diamond splitter). MIT licensed; see LICENSE.
 */
window.__ModuleLoader__.load({
	id: "skill-sky",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");


		// 硬依赖（0.1.7-rc.1 修复）：theme 服务由 dsh-client-ui-theme 提供，
		// 而它自身的 inject 为 ['slots','locale','remote','configForms']，
		// 注册时机远晚于无依赖的 slots。此处留空 inject 会让 apply 抢跑：
		// ctx.get('theme') 返回 undefined，琥珀令牌层被静默跳过，
		// 于是圣徽与单宽字体健在，唯独所有字体的琥珀色尽失。
		// 声明硬依赖后由 Cordis 推迟 apply 至 theme 就绪（theme 又传递性保证 slots）。
		const inject = ['theme'];

		/** 注入一段 <style> 并返回移除它的 disposer（正式 client 插件无 styles builtin，故用 DOM）。 */
		function insertCss(css) {
			if (typeof document === "undefined") return () => {};
			const tag = document.createElement("style");
			tag.dataset.plugin = "skill-sky";
			tag.textContent = css;
			document.head.appendChild(tag);
			return () => {
				if (tag.parentNode) tag.parentNode.removeChild(tag);
			};
		}

		function apply(ctx) {
			// ── 琥珀主题令牌覆写（别名层） ──
			const theme = ctx.get('theme');
			if (theme === undefined) {
				// 绝不再静默：声明 inject 后此分支不应出现；一旦出现即刻显形，便于排查。
				console.warn('[skill-sky] theme service unavailable — 琥珀令牌层未登记，字体将失去琥珀色。请检查本插件的 inject 声明。');
			}
			if (theme !== undefined) {
				ctx.effect(() => theme.overrideTokens('skill-sky', {
					'--dsw-alias-bg-base': { light: '#050a14', dark: '#04070e' },
					'--dsw-alias-bg-layer-1': { light: '#080d1a', dark: '#070a14' },
					'--dsw-alias-bg-layer-2': { light: '#101828', dark: '#0a0f1e' },
					/* 补齐官方其余的底色令牌：不覆写时它们在浅色模式下仍是近白色，
					   卡片 / 弹层 / 代码块 / 预览会露出一块白底。 */
					'--dsw-alias-bg-layer-3': { light: '#142037', dark: '#0f1628' },
					'--dsw-alias-bg-layer-4': { light: '#1a2a48', dark: '#16223c' },
					'--dsw-alias-bg-module-platform': { light: '#080d1a', dark: '#070a14' },
					'--dsw-alias-bg-document-preview': { light: '#050a14', dark: '#04070e' },
					'--dsw-alias-bg-document-selection': { light: '#204060', dark: '#1e3352' },
					'--dsw-alias-bg-l1': { light: '#080d1a', dark: '#070a14' },
					'--dsw-alias-bg-l2': { light: '#101828', dark: '#0a0f1e' },
					'--dsw-alias-bg-skeleton': { light: '#121e34', dark: '#0d1626' },
					'--dsw-alias-bg-multi-select': { light: '#1e3352', dark: '#182742' },
					'--dsw-alias-bg-overlay': { light: '#0a1424', dark: '#080d1a' },
					'--dsw-alias-border-l1': { light: '#1e3352', dark: '#182742' },
					'--dsw-alias-border-l2': { light: '#2a4c7f', dark: '#24447a' },
					'--dsw-alias-brand-primary': { light: '#64a4ff', dark: '#64a4ff' },
					'--dsw-alias-label-primary': { light: '#dcebff', dark: '#dcebff' },
					'--dsw-alias-label-secondary': { light: '#b9d2ff', dark: '#b9d2ff' },
					'--dsw-alias-label-tertiary': { light: '#c4d8f6', dark: '#c4d8f6' },
					'--dsw-alias-label-caption': { light: '#a9c2e4', dark: '#a9c2e4' },
					'--dsw-alias-label-dimmed': { light: '#8aa6c9', dark: '#8aa6c9' },
					'--dsw-alias-state-error-primary': { light: '#c93a2e', dark: '#b3352a' },
					'--dsw-alias-state-success-primary': { light: '#8fae6a', dark: '#7d9c5c' },
					'--dsw-alias-state-warn-primary': { light: '#6a8aff', dark: '#5f8ae8' },
					'--dsw-specific-sidebar-fill': { light: '#060c16', dark: '#08101c' },
					// 产品输入光标取自此令牌（.RlGAzG_input 的 caret-color），
					// 不覆写则暗底琥珀界面里仍是产品原色，与「文字与光标同源」相悖。
					'--dsw-alias-state-business-primary': { light: '#8ab8ff', dark: '#2a7bff' }
				}), 'skill-sky: tokens');
			}

			// ── 深层变量净化 + CRT 机魂样式 + 口号覆写 + hero 布局（DOM 注入） ──
			ctx.effect(() => insertCss(`
				:root {
					/* 本机若缺前几款，即落 Consolas —— 故将其提前，避免「声明了却不生效」的假象 */
					--skill-sky-font: Consolas, ui-monospace, 'Cascadia Mono', 'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', monospace;
				}
				/* 补齐白底：产品许多面底由 --dsw-static-neutral-* 派生，琥珀皮肤没逐一覆写，
				   于是浅色模式下输入框 / 行内代码 / 菜单仍是近白色。只作用于浅色模式，
				   用 !important 压过 :root 上的主题声明；不碰 neutral-800 这类「文字用」的深色静态值。 */
				body:not([data-ds-dark-theme]) {
					--dsw-static-neutral-50: #0f1628 !important;
					--dsw-static-neutral-bluish-00: #070a14 !important;
					--dsw-static-neutral-bluish-50: #080d1a !important;
					--dsw-static-neutral-bluish-60: #0a0f1e !important;
					--dsw-specific-input-major: #070a14 !important;
					--dsw-specific-login-input: #080d1a !important;
					--dsw-specific-selector: #0a0f1e !important;
					--dsw-specific-tip: #0a0f1e !important;
					--dsw-specific-menu: rgba(12, 18, 34, .96) !important;
					--dsw-menu-surface-fill: rgba(12, 18, 34, .94) !important;
					--dsw-alias-markdown-inline-code: #0f1628 !important;
					--dsw-alias-markdown-code-block: #070a14 !important;
					--dsw-alias-markdown-code-block-banner: #0a0f1e !important;
					/* 用户消息气泡：浅色模式取自 --dsw-static-deepseek-50 = rgb(237,243,254)，就是聊天记录里那块白底 */
					--dsw-specific-bubble: #0a0f1e !important;
					--dsw-specific-bubble-highlight: #142037 !important;
					--dsw-specific-sidebar-nav-item-active: #182742 !important;
					--dsw-specific-sidebar-nav-item-hover: #101828 !important;
				}
				body[data-ds-dark-theme] {
					--dsw-specific-input-major: #070a14 !important;
					--dsw-alias-markdown-inline-code: #0f1628 !important;
					--dsw-alias-markdown-code-block: #070a14 !important;
					--dsw-menu-surface-fill: rgba(12, 18, 34, .94) !important;
					--dsw-specific-bubble: #0a0f1e !important;
					--dsw-specific-bubble-highlight: #142037 !important;
				}
				:not(pre) > code {
					background-color: #0f1628 !important;
					border-color: #1e3352 !important;
				}
				/* 通配强制单宽字族：堵住产品写死的比例字体旁路（如 QueueDock 的 Inter）。
				   数学排版豁免：KaTeX 以 .katex{font:1.21em KaTeX_Main,…} 与 .katex *
				   族规则声明 KaTeX_* 字族，均不带 !important；若通配规则不排除该子树，
				   公式字形会被 !important 击穿。:not() 取参数中最高特异性，
				   故 body *:not(.katex) 特异性仍为 0，不会反压 KaTeX 的类规则。
				   注：本段位于 JS 模板字面量内，注释中严禁使用反引号。 */
				body, body *:not(.katex) {
					font-family: var(--skill-sky-font) !important;
				}
				body {
					text-shadow: 0 0 2px rgba(240, 248, 255, 0.95), 0 0 12px rgba(110, 175, 255, 0.72), 0 0 26px rgba(50, 120, 255, 0.36);
				}
				::selection {
					background: rgba(90, 150, 255, 0.38);
					color: #c2d8ff;
				}
				* {
					caret-color: #8ab8ff;
				}
				html body {
					--dsw-static-blue-50: #e6f0ff !important;
					--dsw-static-blue-50p: #d9e8ff !important;
					--dsw-static-blue-75: #ccdcff !important;
					--dsw-static-blue-100: #d0e0ff !important;
					--dsw-static-blue-300: #a0c0f5 !important;
					--dsw-static-blue-400: #8ab8ff !important;
					--dsw-static-blue-450: #2a7bff !important;
					--dsw-static-blue-500: #4da8f5 !important;
					--dsw-static-blue-600: #5fa8dd !important;
					--dsw-static-blue-800: #3a6aa0 !important;
					--dsw-static-blue-900: #1f5aa0 !important;
					--dsw-static-blue-950: #143a70 !important;
					--dsw-static-deepseek-50: #e0eefd !important;
					--dsw-static-deepseek-100: #ccdcfb !important;
					--dsw-static-deepseek-200: #b3caf8 !important;
					--dsw-static-deepseek-300: #a8c0f0 !important;
					--dsw-static-deepseek-400: #8ab8ff !important;
					--dsw-static-deepseek-450: #6aa8ff !important;
					--dsw-static-deepseek-500: #39a0f5 !important;
					--dsw-static-deepseek-600: #4f8ac8 !important;
					--dsw-static-deepseek-700-delete: #2f6a9a !important;
					--dsw-static-deepseek-800: #2f5a8a !important;
					--dsw-static-deepseek-900: #24447a !important;
					--dsw-alias-brand-primary-new-colorprimary-new-color: #2a7bff !important;
					--dsw-alias-interactive-bg-active: #2a7bff1a !important;
					--dsw-alias-interactive-bg-hover: #2a7bff0f !important;
					--dsw-alias-interactive-bg-hover-accent: #2a7bff24 !important;
					--dsw-alias-interactive-bg-hover-danger: #ec13130d !important;
				}
				body::after {
					content: '';
					position: fixed;
					inset: 0;
					pointer-events: none;
					z-index: 2147483647;
					background:
						repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.16) 0, rgba(0, 0, 0, 0.16) 1px, transparent 1px, transparent 3px),
						repeating-linear-gradient(to bottom, rgba(120, 170, 255, 0.06) 0, rgba(120, 170, 255, 0.06) 1px, transparent 1px, transparent 12px),
						radial-gradient(ellipse at center, transparent 58%, rgba(0, 0, 0, 0.32) 100%);
				}
				/* 暗橙环境光：screen 混合只提亮暗部，亮色文字几乎不受影响，
				   于是光晕自然只长在「非文字」的底色区域上。 */
				body::before {
					content: '';
					position: fixed;
					inset: 0;
					pointer-events: none;
					z-index: 2147483646;
					mix-blend-mode: screen;
					background: 
						radial-gradient(58vmin 40vmin at 28% 26%, rgba(46, 96, 210, 0.075), transparent 72%),
						radial-gradient(52vmin 46vmin at 76% 72%, rgba(34, 74, 190, 0.065), transparent 72%),
						radial-gradient(48vmin 34vmin at 16% 20%, rgba(242, 250, 255, 0.16), rgba(198, 222, 255, 0.055) 46%, transparent 70%),
						radial-gradient(42vmin 30vmin at 82% 70%, rgba(238, 248, 255, 0.145), rgba(194, 220, 255, 0.05) 46%, transparent 70%),
						radial-gradient(13vmin 9vmin at 17% 21%, rgba(255, 255, 255, 0.18), transparent 68%),
						radial-gradient(10vmin 7vmin at 83% 71%, rgba(255, 255, 255, 0.15), transparent 68%),
						radial-gradient(30vmin 22vmin at 54% 86%, rgba(230, 243, 255, 0.10), transparent 68%),
						radial-gradient(26vmin 19vmin at 90% 24%, rgba(226, 240, 255, 0.085), transparent 68%),
						radial-gradient(16vmin 12vmin at 34% 8%, rgba(220, 238, 255, 0.06), transparent 64%),
						radial-gradient(13vmin 10vmin at 68% 16%, rgba(216, 235, 255, 0.05), transparent 64%),
						radial-gradient(0.83px at 187px 13px, rgba(140, 180, 255, 0.88), transparent) 0 0 / 180px 180px repeat,
						radial-gradient(2.6px at 249px 167px, rgba(225, 242, 255, 0.95), rgba(120, 175, 255, 0.35) 45%, transparent) 0 0 / 340px 340px repeat,
						radial-gradient(2.22px at 168px 394px, rgba(205, 232, 255, 0.77), transparent) 0 0 / 180px 180px repeat,
						radial-gradient(0.75px at 335px 257px, rgba(140, 180, 255, 0.4), transparent) 0 0 / 180px 180px repeat,
						radial-gradient(2.6px at 188px 103px, rgba(225, 242, 255, 0.95), rgba(120, 175, 255, 0.35) 45%, transparent) 0 0 / 380px 380px repeat,
						radial-gradient(2.1px at 203px 240px, rgba(205, 232, 255, 0.46), transparent) 0 0 / 400px 400px repeat,
						radial-gradient(1.89px at 154px 391px, rgba(170, 208, 255, 0.24), transparent) 0 0 / 330px 330px repeat,
						radial-gradient(2.6px at 163px 267px, rgba(225, 242, 255, 0.95), rgba(120, 175, 255, 0.35) 45%, transparent) 0 0 / 380px 380px repeat,
						radial-gradient(1.07px at 141px 367px, rgba(140, 180, 255, 0.58), transparent) 0 0 / 360px 360px repeat,
						radial-gradient(2.6px at 239px 79px, rgba(225, 242, 255, 0.95), rgba(120, 175, 255, 0.35) 45%, transparent) 0 0 / 300px 300px repeat,
						radial-gradient(1.08px at 346px 42px, rgba(140, 180, 255, 0.45), transparent) 0 0 / 240px 240px repeat,
						radial-gradient(2.28px at 366px 143px, rgba(205, 232, 255, 0.53), transparent) 0 0 / 180px 180px repeat;
				}
				*::-webkit-scrollbar {
					width: 10px;
					height: 10px;
				}
				*::-webkit-scrollbar-track {
					background: #08101c;
				}
				*::-webkit-scrollbar-thumb {
					background: #1f3a6a;
					border-radius: 5px;
					border: 2px solid #08101c;
				}
				*::-webkit-scrollbar-thumb:hover {
					background: #8ab8ff;
				}


				/* ── 对话模式选择器：座席长度 +10%（0.1.7-rc.1 增铸）────────────
				   原件（@deepseek-ai/dsh-client-ui-agent-preset 之 AgentPresetSeat）：
				     .<hash>_seat      { …, max-width: min(100%, 240px) }
				     .<hash>_menuAnchor{ min-width: 54px; max-width: 100% }
				     .<hash>_item      { …, max-width: 280px }
				   座席本已按内容自适应，长度受此封顶所限，故长模式名会被 _seatLabel
				   的 text-overflow:ellipsis 截断。此处按大贤者谕令增铸 10%：
				     240px → 264px（座席，展开前的可视长度）
				     280px → 308px（选项条目，长简介不再被压折）
				   仅调整长度上限，不动字号、内边距与省略号机制——
				   极长名称仍以省略号收束，不会撑破排版。
				   注：类名哈希由构建生成，故以 [class*="_seat"] 作锚，
				   并限定为不承载其它 seatLabel 的直系座席，避免波及旁支组件。
				──────────────────────────────────────────────────────────── */
				[class*="_seat"]:has(> [class*="_seatLabel"]) {
					max-width: min(100%, 264px) !important;
				}
				[class*="_menuAnchor"]:has(> [class*="_seat"]) {
					max-width: 100% !important;
				}
				[class*="_item"]:has(> [class*="_itemName"]) {
					max-width: 308px !important;
				}

				/* hero 标题区：grid → flex 纵向居中（不依赖哈希前缀） */
				[class*="headline"]:has([class*="fishHitbox"]) {
					display: flex !important;
					flex-direction: column !important;
					align-items: center !important;
					justify-content: center !important;
					gap: 12px !important;
					column-gap: 0 !important;
				}
				[class*="headline"]:has([class*="fishHitbox"]) [class*="fishHitbox"] {
					order: -1 !important;
					width: auto !important;
					height: auto !important;
					display: flex !important;
					align-items: center !important;
					justify-content: center !important;
					margin: 0 auto !important;
				}
				[class*="headline"]:has([class*="fishHitbox"]) [class*="previewBadge"] {
					order: 1 !important;
				}
				/* 隐匿「预览版」圣印：遵机神谕令，隐去官方预览徽章 */
				[class*="previewBadge"] {
					display: none !important;
				}
				/* 圣徽为图腾非游鱼：熄灭 hover 摇动动画 */
				[class*="headline"]:has([class*="fishHitbox"]) [class*="fishHitbox"]:hover [class*="fish"] {
					animation: none !important;
				}
				[class*="headline"]:has([class*="fishHitbox"]) [class*="fishHitbox"] [class*="fish"] {
					animation: none !important;
				}
				


				/* ── 分栏分割线：产品默认 width:0，只在 hover 时露 1px 细线 ── */
				/* 改成常驻可见的蓝色竖线，并把抓取热区加宽，方便左右拖动 */
				[class*="_splitRow_"] > [class*="_divider_"] {
					position: relative;
					z-index: 2;
				}
				
				[class*="_splitRow_"] > [class*="_divider_"]::before {
					content: '';
					position: absolute;
					top: 0;
					bottom: 0;
					left: -1px;
					width: 2px;
					background: linear-gradient(to bottom, rgba(120, 170, 255, 0.18), rgba(185, 218, 255, 0.85) 50%, rgba(120, 170, 255, 0.18));
					box-shadow: 0 0 9px rgba(90, 150, 255, 0.65);
					pointer-events: none;
				}
				
				/* 抓取热区：由 ±4px 加宽到 ±7px */
				[class*="_splitRow_"] > [class*="_divider_"]::after {
					inset: 0 -7px;
					opacity: 1;
					background: none;
					cursor: col-resize;
				}
				
				[class*="_splitRow_"] > [class*="_divider_"]:hover::before,
				[class*="_splitRow_"] > [class*="_divider_"]:active::before {
					left: -2px;
					width: 4px;
					background: rgba(215, 240, 255, 0.95);
					box-shadow: 0 0 14px rgba(130, 185, 255, 0.9);
				}
								/* ── 固定定位的分割线指示（不参与命中，只做视觉提示） ── */
				#skill-sky-splitline {
					position: fixed;
					top: 0;
					bottom: 0;
					width: 8px;
					margin-left: -4px;
					display: none;
					pointer-events: none;
					z-index: 2147483644;
					opacity: 0;
					transition: opacity 150ms ease;
					background-image:
						linear-gradient(to bottom, rgba(160, 205, 255, 0.16), rgba(230, 245, 255, 0.75) 50%, rgba(160, 205, 255, 0.16)),
						radial-gradient(circle 2.4px at 50% 5px, rgba(255, 255, 255, 1), transparent 70%),
						radial-gradient(circle 1.8px at 22% 11px, rgba(240, 250, 255, 0.97), transparent 70%),
						radial-gradient(circle 2.2px at 76% 16px, rgba(255, 255, 255, 1), transparent 70%),
						radial-gradient(circle 1.5px at 34% 21px, rgba(220, 240, 255, 0.95), transparent 70%),
						radial-gradient(circle 2.0px at 66% 27px, rgba(255, 255, 255, 1), transparent 70%);
					background-size: 100% 100%, 100% 24px, 100% 24px, 100% 24px, 100% 24px, 100% 24px;
					background-repeat: no-repeat, repeat-y, repeat-y, repeat-y, repeat-y, repeat-y;
					filter: drop-shadow(0 0 5px rgba(190, 225, 255, 1)) drop-shadow(0 0 14px rgba(120, 180, 255, 0.9));
				}
				#skill-sky-splitline.is-near {
					opacity: 1;
				}
				/* ── 软糖果五角星 ── */
				.skill-sky-star {
					overflow: visible;
					filter: brightness(1.4) saturate(1.3)
						drop-shadow(0 0 3px #ffffff)
						drop-shadow(0 0 11px rgba(255, 255, 255, 1))
						drop-shadow(0 0 26px rgba(195, 228, 255, 1))
						drop-shadow(0 0 58px rgba(125, 178, 255, 1))
						drop-shadow(0 0 118px rgba(72, 132, 255, 0.9));
					transition: transform 200ms cubic-bezier(.34, 1.56, .64, 1);
				}
				.skill-sky-star-halo {
					animation: skillSkyHalo 2.6s ease-in-out infinite;
				}
				@keyframes skillSkyHalo {
					0%, 100% { opacity: 0.85; transform: scale(0.95); }
					50% { opacity: 1; transform: scale(1.1); }
				}
				.skill-sky-brand:hover .skill-sky-star {
					transform: scale(1.12) rotate(-6deg);
				}
				.skill-sky-brand:hover .skill-sky-star {
					transform: scale(1.12) rotate(-6deg);
				}
				/* ── 品牌图标：纯白高光 + 创意英文字 ── */
				img.skill-sky-mark-img {
					filter: brightness(0) invert(1)
						drop-shadow(0 0 5px rgba(235, 246, 255, 0.95))
						drop-shadow(0 0 14px rgba(150, 200, 255, 0.9))
						drop-shadow(0 0 32px rgba(80, 140, 255, 0.6));
					opacity: 1;
				}
				.skill-sky-brand {
					display: inline-flex;
					align-items: center;
					gap: 9px;
					min-width: 0;
					max-width: 100%;
					overflow: hidden;
				}
				.skill-sky-wordmark {
					display: inline-flex;
					align-items: baseline;
					gap: 5px;
					white-space: nowrap;
					overflow: hidden;
					line-height: 1;
				}
				.skill-sky-wordmark-sky {
					font-family: 'Segoe UI', system-ui, sans-serif;
					font-size: 19px;
					font-weight: 900;
					font-style: italic;
					letter-spacing: 2.5px;
					background: linear-gradient(180deg, #ffffff 0%, #dcecff 45%, #7fb6ff 100%);
					-webkit-background-clip: text;
					background-clip: text;
					color: transparent;
					filter: drop-shadow(0 0 6px rgba(190, 225, 255, 0.95)) drop-shadow(0 0 18px rgba(90, 150, 255, 0.8));
				}
				.skill-sky-wordmark-sep {
					font-size: 12px;
					font-weight: 700;
					color: rgba(150, 200, 255, 0.55);
					letter-spacing: 0;
				}
				.skill-sky-wordmark-sub {
					font-size: 9.5px;
					font-weight: 700;
					letter-spacing: 1.6px;
					color: rgba(215, 236, 255, 0.85);
					text-shadow: 0 0 8px rgba(130, 185, 255, 0.7);
				}
				.skill-sky-wordmark-hero .skill-sky-wordmark-sky { font-size: 30px; letter-spacing: 4px; }
				.skill-sky-wordmark-hero .skill-sky-wordmark-sub { font-size: 11px; letter-spacing: 2.4px; }
				.skill-sky-wordmark-sidebar .skill-sky-wordmark-sub { display: none; }
				.skill-sky-wordmark-sidebar .skill-sky-wordmark-sep { display: none; }
				/* ── 全局默认文字统一：同字重 / 同色温 / 同辉光，字号保持原样 ── */
				body :where(span, p, label, button, a, li, dt, dd, summary):not(pre *) {
					font-weight: 550;
					letter-spacing: 0.1px;
				}
				body :where(button, [role="button"], [role="tab"], summary) {
					font-weight: 600 !important;
					letter-spacing: 0.25px;
				}
				/* 代码块与行内代码保持原样，不参与统一 */
				body :where(pre, code, pre *, code *, [class*="markdown"] code) {
					font-weight: inherit;
					text-shadow: none !important;
				}
				/* ── 输入框：亮白描边 + 三层辉光 + 玻璃高光 ── */
				.skill-sky-composer {
					border: 4px solid rgba(238, 248, 255, 1) !important;
					border-radius: 18px !important;
					background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.085), rgba(255, 255, 255, 0.015)) !important;
					box-shadow:
						inset 0 1px 0 rgba(255, 255, 255, 0.55),
						inset 0 0 22px rgba(150, 200, 255, 0.16),
						0 0 22px rgba(220, 240, 255, 1),
						0 0 54px rgba(135, 185, 255, 0.8),
						0 0 120px rgba(75, 140, 255, 0.45) !important;
					transition: box-shadow 220ms ease, border-color 220ms ease;
				}
				.skill-sky-composer:focus-within {
					border-color: #ffffff !important;
					box-shadow:
						inset 0 1px 0 rgba(255, 255, 255, 0.75),
						inset 0 0 26px rgba(180, 215, 255, 0.22),
						0 0 16px rgba(210, 235, 255, 0.95),
						0 0 48px rgba(120, 175, 255, 0.7),
						0 0 110px rgba(70, 130, 255, 0.42) !important;
				}
				/* 顶着一条亮白高光线，像玻璃反光 */
				.skill-sky-composer-shell {
					position: relative !important;
				}
				.skill-sky-composer-shell::after {
					content: '';
					position: absolute;
					left: 14%;
					right: 14%;
					top: 0;
					height: 1.5px;
					border-radius: 2px;
					pointer-events: none;
					background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.95) 22%, rgba(220, 240, 255, 0.9) 50%, rgba(255, 255, 255, 0.95) 78%, transparent);
					box-shadow: 0 0 8px rgba(200, 230, 255, 0.9), 0 0 20px rgba(120, 175, 255, 0.6);
				}
				/* ── 输入框占位文字：更淡、去掉全局辉光 ── */
				textarea::placeholder,
				input::placeholder {
					color: rgba(138, 178, 228, 0.38) !important;
					opacity: 1 !important;
					-webkit-text-fill-color: rgba(138, 178, 228, 0.38) !important;
					text-shadow: none !important;
					font-weight: 400 !important;
				}
				/* 部分组件用独立元素画占位，同样压暗 */
				[class*="placeholder" i]:not([class*="wrapper" i]):not([class*="container" i]) {
					color: rgba(138, 178, 228, 0.38) !important;
					text-shadow: none !important;
					font-weight: 400 !important;
				}
				[contenteditable]::before,
				[data-placeholder]::before,
				[data-placeholder]::after {
					color: rgba(138, 178, 228, 0.38) !important;
					text-shadow: none !important;
				}
				/* ── 侧栏与顶部标签文字：靠文本内容匹配，不依赖产品类名 ── */
				.skill-sky-side {
					display: inline-block;
					font-size: 15.5px !important;
					font-weight: 600 !important;
					color: #eef7ff !important;
					letter-spacing: 0.2px;
					line-height: 1.45 !important;
					text-shadow: 0 0 10px rgba(140, 195, 255, 0.6), 0 0 2px rgba(240, 250, 255, 0.75);
					transition: transform 180ms cubic-bezier(.34, 1.56, .64, 1);
					transform-origin: left center;
				}
				.skill-sky-row {
					transition: transform 180ms cubic-bezier(.34, 1.56, .64, 1), background-color 180ms ease;
					transform-origin: left center;
					border-radius: 9px;
				}
				.skill-sky-row:hover {
					transform: translateX(2px) scale(1.03);
				}
				.skill-sky-row:hover .skill-sky-side {
					transform: scale(1.045);
					color: #ffffff !important;
				}
				.skill-sky-row:active {
					transform: translateX(1px) scale(0.985);
				}
				.skill-sky-tab {
					display: inline-block;
					font-size: 15px !important;
					font-weight: 650 !important;
					color: #eef7ff !important;
					letter-spacing: 0.3px;
					text-shadow: 0 0 10px rgba(140, 195, 255, 0.6), 0 0 2px rgba(240, 250, 255, 0.75);
					transition: transform 180ms cubic-bezier(.34, 1.56, .64, 1);
					transform-origin: center bottom;
				}
				.skill-sky-tab:hover {
					transform: scale(1.07);
					color: #ffffff !important;
				}
				/* ── 侧栏时钟 ── */
				#skill-sky-clock {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					gap: 4px;
					width: 100%;
					box-sizing: border-box;
					padding: 10px 16px 8px;
					margin: 0;
					user-select: none;
					-webkit-user-select: none;
					pointer-events: none;
				}
				#skill-sky-clock canvas {
					display: block;
					width: 100%;
					max-width: 100%;
					height: auto;
					aspect-ratio: 1 / 1;
					margin: 0;
					padding: 0;
				}
				#skill-sky-clock canvas.skill-sky-digital {
					display: block;
					width: 100%;
					max-width: 100%;
					height: auto;
					aspect-ratio: 30 / 9;
					margin: 0;
				}
				#skill-sky-clock.skill-sky-floating {
					position: fixed;
					left: 16px;
					bottom: 104px;
					width: 188px;
					z-index: 2147483646;
					padding: 10px 0 8px;
					margin: 0;
				}
				/* ── 整体字号放大：产品所有字号都由 --dsh-content-font-size 派生 ── */
				html, body {
					--dsh-content-font-size: 16px !important;
					--dsh-code-font-size: 14.5px !important;
				}
				/* ── 流星：一颗斜掠而过的流星 ── */
								/* ── 流星：外层负责随机落点与远近缩放，内层跑固定抛物线 ── */
				
				
				/* ── 四芒星：分三组各自忽明忽暗，相位错开 ── */
				
				/* ── 会呼吸的星点：八组各用不同周期，组内星点大小与亮度固定 ── */
				#skill-sky-twinkle-0, #skill-sky-twinkle-1, #skill-sky-twinkle-2, #skill-sky-twinkle-3,
				#skill-sky-twinkle-4, #skill-sky-twinkle-5, #skill-sky-twinkle-6, #skill-sky-twinkle-7 {
					position: fixed;
					inset: 0;
					pointer-events: none;
					z-index: 2147483646;
					mix-blend-mode: screen;
					background-repeat: no-repeat;
				}
				#skill-sky-twinkle-0 {
					background: radial-gradient(3.2px at 315px 324px, rgba(140, 180, 255, 0.42), rgba(140, 180, 255, 0.13) 26%, transparent) 0 0 / 180px 180px repeat,
						radial-gradient(5.77px at 329px 161px, rgba(205, 232, 255, 0.29), rgba(205, 232, 255, 0.09) 26%, transparent) 0 0 / 240px 240px repeat,
						radial-gradient(5.28px at 109px 378px, rgba(205, 232, 255, 0.25), rgba(205, 232, 255, 0.08) 26%, transparent) 0 0 / 300px 300px repeat,
						radial-gradient(4.16px at 288px 397px, rgba(170, 208, 255, 0.43), rgba(170, 208, 255, 0.14) 26%, transparent) 0 0 / 210px 210px repeat;
					animation: skillSkyStarTwinkle 2.2s ease-in-out infinite;
					animation-delay: -0.4s;
				}
				#skill-sky-twinkle-1 {
					background: radial-gradient(5.36px at 159px 187px, rgba(205, 232, 255, 0.22), rgba(205, 232, 255, 0.07) 26%, transparent) 0 0 / 210px 210px repeat,
						radial-gradient(7.2px at 295px 257px, rgba(225, 242, 255, 0.92), rgba(150, 195, 255, 0.36) 30%, transparent) 0 0 / 300px 300px repeat,
						radial-gradient(3.9px at 261px 193px, rgba(170, 208, 255, 0.52), rgba(170, 208, 255, 0.17) 26%, transparent) 0 0 / 210px 210px repeat,
						radial-gradient(4.65px at 262px 256px, rgba(170, 208, 255, 0.38), rgba(170, 208, 255, 0.12) 26%, transparent) 0 0 / 180px 180px repeat;
					animation: skillSkyStarTwinkle 2.9s ease-in-out infinite;
					animation-delay: -1.7s;
				}
				#skill-sky-twinkle-2 {
					background: radial-gradient(5.07px at 363px 168px, rgba(205, 232, 255, 0.51), rgba(205, 232, 255, 0.16) 26%, transparent) 0 0 / 180px 180px repeat,
						radial-gradient(5.69px at 161px 309px, rgba(205, 232, 255, 0.55), rgba(205, 232, 255, 0.18) 26%, transparent) 0 0 / 240px 240px repeat,
						radial-gradient(5.46px at 22px 290px, rgba(205, 232, 255, 0.19), rgba(205, 232, 255, 0.06) 26%, transparent) 0 0 / 360px 360px repeat,
						radial-gradient(3.2px at 398px 103px, rgba(140, 180, 255, 0.32), rgba(140, 180, 255, 0.10) 26%, transparent) 0 0 / 330px 330px repeat;
					animation: skillSkyStarTwinkle 3.6s ease-in-out infinite;
					animation-delay: -2.6s;
				}
				#skill-sky-twinkle-3 {
					background: radial-gradient(4.45px at 186px 83px, rgba(170, 208, 255, 0.43), rgba(170, 208, 255, 0.14) 26%, transparent) 0 0 / 330px 330px repeat,
						radial-gradient(4.32px at 371px 281px, rgba(170, 208, 255, 0.19), rgba(170, 208, 255, 0.06) 26%, transparent) 0 0 / 240px 240px repeat,
						radial-gradient(3.28px at 357px 307px, rgba(170, 208, 255, 0.63), rgba(170, 208, 255, 0.20) 26%, transparent) 0 0 / 210px 210px repeat,
						radial-gradient(3.2px at 151px 301px, rgba(170, 208, 255, 0.51), rgba(170, 208, 255, 0.16) 26%, transparent) 0 0 / 300px 300px repeat;
					animation: skillSkyStarTwinkle 4.3s ease-in-out infinite;
					animation-delay: -3.9s;
				}
				#skill-sky-twinkle-4 {
					background: radial-gradient(5.23px at 22px 390px, rgba(205, 232, 255, 0.74), rgba(205, 232, 255, 0.24) 26%, transparent) 0 0 / 270px 270px repeat,
						radial-gradient(4.71px at 61px 286px, rgba(170, 208, 255, 0.52), rgba(170, 208, 255, 0.17) 26%, transparent) 0 0 / 400px 400px repeat,
						radial-gradient(3.72px at 305px 192px, rgba(170, 208, 255, 0.34), rgba(170, 208, 255, 0.11) 26%, transparent) 0 0 / 240px 240px repeat,
						radial-gradient(3.2px at 11px 125px, rgba(140, 180, 255, 0.55), rgba(140, 180, 255, 0.18) 26%, transparent) 0 0 / 240px 240px repeat;
					animation: skillSkyStarTwinkle 5.1s ease-in-out infinite;
					animation-delay: -1.1s;
				}
				#skill-sky-twinkle-5 {
					background: radial-gradient(5.8px at 145px 115px, rgba(205, 232, 255, 0.33), rgba(205, 232, 255, 0.10) 26%, transparent) 0 0 / 360px 360px repeat,
						radial-gradient(4.42px at 257px 311px, rgba(170, 208, 255, 0.37), rgba(170, 208, 255, 0.12) 26%, transparent) 0 0 / 270px 270px repeat,
						radial-gradient(3.2px at 81px 92px, rgba(170, 208, 255, 0.71), rgba(170, 208, 255, 0.23) 26%, transparent) 0 0 / 300px 300px repeat,
						radial-gradient(4.76px at 281px 316px, rgba(170, 208, 255, 0.57), rgba(170, 208, 255, 0.18) 26%, transparent) 0 0 / 300px 300px repeat;
					animation: skillSkyStarTwinkle 5.9s ease-in-out infinite;
					animation-delay: -4.8s;
				}
				#skill-sky-twinkle-6 {
					background: radial-gradient(3.2px at 82px 180px, rgba(170, 208, 255, 0.22), rgba(170, 208, 255, 0.07) 26%, transparent) 0 0 / 400px 400px repeat,
						radial-gradient(3.2px at 10px 151px, rgba(140, 180, 255, 0.31), rgba(140, 180, 255, 0.10) 26%, transparent) 0 0 / 360px 360px repeat,
						radial-gradient(7.2px at 186px 133px, rgba(225, 242, 255, 0.92), rgba(150, 195, 255, 0.36) 30%, transparent) 0 0 / 380px 380px repeat,
						radial-gradient(4.47px at 271px 324px, rgba(170, 208, 255, 0.61), rgba(170, 208, 255, 0.19) 26%, transparent) 0 0 / 270px 270px repeat;
					animation: skillSkyStarTwinkle 6.8s ease-in-out infinite;
					animation-delay: -5.6s;
				}
				#skill-sky-twinkle-7 {
					background: radial-gradient(4.78px at 139px 128px, rgba(170, 208, 255, 0.60), rgba(170, 208, 255, 0.19) 26%, transparent) 0 0 / 240px 240px repeat,
						radial-gradient(5.04px at 76px 138px, rgba(205, 232, 255, 0.30), rgba(205, 232, 255, 0.09) 26%, transparent) 0 0 / 270px 270px repeat,
						radial-gradient(3.35px at 208px 39px, rgba(170, 208, 255, 0.63), rgba(170, 208, 255, 0.20) 26%, transparent) 0 0 / 360px 360px repeat,
						radial-gradient(3.2px at 264px 279px, rgba(140, 180, 255, 0.19), rgba(140, 180, 255, 0.06) 26%, transparent) 0 0 / 400px 400px repeat;
					animation: skillSkyStarTwinkle 7.7s ease-in-out infinite;
					animation-delay: -6.3s;
				}
				@keyframes skillSkyStarTwinkle {
					0%, 100% { opacity: 0.18; }
					50% { opacity: 1; }
				}
				/* ── 六颗四芒星：各自独立节点，闪烁频率 / 光晕大小全部随机 ── */
				#skill-sky-flares-0, #skill-sky-flares-1, #skill-sky-flares-2,
				#skill-sky-flares-3, #skill-sky-flares-4, #skill-sky-flares-5 {
					position: fixed;
					inset: 0;
					pointer-events: none;
					z-index: 2147483646;
					mix-blend-mode: screen;
					background-repeat: no-repeat;
				}
				#skill-sky-flares-0 {
					background: radial-gradient(circle 23px at 72% 36%, rgba(178, 214, 255, 0.282), rgba(90, 140, 255, 0.07) 55%, transparent 82%),
						radial-gradient(1.9px at 72% 36%, rgba(255, 255, 255, 1), rgba(200, 228, 255, 0.62) 46%, transparent 82%),
						radial-gradient(circle 86px at 72% 36%, rgba(150, 195, 255, 0.093), rgba(90, 140, 255, 0.02) 58%, transparent 86%),
						radial-gradient(ellipse 22px 1.3px at 72% 36%, rgba(235, 245, 255, 0.683), transparent 78%),
						radial-gradient(ellipse 1.3px 22px at 72% 36%, rgba(235, 245, 255, 0.683), transparent 78%);
					animation: skillSkyTwinkle 5.0s ease-in-out infinite;
					animation-delay: -0.66s;
				}
				#skill-sky-flares-1 {
					background: radial-gradient(circle 11px at 48% 74%, rgba(178, 214, 255, 0.306), rgba(90, 140, 255, 0.07) 55%, transparent 82%),
						radial-gradient(1.9px at 48% 74%, rgba(255, 255, 255, 1), rgba(200, 228, 255, 0.62) 46%, transparent 82%),
						radial-gradient(circle 32px at 48% 74%, rgba(150, 195, 255, 0.062), rgba(90, 140, 255, 0.02) 58%, transparent 86%),
						radial-gradient(ellipse 29px 1.3px at 48% 74%, rgba(235, 245, 255, 0.557), transparent 78%),
						radial-gradient(ellipse 1.3px 29px at 48% 74%, rgba(235, 245, 255, 0.557), transparent 78%);
					animation: skillSkyTwinkle 2.4s ease-in-out infinite;
					animation-delay: -3.68s;
				}
				#skill-sky-flares-2 {
					background: radial-gradient(circle 26px at 42% 12%, rgba(178, 214, 255, 0.334), rgba(90, 140, 255, 0.07) 55%, transparent 82%),
						radial-gradient(1.9px at 42% 12%, rgba(255, 255, 255, 1), rgba(200, 228, 255, 0.62) 46%, transparent 82%),
						radial-gradient(circle 42px at 42% 12%, rgba(150, 195, 255, 0.048), rgba(90, 140, 255, 0.02) 58%, transparent 86%),
						radial-gradient(ellipse 16px 1.3px at 42% 12%, rgba(235, 245, 255, 0.793), transparent 78%),
						radial-gradient(ellipse 1.3px 16px at 42% 12%, rgba(235, 245, 255, 0.793), transparent 78%);
					animation: skillSkyTwinkle 4.31s ease-in-out infinite;
					animation-delay: -5.22s;
				}
				#skill-sky-flares-3 {
					background: radial-gradient(circle 11px at 51% 32%, rgba(178, 214, 255, 0.396), rgba(90, 140, 255, 0.07) 55%, transparent 82%),
						radial-gradient(1.9px at 51% 32%, rgba(255, 255, 255, 1), rgba(200, 228, 255, 0.62) 46%, transparent 82%),
						radial-gradient(circle 83px at 51% 32%, rgba(150, 195, 255, 0.083), rgba(90, 140, 255, 0.02) 58%, transparent 86%),
						radial-gradient(ellipse 17px 1.3px at 51% 32%, rgba(235, 245, 255, 0.67), transparent 78%),
						radial-gradient(ellipse 1.3px 17px at 51% 32%, rgba(235, 245, 255, 0.67), transparent 78%);
					animation: skillSkyTwinkle 2.85s ease-in-out infinite;
					animation-delay: -5.18s;
				}
				#skill-sky-flares-4 {
					background: radial-gradient(circle 24px at 25% 77%, rgba(178, 214, 255, 0.379), rgba(90, 140, 255, 0.07) 55%, transparent 82%),
						radial-gradient(1.9px at 25% 77%, rgba(255, 255, 255, 1), rgba(200, 228, 255, 0.62) 46%, transparent 82%),
						radial-gradient(circle 59px at 25% 77%, rgba(150, 195, 255, 0.088), rgba(90, 140, 255, 0.02) 58%, transparent 86%),
						radial-gradient(ellipse 36px 1.3px at 25% 77%, rgba(235, 245, 255, 0.775), transparent 78%),
						radial-gradient(ellipse 1.3px 36px at 25% 77%, rgba(235, 245, 255, 0.775), transparent 78%);
					animation: skillSkyTwinkle 4.39s ease-in-out infinite;
					animation-delay: -1.0s;
				}
				#skill-sky-flares-5 {
					background: radial-gradient(circle 22px at 56% 51%, rgba(178, 214, 255, 0.305), rgba(90, 140, 255, 0.07) 55%, transparent 82%),
						radial-gradient(1.9px at 56% 51%, rgba(255, 255, 255, 1), rgba(200, 228, 255, 0.62) 46%, transparent 82%),
						radial-gradient(circle 52px at 56% 51%, rgba(150, 195, 255, 0.092), rgba(90, 140, 255, 0.02) 58%, transparent 86%),
						radial-gradient(ellipse 19px 1.3px at 56% 51%, rgba(235, 245, 255, 0.817), transparent 78%),
						radial-gradient(ellipse 1.3px 19px at 56% 51%, rgba(235, 245, 255, 0.817), transparent 78%);
					animation: skillSkyTwinkle 4.37s ease-in-out infinite;
					animation-delay: -4.02s;
				}
				@keyframes skillSkyTwinkle {
					0%, 100% { opacity: 0.12; }
					50% { opacity: 1; }
				}
				`), 'skill-sky: styles');


				// ── 四芒星节点：六颗各自独立的节点，便于各闪各的 ──

				ctx.effect(() => {

					if (typeof document === 'undefined') return () => {};

					const nodes = [0, 1, 2, 3, 4, 5].map((i) => {

						const el = document.createElement('div');

						el.id = 'skill-sky-flares-' + i;

						el.setAttribute('aria-hidden', 'true');

						(document.body || document.documentElement).appendChild(el);

						return el;

					});

					return () => { nodes.forEach((el) => { if (el.parentNode) el.parentNode.removeChild(el); }); };

				}, 'skill-sky: flares');


				// ── 会闪烁的星点：八组独立节点，各用不同周期 ──

				ctx.effect(() => {

					if (typeof document === 'undefined') return () => {};

					const nodes = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {

						const el = document.createElement('div');

						el.id = 'skill-sky-twinkle-' + i;

						el.setAttribute('aria-hidden', 'true');

						(document.body || document.documentElement).appendChild(el);

						return el;

					});

					return () => { nodes.forEach((el) => { if (el.parentNode) el.parentNode.removeChild(el); }); };

				}, 'skill-sky: twinkle');

								

				// ── 侧栏时钟：插在侧栏页脚最上方（账户行之上） ──
				ctx.effect(() => {
					if (typeof document === 'undefined') return () => {};
					const CLOCK_ID = 'skill-sky-clock';
					let raf = 0, findTimer = 0, canvas = null, g2 = null, digital = null;

					// 只取「可见」的页脚：页脚类名会同时出现在隐藏的右键菜单里
					const pickHost = () => {
						const nodes = document.querySelectorAll('[class*="_footer_4ub78"]');
						let best = null;
						for (let i = 0; i < nodes.length; i++) {
							const r = nodes[i].getBoundingClientRect();
							if (r.width > 60 && r.height > 8) { best = nodes[i]; break; }
						}
						return best;
					};

					const ensure = () => {
						let el = document.getElementById(CLOCK_ID);
						if (el === null) {
							el = document.createElement('div');
							el.id = CLOCK_ID;
							el.setAttribute('aria-hidden', 'true');
							const cv = document.createElement('canvas');
							cv.width = 176; cv.height = 176;
							el.appendChild(cv);
							canvas = cv;
							g2 = cv.getContext('2d');
							const dv = document.createElement('canvas');
							dv.className = 'skill-sky-digital';
							dv.width = 300; dv.height = 96;
							el.appendChild(dv);
							digital = dv;
						}
							// 量出左侧那一列的实际宽度：从左侧边缘取一个点，向上找到贯穿大半屏的容器
							const measureSidebar = () => {
								const vh = window.innerHeight;
								const probe = document.elementFromPoint(6, Math.round(vh * 0.5));
								let n = probe;
								while (n !== null && n !== document.body) {
									const r = n.getBoundingClientRect();
									if (r.width > 120 && r.height > vh * 0.35) return r.width;
									n = n.parentElement;
								}
								return 0;
							};

							const host = pickHost();
							if (host !== null) {
								el.classList.remove('skill-sky-floating');
								el.style.width = '';
								if (el.parentNode !== host) host.insertBefore(el, host.firstChild);
							} else {
								el.classList.add('skill-sky-floating');
								const sideW = measureSidebar();
								el.style.width = (sideW > 140 ? Math.round(sideW - 32) : 188) + 'px';
								if (el.parentNode !== document.body) document.body.appendChild(el);
							}
						if (canvas === null) { canvas = el.querySelector('canvas'); g2 = canvas ? canvas.getContext('2d') : null; }
						return true;
					};

															// ── 七段数码管式的数字时间 ──
					const SEG_MAP = {
						'0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc',
						'5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg'
					};

					const drawDigital = (cv, now) => {
						if (cv === null) return;
						const dpr = Math.min(window.devicePixelRatio || 1, 2);
						const cssW = cv.clientWidth || 150;
						const cssH = cv.clientHeight || Math.round(cssW * 0.30);
						const px = Math.max(48, Math.round(cssW * dpr));
						const py = Math.max(20, Math.round(cssH * dpr));
						if (cv.width !== px) { cv.width = px; cv.height = py; }
						const g = cv.getContext('2d');
						g.setTransform(1, 0, 0, 1, 0, 0);
						g.clearRect(0, 0, px, py);

						const txt = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
						const chars = txt.split('');
						const gap = px * 0.035;
						const colonW = px * 0.052;
						const digitW = (px - colonW - gap * 4) / 4;
						const digitH = py * 0.80;
						const top = py * 0.10;
						const t = Math.max(1.4 * dpr, digitW * 0.155);

						const seg = (x, y, w, h) => {
							g.beginPath();
							g.roundRect(x, y, w, h, Math.min(w, h) / 2);
							g.fill();
						};

						let x = 0;
						for (let ci = 0; ci < chars.length; ci++) {
							const ch = chars[ci];
							if (ch === ':') {
								// 冒号呼吸：两秒一个完整周期，正弦渐亮渐暗
								const tsec = now.getSeconds() + now.getMilliseconds() / 1000;
								const pulse = 0.5 - 0.5 * Math.cos(tsec * Math.PI);
								const colonAlpha = 0.18 + 0.78 * pulse;
								const dotR = t * 0.62 * (0.82 + 0.18 * pulse);
									g.fillStyle = 'rgba(210, 235, 255, ' + colonAlpha.toFixed(3) + ')';
									g.shadowColor = 'rgba(140, 195, 255, ' + colonAlpha.toFixed(3) + ')';
									g.shadowBlur = t * (0.6 + 1.7 * pulse);
									for (let k = 0; k < 2; k++) {
										g.beginPath();
										g.arc(x + colonW / 2, top + digitH * (k === 0 ? 0.34 : 0.66), dotR, 0, Math.PI * 2);
										g.fill();
									}
									g.shadowBlur = 0;
								x += colonW + gap;
								continue;
							}

							const on = SEG_MAP[ch] || '';
							const parts = {
								a: [x + t * 0.55, top, digitW - t * 1.1, t],
								g: [x + t * 0.55, top + (digitH - t) / 2, digitW - t * 1.1, t],
								d: [x + t * 0.55, top + digitH - t, digitW - t * 1.1, t],
								f: [x, top + t * 0.55, t, (digitH - t) / 2],
								b: [x + digitW - t, top + t * 0.55, t, (digitH - t) / 2],
								e: [x, top + digitH / 2, t, (digitH - t) / 2],
								c: [x + digitW - t, top + digitH / 2, t, (digitH - t) / 2]
							};

							for (const k of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
								const active = on.indexOf(k) >= 0;
								g.fillStyle = active ? 'rgba(212, 236, 255, 0.96)' : 'rgba(80, 130, 220, 0.10)';
								if (active) {
									g.shadowColor = 'rgba(140, 195, 255, 0.95)';
									g.shadowBlur = t * 1.5;
								} else {
									g.shadowBlur = 0;
								}
								const p = parts[k];
								seg(p[0], p[1], p[2], p[3]);
							}
							g.shadowBlur = 0;
							x += digitW + gap;
						}
					};
					// 画布尺寸跟随容器宽度；所有几何按半径比例计算，任意大小都不失真
					const draw = () => {
						if (g2 === null || canvas === null) return;
						const cssW = canvas.clientWidth || canvas.offsetWidth || 160;
						const dpr = Math.min(window.devicePixelRatio || 1, 2);
						const px = Math.max(64, Math.round(cssW * dpr));
						if (canvas.width !== px) { canvas.width = px; canvas.height = px; }

						const now = new Date();
						const S = canvas.width;
						const R = S / 2;
						const sec = now.getSeconds() + now.getMilliseconds() / 1000;
						const min = now.getMinutes() + sec / 60;
						const hr = (now.getHours() % 12) + min / 60;
						const g = g2;
	g.setTransform(1, 0, 0, 1, 0, 0);
						g.clearRect(0, 0, S, S);

						const RING_IN = R * 0.057;
						// 表盘底：淡蓝薄雾
						g.beginPath();
						g.arc(R, R, R - RING_IN, 0, Math.PI * 2);
						g.fillStyle = 'rgba(90, 140, 255, 0.07)';
						g.fill();

						// 外圈：近白色玻璃描边 + 强辉光
						g.beginPath();
						g.arc(R, R, R - RING_IN, 0, Math.PI * 2);
						// 环身：不规则蓝白晕染（角向渐变，亮度不变）
						const ringGrad = g.createConicGradient(Math.PI * 1.05, R, R);
						ringGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.98)');
						ringGrad.addColorStop(0.07, 'rgba(168, 208, 255, 0.82)');
						ringGrad.addColorStop(0.14, 'rgba(238, 247, 255, 0.95)');
						ringGrad.addColorStop(0.24, 'rgba(150, 196, 255, 0.74)');
						ringGrad.addColorStop(0.33, 'rgba(255, 255, 255, 0.99)');
						ringGrad.addColorStop(0.41, 'rgba(176, 214, 255, 0.8)');
						ringGrad.addColorStop(0.52, 'rgba(246, 251, 255, 0.97)');
						ringGrad.addColorStop(0.6, 'rgba(158, 200, 255, 0.76)');
						ringGrad.addColorStop(0.69, 'rgba(255, 255, 255, 0.98)');
						ringGrad.addColorStop(0.78, 'rgba(172, 210, 255, 0.83)');
						ringGrad.addColorStop(0.88, 'rgba(240, 249, 255, 0.96)');
						ringGrad.addColorStop(0.95, 'rgba(163, 203, 255, 0.79)');
						ringGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.98)');
						g.strokeStyle = ringGrad;
						g.lineWidth = R * 0.062;
						g.shadowColor = 'rgba(150, 205, 255, 1)';
						g.shadowBlur = R * 0.17;
						g.stroke();
						g.shadowBlur = 0;

						// 内圈极细辅助线：玻璃壁的厚度
						g.beginPath();
						g.arc(R, R, R - RING_IN - R * 0.055, 0, Math.PI * 2);
						g.strokeStyle = 'rgba(140, 198, 255, 0.38)';
						g.lineWidth = R * 0.014;
						g.stroke();

						// 高光弧：左上角一段纯白亮弧
						g.beginPath();
						g.arc(R, R, R - RING_IN, Math.PI * 1.10, Math.PI * 1.60);
						g.strokeStyle = 'rgba(255, 255, 255, 0.98)';
						g.lineWidth = R * 0.058;
						g.lineCap = 'round';
						g.shadowColor = 'rgba(255, 255, 255, 1)';
						g.shadowBlur = R * 0.22;
						g.stroke();
						g.shadowBlur = 0;

						// 右下角淡蓝反光，补立体感
						g.beginPath();
						g.arc(R, R, R - RING_IN, Math.PI * 0.10, Math.PI * 0.42);
						g.strokeStyle = 'rgba(170, 215, 255, 0.55)';
						g.lineWidth = R * 0.042;
						g.lineCap = 'round';
						g.stroke();

						// 刻度
						for (let i = 0; i < 12; i++) {
							const a = (i / 12) * Math.PI * 2;
							const big = i % 3 === 0;
							const r1 = R - R * (big ? 0.25 : 0.18);
							const r2 = R - R * 0.114;
							g.beginPath();
							g.moveTo(R + Math.cos(a) * r1, R + Math.sin(a) * r1);
							g.lineTo(R + Math.cos(a) * r2, R + Math.sin(a) * r2);
							g.strokeStyle = big ? 'rgba(240, 250, 255, 0.98)' : 'rgba(165, 208, 255, 0.62)';
							g.lineWidth = R * (big ? 0.041 : 0.025);
							g.lineCap = 'round';
							g.stroke();
						}

						const hand = (angle, len, width, color, blur) => {
							g.beginPath();
							g.moveTo(R - Math.cos(angle) * R * 0.114, R - Math.sin(angle) * R * 0.114);
							g.lineTo(R + Math.cos(angle) * len, R + Math.sin(angle) * len);
							g.strokeStyle = color;
							g.lineWidth = width;
							g.lineCap = 'round';
							g.shadowColor = blur;
							g.shadowBlur = R * 0.102;
							g.stroke();
							g.shadowBlur = 0;
						};

						hand((hr / 12) * Math.PI * 2 - Math.PI / 2, R * 0.386, R * 0.073, 'rgba(190, 214, 255, 0.98)', 'rgba(90, 140, 255, 0.95)');
						hand((min / 60) * Math.PI * 2 - Math.PI / 2, R * 0.568, R * 0.048, 'rgba(228, 240, 255, 0.99)', 'rgba(120, 180, 255, 0.95)');
						hand((sec / 60) * Math.PI * 2 - Math.PI / 2, R * 0.659, R * 0.027, 'rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)');

						// 中心轴
						g.beginPath();
						g.arc(R, R, R * 0.057, 0, Math.PI * 2);
						g.fillStyle = 'rgba(255, 255, 255, 0.98)';
						g.shadowColor = 'rgba(210, 235, 255, 1)';
						g.shadowBlur = R * 0.159;
						g.fill();
						g.shadowBlur = 0;

						drawDigital(digital, now);
					};

					// 分割线指示：用固定定位元素贴着侧栏右边界画，绕开产品内部的 DOM 结构
					let nearLine = false;
					let tagged = null;
					let sideEl = null;
					const onPointerMove = (e) => {
						const sl = document.getElementById('skill-sky-splitline');
						if (sl === null) return;
						const x = parseFloat(sl.style.left || '0');
						nearLine = Math.abs(e.clientX - x) < 16;
					};
					document.addEventListener('pointermove', onPointerMove, { passive: true });
					const updateSplit = () => {
						let sl = document.getElementById('skill-sky-splitline');
						if (sl === null) {
							sl = document.createElement('div');
							sl.id = 'skill-sky-splitline';
							sl.setAttribute('aria-hidden', 'true');
							(document.body || document.documentElement).appendChild(sl);
						}
						const vh = window.innerHeight;
						const probe = document.elementFromPoint(6, Math.round(vh * 0.5));
						let n = probe;
						let rect = null;
						while (n !== null && n !== document.body) {
							const r = n.getBoundingClientRect();
							if (r.width > 120 && r.height > vh * 0.35) { rect = r; sideEl = n; break; }
							n = n.parentElement;
						}
						if (rect === null || rect.right < 80 || rect.right > window.innerWidth - 120) {
							sl.style.display = 'none';
							return;
						}
						sl.style.display = 'block';
						sl.style.left = Math.round(rect.right) + 'px';
						if (sideEl !== null) {
							if (tagged !== sideEl) {
								if (tagged !== null) tagged.classList.remove('skill-sky-sidebar');
								sideEl.classList.add('skill-sky-sidebar');
								tagged = sideEl;
							}
						}
						sl.classList.toggle('is-near', nearLine);
					};

					// ── 按文本内容给侧栏 / 顶部标签打标记（不依赖产品类名） ──
					const SIDE_LABELS = ['新会话', '插件', '自动化任务', '工作区', '默认工作区'];
					const TAB_LABELS = ['对话', '轨迹', '应用', '编辑'];
					const XP_SIDE = './/*[not(*) and (' + SIDE_LABELS.map((s) => "normalize-space(.)='" + s + "'").join(' or ') + ')]';
					const XP_TAB = '//*[not(*) and (' + TAB_LABELS.map((s) => "normalize-space(.)='" + s + "'").join(' or ') + ')]';

					const query = (expr, ctx) => {
						const out = [];
						if (ctx === null) return out;
						try {
							const res = document.evaluate(expr, ctx, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
							for (let i = 0; i < res.snapshotLength; i++) out.push(res.snapshotItem(i));
						} catch (e) { /* XPath 不可用时静默跳过 */ }
						return out;
					};

					// 只标记「屏幕底部」那个输入框；聊天记录里的编辑框保持原样
					const tagComposer = () => {
						// 每一轮先清掉旧标记，避免布局变化后残留
						const stale = document.querySelectorAll('.skill-sky-composer, .skill-sky-composer-shell');
						for (let i = 0; i < stale.length; i++) {
							stale[i].classList.remove('skill-sky-composer');
							stale[i].classList.remove('skill-sky-composer-shell');
						}

						const vh = window.innerHeight;
						const list = document.querySelectorAll('textarea');
						let best = null;
						let bestTop = -1;
						for (let i = 0; i < list.length; i++) {
							const t = list[i];
							const r = t.getBoundingClientRect();
							if (r.width < 180 || r.height < 18) continue;
							if (r.top < vh * 0.45) continue;
							if (r.top > bestTop) { bestTop = r.top; best = t; }
						}
						if (best === null) return;

						let box = best.parentElement;
						while (box !== null && box !== document.body) {
							const r = box.getBoundingClientRect();
							if (r.width > 240 && r.height > 44) break;
							box = box.parentElement;
						}
						if (box === null || box === document.body) return;
						box.classList.add('skill-sky-composer');

						const shell = box.parentElement;
						if (shell !== null && shell !== document.body) {
							const sr = shell.getBoundingClientRect();
							if (sr.width > 260 && sr.height > 50) shell.classList.add('skill-sky-composer-shell');
						}
					};
					const applyLabelStyles = () => {
						const sides = query(XP_SIDE, sideEl);
						for (let i = 0; i < sides.length; i++) {
							const el = sides[i];
							if (el.classList.contains('skill-sky-side')) continue;
							el.classList.add('skill-sky-side');
							const row = el.parentElement;
							if (row !== null && row !== sideEl) row.classList.add('skill-sky-row');
						}

						tagComposer();

						const tabs = query(XP_TAB, document);
						for (let i = 0; i < tabs.length; i++) {
							const el = tabs[i];
							let target = el;
							for (let k = 0; k < 4; k++) {
								const p = target.parentElement;
								if (p === null || p === document.body) break;
								const pr = p.getBoundingClientRect();
								if (pr.width > 340 || pr.height > 64) break;
								target = p;
								if (p.tagName === 'BUTTON' || p.getAttribute('role') === 'button' || p.hasAttribute('tabindex')) break;
							}
							if (target.classList.contains('skill-sky-tab')) continue;
							const r = target.getBoundingClientRect();
							if (r.width === 0 || r.top > 200) continue;
							target.classList.add('skill-sky-tab');
						}
					};

					let labelTimer = 0;
					let last = 0;
					const loop = (t) => {
						raf = requestAnimationFrame(loop);
						if (t - last < 33) return;
						last = t;
						ensure();
						updateSplit();
						draw();
					};

					ensure();
					findTimer = setInterval(ensure, 800);
					applyLabelStyles();
					labelTimer = setInterval(applyLabelStyles, 1200);
					raf = requestAnimationFrame(loop);

					return () => {
						cancelAnimationFrame(raf);
						clearInterval(findTimer);
						clearInterval(labelTimer);
						const el = document.getElementById(CLOCK_ID);
						if (el !== null && el.parentNode) el.parentNode.removeChild(el);
						document.removeEventListener('pointermove', onPointerMove);
						const sl = document.getElementById('skill-sky-splitline');
						if (sl !== null && sl.parentNode) sl.parentNode.removeChild(sl);
					};
				}, 'skill-sky: clock');


			// ── 品牌圣位：矢量圣徽（透明四角 + hero 放大） ──
			const slots = ctx.get('slots');
			if (slots !== undefined) {
				const brandMark = (props, kind) => {
					const base = props.size || (kind === 'hero' ? 34 : 28);
					const size = kind === 'hero' ? base * 2 : base;
					const cls = typeof props.className === 'string' ? props.className : undefined;
					// 软糖果五角星：半径外 44 / 内 21，用超粗 stroke + round 圆角把尖角磨圆
					const starPts = (() => {
						const out = [];
						for (let i = 0; i < 10; i++) {
							const rad = i % 2 === 0 ? 44 : 21;
							const a = (Math.PI / 5) * i - Math.PI / 2;
							out.push((50 + Math.cos(a) * rad).toFixed(2) + ' ' + (50 + Math.sin(a) * rad).toFixed(2));
						}
						return 'M' + out.join(' L') + ' Z';
					})();

					const gradId = 'skill-sky-star-grad-' + kind;
					const markImg = react.createElement('svg', {
						className: 'skill-sky-star',
						width: size,
						height: size,
						viewBox: '0 0 100 100',
						role: 'img',
						'aria-label': 'Skill Sky star',
						style: { display: 'block', flex: 'none', overflow: 'visible' }
					}, [
						react.createElement('defs', { key: 'defs' },
							react.createElement('radialGradient', { id: 'skill-sky-star-halo-' + kind, cx: '50%', cy: '50%', r: '50%' },
								react.createElement('stop', { key: 'h1', offset: '0%', stopColor: '#ffffff', stopOpacity: 0.98 }),
								react.createElement('stop', { key: 'h2', offset: '18%', stopColor: '#eaf5ff', stopOpacity: 0.96 }),
								react.createElement('stop', { key: 'h3', offset: '44%', stopColor: '#bcdcff', stopOpacity: 0.78 }),
								react.createElement('stop', { key: 'h4', offset: '70%', stopColor: '#82b4ff', stopOpacity: 0.44 }),
								react.createElement('stop', { key: 'h5', offset: '100%', stopColor: '#3d78ff', stopOpacity: 0 })
							),
							react.createElement('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0.35', y2: '1' },
								react.createElement('stop', { key: 's1', offset: '0%', stopColor: '#ffffff' }),
								react.createElement('stop', { key: 's2', offset: '34%', stopColor: '#f0f8ff' }),
								react.createElement('stop', { key: 's3', offset: '72%', stopColor: '#a8d0ff' }),
								react.createElement('stop', { key: 's4', offset: '100%', stopColor: '#7fb6ff' })
							)
						),
						react.createElement('circle', {
							key: 'halo',
							className: 'skill-sky-star-halo',
							cx: 50, cy: 50, r: 50,
							fill: 'url(#skill-sky-star-halo-' + kind + ')',
							style: { transformOrigin: '50% 50%' }
						}),
						react.createElement('path', {
							key: 'star',
							d: starPts,
							fill: 'url(#' + gradId + ')',
							stroke: '#ffffff',
							strokeWidth: 16,
							strokeLinejoin: 'round',
							strokeLinecap: 'round'
						})
					]);

					const word = react.createElement('span', {
						className: 'skill-sky-wordmark skill-sky-wordmark-' + kind
					}, [
						react.createElement('span', { key: 'a', className: 'skill-sky-wordmark-sky' }, 'SKY'),
						react.createElement('span', { key: 'b', className: 'skill-sky-wordmark-sep' }, '//'),
						react.createElement('span', { key: 'c', className: 'skill-sky-wordmark-sub' }, 'DEEP BLUE')
					]);

					return react.createElement('span', {
						className: 'skill-sky-brand skill-sky-brand-' + kind
					}, markImg, word);
				};

				slots.inject('sidebar.brand.mark', () => slots.register(
					{ name: 'sidebar.brand.mark', id: 'skill-sky', priority: -1 },
					(props) => brandMark(props, 'sidebar')
				), 'skill-sky: sidebar mark');
				slots.inject('conversation.hero.brand.mark', () => slots.register(
					{ name: 'conversation.hero.brand.mark', id: 'skill-sky', priority: -1 },
					(props) => brandMark(props, 'hero')
				), 'skill-sky: hero mark');
			}

		// ── 口号覆写（0.1.7-rc.1 重铸）──────────────────────────────────────
		// 解剖 dsh-client-ui-conversation 机魂后的确证结构：
		//   div[class*="headline"] > span[class*="titleGroup"] > span（无类名）
		// 承载「探索未至之境」的 span 不携带任何类名，故旧版
		// span[class*="headlineText"] 选择器永不匹配——替字失效之根因即在此。
		// 新法两道铭文并行：DOM 替字为主，CSS 兜底为辅。
		// ─────────────────────────────────────────────────────────────────
		const SLOGAN_OLD = '探索未至之境';
		const SLOGAN_NEW = '铸造圣火永不熄灭';
		ctx.effect(() => insertCss(`
			[class*="headline"] > [class*="titleGroup"] > span[data-skill-sky-slogan] {
				color: transparent !important;
				font-size: 0 !important;
				line-height: 0 !important;
				display: inline-block;
				position: relative;
				cursor: default;
			}
			[class*="headline"] > [class*="titleGroup"] > span[data-skill-sky-slogan]::before {
				content: "铸造圣火永不熄灭";
				display: block;
				text-align: center;
				color: #8ab8ff;
				font-family: var(--dsw-font-family);
				font-size: 26px;
				line-height: 32px;
				letter-spacing: 0.5px;
				text-shadow: 0 0 2px rgba(240, 248, 255, 0.95), 0 0 12px rgba(110, 175, 255, 0.72), 0 0 26px rgba(50, 120, 255, 0.36);
				white-space: nowrap;
			}
		`), 'skill-sky: slogan');

		// ── 口号替字：DOM 直改（不依赖任何构建哈希类名） ──
		ctx.effect(() => {
			if (typeof document === 'undefined') return () => {};
			let queued = false;
			const sweep = () => {
				queued = false;
				const heads = document.querySelectorAll('[class*="headline"]');
				for (let i = 0; i < heads.length; i++) {
					const groups = heads[i].querySelectorAll('[class*="titleGroup"]');
					for (let j = 0; j < groups.length; j++) {
						const kids = groups[j].children;
						for (let k = 0; k < kids.length; k++) {
							const span = kids[k];
							if (span.dataset === undefined || span.dataset.skillSkySlogan !== undefined) continue;
							const text = span.textContent.trim();
							const isOld = text.indexOf(SLOGAN_OLD) >= 0 || text.indexOf('Into the Unknown') >= 0;
							if (!isOld) continue;
							span.dataset.skillSkySlogan = '';
							span.textContent = SLOGAN_NEW;
						}
					}
				}
			};
			const schedule = () => {
				if (queued) return;
				queued = true;
				requestAnimationFrame(sweep);
			};
			sweep();
			const observer = new MutationObserver(schedule);
			observer.observe(document.body, {
				childList: true,
				subtree: true,
				characterData: true
			});
			return () => observer.disconnect();
		}, 'skill-sky: slogan rewrite');

		// （0.1.7-rc.1 熔去）原「InputBar 治本」块已整块移除：
		//   产品输入区已改为 Lexical contentEditable，全库无 textarea 元素、
		//   亦无 [data-input-backdrop] 属性，该块两条规则永久空转；
		//   且产品自带 .RlGAzG_input 已设 color 与 caret-color，根因不复存在。
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
