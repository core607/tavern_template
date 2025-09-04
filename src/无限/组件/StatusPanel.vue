<template>
  <div class="status-root">
    <div v-if="!meLoaded" class="loading">正在载入状态数据...</div>
    <div v-else-if="!hasMe" class="error">未能找到有效的角色数据。</div>
    <template v-else>
      <div v-if="showSection('status')" class="sec">
        <div class="sec-h head">🔹 核心信息</div>
        <div class="sec-c">
          <div class="grid2">
            <div class="prop"><div class="pname">姓名</div><div class="pval">{{ v(me?.姓名) }}</div></div>
            <div class="prop"><div class="pname">身份</div><div class="pval">{{ v(me?.身份) }}</div></div>
          </div>
          <div class="prop"><div class="pname">当前位置</div><div class="pval">{{ v(me?.当前位置) }}</div></div>
          <div class="grid2">
            <div class="prop"><div class="pname">行动</div><div class="pval">{{ v(me?.行动) }}</div></div>
            <div class="prop"><div class="pname">当前状态</div><div class="pval">{{ Array.isArray(me?.当前状态) ? v(firstOf(me?.当前状态), '—') : v(me?.当前状态, '—') }}</div></div>
          </div>
          <div class="prop"><div class="pname">外貌</div><div class="pval">{{ v(me?.外貌, '未描述') }}</div></div>
        </div>
      </div>

      <div v-if="showSection('status')" class="sec">
        <div class="sec-h head">📜 履历</div>
        <div class="sec-c">
          <div class="grid2">
            <div class="prop"><div class="pname">称号</div><div class="pval">{{ v(firstOf(me?.称号), '无') }}</div></div>
            <div class="prop"><div class="pname">称号效果</div><div class="pval">{{ v(firstOf(me?.称号效果), '无') }}</div></div>
          </div>
          <div class="prop"><div class="pname">通关记录</div><div class="pval">{{ v(me?.通关记录, 0) }}</div></div>
        </div>
      </div>

      <div v-if="showSection('status')" class="sec">
        <div class="sec-h head">📊 属性</div>
        <div class="sec-c">
          <div class="prop">
            <div class="row between">
              <div class="pname">综合评级</div>
              <div class="pval">{{ v(rank) }}</div>
            </div>
            <div class="bar rank"><div class="val" :style="{ width: rankProgress + '%' }"></div></div>
          </div>
          <div class="grid2">
            <div v-for="(key, idx) in sixKeys" :key="'b'+idx" class="prop">
              <div class="row between"><div class="pname">{{ key }}</div><div class="pval">{{ v(base[key], 0) }}</div></div>
              <div class="bar"><div class="val" :style="{ width: statPct(base[key]) + '%' }"></div></div>
            </div>
          </div>
          <div class="grid3" style="margin-top:6px">
            <div class="prop"><div class="row between"><div class="pname">HP</div><div class="pval">{{ fmt(der.HP) }}/{{ fmt(der['HP上限']) }}</div></div><div class="bar hp"><div class="val" :style="{ width: pct(der.HP, der['HP上限']) + '%' }"></div></div></div>
            <div class="prop"><div class="row between"><div class="pname">ATK</div><div class="pval">{{ fmt(der.ATK) }}</div></div><div class="bar atk"><div class="val" :style="{ width: conceptualPct(der.ATK, 'atk') + '%' }"></div></div></div>
            <div class="prop"><div class="row between"><div class="pname">DEF</div><div class="pval">{{ fmt(der.DEF) }}</div></div><div class="bar def"><div class="val" :style="{ width: conceptualPct(der.DEF, 'def') + '%' }"></div></div></div>
            <div class="prop"><div class="row between"><div class="pname">EP</div><div class="pval">{{ fmt(der.EP) }}/{{ fmt(der['EP上限']) }}</div></div><div class="bar ep"><div class="val" :style="{ width: pct(der.EP, der['EP上限']) + '%' }"></div></div></div>
            <div class="prop"><div class="row between"><div class="pname">SP</div><div class="pval">{{ fmt(der.SP) }}/{{ fmt(der['SP上限']) }}</div></div><div class="bar sp"><div class="val" :style="{ width: pct(der.SP, der['SP上限']) + '%' }"></div></div></div>
            <div class="prop"><div class="row between"><div class="pname">法术ATK</div><div class="pval">{{ fmt(der['法术ATK']) }}</div></div><div class="bar sp"><div class="val" :style="{ width: conceptualPct(der['法术ATK'], 'atk') + '%' }"></div></div></div>
            <div class="prop"><div class="row between"><div class="pname">法术强度</div><div class="pval">{{ v(der['法术强度'], '0%') }}</div></div><div class="bar sp"><div class="val" :style="{ width: (parseFloat(String(v(der['法术强度'], '0').toString().replace('%',''))) || 0) + '%' }"></div></div></div>
          </div>
          <div class="prop" style="margin-top:8px">
            <div class="pname">预设计算 (战斗数值)</div>
            <div class="grid3">
              <div class="prop"><div class="pname">先攻修正</div><div class="pval">+{{ v(preset['先攻修正'], 0) }}</div></div>
              <div class="prop"><div class="pname">防御DC</div><div class="pval">{{ v(preset['防御DC'], 30) }}</div></div>
              <div class="prop"><div class="pname">强韧豁免</div><div class="pval">+{{ v(preset['强韧豁免'], 0) }}</div></div>
              <div class="prop"><div class="pname">反射豁免</div><div class="pval">+{{ v(preset['反射豁免'], 0) }}</div></div>
              <div class="prop"><div class="pname">意志豁免</div><div class="pval">+{{ v(preset['意志豁免'], 0) }}</div></div>
            </div>
          </div>
          
        </div>
      </div>

      <div v-if="showSection('world') || showSection('quests')" class="sec">
        <div class="sec-h head">🌐 世界状态</div>
        <div class="sec-c">
          <template v-if="showSection('world')">
            <div class="prop"><div class="pname">当前状态</div><div class="pval">{{ Array.isArray(me['当前状态']) ? v(firstOf(me['当前状态']), '—') : v(me['当前状态'], '—') }}</div></div>
            <div class="grid2">
              <div class="prop"><div class="pname">世界名称</div><div class="pval">{{ v(me.任务世界信息?.世界名称, '—') }}</div></div>
              <div class="prop"><div class="pname">世界难度</div><div class="pval">{{ v(me.任务世界信息?.难度, '—') }}</div></div>
              <div class="prop"><div class="pname">当前地点</div><div class="pval">{{ v(me.任务世界信息?.当前地点, '—') }}</div></div>
              <div class="prop"><div class="pname">时间</div><div class="pval">{{ v(me.当前时间, '—') }}</div></div>
              <div class="prop"><div class="pname">稳定值</div><div class="pval">{{ v(me.任务世界信息?.稳定值, '—') }}</div></div>
            </div>
            <div class="prop"><div class="pname">任务世界击杀</div>
              <div class="chips">
                <span v-if="worldKillText" class="chip">{{ worldKillText }}</span>
                <div v-else class="empty">暂无击杀记录</div>
              </div>
            </div>
            <!-- 去掉系统开关显示 -->
          </template>
          <div class="prop"><div class="pname">主线任务</div>
            <div class="q-list">
              <div v-for="(q,i) in simpleQuests(me.任务列表?.主线)" :key="'mq'+i" class="q-row">
                <div class="q-name">{{ q.name || '未命名主线' }}</div>
                <div class="q-meta">
                  <span v-if="q.state">{{ q.state }}</span>
                  <span v-if="q.progress" class="sep">·</span>
                  <span v-if="q.progress">{{ q.progress }}</span>
                  <span v-if="q.time" class="sep">·</span>
                  <span v-if="q.time">{{ q.time }}</span>
                </div>
              </div>
              <div v-if="!simpleQuests(me.任务列表?.主线).length" class="empty">无主线任务</div>
            </div>
          </div>
          <div class="prop"><div class="pname">支线任务</div>
            <div class="q-list">
              <div v-for="(q,i) in simpleQuests(me.任务列表?.支线)" :key="'sq'+i" class="q-row">
                <div class="q-name">{{ q.name || '未命名支线' }}</div>
                <div class="q-meta">
                  <span v-if="q.state">{{ q.state }}</span>
                  <span v-if="q.progress" class="sep">·</span>
                  <span v-if="q.progress">{{ q.progress }}</span>
                  <span v-if="q.time" class="sep">·</span>
                  <span v-if="q.time">{{ q.time }}</span>
                </div>
              </div>
              <div v-if="!simpleQuests(me.任务列表?.支线).length" class="empty">无支线任务</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showSection('roles')" class="sec">
        <div class="sec-h head">👥 角色</div>
        <div class="sec-c">
          <details class="fold" :open="false">
            <summary class="fold-h">同伴（{{ companions.length }}）</summary>
            <div class="list">
              <div v-for="c in companions" :key="c.名称 || JSON.stringify(c)" class="li" @click="openDetail({ 名称: c.名称 || '同伴', ...c }, 'char')">
                <div class="name">👤 {{ c.名称 || '同伴' }}</div>
                <div class="meta">
                  <span v-if="v(c.身份, '')">{{ v(c.身份, '') }}</span>
                  <span v-if="v(c.评级 || c.综合评级, '')" class="sep">·</span>
                  <span v-if="v(c.评级 || c.综合评级, '')">{{ v(c.评级 || c.综合评级, '') }}</span>
                  <span v-if="v(c['在场状态'], '')" class="sep">·</span>
                  <span v-if="v(c['在场状态'], '')">{{ v(c['在场状态'], '') }}</span>
                </div>
              </div>
            </div>
          </details>
          <details class="fold" :open="false">
            <summary class="fold-h">附近NPC（{{ nearbyNPCs.length }}）</summary>
            <div class="list">
              <div v-for="c in nearbyNPCs" :key="c.名称 || JSON.stringify(c)" class="li" @click="openDetail({ 名称: c.名称 || 'NPC', ...c }, 'char')">
                <div class="name">👁 {{ c.名称 || 'NPC' }}</div>
                <div class="meta">
                  <span v-if="v(c.身份, '')">{{ v(c.身份, '') }}</span>
                  <span v-if="v(c.评级 || c.综合评级, '')" class="sep">·</span>
                  <span v-if="v(c.评级 || c.综合评级, '')">{{ v(c.评级 || c.综合评级, '') }}</span>
                  <span v-if="v(c['在场状态'], '')" class="sep">·</span>
                  <span v-if="v(c['在场状态'], '')">{{ v(c['在场状态'], '') }}</span>
                </div>
              </div>
            </div>
          </details>
          <details class="fold" :open="false">
            <summary class="fold-h">离场角色（{{ absentChars.length }}）</summary>
            <div class="list">
              <div v-for="c in absentChars" :key="c.名称 || JSON.stringify(c)" class="li" @click="openDetail({ 名称: c.名称 || '离场角色', ...c }, 'char')">
                <div class="name">🚪 {{ c.名称 || '离场角色' }}</div>
                <div class="meta">
                  <span>离场</span>
                  <span v-if="v(c.评级, '')" class="sep">·</span>
                  <span v-if="v(c.评级, '')">{{ v(c.评级, '') }}</span>
                  <span v-if="v(c['上次互动'], '')" class="sep">·</span>
                  <span v-if="v(c['上次互动'], '')">上次互动 {{ v(c['上次互动'], '') }}</span>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>

      <div v-if="showSection('inventory')" class="sec">
        <div class="sec-h head">🎒 清单</div>
        <div class="sec-c">
          <div class="subtabs">
            <button class="subtab" :class="{ a: inventoryTab==='all' }" @click="inventoryTab='all'">全部</button>
            <button class="subtab" :class="{ a: inventoryTab==='equip' }" @click="inventoryTab='equip'">装备 ({{ equips.length }})</button>
            <button class="subtab" :class="{ a: inventoryTab==='item' }" @click="inventoryTab='item'">物品 ({{ items.length }})</button>
            <button class="subtab" :class="{ a: inventoryTab==='blood' }" @click="inventoryTab='blood'">血统 ({{ bloods.length }})</button>
            <button class="subtab" :class="{ a: inventoryTab==='skill' }" @click="inventoryTab='skill'">技能 ({{ skills.length }})</button>
          </div>
          <div class="prop"><div class="pname">空间币</div><div class="pval coin">{{ v(me['空间币'], 0) }}</div></div>
          <template v-if="inventoryTab==='all'">
            <div class="prop"><div class="pname">装备 ({{ equips.length }})</div></div>
            <div class="list">
              <div v-for="e in equips.slice(0,3)" :key="e.名称 || JSON.stringify(e)" class="li" @click="openDetail(e, 'equip')">
                <div class="name">{{ inferEquipIcon(e) }} {{ e.名称 || '未知装备' }}</div>
                <div class="meta">
                  <span v-if="v(e.类型, '')">{{ v(e.类型, '') }}</span>
                  <span v-if="v(e.类型, '') && v(e.品质, '')" class="sep">·</span>
                  <span v-if="v(e.品质, '')">{{ v(e.品质, '') }}</span>
                </div>
              </div>
              <div v-if="equips.length>3" class="empty"><a href="javascript:void(0)" @click="inventoryTab='equip'">查看更多…</a></div>
            </div>
            <div class="prop"><div class="pname">物品 ({{ items.length }})</div></div>
            <div class="list">
              <div v-for="it in items.slice(0,4)" :key="it.名称 || JSON.stringify(it)" class="li" @click="openDetail(it, 'item')">
                <div class="name">📦 {{ it.名称 || '物品' }}</div>
                <div class="meta">
                  <span v-if="v(it.类型, '')">{{ v(it.类型, '') }}</span>
                  <span v-if="v(it.类型, '') && v(it.品质, '')" class="sep">·</span>
                  <span v-if="v(it.品质, '')">{{ v(it.品质, '') }}</span>
                  <span v-if="v(it.数量, 1) !== 'N/A'" class="sep">·</span>
                  <span v-if="v(it.数量, 1) !== 'N/A'">×{{ v(it.数量, 1) }}</span>
                </div>
              </div>
              <div v-if="items.length>4" class="empty"><a href="javascript:void(0)" @click="inventoryTab='item'">查看更多…</a></div>
            </div>
            <div class="prop"><div class="pname">血统 ({{ bloods.length }})</div></div>
            <div class="list">
              <div v-for="b in bloods.slice(0,2)" :key="b.名称 || JSON.stringify(b)" class="li" @click="openDetail(b, 'blood')">
                <div class="name">🧬 {{ b.名称 || '血统' }}</div>
                <div class="meta">
                  <span v-if="v(b.品质, '')">{{ v(b.品质, '') }}</span>
                  <span v-if="v(b.类型, '') && v(b.品质, '')" class="sep">·</span>
                  <span v-if="v(b.类型, '')">{{ v(b.类型, '') }}</span>
                </div>
              </div>
              <div v-if="bloods.length>2" class="empty"><a href="javascript:void(0)" @click="inventoryTab='blood'">查看更多…</a></div>
            </div>
            <div class="prop"><div class="pname">技能 ({{ skills.length }})</div></div>
            <div class="list">
              <div v-for="s in skills.slice(0,3)" :key="s.名称 || JSON.stringify(s)" class="li" @click="openDetail(s, 'skill')">
                <div class="name">✨ {{ s.名称 || '技能' }}</div>
                <div class="meta">
                  <span v-if="v(s.类型, '')">{{ v(s.类型, '') }}</span>
                  <span v-if="v(s.等级, '')" class="sep">·</span>
                  <span v-if="v(s.等级, '')">{{ v(s.等级, '') }}</span>
                </div>
              </div>
              <div v-if="skills.length>3" class="empty"><a href="javascript:void(0)" @click="inventoryTab='skill'">查看更多…</a></div>
            </div>
          </template>

          <template v-else-if="inventoryTab==='equip'">
            <div class="prop"><div class="pname">装备</div></div>
            <div class="list">
              <div v-for="e in equips" :key="e.名称 || JSON.stringify(e)" class="li" @click="openDetail(e, 'equip')">
                <div class="name">{{ inferEquipIcon(e) }} {{ e.名称 || '未知装备' }}</div>
                <div class="meta"><span v-if="v(e.类型, '')">{{ v(e.类型, '') }}</span><span v-if="v(e.类型, '') && v(e.品质, '')" class="sep">·</span><span v-if="v(e.品质, '')">{{ v(e.品质, '') }}</span></div>
              </div>
            </div>
          </template>
          <template v-else-if="inventoryTab==='item'">
            <div class="prop"><div class="pname">物品</div></div>
            <div class="list">
              <div v-for="it in items" :key="it.名称 || JSON.stringify(it)" class="li" @click="openDetail(it, 'item')">
                <div class="name">📦 {{ it.名称 || '物品' }}</div>
                <div class="meta"><span v-if="v(it.类型, '')">{{ v(it.类型, '') }}</span><span v-if="v(it.类型, '') && v(it.品质, '')" class="sep">·</span><span v-if="v(it.品质, '')">{{ v(it.品质, '') }}</span><span v-if="v(it.数量, 1) !== 'N/A'" class="sep">·</span><span v-if="v(it.数量, 1) !== 'N/A'">×{{ v(it.数量, 1) }}</span></div>
              </div>
            </div>
          </template>
          <template v-else-if="inventoryTab==='blood'">
            <div class="prop"><div class="pname">血统</div></div>
            <div class="list">
              <div v-for="b in bloods" :key="b.名称 || JSON.stringify(b)" class="li" @click="openDetail(b, 'blood')">
                <div class="name">🧬 {{ b.名称 || '血统' }}</div>
                <div class="meta"><span v-if="v(b.品质, '')">{{ v(b.品质, '') }}</span><span v-if="v(b.类型, '') && v(b.品质, '')" class="sep">·</span><span v-if="v(b.类型, '')">{{ v(b.类型, '') }}</span></div>
              </div>
            </div>
          </template>
          <template v-else-if="inventoryTab==='skill'">
            <div class="prop"><div class="pname">技能</div></div>
            <div class="list">
              <div v-for="s in skills" :key="s.名称 || JSON.stringify(s)" class="li" @click="openDetail(s, 'skill')">
                <div class="name">✨ {{ s.名称 || '技能' }}</div>
                <div class="meta"><span v-if="v(s.类型, '')">{{ v(s.类型, '') }}</span><span v-if="v(s.等级, '')" class="sep">·</span><span v-if="v(s.等级, '')">{{ v(s.等级, '') }}</span></div>
              </div>
            </div>
          </template>
        </div>
      </div>
      
      <!-- 详情弹窗（Teleport 到 body，防止被容器裁剪） -->
      <teleport to="body">
        <div v-if="detailVisible" class="inf-modal-mask" :class="{ tall: isModalTall }" ref="maskRef" @click.self="closeDetail">
          <div class="inf-modal" :class="{ tall: isModalTall }" ref="modalRef">
            <div class="inf-modal-head">
              <div class="left">
                <button v-if="charModal && detailType!=='char'" class="back" @click="backToChar">← 返回</button>
                <div class="inf-icon">{{ detailIcon }}</div>
                <div class="titles">
                  <div class="big-title">{{ detailTitle }}</div>
                  <div class="chips" v-if="detailBadges.length">
                    <span v-for="b in detailBadges" :key="b" class="chip">{{ b }}</span>
                  </div>
                </div>
              </div>
              <button class="x" @click="closeDetail">✕</button>
            </div>
            <div v-if="metricList.length" class="inf-metrics">
              <div v-for="(m,i) in metricList" :key="'m'+i" class="inf-metric">
                <div class="metric-v">{{ m.value }}</div>
                <div class="metric-k">{{ m.key }}</div>
              </div>
            </div>
            <div class="inf-nav" v-if="detailType==='char'">
              <button class="inav" @click="gotoSec('attrs')">属性</button>
              <button class="inav" @click="gotoSec('equip')">装备</button>
              <button class="inav" @click="gotoSec('items')">物品</button>
              <button class="inav" @click="gotoSec('skills')">技能</button>
              <button class="inav" @click="gotoSec('bloods')">血统</button>
              <button class="inav" @click="gotoSec('desc')">说明</button>
              <button class="inav" @click="gotoSec('status')">状态</button>
              <button class="inav" @click="gotoSec('bonus')">加成</button>
              <button class="inav" @click="gotoSec('reunion')">重聚潜能</button>
              <span class="sp"></span>
              <button class="inav ghost" @click="foldAll(false)">展开全部</button>
              <button class="inav ghost" @click="foldAll(true)">收起全部</button>
            </div>
            <div class="inf-sections" ref="infSectionsRef">
              <div v-if="charModal && detailType==='char'" class="inf-section" data-sec="attrs">
                <div class="inf-section-title">属性</div>
                <div class="grid2">
                  <div v-for="k in sixKeys" :key="'cb'+k" class="prop">
                    <div class="row between"><div class="pname">{{ k }}</div><div class="pval">{{ v(charModal.base?.[k], 0) }}</div></div>
                    <div class="bar"><div class="val" :style="{ width: mStatPct(charModal.base?.[k], charModal.rank) + '%' }"></div></div>
                  </div>
                </div>
                <div class="grid3" style="margin-top:6px">
                  <div class="prop"><div class="row between"><div class="pname">HP</div><div class="pval">{{ fmt(charModal.der?.HP) }}/{{ fmt(charModal.der?.['HP上限']) }}</div></div><div class="bar hp"><div class="val" :style="{ width: pct(charModal.der?.HP, charModal.der?.['HP上限']) + '%' }"></div></div></div>
                  <div class="prop"><div class="row between"><div class="pname">ATK</div><div class="pval">{{ fmt(charModal.der?.ATK) }}</div></div><div class="bar atk"><div class="val" :style="{ width: conceptualPctWithRank(charModal.der?.ATK, charModal.rank, 'atk') + '%' }"></div></div></div>
                  <div class="prop"><div class="row between"><div class="pname">DEF</div><div class="pval">{{ fmt(charModal.der?.DEF) }}</div></div><div class="bar def"><div class="val" :style="{ width: conceptualPctWithRank(charModal.der?.DEF, charModal.rank, 'def') + '%' }"></div></div></div>
                  <div class="prop"><div class="row between"><div class="pname">EP</div><div class="pval">{{ fmt(charModal.der?.EP) }}/{{ fmt(charModal.der?.['EP上限']) }}</div></div><div class="bar ep"><div class="val" :style="{ width: pct(charModal.der?.EP, charModal.der?.['EP上限']) + '%' }"></div></div></div>
                  <div class="prop"><div class="row between"><div class="pname">SP</div><div class="pval">{{ fmt(charModal.der?.SP) }}/{{ fmt(charModal.der?.['SP上限']) }}</div></div><div class="bar sp"><div class="val" :style="{ width: pct(charModal.der?.SP, charModal.der?.['SP上限']) + '%' }"></div></div></div>
                </div>
                <div class="prop" style="margin-top:8px">
                  <div class="pname">预设计算</div>
                  <div class="grid3">
                    <div class="prop"><div class="pname">先攻修正</div><div class="pval">+{{ v(charModal.preset?.['先攻修正'], 0) }}</div></div>
                    <div class="prop"><div class="pname">防御DC</div><div class="pval">{{ v(charModal.preset?.['防御DC'], 30) }}</div></div>
                    <div class="prop"><div class="pname">强韧豁免</div><div class="pval">+{{ v(charModal.preset?.['强韧豁免'], 0) }}</div></div>
                    <div class="prop"><div class="pname">反射豁免</div><div class="pval">+{{ v(charModal.preset?.['反射豁免'], 0) }}</div></div>
                    <div class="prop"><div class="pname">意志豁免</div><div class="pval">+{{ v(charModal.preset?.['意志豁免'], 0) }}</div></div>
                  </div>
                </div>
                <details v-if="detailType==='char'" class="fold" :open="false" data-sec="equip">
                  <summary class="fold-h">装备（{{ charModal.equips.length }}）</summary>
                  <div class="list">
                    <div v-for="e in charModal.equips" :key="e.名称 || JSON.stringify(e)" class="li" @click="openChildDetail(e, 'equip')">
                      <div class="name">{{ inferEquipIcon(e) }} {{ e.名称 || '装备' }}</div>
                      <div class="meta"><span v-if="v(e.类型,'')">{{ v(e.类型,'') }}</span><span v-if="v(e.品质,'')" class="sep">·</span><span v-if="v(e.品质,'')">{{ v(e.品质,'') }}</span></div>
                    </div>
                  </div>
                </details>
                <details v-if="detailType==='char'" class="fold" :open="false" data-sec="items">
                  <summary class="fold-h">物品（{{ charModal.items.length }}）</summary>
                  <div class="list">
                    <div v-for="it in charModal.items" :key="it.名称 || JSON.stringify(it)" class="li" @click="openChildDetail(it, 'item')">
                      <div class="name">📦 {{ it.名称 || '物品' }}</div>
                      <div class="meta"><span v-if="v(it.类型,'')">{{ v(it.类型,'') }}</span><span v-if="v(it.品质,'')" class="sep">·</span><span v-if="v(it.品质,'')">{{ v(it.品质,'') }}</span><span v-if="v(it.数量, 1) !== 'N/A'" class="sep">·</span><span v-if="v(it.数量, 1) !== 'N/A'">×{{ v(it.数量, 1) }}</span></div>
                    </div>
                  </div>
                </details>
                <details v-if="detailType==='char'" class="fold" :open="false" data-sec="skills">
                  <summary class="fold-h">技能（{{ charModal.skills.length }}）</summary>
                  <div class="list">
                    <div v-for="s in charModal.skills" :key="s.名称 || JSON.stringify(s)" class="li" @click="openChildDetail(s, 'skill')">
                      <div class="name">✨ {{ s.名称 || '技能' }}</div>
                      <div class="meta"><span v-if="v(s.类型,'')">{{ v(s.类型,'') }}</span><span v-if="v(s.等级,'')" class="sep">·</span><span v-if="v(s.等级,'')">{{ v(s.等级,'') }}</span></div>
                    </div>
                  </div>
                </details>
                <details v-if="detailType==='char'" class="fold" :open="false" data-sec="bloods">
                  <summary class="fold-h">血统（{{ charModal.bloods.length }}）</summary>
                  <div class="list">
                    <div v-for="b in charModal.bloods" :key="b.名称 || JSON.stringify(b)" class="li" @click="openChildDetail(b, 'blood')">
                      <div class="name">🧬 {{ b.名称 || '血统' }}</div>
                      <div class="meta"><span v-if="v(b.等级,'')">{{ v(b.等级,'') }}</span></div>
                    </div>
                  </div>
                </details>
              </div>

              <!-- 非角色：基础与功能分区 -->
              <div v-if="detailType!=='char' && detailBase.length" class="inf-section" data-sec="base">
                <div class="inf-section-title">基础</div>
                <div class="inf-dl">
                  <div v-for="(p,i) in detailBase" :key="'base'+i" class="inf-row">
                    <div class="k">{{ p.key }}</div>
                    <div class="v">{{ p.value }}</div>
                  </div>
                </div>
              </div>
              <div v-if="detailType!=='char' && funcPairs.length" class="inf-section" data-sec="funcs">
                <div class="inf-section-title">功能</div>
                <div class="inf-dl">
                  <div v-for="(p,i) in funcPairs" :key="'fn'+i" class="inf-row">
                    <div class="k">{{ p.key }}</div>
                    <div class="v">{{ p.value }}</div>
                  </div>
                </div>
              </div>

              <div v-if="descText.length" class="inf-section" data-sec="desc">
                <div class="inf-section-title">说明</div>
                <div class="inf-desc">
                  <p v-for="(t,i) in descText" :key="'p'+i">{{ t }}</p>
                </div>
              </div>
              <div v-if="detailStatus.length" class="inf-section" data-sec="status">
                <div class="inf-section-title">状态</div>
                <div class="chips">
                  <span v-for="(p,i) in detailStatus" :key="'s'+i" class="chip">{{ p.key }}：{{ p.value }}</span>
                </div>
              </div>
              <div v-if="detailAttrBonuses.length" class="inf-section" data-sec="bonus">
                <div class="inf-section-title">属性加成</div>
                <div class="bonus-groups">
                  <div class="bonus-group">
                    <div class="bg-head">六维</div>
                    <div class="bg-body">
                      <span v-for="kv in bonusBy(['力量','体力','敏捷','智力','精神','魅力'])" :key="kv.key" class="chip strong">{{ kv.key }} {{ kv.value }}</span>
                    </div>
                  </div>
                  <div class="bonus-group">
                    <div class="bg-head">基础</div>
                    <div class="bg-body">
                      <span v-for="kv in bonusBy(['HP','EP','SP'])" :key="kv.key" class="chip">{{ kv.key }} {{ kv.value }}</span>
                      <span v-for="kv in bonusBy(['ATK','DEF'])" :key="'bd'+kv.key" class="bonus-bar">
                        <b class="k">{{ kv.key }}</b>
                        <span class="b"><i :style="{ width: conceptualPctWithRank(kv.value, (charModal && charModal.rank) || 'D', kv.key==='ATK'?'atk':'def') + '%' }"></i></span>
                        <span>{{ kv.value }}</span>
                      </span>
                    </div>
                  </div>
                  <div class="bonus-group" v-if="bonusBy(['法术ATK','法术强度']).length">
                    <div class="bg-head">扩展</div>
                    <div class="bg-body">
                      <span v-for="kv in bonusBy(['法术ATK','法术强度'])" :key="kv.key" class="chip magic">{{ kv.key }} {{ kv.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="(charModal && (charModal.reunionLevel || reunionList.length))" class="inf-section" data-sec="reunion">
                <div class="inf-section-title">重聚潜能</div>
                <div class="kv">
                  <div class="k">等级</div>
                  <div class="v">{{ charModal?.reunionLevel || '无' }}</div>
                </div>
                <div class="kv" v-for="(r,i) in reunionList" :key="'r'+i">
                  <div class="k">理由{{ reunionList.length>1 ? ' '+(i+1) : '' }}</div>
                  <div class="v">{{ r }}</div>
                </div>
              </div>
              
              
            </div>
          </div>
        </div>
      </teleport>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

type ViewMode = 'full' | 'status' | 'world' | 'roles' | 'quests' | 'inventory';
const props = withDefaults(defineProps<{ view?: ViewMode }>(), { view: 'full' });

const me = ref<any>({});
const meLoaded = ref(false);
const hasMe = computed(() => !!me.value && !!me.value.姓名);

onMounted(async () => {
  try {
    const msgs = await getChatMessages(getCurrentMessageId());
    const stat_data = msgs?.[0]?.data?.stat_data || {};
    const found = Object.values(stat_data).find((v: any) => v && (v as any).姓名) as any;
    me.value = found || {};
  } catch {
    me.value = {};
  } finally {
    meLoaded.value = true;
  }
});

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

function showSection(section: 'status' | 'world' | 'roles' | 'quests' | 'inventory') {
  if (props.view === 'full') return true;
  return props.view === section || (props.view === 'status' && section === 'status');
}

const base = computed(() => me.value?.属性?.基础 || {});
const der = computed(() => me.value?.属性?.衍生 || {});
const preset = computed(() => me.value?.属性?.预设检定 || {});
const rank = computed(() => v(me.value?.属性?.综合评级, 'D'));
const sixKeys = ['力量', '体力', '敏捷', '智力', '精神', '魅力'] as const;
const WORLD_RANKS = ['SSS级','SS级','S级','A级','B级','C级','D级','E级','F级'] as const;
const worldKills = computed(() => {
  const ranks = WORLD_RANKS as unknown as string[];
  const out: Record<string, number> = Object.fromEntries(ranks.map(r => [r, 0]));
  const src = (me.value?.任务世界信息 && (me.value as any).任务世界信息['任务世界击杀'])
    || (me.value && (me.value as any)['任务世界击杀'])
    || (me.value?.任务世界信息 && (me.value as any).任务世界信息['击杀'])
    || {};
  try {
    if (src && typeof src === 'object' && !Array.isArray(src)) {
      ranks.forEach(r => { out[r] = Number((src as any)[r]) || 0; });
    } else if (Array.isArray(src)) {
      src.forEach(it => {
        const rk = String((it && (it.评级 ?? it.rank)) || '').toUpperCase();
        const map: any = { 'SSS':'SSS级','SS':'SS级','S':'S级','A':'A级','B':'B级','C':'C级','D':'D级','E':'E级','F':'F级' };
        const key = ranks.includes(rk as any) ? rk : (map[rk] || '');
        if (key) out[key] = Number((it && (it.数量 ?? it.count)) || 0) || 0;
      });
    } else if (typeof src === 'string') {
      src.split(/[，,；;\n\r]+/).map(s=>s.trim()).filter(Boolean).forEach(p => {
        const mm = p.match(/(SSS级|SS级|S级|A级|B级|C级|D级|E级|F级|SSS|SS|S|A|B|C|D|E|F)\s*[:：]\s*(\d+)/i);
        if (!mm) return;
        const tag = mm[1].toUpperCase();
        const map: any = { 'SSS':'SSS级','SS':'SS级','S':'S级','A':'A级','B':'B级','C':'C级','D':'D级','E':'E级','F':'F级' };
        const key = ranks.includes(tag as any) ? tag : (map[tag] || '');
        if (key) out[key] = Number(mm[2]) || 0;
      });
    }
  } catch {}
  return out;
});
const worldKillText = computed(() => {
  try {
    const o = worldKills.value as Record<string, number>;
    const list = (WORLD_RANKS as unknown as string[])
      .filter(r => Number(o[r] || 0) > 0)
      .map(r => `${r} × ${o[r] || 0}`);
    return list.join('、');
  } catch { return ''; }
});
const worldKillList = computed(()=> {
  const RANKS = ['SSS级','SS级','S级','A级','B级','C级','D级','E级','F级'];
  return RANKS.map(r => ({ rank: r, count: (worldKills.value as any)[r] || 0 }));
});
const hasWorldKills = computed(()=> worldKillList.value.some(it => Number(it.count) > 0));

const RANK_SCALE: any = {
  D: { sum: [50, 120], statMax: 30, atkMax: 30, defMax: 20 },
  C: { sum: [120, 200], statMax: 50, atkMax: 100, defMax: 70 },
  B: { sum: [200, 350], statMax: 70, atkMax: 300, defMax: 200 },
  A: { sum: [350, 600], statMax: 120, atkMax: 700, defMax: 400 },
  S: { sum: [600, 1100], statMax: 220, atkMax: 2400, defMax: 1600 },
  SS: { sum: [1100, 2000], statMax: 400, atkMax: 10000, defMax: 6000 },
  SSS: { sum: [2000, 999999], statMax: 1000, atkMax: 20000, defMax: 12000 },
};
function rankKey(r: string) { return String(r || 'D').replace('级', '').replace('+', '').toUpperCase(); }
const scale = computed(() => RANK_SCALE[rankKey(rank.value)] || RANK_SCALE.D);
function sumSix(b: any) { return sixKeys.reduce((s, k) => s + (Number(v(b?.[k], 0)) || 0), 0); }
const rankProgress = computed(() => {
  const s = sumSix(base.value);
  const [min, max] = scale.value.sum;
  const pct = ((s - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, isFinite(pct) ? pct : 0)).toFixed(1);
});

function statPct(value: any) {
  const cur = Number(v(value, 0)) || 0;
  const pct = (cur / scale.value.statMax) * 100;
  return Math.max(0, Math.min(100, pct)).toFixed(1);
}
function pct(cur: any, max: any) {
  const c = Number(v(cur, 0)) || 0; const m = Number(v(max, 0)) || 0; const p = m > 0 ? (c / m) * 100 : 0;
  return Math.max(0, Math.min(100, p)).toFixed(1);
}
function conceptualPct(val: any, kind: 'atk' | 'def') {
  const cur = Number(v(val, 0)) || 0; const max = kind === 'atk' ? scale.value.atkMax : scale.value.defMax;
  return Math.max(0, Math.min(100, (cur / max) * 100)).toFixed(1);
}
function fmt(val: any) { const n = v(val, 0); return typeof n === 'number' ? String(n) : String(n || '0'); }

function conceptualPctWithRank(val: any, rankStr: any, kind: 'atk'|'def') {
  const key = String(rankStr || 'D').replace('级','').replace('+','').toUpperCase();
  const scaleMap: any = {
    D: { atkMax: 30, defMax: 20 },
    C: { atkMax: 100, defMax: 70 },
    B: { atkMax: 300, defMax: 200 },
    A: { atkMax: 700, defMax: 400 },
    S: { atkMax: 2400, defMax: 1600 },
    SS: { atkMax: 10000, defMax: 6000 },
    SSS: { atkMax: 20000, defMax: 12000 },
  };
  const s = scaleMap[key] || scaleMap.D;
  const cur = Number(v(val, 0)) || 0;
  const max = kind === 'atk' ? s.atkMax : s.defMax;
  return Math.max(0, Math.min(100, (cur / max) * 100)).toFixed(1);
}

function mStatPct(value: any, rankStr: any) {
  const key = String(rankStr || 'D').replace('级','').replace('+','').toUpperCase();
  const statMaxMap: any = { D: 30, C: 50, B: 70, A: 120, S: 220, SS: 400, SSS: 1000 };
  const statMax = statMaxMap[key] || 30;
  const cur = Number(v(value, 0)) || 0;
  const pct = (cur / statMax) * 100;
  return Math.max(0, Math.min(100, pct)).toFixed(1);
}

function inferEquipIcon(e: any) {
  const rawType = String(v(e?.类型, '')).toLowerCase();
  // 简化为三大类：武器/护甲/饰品
  if (/(戒|项链|饰品|ring|necklace|amulet|accessory)/.test(rawType)) return '💍';
  if (/(甲|盔|护|上身|全身|armor|helm|chest|glove|boot|cloak|belt)/.test(rawType)) return '🧥';
  return '⚔️';
}

// 已移除"扩展衍生"

const companions = computed(() => listOf(me.value?.['登场角色']).filter(c => v(c['阵营标识'] || c['阵营']) === '同伴' && v(c['在场状态']) === '附近'));
const nearbyNPCs = computed(() => listOf(me.value?.['登场角色']).filter(c => v(c['阵营标识'] || c['阵营']) !== '同伴' && v(c['在场状态']) === '附近'));
const absentChars = computed(() => listOf(me.value?.['登场角色']).filter(c => v(c['在场状态']) === '离场'));

const equips = computed(() => listOf(me.value?.['装备栏']));
const items = computed(() => listOf(me.value?.['物品栏']));
const bloods = computed(() => listOf(me.value?.['血统']));
const skills = computed(() => listOf(me.value?.['技能']));
const inventoryTab = ref<'all'|'equip'|'item'|'blood'|'skill'>('all');

function renderQuests(questMap: any, title: string) {
  const cleaned = cleanObj(questMap || {});
  const list = '任务目标' in cleaned ? [cleaned] : listOf(cleaned);
  if (!list.length) return `<div class="empty">无${title}</div>`;
  const knownKeys = ['任务名称', '名称', '状态', '时限', '完成进度'];
  return list
    .map(q => {
      const name = v(q.任务名称 || q.名称, '无');
      const state = q.状态 ? `<span class="badge">${v(q.状态)}</span>` : '';
      const progress = (q.完成进度 && String(v(q.完成进度)).includes('%')) ? `<span class="badge badge-prog">${v(q.完成进度)}</span>` : '';
      const others = Object.entries(q).filter(([k]) => !knownKeys.includes(k));
      const details = others.map(([k, val]) => `<div class="kv"><span class="k">${k}</span><span class="v">${v(val)}</span></div>`).join('');
      return `<div class="q-card"><div class="q-title">${name} ${state} ${progress}</div>${details}</div>`;
    })
    .join('');
}

function firstOf(val: any) {
  if (Array.isArray(val)) return val[0] ?? '无';
  return val;
}

function simpleQuests(q: any): Array<{ name: string; state?: string; progress?: string; time?: string }> {
  const cleaned = cleanObj(q || {});
  const list = '任务目标' in cleaned || '状态' in cleaned || '完成进度' in cleaned ? [cleaned] : listOf(cleaned);
  return list.map((x: any) => ({
    name: String(v(x.任务名称 || x.名称 || x.任务目标 || '', '') || ''),
    state: String(v(x.状态 || '', '') || '') || undefined,
    progress: String(v(x.完成进度 || '', '') || '') || undefined,
    time: String(v(x.时限 || '', '') || '') || undefined,
  }));
}

// 详情弹窗逻辑
const detailVisible = ref(false);
const detailTitle = ref('');
const detailIcon = ref('');
const detailBadges = ref<string[]>([]);
const detailPairs = ref<Array<{ key: string; value: string }>>([]);
const detailDescs = ref<Array<{ label: string; value: string }>>([]);
const detailStatus = ref<Array<{ key: string; value: string }>>([]);
const detailFacts = ref<Array<{ key: string; value: string }>>([]);
const detailStats = ref<Array<{ key: string; value: string }>>([]);
const detailOthers = ref<Array<{ key: string; value: string }>>([]);
const detailBase = ref<Array<{ key: string; value: string }>>([]);
const funcPairs = ref<Array<{ key: string; value: string }>>([]);
const toggleMore = ref(true);
const charModal = ref<any | null>(null);
const detailType = ref<'equip'|'item'|'blood'|'skill'|'char'|'status'>('status');
const charSource = ref<any | null>(null);
const detailAttrBonuses = ref<Array<{ key: string; value: string }>>([]);
const reunionList = computed<string[]>(() => {
  const r = (charModal.value && (charModal.value as any).reunionReasons) || [];
  return Array.isArray(r) ? r.map(x => String(x)).filter(Boolean) : (r ? [String(r)] : []);
});
const infSectionsRef = ref<HTMLElement|null>(null);
const isModalTall = ref(false);
function gotoSec(key: string){
  try {
    const root = infSectionsRef.value;
    if (!root) return;
    const sec = root.querySelector(`[data-sec="${key}"]`) as HTMLElement | null;
    if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch {}
}
function foldAll(close: boolean){
  try {
    const root = infSectionsRef.value;
    if (!root) return;
    const list = Array.from(root.querySelectorAll('details.fold')) as HTMLDetailsElement[];
    list.forEach(el => { el.open = !close; });
  } catch {}
}

watch(detailVisible, (v)=>{
  try {
    // 不再禁用body滚动，让mask自己处理滚动
    if (v) {
      // 确保弹窗内容完全显示
      isModalTall.value = true;
    }
  } catch {}
});

const metricList = computed(()=>{
  const out: Array<{key:string; value:string}> = [];
  const take = (k: string) => {
    const hit = detailStats.value.find(x=>x.key.includes(k)) || detailFacts.value.find(x=>x.key.includes(k));
    if (hit) out.push({ key: k, value: String(hit.value) });
  };
  ['ATK','DEF','HP','EP','SP'].forEach(take);
  return out;
});

const descText = computed(() => detailDescs.value.map(d => String(d.value)).filter(Boolean));

function bonusBy(keys: string[]): Array<{ key: string; value: string }> {
  const keySet = new Set(keys);
  return detailAttrBonuses.value.filter(kv => keySet.has(kv.key));
}

function openDetail(obj: any, type: 'equip' | 'item' | 'blood' | 'skill' | 'char' | 'status' = 'status') {
  if (!obj) return;
  try { document.body.style.overflow = 'hidden'; } catch {}
  const isChar = type === 'char';
  detailIcon.value = type === 'equip' ? '⚔️' : type === 'item' ? '📦' : type === 'blood' ? '🧬' : type === 'skill' ? '✨' : isChar ? '👤' : 'ℹ️';
  detailTitle.value = v((obj as any).名称 || (obj as any).name || (obj as any).任务名称 || (obj as any).角色 || (obj as any).姓名 || '详细信息', '详细信息');

  const badges: string[] = [];
  if (isChar) {
    const idt = v((obj as any).身份, '');
    const camp = v((obj as any)['阵营标识'] || (obj as any)['阵营'], '');
    const rankChar = v((obj as any).评级 || (obj as any).综合评级, '');
    const present = v((obj as any)['在场状态'], '');
    const favor = v((obj as any)['好感度'], '');
    const relation = v((obj as any)['关系'], '');
    const coins = v((obj as any)['空间币'], '');
    if (idt && idt !== 'N/A') badges.push(String(idt));
    if (camp && camp !== 'N/A') badges.push(String(camp));
    if (rankChar && rankChar !== 'N/A') badges.push(String(rankChar));
    if (present && present !== 'N/A') badges.push(String(present));
    if (coins !== 'N/A' && coins !== '') badges.push(`币 ${coins}`);
    if (favor !== 'N/A' && favor !== '') badges.push(`好感 ${favor}`);
    if (relation && relation !== 'N/A') badges.push(`关系 ${relation}`);
  } else {
    if ((obj as any).等级) badges.push(String(v((obj as any).等级, '')));
    if ((obj as any).数量 && v((obj as any).数量, 1) !== 'N/A') badges.push(`×${v((obj as any).数量, 1)}`);
    if ((obj as any).类型) badges.push(String(v((obj as any).类型, '')));
    if ((obj as any).品质) badges.push(String(v((obj as any).品质, '')));
  }
  detailBadges.value = badges.filter(Boolean);
  detailType.value = type;
  if (isChar) charSource.value = obj;

  const known = new Set(['名称','name','任务名称','角色','姓名','品质','类型','等级','数量','ID','_id','等级序号']);
  if (isChar) {
    // 这些字段仅用于头部徽章，不进入通用明细；
    // 注意：不要在此排除"外貌/行动/当前状态/在场状态/位置/上次互动"，它们应进入"状态"分组
    ['身份','阵营标识','阵营','评级','综合评级','好感度','关系','空间币']
      .forEach(k=>known.add(k));
  }
  const pairs: Array<{ key: string; value: string }> = [];
  const descs: Array<{ label: string; value: string }> = [];
  const statusPairs: Array<{ key: string; value: string }> = [];
  const facts: Array<{ key: string; value: string }> = [];
  const stats: Array<{ key: string; value: string }> = [];
  const others: Array<{ key: string; value: string }> = [];
  detailBase.value = [];
  funcPairs.value = [];

  function walk(value: any, prefix = ''): void {
    if (value === null || value === undefined || value === '') return;
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return;
        const isPrimitiveArray = value.every(x => typeof x !== 'object' || x === null);
        if (isPrimitiveArray) {
          pairs.push({ key: prefix || '列表', value: value.map(x => String(x)).join('、') });
        } else {
          value.forEach((item, idx) => walk(item, prefix ? `${prefix}[${idx+1}]` : `[${idx+1}]`));
        }
      } else {
        for (const [k, v2] of Object.entries(value)) {
          if (k.startsWith('$')) continue;
          if ((isChar && known.has(k)) || (!isChar && !prefix && known.has(k))) continue;
          const label = prefix ? `${prefix}.${k}` : k;
          if (v2 && typeof v2 === 'object') {
            walk(v2, label);
          } else {
            const strRaw = String(v(v2, ''));
            const str = strRaw.trim();
            if (!str || /^(无|none|null|undefined|—|-)$/.test(str.toLowerCase())) continue;
            // NPC 弹窗：过滤大块嵌套（属性/装备栏/物品栏/技能/血统）
            const root = (label.split('.') as string[])[0];
            if (isChar && /^(属性|装备栏|物品栏|技能|血统)$/.test(root)) continue;
            if (/(描述|说明|角色备注)/.test(label)) {
              descs.push({ label, value: str });
            } else if (/^(外貌|行动|位置)$/.test(label)) {
              statusPairs.push({ key: label, value: str });
            } else if (/^(当前状态|在场状态|上次互动)$/.test(label)) {
              statusPairs.push({ key: label, value: str });
            } else if (/当前|状态/.test(label)) {
              statusPairs.push({ key: label, value: str });
            } else {
              pairs.push({ key: label, value: str });
            }
          }
        }
      }
      return;
    }
    const s0 = String(v(value, ''));
    const str = s0.trim();
    if (str && !/^(无|none|null|undefined|—|-)$/.test(str.toLowerCase())) {
      const root = (prefix || '').split('.')[0] || prefix || '';
      if (isChar && /^(属性|装备栏|物品栏|技能|血统)$/.test(root)) return;
      if (/(描述|说明|角色备注)/.test(prefix || '')) {
        descs.push({ label: prefix || '说明', value: str });
      } else if (/^(外貌|行动|位置)$/.test(prefix || '')) {
        statusPairs.push({ key: String(prefix), value: str });
      } else if (/^(当前状态|在场状态|上次互动)$/.test(prefix || '')) {
        statusPairs.push({ key: String(prefix), value: str });
      } else if (/(当前|状态)/.test(prefix || '')) {
        statusPairs.push({ key: String(prefix || '状态'), value: str });
      } else {
        pairs.push({ key: prefix || '内容', value: str });
      }
    }
  }

  try { walk(cleanObj(obj)); } catch {}

  // 直接从"属性加成"里解析常见关键数值
  const rawAttr = v((obj as any)['属性加成'], '');
  if (typeof rawAttr === 'string' && rawAttr) {
    const segs = rawAttr.split(/[，,]/).map(s=>s.trim()).filter(Boolean);
    segs.forEach(s => {
      const m = s.match(/(ATK|DEF|HP|EP|SP|法术ATK|法术强度)\s*\+?([\d\.]+%?)/i);
      if (m) {
        stats.push({ key: m[1], value: m[2] });
      } else {
        // 尝试中文括号格式：攻击值(ATK)+7
        const m2 = s.match(/\((ATK|DEF|HP|EP|SP)\)\s*\+?([\d\.]+%?)/i);
        if (m2) stats.push({ key: m2[1], value: m2[2] });
        else {
          // 解析六维：力量/体力/敏捷/智力/精神/魅力
          const m3 = s.match(/(力量|体力|敏捷|智力|精神|魅力)\s*\+?(-?[\d\.]+)/);
          if (m3) stats.push({ key: m3[1], value: m3[2] });
          else {
            // 中文名映射
            const map: Record<string,string> = { '攻击值':'ATK','防御值':'DEF','生命值':'HP','能量值':'EP','精力值':'SP' };
            const m4 = s.match(/(攻击值|防御值|生命值|能量值|精力值)\s*\+?([\d\.]+%?)/);
            if (m4) stats.push({ key: map[m4[1]], value: m4[2] });
          }
        }
      }
    });
  }

  pairs.forEach(p => {
    if (/(伤害|加成|Buff|消耗|冷却|要求|上限|护盾|防御|攻击|ATK|DEF|HP|EP|SP|法术ATK|法术强度)/i.test(p.key)) stats.push(p);
    else if (!facts.find(f=>f.key===p.key)) others.push(p);
  });

  // 槽位推断：基于"类型"
  const t = String(v((obj as any)['槽位'] || (obj as any)['类型'], '')).toLowerCase();
  let slot = '';
  if (/主手|单手剑|法术武器|双手|武器|撬棍|匕首|剑|弓|杖/.test(t)) slot = '主手/武器';
  else if (/副手|盾/.test(t)) slot = '副手/盾';
  else if (/上身|胸甲|全身/.test(t)) slot = '上身/全身';
  else if (/饰品|戒|项链|腰带/.test(t)) slot = '饰品';
  if (slot && !facts.find(f=>f.key==='槽位')) facts.push({ key: '槽位', value: slot });

  // 根据槽位/类型换更贴切的图标
  if (type === 'equip') {
    let ico = '⚔️';
    const rawType = String(v((obj as any)['类型'], '')).toLowerCase();
    if (/(戒|项链|饰品|ring|necklace|amulet|accessory)/.test(rawType)) ico = '💍';
    else if (/(甲|盔|护|上身|全身|armor|helm|chest|glove|boot|cloak|belt)/.test(rawType)) ico = '🧥';
    else ico = '⚔️';
    detailIcon.value = ico;
  }

  // NPC 概览要点：数量汇总
  if (isChar) {
    try {
      const eqCount = listOf((obj as any)['装备栏']).length;
      const itCount = listOf((obj as any)['物品栏']).length;
      const blCount = listOf((obj as any)['血统']).length;
      const skCount = listOf((obj as any)['技能']).length;
      if (!isNaN(eqCount)) facts.push({ key: '装备', value: String(eqCount) });
      if (!isNaN(skCount)) facts.push({ key: '技能', value: String(skCount) });
      if (!isNaN(blCount)) facts.push({ key: '血统', value: String(blCount) });
      if (!isNaN(itCount)) facts.push({ key: '物品', value: String(itCount) });
      const reunionRaw = (obj as any)['重聚潜能'] || {};
      let reunionLevel = v((reunionRaw as any)['等级'], '无');
      let reunionReasons: any = (reunionRaw as any)['理由'];
      if (Array.isArray(reunionReasons)) reunionReasons = reunionReasons.filter((x:any)=>x && String(x).trim() !== '');
      charModal.value = {
        base: (obj as any)?.属性?.基础 || {},
        der: (obj as any)?.属性?.衍生 || {},
        preset: (obj as any)?.属性?.预设检定 || {},
        rank: v((obj as any)?.属性?.综合评级 || (obj as any)?.综合评级, 'D'),
        equips: listOf((obj as any)['装备栏']),
        items: listOf((obj as any)['物品栏']),
        skills: listOf((obj as any)['技能']),
        bloods: listOf((obj as any)['血统']),
        reunionLevel: String(reunionLevel || '无'),
        reunionReasons: reunionReasons,
      };
    } catch {}
  }

  // 非角色：基础与功能分区
  if (!isChar) {
    const top = cleanObj(obj) || {};
    const baseKeys = [
      ['等级','等级'], ['品质','品质'], ['类型','类型'], ['数量','数量'], ['ID','ID'], ['槽位','槽位']
    ];
    const baseSet = new Set<string>();
    baseKeys.forEach(([k,label])=>{
      const val = v((top as any)[k], '');
      if (val !== 'N/A' && String(val) !== '') { detailBase.value.push({ key: label, value: String(val) }); baseSet.add(label); }
    });
    facts.forEach(f=>{ if (!baseSet.has(f.key)) { detailBase.value.push(f); baseSet.add(f.key); } });

    const funcKeyList = ['效果','伤害','消耗','目标','冷却','特效'];
    const isFunc = (k:string)=> funcKeyList.some(x=> k.endsWith(x));
    const funcs = others.filter(p=> isFunc(p.key));
    const othersRest = others.filter(p=> !isFunc(p.key));
    funcPairs.value = funcs;
    detailOthers.value = othersRest;
  } else {
    detailOthers.value = others;
  }

  detailPairs.value = [];
  detailDescs.value = descs;
  detailStatus.value = statusPairs;
  detailFacts.value = [];
  detailStats.value = stats;
  // 属性加成专用区
  detailAttrBonuses.value = stats.filter(p => /(力量|体力|敏捷|智力|精神|魅力|ATK|DEF|HP|EP|SP|法术ATK|法术强度)/.test(p.key));
  detailVisible.value = true;
  setTimeout(() => {
    try {
      const modal = document.querySelector('.inf-modal') as HTMLElement | null;
      const content = document.querySelector('.inf-sections') as HTMLElement | null;
      const head = document.querySelector('.inf-modal-head') as HTMLElement | null;
      const nav = document.querySelector('.inf-nav') as HTMLElement | null;
      const viewportH = (window.innerHeight || document.documentElement.clientHeight || 800);
      const contentH = (content?.scrollHeight || 0) + (head?.offsetHeight || 0) + (nav?.offsetHeight || 0) + 48;
      const maxH = viewportH * 0.86;
      if (modal) modal.style.maxHeight = contentH > maxH ? '92vh' : '84vh';
    } catch {}
  }, 0);
}

function closeDetail() { detailVisible.value = false; }
watch(detailVisible, (v)=>{ try { document.body.style.overflow = v ? 'hidden' : ''; } catch {} });

function openChildDetail(obj: any, type: 'equip'|'item'|'blood'|'skill') {
  // 在 NPC 容器内切换弹窗内容，不关闭外层（保持 charModal/charSource，替换细节）
  detailType.value = type;
  // 复用主详情渲染，但不改动 charSource
  openDetail(obj, type);
}

function backToChar() {
  if (!charSource.value) return;
  // 直接复位到人物视图，不重建遮罩
  detailType.value = 'char';
  openDetail(charSource.value, 'char');
}
</script>

<style scoped>
@import '../页面/公共样式.scss';
.status-root { color: #3b2f2f; font-family: 'Cinzel','Songti SC','Times New Roman',serif; }
.loading,.error { padding: 10px; color: #8b5e34; }
.sec { background: transparent; border: none; margin-bottom: 8px; }
.sec-h { font-weight: 700; font-size: 15px; padding: 4px 0; color: #3b2f2f; }
.sec-c { padding: 6px 0 8px; }
.prop { background: rgba(255,255,255,0.55); border: 1px solid rgba(120,90,50,0.35); border-radius: 8px; padding: 8px; margin-bottom: 6px; box-shadow: inset 0 0 15px rgba(120,90,50,0.08); }
.pname { color: #6b4f3e; font-size: 12px; margin-bottom: 4px; }
.pval { font-size: 13px; font-weight: 700; color: #3b2f2f; overflow-wrap: anywhere; }
.coin { color: #7a5d2f; }
.grid2 { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 6px; }
.grid3 { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 6px; }
.row.between { display: flex; justify-content: space-between; align-items: center; gap: 8px; min-width: 0; }
.bar { height: 8px; border: 1px solid rgba(120,90,50,0.5); border-radius: 999px; background: rgba(255,255,255,0.6); overflow: hidden; margin-top: 6px; }
.bar .val { height: 100%; width: 0%; transition: width 0.3s ease; background: linear-gradient(90deg, #caa96e, #9a7b4f); box-shadow: 0 0 6px rgba(154,123,79,0.6); }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); gap: 8px; }
.card { background: rgba(255,255,255,0.55); border: 1px solid rgba(120,90,50,0.35); border-radius: 8px; padding: 8px; box-shadow: inset 0 0 15px rgba(120,90,50,0.08); }
.card .sub { color: #6b4f3e; font-size: 12px; margin-left: 6px; }
.empty { font-size: 12px; color: #6b4f3e; font-style: italic; padding: 6px 0; }
.badge { display: inline-block; font-size: 10px; padding: 2px 6px; border-radius: 999px; background: rgba(154,123,79,0.15); border: 1px solid rgba(120,90,50,0.35); margin-left: 6px; color: #3b2f2f; }
.badge-prog { background: rgba(202,169,110,0.15); border-color: rgba(202,169,110,0.45); color: #7a5d2f; }
.q-card { background: rgba(255,255,255,0.55); border: 1px solid rgba(120,90,50,0.35); border-radius: 8px; padding: 8px; margin-top: 6px; box-shadow: inset 0 0 15px rgba(120,90,50,0.08); }
.q-title { font-weight: 700; margin-bottom: 6px; color: #3b2f2f; }
.kv { display: grid; grid-template-columns: 90px 1fr; gap: 6px; font-size: 12px; }
.kv .k { color: #6b4f3e; }
.kv .v { color: #3b2f2f; }

/* 折叠样式 */
.fold { background: rgba(255,255,255,0.55); border: 1px solid rgba(120,90,50,0.35); border-radius: 8px; padding: 6px; margin-bottom: 6px; }
.fold-h { cursor: pointer; font-weight: 800; color: #3b2f2f; position: relative; padding-left: 14px; }
.fold-h::before { content: '▸'; position: absolute; left: 0; top: 0; transform: translateY(1px); }
.fold[open] .fold-h::before { content: '▾'; }

/* 列表与弹窗 */
.list { display: grid; grid-template-columns: 1fr; gap: 6px; }
.li { display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(255,255,255,0.55); border: 1px solid rgba(120,90,50,0.35); border-radius: 8px; box-shadow: inset 0 0 15px rgba(120,90,50,0.08); cursor: pointer; }
.li:hover { background: rgba(255,255,255,0.7); }
.li .name { font-weight: 700; color: #3b2f2f; }
.li .meta { color: #6b4f3e; font-size: 12px; }
.li .meta .sep { margin: 0 4px; color: #b08b5f; }

.subtabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.subtab { padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(120,90,50,0.35); background: rgba(255,255,255,0.6); color: #3b2f2f; cursor: pointer; font-weight: 700; }
.subtab.a { background: rgba(255,255,255,0.85); border-color: rgba(120,90,50,0.6); }

/* 任务简表 */
.q-list { display: grid; grid-template-columns: 1fr; gap: 6px; }
.q-row { display: flex; align-items: center; justify-content: space-between; padding: 8px; background: rgba(255,255,255,0.55); border: 1px solid rgba(120,90,50,0.35); border-radius: 8px; }
.q-name { font-weight: 800; color: #3b2f2f; }
.q-meta { color: #6b4f3e; font-size: 12px; }
.q-meta .sep { margin: 0 4px; color: #b08b5f; }

/* 新版信息弹窗，避免被其他样式影响 */
.inf-modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 10000; overflow-y: auto; padding: 20px 0; }
.inf-modal { width: min(820px, 94vw); max-height: calc(100vh - 40px); background: #fffdf6; border: 1px solid rgba(120,90,50,0.35); border-radius: 16px; box-shadow: 0 14px 40px rgba(0,0,0,0.28); display: flex; flex-direction: column; overflow: hidden; color: #3b2f2f; margin: auto; }
.inf-modal.tall { max-height: calc(100vh - 40px) !important; }
.inf-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-bottom: 1px solid rgba(120,90,50,0.18); background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.78)); }
.inf-modal-head .left { display: flex; align-items: center; gap: 10px; }
.inf-modal-head .back { background: rgba(154,123,79,0.15); border: 1px solid rgba(120,90,50,0.35); color: #3b2f2f; border-radius: 6px; padding: 2px 8px; cursor: pointer; }
.inf-icon { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 30% 30%, #e9d8a6, #c9a66b); box-shadow: inset 0 0 8px rgba(0,0,0,0.12); }
.inf-modal-head .x { background: transparent; border: none; font-size: 18px; cursor: pointer; color: #6b4f3e; }
.inf-metrics { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; padding: 10px 14px 0; }
.inf-metric { background: rgba(255,255,255,0.9); border: 1px solid rgba(120,90,50,0.22); border-radius: 10px; padding: 10px; text-align: center; }
.inf-sections { padding: 10px 14px 14px; overflow-y: auto; flex: 1; max-height: calc(90vh - 160px); }
.inf-nav { position: sticky; top: 0; z-index: 1; display: flex; gap: 6px; align-items: center; padding: 6px 14px; background: #fffdf6; border-bottom: 1px solid rgba(120,90,50,0.18); }
.inf-nav .inav { padding: 4px 8px; border: 1px solid rgba(120,90,50,0.3); background: rgba(255,255,255,0.9); border-radius: 999px; cursor: pointer; }
.inf-nav .inav.ghost { background: transparent; }
.inf-nav .sp { flex: 1 1 auto; }
.inf-section { background: rgba(255,255,255,0.92); border: 1px solid rgba(120,90,50,0.22); border-radius: 10px; padding: 10px; margin-bottom: 10px; }
.inf-section-title { font-weight: 900; margin-bottom: 6px; color: #3b2f2f; }
.inf-desc p { margin: 0 0 6px; line-height: 1.7; }
.inf-dl .inf-row { display: grid; grid-template-columns: 140px 1fr; gap: 6px 12px; padding: 6px 0; border-bottom: 1px dotted rgba(120,90,50,0.25); }
.inf-dl .inf-row:last-child { border-bottom: none; }
.facts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.fact { background: rgba(255,255,255,0.92); border: 1px solid rgba(120,90,50,0.22); border-radius: 10px; padding: 10px; }
.fact .k { color: #6b4f3e; font-size: 12px; margin-bottom: 4px; }
.fact .v { font-weight: 900; color: #3b2f2f; }

/* 属性加成分组样式 */
.bonus-groups { display: grid; grid-template-columns: 1fr; gap: 8px; }
.bonus-group { background: rgba(255,255,255,0.92); border: 1px solid rgba(120,90,50,0.22); border-radius: 10px; padding: 8px; }
.bg-head { font-weight: 900; color: #3b2f2f; margin-bottom: 6px; }
.bg-body { display: flex; flex-wrap: wrap; gap: 6px; }
.chip.strong { background: rgba(154,123,79,0.2); border-color: rgba(120,90,50,0.5); }
.chip.magic { background: rgba(120,90,180,0.15); border-color: rgba(120,90,180,0.4); }

/* ATK/DEF 条形增强（在属性加成内呈现） */
.bonus-bar { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border: 1px solid rgba(120,90,50,0.35); border-radius: 8px; background: rgba(255,255,255,0.9); }
.bonus-bar .k { font-weight: 800; color: #3b2f2f; }
.bonus-bar .b { width: 120px; height: 6px; border: 1px solid rgba(120,90,50,0.4); border-radius: 999px; background: rgba(255,255,255,0.7); overflow: hidden; }
.bonus-bar .b > i { display: block; height: 100%; background: linear-gradient(90deg, #caa96e, #9a7b4f); width: 0%; }

@media (max-width: 768px) {
  .grid2 { grid-template-columns: 1fr; }
  .grid3 { grid-template-columns: 1fr; }
  .cards { grid-template-columns: 1fr; }
  .q-list, .list { grid-template-columns: 1fr; }
  .inf-modal { width: 96vw; max-height: 86vh; }
  .inf-metrics { grid-template-columns: repeat(2, 1fr); }
  .facts-grid { grid-template-columns: 1fr; }
  .inf-dl .inf-row { grid-template-columns: 1fr; }
  .row.between { flex-wrap: wrap; }
}

</style>

