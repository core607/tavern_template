<template>
  <RouterView />
  
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Satisfy&family=Cinzel:wght@700&display=swap');
/* 额外免费字体 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Merriweather:wght@400;700&family=Noto+Sans+SC:wght@400;700&family=Noto+Serif+SC:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap');
:global(html, body) {
  height: auto;
  min-height: 0;
}
:global(body) {
  margin: 0;
}
:global(body::before) {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(200px 200px at 14% 18%, rgba(255, 232, 180, 0.2), transparent 70%),
    radial-gradient(160px 160px at 86% 76%, rgba(255, 210, 150, 0.16), transparent 65%),
    radial-gradient(120px 120px at 72% 28%, rgba(255, 250, 200, 0.12), transparent 60%);
  mix-blend-mode: screen;
}
:global(body::after) {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(240px 240px at 6% 10%, rgba(255, 220, 160, 0.2), transparent 70%),
    radial-gradient(180px 180px at 92% 88%, rgba(255, 200, 130, 0.16), transparent 70%);
  mix-blend-mode: soft-light;
}

/* 主题钩子：根据 data-unlimited-theme 应用背景风格 */
:global(html[data-unlimited-theme='default'] body) {
  background:
    radial-gradient(ellipse at center, rgba(0,0,0,0.18), rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.04) 60%, rgba(0,0,0,0.02) 80%, transparent 100%) center/100% 100% fixed,
    repeating-linear-gradient(90deg, #5f3b26 0px, #603c27 4px, #5a3924 8px, #5d3a25 12px) fixed,
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0 0.06 0.08"/></feComponentTransfer></filter><rect width="120" height="120" filter="url(%23n)"/></svg>') repeat;
}
/* 新主题别名：parchment */
:global(html[data-unlimited-theme='parchment'] body) {
  background:
    radial-gradient(ellipse at center, rgba(0,0,0,0.18), rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.04) 60%, rgba(0,0,0,0.02) 80%, transparent 100%) center/100% 100% fixed,
    repeating-linear-gradient(90deg, #5f3b26 0px, #603c27 4px, #5a3924 8px, #5d3a25 12px) fixed,
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0 0.06 0.08"/></feComponentTransfer></filter><rect width="120" height="120" filter="url(%23n)"/></svg>') repeat;
}
/* 让页面容器也呈现木纹背景，避免外层覆盖 */
:global(html[data-unlimited-theme='parchment']) .page {
  background:
    radial-gradient(ellipse at center, rgba(0,0,0,0.18), rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.04) 60%, rgba(0,0,0,0.02) 80%, transparent 100%) center/100% 100% fixed,
    repeating-linear-gradient(90deg, #5f3b26 0px, #603c27 4px, #5a3924 8px, #5d3a25 12px) fixed,
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><filter id="n2"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0 0.06 0.08"/></feComponentTransfer></filter><rect width="120" height="120" filter="url(%23n2)"/></svg>') repeat;
}
:global(html[data-unlimited-theme='light'] body) {
  background: #f5f7fb;
}
/* 新主题别名：clean */
:global(html[data-unlimited-theme='clean'] body) {
  background: #f5f7fb;
}
:global(html[data-unlimited-theme='clean']) .page { background: #f5f7fb; }
:global(html[data-unlimited-theme='dark'] body) {
  background: #1e1f24;
}
/* 暗潮：深海蓝绿渐变与冷色粒子光斑 */
:global(html[data-unlimited-theme='darktide'] body) {
  background:
    radial-gradient(800px 600px at 80% 10%, rgba(0, 255, 200, 0.08), transparent 60%),
    radial-gradient(600px 400px at 20% 90%, rgba(0, 140, 255, 0.06), transparent 60%),
    linear-gradient(180deg, #0a0f14 0%, #0c1b22 50%, #0a0f14 100%);
}
/* 赛博朋克：深紫底与霓虹晕光 */
:global(html[data-unlimited-theme='cyber'] body) {
  background:
    radial-gradient(600px 600px at 15% 20%, rgba(255, 0, 128, 0.12), transparent 55%),
    radial-gradient(700px 500px at 85% 80%, rgba(0, 255, 255, 0.10), transparent 55%),
    linear-gradient(180deg, #12061b 0%, #1b0f2a 50%, #12061b 100%);
}

/* 主题化的 parchment 与卡片（强优先级，覆盖组件内部） */
:global(html[data-unlimited-theme='default']) .parchment {
  background: #efe3c3 !important;
  border-color: rgba(120, 90, 50, 0.45) !important;
  box-shadow:
    0 14px 36px rgba(0, 0, 0, 0.38),
    0 2px 1px rgba(255, 255, 255, 0.5) inset,
    0 0 0 2px rgba(120, 90, 50, 0.45),
    inset 0 0 85px rgba(120, 90, 50, 0.28) !important;
}
:global(html[data-unlimited-theme='parchment']) .parchment {
  background: #efe3c3 !important;
  border-color: rgba(120, 90, 50, 0.45) !important;
  box-shadow:
    0 14px 36px rgba(0, 0, 0, 0.38),
    0 2px 1px rgba(255, 255, 255, 0.5) inset,
    0 0 0 2px rgba(120, 90, 50, 0.45),
    inset 0 0 85px rgba(120, 90, 50, 0.28) !important;
}
:global(html[data-unlimited-theme='light']) .parchment {
  background: #ffffff !important;
  border-color: rgba(120, 120, 140, 0.25) !important;
  box-shadow: 0 8px 22px rgba(0,0,0,0.08), 0 0 0 1px rgba(120,120,140,0.15) inset !important;
}
:global(html[data-unlimited-theme='clean']) .parchment {
  background: #ffffff !important;
  border-color: rgba(120, 120, 140, 0.25) !important;
  box-shadow: 0 8px 22px rgba(0,0,0,0.08), 0 0 0 1px rgba(120,120,140,0.15) inset !important;
}
:global(html[data-unlimited-theme='dark']) .parchment {
  background: #2a2d34 !important;
  border-color: rgba(200,200,220,0.16) !important;
  box-shadow: 0 10px 26px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset !important;
}
:global(html[data-unlimited-theme='darktide']) .parchment {
  background: linear-gradient(180deg, rgba(6,18,24,0.95), rgba(10,26,34,0.95)) !important;
  border-color: rgba(0, 200, 220, 0.18) !important;
  box-shadow: 0 12px 28px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,200,220,0.15) inset !important;
}
:global(html[data-unlimited-theme='cyber']) .parchment {
  background: linear-gradient(180deg, rgba(26, 12, 42, 0.9), rgba(18, 6, 27, 0.92)) !important;
  border-color: rgba(255, 0, 170, 0.28) !important;
  box-shadow: 0 12px 28px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,255,0.18) inset !important;
}

/* 主题下正文颜色（不覆盖酒馆的关键配色类，只处理基础继承） */
:global(html[data-unlimited-theme='light']) .parchment .story { color: #2a2a2e; }
:global(html[data-unlimited-theme='dark']) .parchment .story { color: #e8eaf0; }
:global(html[data-unlimited-theme='darktide']) .parchment .story { color: #d8f7ff; }
:global(html[data-unlimited-theme='cyber']) .parchment .story { color: #f2e9ff; }

/* 强化强调/内心等（通常被 tavern 正则转成 em/i/b/span） */
:global(.parchment .story em),
:global(.parchment .story i) { opacity: 0.95; }
:global(html[data-unlimited-theme='dark'] .parchment .story em),
:global(html[data-unlimited-theme='dark'] .parchment .story i) { color: #ffd68a; }
:global(html[data-unlimited-theme='darktide'] .parchment .story em),
:global(html[data-unlimited-theme='darktide'] .parchment .story i) { color: #87f7ff; }
:global(html[data-unlimited-theme='cyber'] .parchment .story em),
:global(html[data-unlimited-theme='cyber'] .parchment .story i) { color: #ff70f0; }

</style>

<script setup lang="ts"></script>
