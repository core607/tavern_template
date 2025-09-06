<template>
  <div class="page">
    <div class="tabs">
      <button v-for="t in tabs" :key="t" class="tab" :class="{ a: t===cur }" @click="$router.push('/'+t)">{{ t }}</button>
    </div>
    <div class="parchment">
      
      <h3 class="head">正文</h3>
      <div class="gear" @click.stop="gearOpen = !gearOpen">⚙</div>
      <div class="theme-toggle" :title="theme==='unl-night' ? '切换为日间' : '切换为夜间'" @click.stop="toggleTheme()">{{ theme==='unl-night' ? '🌙' : '☀️' }}</div>
      <div v-if="gearOpen" class="gear-panel" @click.stop>

        <div class="gear-title" style="margin-top:8px">正文字体</div>
        <div class="gear-opts">
          <label class="gear-ctl">
            <span>大小</span>
            <input type="range" min="12" max="22" step="1" :value="fontSize" @input="onFontSize($event)">
            <span class="val">{{ fontSize }}px</span>
          </label>
          <label class="gear-ctl">
            <span>样式</span>
            <select :value="fontFamily" @change="onFontFamily($event)">
              <option v-for="f in fontFamilies" :key="f.value" :value="f.value">{{ f.label }}</option>
            </select>
          </label>
        </div>

        <div class="gear-title" style="margin-top:8px">原楼层显示</div>
        <div class="gear-opts">
          <label class="gear-ctl">
            <input type="checkbox" :checked="!nativeHidden" @change="onNativeToggle($event)">
            <span>{{ nativeHidden ? '隐藏中' : '显示中' }}</span>
          </label>
          <button class="btn small" @click.stop="toggleNative()">{{ nativeHidden ? '显示原楼层' : '隐藏原楼层' }}</button>
        </div>
      </div>
      <div class="story" ref="storyRoot" v-html="beautified"></div>
      <!-- 世界候选（羊皮纸分节） -->
      <div class="prop" v-if="missions.length">
        <div class="pname">世界候选</div>
        <div class="missions">
          <div
            class="mission"
            v-for="(m,i) in missions"
            :key="'m'+i"
            :class="{ sel: i===pendingWorldIndex }"
            @click="setPendingWorld(i)"
          >
            <div class="m-title">🌐 {{ m.title }}</div>
            <div class="m-body" v-html="formatMissionBody(m.body)"></div>
            <div class="m-actions" v-if="i===pendingWorldIndex">
              <button class="btn small" @click.stop="confirmWorld(i)">确认进入</button>
              <button class="btn small" @click.stop="cancelWorld">取消</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 市场（羊皮纸分节） -->
      <div class="prop" v-if="marketCategories.length">
        <div class="pname">兑换终端</div>
        <div class="market">
          <div class="market-tabs">
            <button
              v-for="c in marketTabs"
              :key="c"
              class="market-tab"
              :class="{ a: c===marketActive }"
              @click="marketActive=c"
            >{{ c }}</button>
          </div>
          <div v-if="marketActive==='属性加点'" class="attr-panel">
            <div class="char-row" v-if="charOptions.length">
              <button v-for="(n,i) in charOptions" :key="'c'+i" class="chip-btn" :class="{ a: i===selectedCharIndex }" @click.stop="chooseChar(i)">{{ n }}</button>
            </div>
            <div class="bl-row" v-if="allBloodlines.length">
              <button v-for="(b,i) in allBloodlines" :key="b.key" class="chip-btn" :class="{ a: i===selectedBloodlineIndex }" @click.stop="chooseBloodline(i)">{{ b.name }}</button>
            </div>
            <div class="row between attr-sum">
              <div>总加点：<b>{{ totalAttrPoints }}</b></div>
              <div>消耗币：<b class="coin">{{ attrTotalPrice }}</b></div>
            </div>
            <div class="evo-section">
              <div class="evo-title">血统进化进度</div>
              <div class="evo-bar"><div class="evo-fill" :style="{ width: evoPercent + '%' }"><span class="evo-text">{{ Math.round(evoPercent) }}%</span></div></div>
              <div class="evo-info">
                <div class="cur">当前: {{ currentTier }}级 ({{ currentNewSum }})</div>
                <div class="next">{{ nextTierText }}</div>
              </div>
            </div>
            <div class="attr-grid">
              <div v-for="a in CORE_ATTRIBUTES" :key="a" class="attr-row">
                <div class="a-name"><span class="emo">{{ ATTR_EMOJIS[a] }}</span>{{ a }}</div>
                <div class="a-base">当前 {{ panelBaseAttributes[a] || 0 }}（血统+{{ initialBloodlineBonuses[a] || 0 }}）</div>
                <div class="a-ctrl">
                  <button class="a-btn" @click.stop="changeAttr(a, -1)">−</button>
                  <input class="a-input" type="number" min="0" :value="attributePoints[a] || 0" @input="onAttrInput(a, $event)">
                  <button class="a-btn" @click.stop="changeAttr(a, +1)">+</button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="market-items">
            <div
              class="item"
              v-for="it in market[marketActive]"
              :key="it.name"
              :class="{ sel: isSelected(it, marketActive) }"
              @click="toggleSelect(it, marketActive)"
            >
              <div class="row between">
                <div class="i-name">{{ it.name }}</div>
                <div class="i-badges">
                  <span class="badge">{{ it.price }} 币</span>
                  <span class="badge">评级 {{ it.rating }}</span>
                </div>
              </div>
              <div class="i-attrs">
                <span class="chip" v-for="(v,k) in it.attributes" :key="k">{{ k }}: {{ v }}</span>
              </div>
              <div class="qty" v-if="isSelected(it, marketActive)">
                <button class="a-btn" @click.stop="changeQty(it, marketActive, -1)">−</button>
                <input class="a-input" type="number" min="1" :value="selectedQty[keyOf(it, marketActive)] || 1" @input="onQtyInput(it, marketActive, $event)">
                <button class="a-btn" @click.stop="changeQty(it, marketActive, +1)">+</button>
              </div>
            </div>
            <div v-if="!market[marketActive].length" class="empty">此分类下暂无商品</div>
          </div>
          <div class="market-footer">
            <div class="sum">
              <span>余额：<b>{{ initialCoins }}</b> 币</span>
              <span class="sep">·</span>
              <span>合计：<b>{{ totalPrice }}</b> 币</span>
              <span class="sep">·</span>
              <span>预计剩余：<b :class="{ warn: remainingCoins < 0 }">{{ Math.max(0, remainingCoins) }}</b> 币</span>
              <span v-if="remainingCoins < 0" class="warn-msg">余额不足，无法生成</span>
            </div>
            <button class="btn" :disabled="!canSendTransaction" :title="sendDisabledReason" @click="sendMarket()">生成交易协议</button>
          </div>
        </div>
      </div>
      <details ref="optsDetails" class="opts-card" v-if="options.length" @toggle="onOptsToggle">
        <summary class="opts-summary">
          <div class="opt-toggle">{{ optsOpen ? '收起选项' : '展开选项' }}</div>
        </summary>
        <div class="opt-btns">
          <button
            class="opt-btn"
            v-for="(op,i) in options"
            :key="i"
            :class="{ active: i === activeOptionIndex }"
            @click.stop="sendOption(op, i)"
          >
            <span class="dot"></span>
            <span class="txt">{{ op.display }}</span>
          </button>
        </div>
      </details>
      <div class="tear"></div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue';

const tabs = ['正文','状态','世界','角色','清单'];
const cur = '正文';
const raw = ref('');
const taverned = ref('');
const storyRoot = ref<HTMLElement|null>(null);
const gearOpen = ref(false);
// 只保留羊皮纸主题
// 字体控制
const fontSize = ref<number>(parseInt(localStorage.getItem('无限_font_size') || '14', 10) || 14);
const fontFamily = ref<string>(localStorage.getItem('无限_font_family') || 'default');
const fontFamilies = [
  { value: 'default', label: '默认' },
  { value: 'inter', label: 'Inter (Sans)' },
  { value: 'noto-sans', label: 'Noto Sans SC (中文)' },
  { value: 'merri', label: 'Merriweather (Serif)' },
  { value: 'noto-serif', label: 'Noto Serif SC (中文)' },
  { value: 'jetbrains', label: 'JetBrains Mono (等宽)' },
] as const;
// 原楼层显示开关
const nativeHidden = ref<boolean>((() => {
  try { return localStorage.getItem('无限_native_hidden') === '1'; } catch { return false; }
})());
// 主题（日/夜）
const theme = ref<string>((() => { try { return localStorage.getItem('无限_theme') || 'parchment'; } catch { return 'parchment'; } })());
let regsCache: any[] = [];
let compiledRegs: Array<{ re: RegExp; replace: string }> = [];
let hasIgnoreRule = false;
const IGNORE_SUBSTR = '正文美化';
const options = ref<Array<{ display: string; sendText: string }>>([]);
const optsOpen = ref(false);
const activeOptionIndex = ref<number|null>(null);
const optsDetails = ref<HTMLElement|null>(null);

type MarketItem = { name: string; attributes: Record<string,string>; price: number; rating: string };
const market = ref<Record<string, MarketItem[]>>({});
const marketActive = ref<string>('');
const selectedSet = ref<Set<string>>(new Set()); // key = `${cat}||${name}`
const missions = ref<Array<{ title: string; body: string }>>([]);
// 通用取值/清洗/列表化（与 StatusPanel 对齐）
function v(val: any, def: any = 'N/A') {
  if (val === null || val === undefined) return def;
  if (Array.isArray(val)) return val.length === 0 ? def : (val[0] ?? def);
  return val;
}
function cleanObj(obj: any) { if (!obj || typeof obj !== 'object') return obj; const o: any = {}; for (const k in obj) if (!k.startsWith('$')) o[k] = obj[k]; return o; }
function listOf(data: any): any[] {
  if (!data) return [];
  const cleaned = cleanObj(data);
  if (Array.isArray(cleaned)) return cleaned.filter(it => it && (typeof it !== 'object' || Object.keys(it).length > 0));
  if (typeof cleaned === 'object') {
    const entries = Object.entries(cleaned);
    const hasIdKeys = entries.some(([k]) => /^[A-Z]+_\d+/.test(k));
    if (hasIdKeys) return entries.map(([, v]) => v).filter(v => v && typeof v === 'object');
    return entries
      .map(([k, v]) => (v && typeof v === 'object' && !('名称' in (v as any)) ? { 名称: k, ...(v as any) } : v))
      .filter(Boolean) as any[];
  }
  return [];
}

// 属性加点（恢复简化版）
const CORE_ATTRIBUTES = ['力量','体力','敏捷','智力','精神','魅力'] as const;
const ATTR_EMOJIS: Record<string,string> = { 力量:'💪', 体力:'❤️', 敏捷:'⚡', 智力:'🧠', 精神:'✨', 魅力:'👑' };
const meRef = ref<any>({});
const companionsRef = ref<any[]>([]);
const currentChar = ref<any>(null);
const charOptions = ref<string[]>(['我']);
const selectedCharIndex = ref(0);
const allBloodlines = ref<Array<{ key:string; name:string; data:any }>>([]);
const canAddPoints = ref(false);
const selectedBloodlineIndex = ref(0);
const currentBloodline = computed(()=> allBloodlines.value[Math.max(0, Math.min(selectedBloodlineIndex.value, allBloodlines.value.length-1))]);
const panelBaseAttributes = ref<Record<string, number>>({});
const initialBloodlineBonuses = ref<Record<string, number>>({});
const initialBonusSum = ref(0);
const attributePoints = ref<Record<string, number>>({});
// 多人/多血统加点缓存：key = `${charKey}||${bloodKey}` → Record<属性, 点数>
const attrDrafts = ref<Record<string, Record<string, number>>>({});
const powerTiers = {
  F: { min: 0, max: 29, cost: 25 },
  E: { min: 30, max: 99, cost: 30 },
  D: { min: 100, max: 299, cost: 40 },
  C: { min: 300, max: 999, cost: 50 },
  B: { min: 1000, max: 2999, cost: 75 },
  A: { min: 3000, max: 9999, cost: 100 },
  S: { min: 10000, max: 29999, cost: 150 },
  SS: { min: 30000, max: 99999, cost: 200 },
  SSS: { min: 100000, max: Infinity, cost: 300 },
} as const;
const tierOrder = ['F','E','D','C','B','A','S','SS','SSS'] as const;
const bloodlineTierNames: Record<string,string> = { F:'普通', E:'强韧', D:'精锐', C:'超凡', B:'英雄', A:'王者', S:'圣域', SS:'神话', SSS:'至高' };
const attrDraftMeta = ref<Record<string, { baseSum: number; initialTier: string }>>({});
const initialCoins = ref(0);

onMounted(async () => {
  try {

    try { applyFontControls(); } catch {}
    // 标记承载本界面的父级楼层，避免被隐藏
    try { markHostMessageContainer(); } catch {}
    // 应用主题
    try { applyTheme(theme.value); } catch {}
    const chat = (await getChatMessages(getCurrentMessageId()))?.[0] || {} as any;
    const msg = chat?.message || '';
    raw.value = msg;
    const stat_data = chat?.data?.stat_data || {};
    meRef.value = Object.values(stat_data).find((v: any) => v && v.姓名) || {};
    // 同伴与附近角色（规范化列表）
    const allCharsRaw = listOf(meRef.value?.['登场角色']);
    companionsRef.value = allCharsRaw.filter((c:any)=> String((c?.['阵营标识']||c?.['阵营'])||'') === '同伴');
    // 角色选项
    charOptions.value = ['我'].concat(companionsRef.value.map(c=> String(c?.名称||'同伴')));
    // 选择当前操作角色：优先我，如果我无血统则选择第一位有血统的同伴
    const meHasBlood = hasBloodlines(meRef.value);
    const firstCompWithBlood = companionsRef.value.find(c => hasBloodlines(c));
    currentChar.value = meHasBlood ? meRef.value : (firstCompWithBlood || meRef.value);
    selectedCharIndex.value = meHasBlood ? 0 : (firstCompWithBlood ? (companionsRef.value.indexOf(firstCompWithBlood) + 1) : 0);
    // 面板基础属性
    panelBaseAttributes.value = Object.fromEntries(CORE_ATTRIBUTES.map(a => [a, parseInt(String((currentChar.value?.属性?.基础?.[a]) ?? '0').replace(/,/g,'')) || 0]));
    attributePoints.value = Object.fromEntries(CORE_ATTRIBUTES.map(a => [a, 0]));
    // 是否展示"属性加点"标签：任一角色存在血统即可
    canAddPoints.value = meHasBlood || !!firstCompWithBlood;
    // 载入血统
    loadBloodlineData();
    updateCurrentBloodlineData();
    // 币
    try { initialCoins.value = parseInt(String(v(meRef.value?.['空间币'], 0)).replace(/,/g,'')) || 0; } catch { initialCoins.value = 0; }
    // 仅按当前消息一次性应用正则与渲染
    refreshEnabledRegs();
    taverned.value = applyTavernTo(msg);
  } catch {}
  // 设置变更时刷新规则缓存
  try { eventOn(tavern_events.SETTINGS_UPDATED, () => refreshEnabledRegs()); } catch {}

  // 组件卸载时清理资源
  onUnmounted(() => {
    // 清除定时器
    if (enhanceTimeout) {
      clearTimeout(enhanceTimeout);
      enhanceTimeout = null;
    }
    // 清理事件监听器（如果有的话）
    // 注意：由于我们使用了data-listener-bound属性来防止重复绑定，这里不需要额外清理
  });
  const m = raw.value.match(/<options>[\s\S]*?<\/options>/i);
  const list: Array<{ display: string; sendText: string }> = [];
  if (m) {
    m[0]
      .replace(/<\/?options>/gi, '')
      .split(/\n/)
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(line => {
        // 去掉前缀序号 "1. "，得到动作文本
        const mNum = line.match(/^\s*\d+\.\s*(.*)$/);
        const actionText = (mNum ? mNum[1] : line).trim();
        // 发送内容：去掉括号内说明
        const sendText = actionText.replace(/\([^)]*\)/g, '').trim();
        // 展示内容：使用去序号后的文本，更贴近我们的 UI
        const display = actionText;
        if (sendText) list.push({ display, sendText });
    });
  }
  options.value = list;

  // 解析市场
  const mk = raw.value.match(/<market>([\s\S]*?)<\/market>/i);
  if (mk) {
    market.value = parseMarketData(mk[1] || '');
    const cats = Object.keys(market.value);
    const tabs = (canAddPoints.value ? ['属性加点'] : []).concat(cats);
    marketActive.value = tabs[0] || '';
  }
  // 解析世界选择
  const ms = raw.value.match(/<mission>([\s\S]*?)<\/mission>/gi) || [];
  missions.value = ms
    .map(b => parseMissionsBlock(b.replace(/<\/?mission>/gi, '')))
    .flat();
});

const beautified = computed(()=>{
  // 先基于 taverned（已应用酒馆正则）再做我们的美化
  let t = taverned.value || raw.value || '';
  // 移除我们将会独立渲染的特殊块
  t = t
    .replace(/<options>[\s\S]*?<\/options>/gi,'')
    .replace(/<market>[\s\S]*?<\/market>/gi,'')
    .replace(/<mission>[\s\S]*?<\/mission>/gi,'')
    .trim();
  // 保留 plot/other 原始内容，不做转换；不再二次包裹系统行，交由 CSS 统一着色
  t = t.replace(/\n{3,}/g,'\n\n');
  // 注入检定结果占位
  t = injectCheckResults(t);
  // 注入外链脚本/完整 HTML 代码块为占位，稍后增强为 iframe(srcdoc)
  try { t = injectEmbedsFromCodeFences(t); } catch {}
  // 额外：对话/内心/系统等做颜色分层（若酒馆未处理则由我们兜底）
  t = colorizeStorySafe(t);
  return t;
});

function sendDirect(text:string){
  try { if (typeof triggerSlash==='function') { triggerSlash(`/send ${text}|/trigger`); return; } } catch {}
  try {
    const input = (window.parent as any)?.document?.querySelector?.('#send_textarea');
    if (input) {
      const cur = String(input.value || '').trim();
      input.value = cur ? `${cur}\n${text}` : text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
  } catch {}
}

function sendToInput(text: string){
  try {
    const input = (window.parent as any)?.document?.querySelector?.('#send_textarea');
    if (input) {
      const cur = String(input.value || '').trim();
      input.value = cur ? `${cur}\n${text}` : text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } catch {}
}

function sendOption(op: { display: string; sendText: string }, idx: number){
  activeOptionIndex.value = idx;
  sendToInput(op.sendText);
}

function onOptsToggle(e: Event){
  const el = e.target as HTMLDetailsElement;
  optsOpen.value = !!el?.open;
}

function parseMarketData(text: string): Record<string, MarketItem[]> {
  const out: Record<string, MarketItem[]> = {};
  if (!text) return out;
  try {
    const blocks = text.split(/---\s*/).filter(b => b.trim());
    blocks.forEach(block => {
      const titleRe = /^\s*【([^】]+)】/gm;
      const allMatches = Array.from(titleRe[Symbol.matchAll] ? titleRe[Symbol.matchAll](block as any) : block.matchAll(titleRe));
      if (allMatches.length < 2) return;
      const cat = allMatches[0][1].trim();
      const items: MarketItem[] = [];
      const itemMatches = allMatches.slice(1);
      itemMatches.forEach((m, idx) => {
        const name = m[1].trim();
        const start = (m.index || 0) + m[0].length;
        const next = itemMatches[idx + 1];
        const end = next ? (next.index || block.length) : block.length;
        const seg = block.slice(start, end).trim();
        const lb = seg.indexOf('[');
        const rb = seg.lastIndexOf(']');
        if (lb < 0 || rb < 0 || rb <= lb) return;
        const content = seg.slice(lb + 1, rb);
        const attributes: Record<string,string> = {};
        let price = 0; let rating = 'F';
        content.split('|').map(p=>p.trim()).forEach(part => {
          part.split(',').map(s=>s.trim()).forEach(s => {
            if (!s) return;
            const kidx = s.search(/[:：]/);
            if (kidx > -1) {
              const k = s.slice(0, kidx).trim();
              const v = s.slice(kidx + 1).trim();
              if (k === '价格') price = parseInt(v, 10) || 0;
              else if (k === '评级') rating = v;
              else attributes[k] = v;
            } else {
              const mm = s.match(/^([A-Za-z\u4e00-\u9fa5\s]+)\+([\d.]+%?)$/);
              if (mm) attributes[mm[1].trim()] = `+${mm[2]}`;
            }
          });
        });
        // 价格字段中可能包含"空间币"等单位，先去掉非数字再解析
        if (!price) {
          const pv = (attributes['价格'] || '').toString();
          const num = parseInt(pv.replace(/[^\d]/g,'') || '0', 10);
          if (num) price = num;
          delete attributes['价格'];
        }
        if (!rating && attributes['评级']) { rating = String(attributes['评级']); delete attributes['评级']; }
        if (price > 0 && rating) items.push({ name, attributes, price, rating });
      });
      if (items.length) out[cat] = items;
    });
  } catch {}
  return out;
}

function parseMissionsBlock(text: string): Array<{ title: string; body: string; source?: string }>{
  const list: Array<{ title: string; body: string; source?: string }> = [];
  const re = /【([^】]+)】\s*(?:\(([^\)]*)\))?\s*\[([\s\S]*?)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const title = m[1]?.trim() || '';
    const source = (m[2]?.trim() || '') || undefined;
    const body = m[3]?.trim() || '';
    list.push({ title: source ? `${title}（${source}）` : title, body, source });
  }
  return list;
}

function escapeHtmlLite(s: string): string {
  return String(s||'').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]||c));
}

function formatMissionBody(body: string): string {
  const text = String(body||'');
  const labels = ['世界背景','主线任务','执行者支线','注意事项','难度评级'];
  let out = escapeHtmlLite(text);
  out = out.replace(/\n/g,'<br>');
  labels.forEach(lbl => {
    const re = new RegExp(`(${lbl}\s*[:：])`,'g');
    out = out.replace(re, '<br><span class="label-strong">$1</span>');
  });
  return out;
}

// 检定结果：将 <CheckResult> 块转换为占位 DOM，后续增强为交互
function injectCheckResults(input: string): string {
  if (!input || input.indexOf('<CheckResult>') === -1) return input;
  const re = /<CheckResult>([\s\S]*?)<\/CheckResult>/gi;
  return input.replace(re, (_m, body) => {
    const b64 = toB64(String(body||''));
    const html = [
      '<div class="check-result" data-b64="', b64, '">',
        '<button class="cr-btn"><span class="cr-ico">🎲</span><span class="cr-label"></span></button>',
        '<div class="cr-content"></div>',
      '</div>'
    ].join('');
    return html;
  });
}

function toB64(text: string): string {
  try { return btoa(unescape(encodeURIComponent(text))); } catch { return ''; }
}

function fromB64(b64: string): string {
  try { return decodeURIComponent(escape(atob(b64))); } catch { return ''; }
}

function deriveCheckLabel(rawText: string): string {
  const firstLine = String(rawText||'').trim().split('\n')[0] || '检定结果';
  return firstLine.replace(/^\s*>\s*/, '').replace(/^[^\w\s\u4e00-\u9fa5]+/, '').trim();
}

function beautifyCheckText(text: string): string {
  const keywords = ['DC','HP','EP','DEF','ATK','MATK','AP','vs','命中','成功','失败','伤害','治疗'];
  const special: Record<string,string> = { '[':'bracket', ']':'bracket', '`':'code', '✅':'success', '❌':'fail', '💥':'damage', '💚':'heal', '➞':'arrow', '→':'arrow', '|':'separator' };
  const lines = String(text||'').trim().split('\n');
  let out = '';
  lines.forEach((line, idx) => {
    const indent = Math.floor(((line.match(/^(\s*)/)||['',''])[1] as string).length / 2);
    let s = line.trim();
    if (s.startsWith('>')) s = s.slice(1).trim();
    let html = '';
    let inCode = false;
    for (let i=0;i<s.length;i++){
      const ch = s[i];
      if (ch==='`'){ inCode = !inCode; html += inCode ? '<span class="tk-code">' : '</span>'; continue; }
      if (inCode){ html += ch; continue; }
      if (special[ch]){ html += `<span class="tk-${special[ch]}">${ch}</span>`; continue; }
      let matched = false;
      for (const kw of keywords){
        if (s.substring(i, i+kw.length)===kw && /(\b|\s|[^a-zA-Z])/.test(s[i-1]||' ') && /(\s|$|[^a-zA-Z])/.test(s[i+kw.length]||' ')){
          html += `<span class=\"tk-keyword\">${kw}</span>`; i += kw.length-1; matched = true; break;
        }
      }
      if (matched) continue;
      const m = s.substring(i).match(/^(\d+\/\d+|\d+d\d+(?:\s*[+-]\s*\d+)?|-?\d+(?:\.\d+)?%?)/);
      if (m){ const num = m[0]; const isDice = num.includes('d'); html += `<span class=\"${isDice?'tk-dice':'tk-number'}\">${num}</span>`; i += num.length-1; continue; }
      html += ch;
    }
    let cls = 'content-line';
    if (idx===0) cls += ' first-line';
    else if (indent>0) cls += ` indent-${Math.min(indent,3)}`;
    out += `<div class=\"${cls}\">${html}</div>`;
  });
  return out;
}

function enhanceCheckResults(root: HTMLElement|null){
  if (!root) return;
  const nodes = Array.from(root.querySelectorAll('.check-result')) as HTMLElement[];
  nodes.forEach(node => {
    if (node.getAttribute('data-processed')==='1') return;
    const b64 = node.getAttribute('data-b64') || '';
    const rawText = fromB64(b64);
    const labelEl = node.querySelector('.cr-label') as HTMLElement|null;
    const contentEl = node.querySelector('.cr-content') as HTMLElement|null;
    const btnEl = node.querySelector('.cr-btn') as HTMLButtonElement|null;
    if (!labelEl || !contentEl || !btnEl) return;
    labelEl.textContent = deriveCheckLabel(rawText);
    contentEl.innerHTML = beautifyCheckText(rawText);

    // 防止重复绑定事件监听器
    if (!btnEl.hasAttribute('data-listener-bound')) {
      btnEl.addEventListener('click', () => {
        btnEl.classList.toggle('active');
        contentEl.classList.toggle('show');
      });
      btnEl.setAttribute('data-listener-bound', '1');
    }

    node.setAttribute('data-processed','1');
  });
}

// 允许的外链脚本域名白名单
const ALLOWED_EMBED_HOSTS = new Set<string>(['astro4.pages.dev']);
function hasOnlyAllowedScriptHosts(html: string): boolean {
  try {
    const re = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let m: RegExpExecArray | null; let ok = true;
    while ((m = re.exec(html))) {
      const src = (m[1] || '').trim();
      if (!src) continue;
      try {
        const u = new URL(src, 'https://example.com');
        if (/^https?:$/i.test(u.protocol)) {
          if (!ALLOWED_EMBED_HOSTS.has(u.host)) { ok = false; break; }
        }
      } catch {}
    }
    return ok;
  } catch { return false; }
}
// 将三引号代码块中包含完整 HTML/外链脚本的片段转换为 iframe 占位
function injectEmbedsFromCodeFences(input: string): string {
  if (!input) return input;
  const re = /```([a-zA-Z0-9_-]*)?[\t ]*\r?\n([\s\S]*?)```/g;
  return input.replace(re, (_m, lang, body) => {
    const code = String(body || '').trim();
    const l = String(lang || '').toLowerCase();
    const looksDoc = /<!doctype\s+html/i.test(code) || /<html[\s>]/i.test(code);
    const looksScript = /<script[^>]+src=["'][^"']+["'][^>]*><\/script>/i.test(code);
    if ((l === 'html' || looksDoc || looksScript) && hasOnlyAllowedScriptHosts(code)){
      const b64 = toB64(code);
      return `<div class=\"th-embed\" data-b64=\"${b64}\"></div>`;
    }
    return _m; // 非允许或不匹配则原样保留
  });
}
function enhanceEmbeds(root: HTMLElement|null){
  if (!root) return;
  const nodes = Array.from(root.querySelectorAll('.th-embed')) as HTMLElement[];
  nodes.forEach(node => {
    if (node.getAttribute('data-processed') === '1') return;
    const b64 = node.getAttribute('data-b64') || '';
    const html = fromB64(b64);
    if (!html) { node.setAttribute('data-processed','1'); return; }

    // 优先：若仅包含白名单脚本且无其它有效可视内容，则将脚本注入宿主文档执行
    const info = analyzeEmbedHtml(html);
    if (info && info.onlyAllowedScripts && info.scriptSrcs.length > 0) {
      info.scriptSrcs.forEach(src => {
        try {
          // 去重：避免重复加载同一脚本
          if (document.querySelector(`script[src="${src}"]`)) return;
          const s = document.createElement('script');
          s.src = src;
          s.async = true;
          document.head.appendChild(s);
        } catch {}
      });
      // 移除占位，避免空白
      try { node.remove(); } catch { node.innerHTML = ''; }
      return;
    }

    // 否则走 iframe(srcdoc) 以隔离展示
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox','allow-scripts allow-same-origin');
    iframe.setAttribute('referrerpolicy','no-referrer');
    iframe.style.width = '100%';
    iframe.style.border = '0';
    iframe.style.background = 'transparent';
    iframe.style.minHeight = '0px';
    iframe.style.height = '0px';
    try { (iframe as any).srcdoc = html; } catch { iframe.setAttribute('srcdoc', html); }

    const fitHeight = () => {
      try {
        const details = (node.closest && (node.closest('.thinking-description') as HTMLElement | null)) || null;
        if (details && !(details as any).open) { iframe.style.display = 'none'; iframe.style.height = '0px'; return; }
        const doc = (iframe.contentDocument || (iframe as any).contentWindow?.document);
        let h = 0;
        if (doc && doc.body) {
          h = Math.max(
            doc.body.scrollHeight || 0,
            (doc.documentElement && doc.documentElement.scrollHeight) || 0,
            0
          );
        }
        if (h > 20) {
          iframe.style.height = `${h}px`;
          iframe.style.display = '';
        } else {
          iframe.style.display = 'none';
          iframe.style.height = '0px';
          iframe.style.minHeight = '0px';
        }
      } catch {
        iframe.style.display = 'none';
        iframe.style.height = '0px';
        iframe.style.minHeight = '0px';
      }
    };

    iframe.addEventListener('load', () => {
      fitHeight();
      // 监听内容变化，动态自适应高度
      try {
        const win = (iframe as any).contentWindow;
        const doc = iframe.contentDocument || win?.document;
        const ResizeObs = (win && (win as any).ResizeObserver) || (window as any).ResizeObserver;
        if (ResizeObs && doc?.body) {
          const ro = new ResizeObs(() => fitHeight());
          ro.observe(doc.body);
        } else {
          // 兜底轮询一段时间，处理脚本异步渲染
          let count = 0;
          const timer = setInterval(() => { count++; fitHeight(); if (count > 50) clearInterval(timer); }, 200);
        }
        // 兼容内部脚本通过 postMessage 主动请求调整高度
        const onMsg = (ev: MessageEvent) => {
          try {
            if (!ev || (ev.source as any) !== win) return;
            const data: any = ev.data || {};
            if (data && data.type === 'resizeIframe') {
              const h = Math.max(0, parseInt(String(data.height || 0), 10) || 0);
              iframe.style.height = h > 0 ? `${h}px` : '0px';
              iframe.style.display = h > 0 ? '' : 'none';
            }
          } catch {}
        };
        window.addEventListener('message', onMsg);
        // 简单的卸载清理
        iframe.addEventListener('remove', () => { try { window.removeEventListener('message', onMsg); } catch {} });
      } catch { /* 忽略 */ }
    });

    node.innerHTML = '';
    node.appendChild(iframe);

    // 若位于折叠容器（完整变量更新的 details.thinking-description）内，展开时去除限制，收起时还原
    try {
      const details = (node.closest && (node.closest('.thinking-description') as HTMLElement | null)) || null;
      if (details) {
        const contentEl = details.querySelector('div') as HTMLElement | null;
        if (contentEl) {
          const originalMaxH = contentEl.style.maxHeight;
          const originalOverflow = contentEl.style.overflow;
          const originalOverflowY = (contentEl.style as any).overflowY || '';
          const applyOpen = () => { contentEl.style.maxHeight = 'none'; contentEl.style.overflow = 'visible'; (contentEl.style as any).overflowY = 'visible'; fitHeight(); };
          const applyClosed = () => { contentEl.style.maxHeight = originalMaxH; contentEl.style.overflow = originalOverflow; (contentEl.style as any).overflowY = originalOverflowY; iframe.style.display = 'none'; iframe.style.height = '0px'; };
          if ((details as any).open) applyOpen(); else applyClosed();
          details.addEventListener('toggle', () => { ((details as any).open) ? applyOpen() : applyClosed(); });
        }
      }
    } catch { /* 忽略 */ }

    node.setAttribute('data-processed','1');
  });
}

function analyzeEmbedHtml(html: string): { scriptSrcs: string[]; onlyAllowedScripts: boolean } | null {
  try {
    const srcs: string[] = [];
    let onlyAllowed = true;
    // 提取脚本 src 并校验白名单
    html.replace(/<script[^>]+src=["']([^"']+)["'][^>]*>\s*<\/script>/gi, (_m, p1) => {
      const src = String(p1 || '').trim();
      if (src) {
        srcs.push(src);
        try {
          const u = new URL(src, 'https://example.com');
          if (/^https?:$/i.test(u.protocol)) {
            if (!ALLOWED_EMBED_HOSTS.has(u.host)) onlyAllowed = false;
          }
        } catch { onlyAllowed = false; }
      }
      return '';
    });
    // 去除常见壳标签与非可视 head 标签，检查是否有其它可视内容
    const visibleStripped = html
      .replace(/<!doctype[\s\S]*?>/gi, '')
      .replace(/<\/(?:html|head|body)>/gi, '')
      .replace(/<(?:html|head|body)[^>]*>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<meta[^>]*>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      .replace(/<title[\s\S]*?<\/title>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<!--([\s\S]*?)-->/g, '')
      .replace(/\s+/g, '')
      .trim();
    const hasOtherVisible = visibleStripped.length > 0;
    return { scriptSrcs: srcs, onlyAllowedScripts: onlyAllowed && !hasOtherVisible };
  } catch { return null; }
}

// 优化：减少不必要的DOM操作，只在内容真正变化时才更新
let lastBeautifiedContent = '';
let enhanceTimeout: number | null = null;

watch(beautified, async () => {
  await nextTick();
  // 只在内容真正发生变化时才更新
  if (beautified.value !== lastBeautifiedContent) {
    // 清除之前的定时器，防止频繁调用
    if (enhanceTimeout) {
      clearTimeout(enhanceTimeout);
    }
    // 延迟执行，避免短时间内多次触发
    enhanceTimeout = setTimeout(() => {
      enhanceCheckResults(storyRoot.value);
      enhanceEmbeds(storyRoot.value);
      enhanceTimeout = null;
    }, 100);
    lastBeautifiedContent = beautified.value;
  }
}, { immediate: true });

const marketCategories = computed(()=> Object.keys(market.value));
const marketTabs = computed(()=> (canAddPoints.value ? ['属性加点'] : []).concat(marketCategories.value));
function keyOf(it: MarketItem, cat: string){ return `${cat}||${it.name}`; }
function isSelected(it: MarketItem, cat: string){ return selectedSet.value.has(keyOf(it, cat)); }
function toggleSelect(it: MarketItem, cat: string){
  const k = keyOf(it, cat);
  if (selectedSet.value.has(k)) { selectedSet.value.delete(k); delete selectedQty.value[k]; }
  else { selectedSet.value.add(k); if (!selectedQty.value[k] || selectedQty.value[k] < 1) selectedQty.value[k] = 1; }
}
const selectedQty = ref<Record<string, number>>({});
function changeQty(it: MarketItem, cat: string, delta: number){
  const k = keyOf(it, cat);
  if (!selectedSet.value.has(k)) return;
  const cur = Math.max(1, (selectedQty.value[k]||1) + delta);
  selectedQty.value[k] = cur;
}
function onQtyInput(it: MarketItem, cat: string, ev: Event){
  const k = keyOf(it, cat);
  const val = Math.max(1, parseInt((ev.target as HTMLInputElement).value, 10) || 1);
  selectedQty.value[k] = val;
}
const selectedList = computed(()=>{
  const out: Array<{cat:string; item:MarketItem; qty:number}> = [];
  marketCategories.value.forEach(cat => {
    (market.value[cat]||[]).forEach(it => {
      const k = keyOf(it, cat);
      if (selectedSet.value.has(k)) out.push({ cat, item: it, qty: Math.max(1, selectedQty.value[k]||1) });
    });
  });
  return out;
});
const itemsTotalPrice = computed(()=> selectedList.value.reduce((s,x)=> s + (x.item.price||0) * (x.qty||1), 0));
// 当前视图点数与消耗（仅当前选择）
const totalAttrPoints = computed(()=> CORE_ATTRIBUTES.reduce((s,a)=> s + (attributePoints.value[a]||0), 0));
const attrTotalPrice = computed(()=> calculateDynamicCost(initialBonusSum.value, totalAttrPoints.value));
// 进化进度（仅当前视图）
const currentNewSum = computed(()=> initialBonusSum.value + totalAttrPoints.value);
const currentTier = computed(()=> getRatingForSum(currentNewSum.value));
const nextTierText = computed(()=> {
  const t = currentTier.value as any; const tierInfo = powerTiers[t];
  return tierInfo.max === Infinity ? '已达最高' : `下一级: ${tierInfo.max + 1}`;
});
const evoPercent = computed(()=> {
  const t = currentTier.value as any; const info = powerTiers[t];
  if (!info) return 0;
  const inTier = currentNewSum.value - info.min;
  const size = info.max - info.min;
  return size === Infinity ? 100 : Math.min(100, Math.max(0, (inTier / size) * 100));
});
// 全部草稿的总加点消耗（逐条使用各自 baseSum）
const draftsAttrTotalPrice = computed(()=> {
  let total = 0;
  Object.entries(attrDrafts.value).forEach(([key, d]) => {
    const meta = attrDraftMeta.value[key];
    const base = meta?.baseSum ?? 0;
    const pts = CORE_ATTRIBUTES.reduce((s,a)=> s + (d[a]||0), 0);
    total += calculateDynamicCost(base, pts);
  });
  return total;
});
const totalPrice = computed(()=> itemsTotalPrice.value + draftsAttrTotalPrice.value);
const remainingCoins = computed(()=> (initialCoins.value || 0) - totalPrice.value);
const canSendTransaction = computed(()=> {
  if (remainingCoins.value < 0) return false;
  if (itemsTotalPrice.value > 0) return true;
  const anyDraft = Object.values(attrDrafts.value).some(d => CORE_ATTRIBUTES.some(a => (d[a]||0) > 0));
  return anyDraft || totalAttrPoints.value > 0;
});
const sendDisabledReason = computed(()=> {
  if (canSendTransaction.value) return '';
  if (remainingCoins.value < 0) return '余额不足，无法生成交易协议';
  return '请选择商品或进行属性加点后再生成协议';
});
 function sendMarket(){
  if (!canSendTransaction.value) return;
  const lines: string[] = [];
  lines.push('# 【主神空间 - 交易结算协议】');
  // 汇总所有草稿（多角色/多血统）
  const groups: Record<string, Array<{ blood: string; points: Record<string, number> }>> = {};
  Object.entries(attrDrafts.value).forEach(([key, pts]) => {
    const [charKey, bloodKey] = key.split('||');
    if (!groups[charKey]) groups[charKey] = [];
    groups[charKey].push({ blood: bloodKey, points: pts });
  });
  const resolveCharName = (charKey: string) => String(charKey || '未知角色');
  const sumPoints = (pts: Record<string, number>) => CORE_ATTRIBUTES.reduce((s,a)=> s + (pts[a]||0), 0);
  const draftTotalCost = Object.entries(attrDrafts.value).reduce((t,[key,pts])=>{
    const base = attrDraftMeta.value[key]?.baseSum ?? 0;
    return t + calculateDynamicCost(base, sumPoints(pts));
  }, 0);
  if (Object.keys(groups).length) {
    lines.push('## 【基因序列强化日志】');
    Object.entries(groups).forEach(([charKey, arr]) => {
      const name = resolveCharName(charKey);
      lines.push(`- 角色：${name}`);
      arr.forEach((it, idx) => {
        if (idx > 0) lines.push('');
        const baseKey = `${charKey}||${it.blood}`;
        const meta = attrDraftMeta.value[baseKey];
        const base = meta?.baseSum ?? 0;
        const initTier = String(meta?.initialTier || getRatingForSum(base));
        const sumPts = sumPoints(it.points);
        const newSum = base + sumPts;
        const newTier = String(getRatingForSum(newSum));
        const evoName = newTier !== initTier ? formatEvolvedBloodName(it.blood, newTier) : it.blood;
        if (newTier !== initTier) {
          lines.push(`*   **警报:** [${it.blood}] 基因序列发生质变跃迁！等级提升！`);
          lines.push(`*   **系统演算中:** 正在根据进化后的基因序列特性，随机生成同阶核心能力与被动技能,或对原有能力进行升级...`);
        }
        lines.push(`*   **目标:** [${it.blood}] 基因序列。`);
        const cost = calculateDynamicCost(base, sumPts);
        lines.push(`*   **操作:** 注入高维能量，执行定向强化。消耗 ${cost} 空间币。`);
        const baseBonuses = (attrDraftMeta.value[baseKey]?.bonuses || {}) as Record<string, number>;
        const updated = CORE_ATTRIBUTES.map(a => `${a}+${(baseBonuses[a]||0) + (it.points[a]||0)}`);
        lines.push(`*   **强化结果:** 基因序列的属性加成已更新为: ${updated.join(', ')}`);
        lines.push(`*   **系统:** 新的基因序列名称、能力、技能正在生成中...`);
        lines.push('');
      });
    });
  }
  lines.push('## 【物质兑换清单】');
  selectedList.value.forEach(x=>{
    const qty = Math.max(1, x.qty||1);
    const subtotal = (x.item.price||0) * qty;powershell -NoProfile -Command "git add -A; git commit -m 'feat(status): 属性修正区块与NPC详情修正值; build: update dist'; git push"
    lines.push(`*   **项目:** ${x.item.name} [评级:${x.item.rating}] × ${qty}`);
    lines.push(`*   **小计:** ${subtotal} 空间币`);
  });
  lines.push('');
  lines.push('---');
  lines.push(`## 【财务结算摘要】`);
  lines.push(`*   **交易总额:** ${totalPrice.value} 空间币`);
  lines.push(`*   **账户余额:** ${Math.max(0, initialCoins.value - totalPrice.value)} 空间币`);
  lines.push('---');
  lines.push('【系统】: 正在验证轮回者权限...权限已确认。');
  lines.push('【系统】: 正在核对账户余额...余额充足。');
  lines.push('【系统】: 正在执行资源交换协议...');
  lines.push('【系统】: 交换完成。数据已同步至您的轮回印记。');
  lines.push('【系统】: 已给予轮回者更多时间适应新购买的商品。');
  const msg = lines.join('\n').replace(/\n{3,}/g,'\n\n');
  sendDirect(msg);
}

const pendingWorldIndex = ref<number|null>(null);
function setPendingWorld(i: number){ pendingWorldIndex.value = i; }
function cancelWorld(){ pendingWorldIndex.value = null; }
function confirmWorld(i?: number){
  if (typeof i === 'number') pendingWorldIndex.value = i;
  const idx = pendingWorldIndex.value;
  if (idx === null || idx < 0 || idx >= missions.value.length) return;
  const m = missions.value[idx];
  const message = `## 【世界信息】\n**世界名称：** 【${m.title}】\n\n## 【世界背景】\n${m.body}\n\n## 正在进入该世界...`;
  sendDirect(message);
  pendingWorldIndex.value = null;
}

function parseBonusString(bonusStr: any): Record<string, number> {
  const bonuses: Record<string, number> = Object.fromEntries(CORE_ATTRIBUTES.map(a=>[a,0])) as any;
  if (!bonusStr) return bonuses;
  if (typeof bonusStr === 'string') {
    const parts = String(bonusStr)
      .replace(/[\[\]（）()]/g,' ')
      .split(/[，,、;\n\r]+/)
      .map(s=>s.trim())
      .filter(Boolean);
    let restAll: number | null = null;
    parts.forEach(part => {
      const rest = part.match(/(其余|其餘|其他|其它)\s*[:：]?\s*[+＋]?\s*([+-−—]?[\d\.]+)/);
      if (rest) { restAll = parseInt(rest[2].replace('−','-').replace('—','-'), 10) || 0; return; }
      const m = part.match(/(力量|体力|敏捷|智力|精神|魅力)\s*[:：]?\s*[+＋]?\s*([+-−—]?[\d\.]+)/);
      if (m) {
        const key = m[1];
        const raw = m[2].replace('−','-').replace('—','-');
        bonuses[key] = parseInt(raw, 10) || 0;
      }
    });
    if (restAll !== null) {
      (['力量','体力','敏捷','智力','精神','魅力'] as const).forEach(k => {
        if (!bonuses[k]) bonuses[k] = restAll as number;
      });
    }
  } else if (typeof bonusStr === 'object') {
    CORE_ATTRIBUTES.forEach(a => { bonuses[a] = parseInt(String((bonusStr as any)[a]||'0'), 10) || 0; });
  }
  return bonuses;
}



function applyFontControls(){
  const root = document.querySelector('.parchment .story') as HTMLElement | null;
  if (!root) return;
  root.style.fontSize = `${fontSize.value}px`;
  const map: Record<string,string> = {
    inter: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    'noto-sans': 'Noto Sans SC, Inter, system-ui, sans-serif',
    merri: 'Merriweather, Georgia, serif',
    'noto-serif': 'Noto Serif SC, Merriweather, serif',
    jetbrains: 'JetBrains Mono, SF Mono, Monaco, Menlo, Consolas, monospace',
  };
  // 默认使用继承：不设置内联 font-family，让其从父级继承
  if (fontFamily.value && fontFamily.value !== 'default') {
    root.style.fontFamily = map[fontFamily.value] || '';
  } else {
    root.style.removeProperty('font-family');
  }
}

function onFontSize(ev: Event){
  const v = parseInt((ev.target as HTMLInputElement).value, 10) || 14;
  fontSize.value = Math.min(22, Math.max(12, v));
  try { localStorage.setItem('无限_font_size', String(fontSize.value)); } catch {}
  applyFontControls();
}
function onFontFamily(ev: Event){
  fontFamily.value = (ev.target as HTMLSelectElement).value || 'default';
  try { localStorage.setItem('无限_font_family', fontFamily.value); } catch {}
  applyFontControls();
}

function applyTheme(t: string){
  try {
    const html = document.documentElement as HTMLElement;
    const valid = ['parchment','unl-night'];
    const next = valid.includes(t) ? t : 'parchment';
    html.setAttribute('data-unlimited-theme', next);
  } catch {}
}
function toggleTheme(){
  theme.value = theme.value === 'unl-night' ? 'parchment' : 'unl-night';
  try { localStorage.setItem('无限_theme', theme.value); } catch {}
  applyTheme(theme.value);
}

function markHostMessageContainer(){
  try {
    const parentDoc = (window.parent as any)?.document || document;
    // 优先：iframe 情况
    const frame = window.frameElement as HTMLElement | null;
    if (frame && (frame as any).closest) {
      const mes = (frame as any).closest('.mes') as HTMLElement | null;
      if (mes) { mes.setAttribute('data-th-keep', '1'); return; }
    }
    // 退化：非 iframe 情况，尝试从 #app 向上查找
    const app = document.querySelector('#app') as HTMLElement | null;
    if (app && (app as any).closest) {
      const mes2 = (app as any).closest('.mes') as HTMLElement | null;
      if (mes2) { mes2.setAttribute('data-th-keep', '1'); return; }
    }
  } catch {}
}

// 自定义文本着色（兜底）：
// - 将 *...* 转成 <em>...<\/em>
// - 将以中文引号" 开头的整行标记为对话 .s-dialog
// - 将行首【系统】保持粗体（上面已处理），并标记为 .s-system
function colorizeStorySafe(input: string): string {
  if (!input) return input;
  try {
    // 用占位符屏蔽受保护容器，避免内部文本被误解析
    const holders: string[] = [];
    let text = input.replace(/<((?:details)[^>]*class=\"[^\"]*thinking-description[^\"]*\"[^>]*)>([\s\S]*?)<\/details>/gi, (_m, open, body) => {
      const idx = holders.push(`<details ${open.split('details')[1] || ''}>${body}</details>`) - 1;
      return `@@THHOLDER_${idx}@@`;
    });
    text = text.replace(/<div[^>]*class=\"[^\"]*th-embed[^\"]*\"[^>]*>[\s\S]*?<\/div>/gi, (_m) => {
      const idx = holders.push(_m) - 1; return `@@THHOLDER_${idx}@@`; });
    text = text.replace(/<(code|pre|script|style)[^>]*>[\s\S]*?<\/\1>/gi, (_m) => {
      const idx = holders.push(_m) - 1; return `@@THHOLDER_${idx}@@`; });

    // 简化着色：注入 em、对话/系统/引用类，并处理行内对话（避免被 scoped 拦截）
    // 1) *...* → <em>
    text = text.replace(/(^|[^*])\*([^*<>\n]+)\*(?!\*)/g, (_m, p1, p2) => `${p1}<em>${p2}</em>`);

    // 2) 行内对话（不破坏标签）：仅处理非标签段
    function replaceInlineDialogOutsideTags(input: string): string {
      const parts = input.split(/(<[^>]+>)/g);
      for (let i = 0; i < parts.length; i++) {
        const seg = parts[i];
        if (!seg || /^<[^>]+>$/.test(seg)) continue;
        parts[i] = seg
          .replace(/(^|[^A-Za-z0-9_=])\"([^\"<>\n]+)\"/g, '$1<span class="s-dialog-inline">"$2"</span>')
          .replace(/「([^」]+)」/g, '<span class="s-dialog-inline">「$1」</span>')
          .replace(/『([^』]+)』/g, '<span class="s-dialog-inline">『$1』</span>')
          .replace(/__([^_]+)__/g, '<u>$1</u>');
      }
      return parts.join('');
    }
    text = replaceInlineDialogOutsideTags(text);

    // 3) 块级对话/系统/引用（整行处理，跳过以标签开头的行）
    text = text.split(/\n/).map(rawLine => {
      let line = rawLine;
      const t = line.replace(/^\s+/, '');
      if (!t) return line;
      if (/^</.test(t)) return line; // 以标签开头则跳过
      const hasAngle = /[<>]/.test(line);
      const looksLikeAttr = /[A-Za-z_][\w:-]*\s*=\s*"/.test(line);
      if (!hasAngle && !looksLikeAttr) {
        if (/^【系统】/.test(t)) return `<span class="s-system">${line}</span>`;
        if (/^[\"“「『]/.test(t)) return `<span class="s-dialog">${line}</span>`;
        if (/^(>|——)/.test(t)) return `<span class="s-quote">${line}</span>`;
      }
      return line;
    }).join('\n');

    // 恢复占位
    text = text.replace(/@@THHOLDER_(\d+)@@/g, (_m, i) => holders[parseInt(String(i), 10)] || '');
    return text;
  } catch { return input; }
}

function loadBloodlineData(){
  try {
    const rawBlood = currentChar.value?.['血统'];
    if (!rawBlood || typeof rawBlood !== 'object') { canAddPoints.value = false; return; }
    const list = Array.isArray(rawBlood)
      ? rawBlood
          .map((entry:any) => {
            if (!entry) return null;
            // 支持两种形态：{ 名称:'...', ... } 或 { key: {...} }
            if (typeof entry === 'object' && '名称' in entry) return { key: String(entry['名称']), data: entry };
            const k = Object.keys(entry)[0];
            return k ? { key: k, data: entry[k] || {} } : null;
          })
          .filter(Boolean)
      : Object.keys(rawBlood).map(k => ({ key: k, data: rawBlood[k] || {} }));
    allBloodlines.value = list.map((b:any)=>({ key:b.key, name: b.data['名称'] || b.key, data: b.data }));
    canAddPoints.value = allBloodlines.value.length > 0;
  } catch { canAddPoints.value = false; }
}

function updateCurrentBloodlineData(){
  if (!canAddPoints.value) return;
  const cur = allBloodlines.value[Math.max(0, Math.min(selectedBloodlineIndex.value, allBloodlines.value.length-1))];
  const bonuses = parseBonusString(cur?.data?.属性加成);
  initialBloodlineBonuses.value = bonuses;
  initialBonusSum.value = CORE_ATTRIBUTES.reduce((s,a)=> s + (bonuses[a]||0), 0);
  // 保存当前组合的底稿元信息（用于总成本与进化判断）
  try {
    const key = draftKeyForCurrent();
    const tier = getRatingForSum(initialBonusSum.value);
    // 记录原始六维加成，便于"强化结果"输出为 原始+本次加点
    attrDraftMeta.value[key] = { baseSum: initialBonusSum.value, initialTier: String(tier), bonuses: { ...bonuses } as any } as any;
  } catch {}
}

function getRatingForSum(sum: number): keyof typeof powerTiers {
  for (const t of tierOrder) if (sum <= powerTiers[t].max) return t;
  return 'SSS';
}

function tierLetterString(tier: string): string {
  const t = String(tier).toUpperCase();
  if (t === 'SSS') return 'SSS级';
  if (t === 'SS') return 'SS级';
  if (t === 'S') return 'S级';
  if ('ABCDEF'.includes(t)) return `${t}级`;
  return '';
}

function formatEvolvedBloodName(originalName: string, newTier: string): string {
  const name = String(originalName || '').trim();
  const label = bloodlineTierNames[newTier] || '';
  const letter = tierLetterString(newTier);
  const labels = Object.values(bloodlineTierNames).filter(Boolean).join('|');
  const reLetter = /^(SSS级|SS级|S级|[A-F]级)([\s\S]+)$/;
  const reLabelLetter = new RegExp(`^(${labels})(SSS级|SS级|S级|[A-F]级)([\\s\\S]+)$`);
  const reLabelOnly = new RegExp(`^(${labels})([\\s\\S]+)$`);
  let suffix = '';
  let m: RegExpMatchArray | null;
  if ((m = name.match(reLabelLetter))) {
    suffix = m[3].trim();
    return `${label}${letter}${suffix}`;
  }
  if ((m = name.match(reLabelOnly))) {
    suffix = m[2].trim();
    return `${label}${letter}${suffix}`;
  }
  if ((m = name.match(reLetter))) {
    suffix = m[2].trim();
    return `${label}${letter}${suffix}`;
  }
  return `${label}${name}`;
}

function calculateDynamicCost(baseSum: number, pointsToAdd: number): number {
  if (pointsToAdd <= 0) return 0;
  let totalCost = 0, remaining = pointsToAdd, cur = baseSum;
  while (remaining > 0) {
    const tier = getRatingForSum(cur);
    const costPer = powerTiers[tier].cost;
    const toNext = powerTiers[tier].max - cur + 1;
    const take = Math.min(remaining, toNext);
    totalCost += take * costPer;
    cur += take;
    remaining -= take;
  }
  return totalCost;
}

function changeAttr(a: typeof CORE_ATTRIBUTES[number], delta: number){
  const cur = Math.max(0, (attributePoints.value[a]||0) + delta);
  attributePoints.value[a] = cur;
  persistDraft();
}
function onAttrInput(a: typeof CORE_ATTRIBUTES[number], ev: Event){
  const val = parseInt((ev.target as HTMLInputElement).value, 10) || 0;
  attributePoints.value[a] = Math.max(0, val);
  persistDraft();
}

function switchBloodline(step: number){
  if (!allBloodlines.value.length) return;
  selectedBloodlineIndex.value = (selectedBloodlineIndex.value + step + allBloodlines.value.length) % allBloodlines.value.length;
  loadDraft();
  updateCurrentBloodlineData();
}

function onCharChange(){
  const idx = selectedCharIndex.value;
  currentChar.value = idx === 0 ? meRef.value : companionsRef.value[idx - 1];
  panelBaseAttributes.value = Object.fromEntries(CORE_ATTRIBUTES.map(a => [a, parseInt(String((currentChar.value?.属性?.基础?.[a]) ?? '0').replace(/,/g,'')) || 0]));
  loadDraft();
  selectedBloodlineIndex.value = 0;
  loadBloodlineData();
  updateCurrentBloodlineData();
}

function draftKeyForCurrent(): string {
  const charName = String(currentChar.value?.姓名 || currentChar.value?.名称 || '未知角色');
  const bloodName = String(currentBloodline.value?.name || '');
  return `${charName}||${bloodName}`;
}
function persistDraft(){
  const key = draftKeyForCurrent();
  if (!key || !key.includes('||')) return;
  attrDrafts.value[key] = { ...(attrDrafts.value[key]||{}), ...attributePoints.value };
  // 若缺少元信息则补齐
  if (!attrDraftMeta.value[key]) {
    const tier = getRatingForSum(initialBloodlineBonuses.value ? initialBonusSum.value : 0);
    attrDraftMeta.value[key] = {
      baseSum: initialBloodlineBonuses.value ? initialBonusSum.value : 0,
      initialTier: String(tier),
      bonuses: { ...initialBloodlineBonuses.value } as any,
    } as any;
  }
}
function loadDraft(){
  const key = draftKeyForCurrent();
  const saved = attrDrafts.value[key] || {};
  attributePoints.value = Object.fromEntries(CORE_ATTRIBUTES.map(a => [a, parseInt(String(saved[a]||'0'), 10) || 0])) as any;
}

function chooseChar(i: number){ selectedCharIndex.value = i; onCharChange(); }
function chooseBloodline(i: number){ selectedBloodlineIndex.value = i; loadDraft(); updateCurrentBloodlineData(); }

function hasBloodlines(charObj: any): boolean {
  try {
    const rawBlood = charObj?.['血统'];
    if (!rawBlood || typeof rawBlood !== 'object') return false;
    if (Array.isArray(rawBlood)) return rawBlood.length > 0;
    return Object.keys(rawBlood).length > 0;
  } catch { return false; }
}

function refreshEnabledRegs(){
  try {
    // 拉取全部启用规则（包含 global/character），再在本地过滤
    regsCache = getTavernRegexes({ scope: 'all', enable_state: 'enabled' }) || [];
    hasIgnoreRule = regsCache.some(r => String(r?.script_name || '').includes(IGNORE_SUBSTR));
    // 仅保留对 AI 输出且用于显示的规则；明确排除 user_input 规则，避免执行用户输入的正则
    const allow = (r: any) => !!(r?.source?.ai_output) && !!(r?.destination?.display) && !r?.source?.user_input;
    // 预编译：过滤后编译为 RegExp，减少 applyTavernTo 的开销
    const list = (hasIgnoreRule ? regsCache.filter(r => !String(r?.script_name || '').includes(IGNORE_SUBSTR)) : regsCache)
      .filter(allow);
    compiledRegs = [];
    list.forEach(r => {
      const body = String(r.find_regex || '').trim();
      if (!body) return;
      try {
        const lit = parseLiteral(body);
        const re = new RegExp(lit ? lit.body : body, lit ? lit.flags : 'g');
        compiledRegs.push({ re, replace: String(r.replace_string ?? '') });
      } catch {}
    });
  } catch { regsCache = []; hasIgnoreRule = false; }
}

function applyTavernTo(text: string): string {
  if (!text) return '';
  // 为了避免执行用户输入的正则，统一仅应用我们本地过滤/预编译后的规则集合
  let out = text;
  compiledRegs.forEach(({ re, replace }) => {
    try { out = out.replace(re, replace); } catch {}
  });
  return out;
}

 
function parseLiteral(input: string): { body: string; flags: string } | null {
  if (!input) return null;
  const s = input.trim();
  if (s[0] !== '/') return null;
  let end = -1;
  for (let i = s.length - 1; i >= 1; i--) {
    if (s[i] === '/') {
      let bs = 0;
      for (let k = i - 1; k >= 0 && s[k] === '\\'; k--) bs++;
      if (bs % 2 === 0) { end = i; break; }
    }
  }
  if (end <= 0) return null;
  const body = s.slice(1, end);
  const flagStr = s.slice(end + 1);
  const uniqFlags = Array.from(new Set(flagStr.split(''))).filter(f => 'gimsuy'.includes(f)).join('');
  return { body, flags: uniqFlags };
}
</script>

<style scoped>
@import './公共样式.scss';
.page { padding: 10px; }
.story { white-space: pre-wrap; line-height: 1.9; font-size: 14px; }

/* 文本着色交由非 scoped 全局样式控制，避免重复与冲突 */

/* 选项卡片（适配羊皮纸风格） */
.opts-card {
  margin-top: 10px;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(120,90,50,0.35);
  border-radius: 10px;
  box-shadow: inset 0 0 15px rgba(120,90,50,0.08);
  overflow: hidden;
}
.opts-summary { list-style: none; }
.opts-summary::-webkit-details-marker { display: none; }
.opt-toggle {
  padding: 8px 10px;
  text-align: center;
  font-weight: 800;
  color: #3b2f2f;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.78));
  border-bottom: 1px solid rgba(120,90,50,0.18);
}
.opt-btns { display: flex; flex-direction: column; gap: 6px; padding: 8px; }
.opt-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; border-radius: 8px; cursor: pointer;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(120,90,50,0.35);
  color: #3b2f2f; text-align: left; font-weight: 700;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.opt-btn .dot {
  width: 10px; height: 10px; border-radius: 50%; flex: 0 0 auto;
  background: radial-gradient(circle at 35% 35%, #9a6b3f, #6d4a2c 70%);
  box-shadow: 0 0 0 2px #f7edd0 inset, 0 0 0 3px rgba(120,90,50,0.35) inset;
}
.opt-btn:hover { background: rgba(255,255,255,0.8); transform: translateY(-1px); box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
.opt-btn.active { background: rgba(255,255,255,0.9); border-color: rgba(120,90,50,0.6); }
.opt-btn .txt { white-space: normal; line-height: 1.6; }

/* 世界候选 */
.missions { padding: 4px 0; display: grid; grid-template-columns: 1fr; gap: 8px; }
.mission { background: rgba(255,255,255,0.65); border: 1px solid rgba(120,90,50,0.28); border-radius: 8px; padding: 8px; }
.mission.sel { border-color: rgba(120,90,50,0.6); background: rgba(255,255,255,0.85); }
.m-title { font-weight: 900; color: #3b2f2f; margin-bottom: 6px; }
.m-body { color: #4a3a3a; line-height: 1.7; white-space: pre-wrap; }
.m-actions { display: flex; gap: 6px; margin-top: 8px; }

/* 市场（商城） */
.market { padding: 4px 0; }
.market-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.market-tab { padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(120,90,50,0.35); background: rgba(255,255,255,0.6); color: #3b2f2f; cursor: pointer; font-weight: 700; }
.market-tab.a { background: rgba(255,255,255,0.85); border-color: rgba(120,90,50,0.6); }
.market-items { display: grid; grid-template-columns: 1fr; gap: 6px; }
/* 市场商品项 - 添加边框和背景 */
.item { 
  padding: 8px; 
  background: rgba(255,255,255,0.55);  /* 添加半透明白色背景 */
  border: 1px solid rgba(120,90,50,0.35);  /* 添加边框 */
  border-radius: 8px;  /* 圆角 */
  transition: all 0.2s ease;  /* 平滑过渡 */
}
.item:hover {
  background: rgba(255,255,255,0.65);  /* 悬停时稍微亮一点 */
}
.item.sel { 
  background: rgba(255,248,235,0.9);  /* 选中时明显的暖黄色背景 */
  border-color: rgba(120,90,50,0.6);  /* 边框加深 */
  box-shadow: 0 0 0 2px rgba(212,196,160,0.2);  /* 添加外发光效果 */
}
.item.sel { background: rgba(255,255,255,0.8); border-color: rgba(120,90,50,0.6); }
.i-name { font-weight: 900; color: #3b2f2f; }
.i-badges { display: flex; gap: 6px; }
.i-attrs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.qty { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
.qty .a-btn { padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(120,90,50,0.35); background: rgba(255,255,255,0.7); color: #3b2f2f; cursor: pointer; }
.qty .a-input { width: 60px; height: 28px; text-align: center; border: 1px solid rgba(120,90,50,0.35); border-radius: 6px; background: rgba(255,255,255,0.7); }
.market-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.sum { color: #6b4f3e; }
.sum .sep { margin: 0 6px; color: #b08b5f; }
.sum .warn { color: #a33f3f; }
.warn-msg { color: #a33f3f; font-size: 12px; margin-left: 8px; }
button.btn[disabled],
button.btn:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(0.2); }

/* 通用行布局与商店条目防溢出处理 */
.row.between { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.item .row { gap: 8px; }
.i-name { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; }
.i-badges { flex-wrap: wrap; justify-content: flex-end; }

/* 属性加点 UI */
.attr-panel { padding: 6px 2px; }
.char-row, .bl-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
.chip-btn { padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(120,90,50,0.35); background: rgba(255,255,255,0.6); color: #3b2f2f; font-weight: 700; cursor: pointer; }
.chip-btn.a { background: rgba(255,255,255,0.85); border-color: rgba(120,90,50,0.6); }
.attr-sum { margin-bottom: 6px; }
.evo-section { background: rgba(255,255,255,0.55); border: 1px solid rgba(120,90,50,0.35); border-radius: 8px; padding: 8px; margin-bottom: 6px; }
.evo-title { font-weight: 900; color: #3b2f2f; margin-bottom: 6px; }
.evo-bar { position: relative; height: 10px; border: 1px solid rgba(120,90,50,0.45); border-radius: 999px; background: rgba(255,255,255,0.7); overflow: hidden; }
.evo-fill { height: 100%; background: linear-gradient(90deg, #caa96e, #9a7b4f); box-shadow: 0 0 6px rgba(154,123,79,0.6); display: flex; align-items: center; justify-content: flex-end; }
.evo-text { font-size: 10px; color: #3b2f2f; padding-right: 6px; }
.evo-info { display: flex; justify-content: space-between; margin-top: 6px; color: #6b4f3e; font-size: 12px; }
.attr-grid { display: grid; grid-template-columns: 1fr; gap: 6px; }
.attr-row { background: rgba(255,255,255,0.55); border: 1px solid rgba(120,90,50,0.35); border-radius: 8px; padding: 8px; display: grid; grid-template-columns: 110px 1fr auto; gap: 8px; align-items: center; }
.a-name { font-weight: 800; color: #3b2f2f; display: flex; align-items: center; gap: 6px; }
.a-name .emo { font-size: 16px; }
.a-base { color: #6b4f3e; font-size: 12px; }
.a-ctrl { display: flex; align-items: center; gap: 6px; }
.a-btn { padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(120,90,50,0.35); background: rgba(255,255,255,0.7); color: #3b2f2f; cursor: pointer; }
.a-input { width: 60px; height: 28px; text-align: center; border: 1px solid rgba(120,90,50,0.35); border-radius: 6px; background: rgba(255,255,255,0.7); }

/* 齿轮与主题面板 */
.gear { position: absolute; right: 12px; top: 12px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.9); border: 1px solid rgba(120,90,50,0.45); cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.18); z-index: 10; }
.theme-toggle { position: absolute; right: 48px; top: 12px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.9); border: 1px solid rgba(120,90,50,0.45); cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.18); z-index: 10; }
.gear-panel { position: absolute; right: 12px; top: 48px; background: #fffdf6; border: 1px solid rgba(120,90,50,0.45); border-radius: 10px; padding: 10px; width: 240px; box-shadow: 0 14px 30px rgba(0,0,0,0.25); z-index: 20; }
.gear-title { font-weight: 900; color: #3b2f2f; margin-bottom: 6px; }
.gear-opts { display: flex; gap: 6px; flex-wrap: wrap; }
.gear-opt { padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(120,90,50,0.35); background: rgba(255,255,255,0.6); color: #3b2f2f; cursor: pointer; font-weight: 700; }
.gear-opt.a { background: rgba(255,255,255,0.85); border-color: rgba(120,90,50,0.6); }
.gear-ctl { display: inline-flex; align-items: center; gap: 8px; padding: 4px 8px; border: 1px solid rgba(120,90,50,0.35); background: rgba(255,255,255,0.6); border-radius: 8px; }
.gear-ctl .val { font-weight: 700; color: #3b2f2f; }
.btn.small { padding: 4px 8px; font-size: 12px; }

/* 检定结果（内联组件化样式，精简自 check.html）- 使用 :deep 以适配 scoped */
:deep(.check-result) { margin: 8px 0; }
:deep(.cr-btn) { display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; margin: 2px 0; background: linear-gradient(180deg, #f7edd0, #e9d7a8); color: #3b2f2f; border: 1px solid rgba(120,90,50,0.35); border-radius: 10px; cursor: pointer; user-select: none; position: relative; box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 4px rgba(0,0,0,0.12); }
:deep(.cr-btn.active) { background: linear-gradient(180deg, #fff7dc, #f0e0b6); border-color: rgba(120,90,50,0.6); }
:deep(.cr-ico) { font-size: 14px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2)); }
:deep(.cr-label) { font-size: 12px; color: #3b2f2f; max-width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: 0.3px; }
:deep(.cr-content) { display: none; margin: 8px 0 14px 8px; padding: 10px 12px; background: rgba(255,255,255,0.55); border: 1px solid rgba(120,90,50,0.28); border-radius: 8px; box-shadow: inset 0 0 15px rgba(120,90,50,0.08); position: relative; overflow: hidden; }
:deep(.cr-content.show) { display: block; }
:deep(.cr-content:before) { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: linear-gradient(180deg, rgba(120,90,50,0.6), rgba(120,90,50,0.25)); box-shadow: none; }
:deep(.content-line) { padding: 3px 0; font-family: 'SF Mono','Monaco','Inconsolata','Fira Code',monospace; font-size: 12px; color: #3b2f2f; white-space: pre-wrap; }
:deep(.content-line.first-line) { font-weight: 800; color: #3b2f2f; padding-bottom: 6px; margin-bottom: 6px; border-bottom: 1px solid rgba(120,90,50,0.25); background: linear-gradient(90deg, rgba(154,123,79,0.12), transparent); }
:deep(.content-line.indent-1) { padding-left: 18px; }
:deep(.content-line.indent-2) { padding-left: 36px; }
:deep(.content-line.indent-3) { padding-left: 54px; }
:deep(.tk-code) { background: rgba(255,255,255,0.8); color: #7a4f2f; padding: 0 4px; border-radius: 4px; border: 1px solid rgba(120,90,50,0.3); margin: 0 2px; }
:deep(.tk-keyword) { color: #7a4f2f; font-weight: 900; }
:deep(.tk-number) { color: #7a5d2f; font-weight: 800; }
:deep(.tk-dice) { color: #9a6b3f; background: rgba(154,123,79,0.15); padding: 0 3px; border-radius: 3px; border: 1px solid rgba(120,90,50,0.25); }
:deep(.tk-success) { color: #2f7a4f; font-weight: 800; }
:deep(.tk-fail) { color: #a33f3f; font-weight: 800; }
:deep(.tk-damage) { color: #a33f3f; font-weight: 900; }
:deep(.tk-heal) { color: #2f7a4f; font-weight: 900; }
:deep(.tk-bracket) { color: #7a4f2f; }
:deep(.tk-arrow) { color: #9a6b3f; font-weight: 900; margin: 0 4px; }
:deep(.tk-separator) { color: #6b4f3e; margin: 0 6px; opacity: 0.6; }

@media (max-width: 768px){
  :deep(.cr-label) { max-width: calc(85vw - 60px); }
  :deep(.cr-content) { margin: 8px 0 12px 12px; }
}
@media (max-width: 768px) {
  .market-tabs { flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .market-tab { padding: 4px 8px; font-size: 12px; }
  .attr-grid { gap: 8px; }
  .attr-row { grid-template-columns: 1fr auto; align-items: center; }
  .a-base { grid-column: 1 / -1; }
  .a-btn { padding: 4px 10px; }
  .a-input { width: 54px; height: 32px; }
  .a-input::-webkit-outer-spin-button,
  .a-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .a-input[type=number] { -moz-appearance: textfield; }
  .evo-info { flex-direction: column; gap: 4px; align-items: flex-start; }
  .char-row, .bl-row { gap: 6px; }
  .chip-btn { padding: 4px 8px; font-size: 12px; }
  .market-footer { flex-direction: column; gap: 8px; align-items: stretch; }
  .market-tab { 
  padding: 4px 10px; 
  border-radius: 8px; 
  border: 1px solid rgba(120,90,50,0.35); 
  background: rgba(255,255,255,0.7);  /* 稍微提高不透明度 */
  color: #5a4a3a;  /* 深棕色文字 */
  cursor: pointer; 
  font-weight: 700;
  transition: all 0.2s ease;
}
.market-tab:hover {
  background: rgba(255,255,255,0.8);
  transform: translateY(-1px);
}
.market-tab.a { 
  background: rgba(255,248,235,0.9);  /* 激活状态：暖黄色 */
  border-color: rgba(120,90,50,0.55);
  color: #4a3a2a;
  box-shadow: 0 0 0 2px rgba(212,196,160,0.15);
}
}

/* 默认变量（调整为柔和暖白色系） */
.parchment .story { 
  --unl-dialog: #7a5633; 
  --unl-system: #8b7355; 
  --unl-em: #8b6f47; 
  --unl-quote: #6b5a45; 
}

/* 主题覆盖变量 */
:global(html[data-unlimited-theme='default']) .parchment .story { 
  --unl-dialog: #7a5633; 
  --unl-system: #8b7355; 
  --unl-em: #8b6f47; 
  --unl-quote: #6b5a45; 
}

:global(html[data-unlimited-theme='parchment']) .parchment .story { 
  --unl-dialog: #7a5633; 
  --unl-system: #8b7355; 
  --unl-em: #8b6f47; 
  --unl-quote: #6b5a45; 
}

/* 统一着色（作用到 v-html 内容） */
.story :deep(.s-dialog) { color: var(--unl-dialog) !important; }
.story :deep(.s-dialog-inline) { color: var(--unl-dialog) !important; font-weight: 700; }
.story :deep(.s-system) { color: var(--unl-system) !important; font-weight: 800; }
.story :deep(em) { 
  color: var(--unl-em) !important; 
  font-style: italic;
  /* 已删除背景阴影 */
}
.story :deep(.s-quote) { 
  color: var(--unl-quote) !important; 
  border-left: 3px solid #9a8c78; 
  padding-left: 8px; 
  display: block; 
}

/* 夜间护眼主题（避免与父页面冲突） */
::global(html[data-unlimited-theme='unl-night']) .parchment { background: #24282e !important; border-color: rgba(255,255,255,0.14) !important; box-shadow: 0 8px 22px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset !important; }
::global(html[data-unlimited-theme='unl-night']) .parchment .head { color: #ffd68a; }
::global(html[data-unlimited-theme='unl-night']) .parchment .story { color: #e6e9ee !important; --unl-dialog: #ffd68a; --unl-system: #c4ccd6; --unl-em: #ffd68a; --unl-quote: #9ca7b7; }
::global(html[data-unlimited-theme='unl-night']) .parchment .story :deep(em) { color: #ffd68a !important; font-weight: 600; }
::global(html[data-unlimited-theme='unl-night']) .parchment .story :deep(.s-dialog) { color: #ffd68a !important; }
::global(html[data-unlimited-theme='unl-night']) .parchment .story :deep(.s-system) { color: #c4ccd6 !important; font-weight: 800; }
::global(html[data-unlimited-theme='unl-night']) .parchment .story :deep(.s-quote) { color: #9ca7b7 !important; border-left-color: #5f6c80 !important; }
::global(html[data-unlimited-theme='unl-night']) .market-tab { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); color: #e6e9ee; }
::global(html[data-unlimited-theme='unl-night']) .market-tab.a { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.28); color: #fff; }
::global(html[data-unlimited-theme='unl-night']) .item { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.18); }
::global(html[data-unlimited-theme='unl-night']) .gear,::global(html[data-unlimited-theme='unl-night']) .theme-toggle { background: rgba(0,0,0,0.2); border-color: rgba(255,255,255,0.2); color: #ffd68a; }
::global(html[data-unlimited-theme='unl-night']) .opts-card { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.18); }
::global(html[data-unlimited-theme='unl-night']) .evo-section { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.18); }
/* Night buttons/tabs overrides */
::global(html[data-unlimited-theme='unl-night']) .tabs .tab { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #e6e9ee; }
::global(html[data-unlimited-theme='unl-night']) .tabs .tab.a { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.28); color: #ffffff; }
::global(html[data-unlimited-theme='unl-night']) .btn { background: #3a4250; color: #e6e9ee; border: 1px solid #6c7a90; }
::global(html[data-unlimited-theme='unl-night']) .btn.small { background: #3a4250; }
::global(html[data-unlimited-theme='unl-night']) .a-btn { background: #3a4250; color: #e6e9ee; border: 1px solid #6c7a90; }
::global(html[data-unlimited-theme='unl-night']) input.a-input { background: #2d333b; color: #e6e9ee; border-color: #6c7a90; }
::global(html[data-unlimited-theme='unl-night']) .sum { color: #c9d1d9; }
::global(html[data-unlimited-theme='unl-night']) .sum .warn { color: #ff7a7a; }
</style>
<style>
html[data-unlimited-theme='unl-night'] .parchment {
  background: #24282e !important;
  border-color: rgba(255,255,255,0.14) !important;
  box-shadow: 0 12px 28px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset !important;
}
html[data-unlimited-theme='unl-night'] .parchment .head { color: #ffd68a; }
html[data-unlimited-theme='unl-night'] .parchment .story {
  color: #e6e9ee !important;
}
/* 主题变量（放在非 scoped，确保不被拦截） */
html[data-unlimited-theme='parchment'] .parchment .story {
  --unl-dialog: #7a5633;
  --unl-system: #8b7355;
  --unl-em: #8b6f47;
  --unl-quote: #6b5a45;
}
html[data-unlimited-theme='unl-night'] .parchment .story {
  --unl-dialog: #ffd68a;
  --unl-system: #c4ccd6;
  --unl-em: #ffd68a;
  --unl-quote: #9ca7b7;
}
/* 正文染色（兼容其他 .html 的类名；非 scoped，随主题变量变色） */
html[data-unlimited-theme] .parchment .story :is(.s-dialog,.s-dialog-inline,.dialog,.dialogue,.th-dialog) {
  color: var(--unl-dialog) !important;
}
html[data-unlimited-theme] .parchment .story :is(.s-system,.system,.th-system) {
  color: var(--unl-system) !important;
  font-weight: 800;
}
html[data-unlimited-theme] .parchment .story :is(.s-quote,blockquote,.th-quote) {
  color: var(--unl-quote) !important;
  border-left: 3px solid var(--unl-quote) !important;
  padding-left: 8px;
  display: block;
}
/* 内心/强调：兼容 em/i 以及常见类名 */
html[data-unlimited-theme] .parchment .story :is(em,i,.inner,.thought,.thinking) {
  color: var(--unl-em) !important;
}
html[data-unlimited-theme='unl-night'] .tabs .tab {
  background: linear-gradient(180deg, #3a4250, #303742);
  color: #e6e9ee;
  border: 1px solid rgba(255,255,255,0.22);
}
html[data-unlimited-theme='unl-night'] .tabs .tab.a {
  background: linear-gradient(180deg, #465064, #3a4250);
  color: #ffffff;
  border-color: rgba(255,255,255,0.32);
}
html[data-unlimited-theme='unl-night'] .btn,
html[data-unlimited-theme='unl-night'] .a-btn {
  background: #3a4250;
  color: #e6e9ee;
  border: 1px solid #6c7a90;
}
html[data-unlimited-theme='unl-night'] input.a-input {
  background: #2d333b;
  color: #e6e9ee;
  border-color: #6c7a90;
}
</style>
