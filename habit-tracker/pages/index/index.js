// index.js —— 每日打卡：从零开始，无任何预置习惯与记录
const STORE_KEY = 'daily-check-data-v1';
const COLORS = ['#2E7D5B', '#D97E2E', '#4A6FA5', '#C2574A', '#3E8E8E', '#7A6BB5'];
const ICON_KEYS = ['sun', 'book', 'water', 'dumbbell', 'pen', 'moon', 'leaf', 'star'];
const ICON_LABELS = { sun: '太阳', book: '书本', water: '水滴', dumbbell: '哑铃', pen: '画笔', moon: '月亮', leaf: '叶子', star: '星星' };

function iconSrcOf(icon) {
  const k = ICON_KEYS.indexOf(icon) >= 0 ? icon : 'star';
  return '/assets/icons/' + k + '.svg';
}
function autoIcon(name) {
  const n = name || '';
  if (/起|晨|醒|水|喝|饮/.test(n)) return 'water';
  if (/读|书|学/.test(n)) return 'book';
  if (/运|跑|锻炼|健身|练|哑铃/.test(n)) return 'dumbbell';
  if (/写|笔|记|画/.test(n)) return 'pen';
  if (/睡|眠|夜|晚/.test(n)) return 'moon';
  if (/冥|静|深呼吸|树|植/.test(n)) return 'leaf';
  if (/日|晒|光/.test(n)) return 'sun';
  return 'star';
}

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmt(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function parse(s) { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
function todayStr() { return fmt(new Date()); }
function addDays(s, n) { const d = parse(s); d.setDate(d.getDate() + n); return fmt(d); }
function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}
const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
function weekdayCn(s) { return WEEKDAYS[parse(s).getDay()]; }

Page({
  data: {
    dows: ['一', '二', '三', '四', '五', '六', '日'],
    todayNum: '', todayTitle: '', todayDone: 0, todayTotal: 0, todayHint: '',
    ringPct: '0', ringTxt: '0%',
    streakVal: '0', streakFoot: '', monthCount: '0', monthFoot: '',
    habitCards: [], hasHabits: false,
    monthLabel: '', prevDisabled: true, nextDisabled: true, calCells: [],
    manageItems: [],
    showModal: false, modalTitle: '添加习惯', inputName: '', colors: [], iconOptions: [], editingId: null,
    totalRecords: 0,
    showImportModal: false, importText: ''
  },

  onLoad() {
    this.state = wx.getStorageSync(STORE_KEY) || { habits: [], records: {} };
    let migrated = false;
    this.state.habits.forEach(h => {
      if (!h.icon) { h.icon = autoIcon(h.name); migrated = true; }
    });
    if (migrated) this.save();
    this.shownYm = todayStr().slice(0, 7);
    this.renderAll();
  },

  save() { wx.setStorageSync(STORE_KEY, this.state); },

  activeHabitsOn(ds) { return this.state.habits.filter(h => h.createdAt <= ds); },
  doneIdsOn(ds) { return (this.state.records[ds] || []).filter(id => this.state.habits.some(h => h.id === id)); },
  dayRate(ds) {
    const act = this.activeHabitsOn(ds);
    if (!act.length) return null;
    return this.doneIdsOn(ds).length / act.length;
  },
  calcStreak() {
    let d = todayStr();
    if (this.dayRate(d) !== 1) d = addDays(d, -1);
    let n = 0;
    while (true) {
      const r = this.dayRate(d);
      if (r === null || r !== 1) break;
      n++;
      d = addDays(d, -1);
    }
    return n;
  },
  habitTotalCount(hid) {
    let n = 0;
    Object.keys(this.state.records).forEach(k => { if (this.state.records[k].includes(hid)) n++; });
    return n;
  },
  monthStats(ym) {
    const [y, m] = ym.split('-').map(Number);
    const dim = new Date(y, m, 0).getDate();
    const todayS = todayStr();
    let total = 0, daysWith = 0, activeDays = 0;
    for (let dd = 1; dd <= dim; dd++) {
      const s = fmt(new Date(y, m - 1, dd));
      if (s > todayS) continue;
      const act = this.activeHabitsOn(s);
      if (!act.length) continue;
      activeDays++;
      const done = this.doneIdsOn(s).length;
      total += done;
      if (done > 0) daysWith++;
    }
    return { total, daysWith, activeDays };
  },
  monthCountOf(hid, ym) {
    let n = 0;
    Object.keys(this.state.records).forEach(k => {
      if (k.slice(0, 7) === ym && this.state.records[k].includes(hid)) n++;
    });
    return n;
  },

  renderAll() { this.renderHero(); this.renderToday(); this.renderCalendar(); this.renderManage(); },

  renderHero() {
    const t = todayStr();
    const d = parse(t);
    const act = this.activeHabitsOn(t);
    const done = this.doneIdsOn(t).length;
    const rate = act.length ? done / act.length : 0;
    const streak = this.calcStreak();
    const ms = this.monthStats(t.slice(0, 7));
    let hint;
    if (!act.length) hint = '还没有习惯，添加一个开始吧';
    else if (done === act.length) hint = '今日全勤达成，继续保持';
    else hint = '还差 ' + (act.length - done) + ' 项就全勤';
    this.setData({
      todayNum: d.getDate(),
      todayTitle: (d.getMonth() + 1) + '月 · ' + weekdayCn(t),
      todayDone: done, todayTotal: act.length, todayHint: hint,
      ringPct: (rate * 100).toFixed(1),
      ringTxt: Math.round(rate * 100) + '%',
      streakVal: String(streak),
      streakFoot: this.dayRate(t) === 1 ? '今天已全勤，明天继续' : '截至昨天，连续全勤 ' + streak + ' 天',
      monthCount: String(ms.total),
      monthFoot: ms.activeDays ? '本月坚持 ' + ms.daysWith + ' 天' : '本月还没有记录'
    });
  },

  renderToday() {
    const t = todayStr();
    const act = this.activeHabitsOn(t);
    const doneSet = new Set(this.doneIdsOn(t));
    const cards = act.map(h => ({
      id: h.id, name: h.name, color: h.color, bg: hexToRgba(h.color, 0.12),
      iconSrc: iconSrcOf(h.icon),
      done: doneSet.has(h.id),
      total: this.habitTotalCount(h.id)
    }));
    this.setData({ habitCards: cards, hasHabits: act.length > 0 });
  },

  renderCalendar() {
    const ym = this.shownYm;
    const [y, m] = ym.split('-').map(Number);
    const dates = this.state.habits.map(h => h.createdAt).concat(todayStr());
    const min = dates.reduce((a, b) => (a < b ? a : b)).slice(0, 7);
    const max = todayStr().slice(0, 7);
    this.setData({
      monthLabel: y + '年' + m + '月',
      prevDisabled: ym <= min,
      nextDisabled: ym >= max
    });
    const dim = new Date(y, m, 0).getDate();
    const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    const today = todayStr();
    const cells = [];
    let k = 0;
    for (let i = 0; i < offset; i++) cells.push({ key: k++, cls: 'blank', day: '', bar: false });
    for (let dd = 1; dd <= dim; dd++) {
      const s = fmt(new Date(y, m - 1, dd));
      let cls = '', rate = null, bar = false;
      if (s > today) { cls = 'future'; }
      else {
        rate = this.dayRate(s);
        if (rate === null) cls = 'future';
        else if (rate === 0) cls = 'r0';
        else if (rate < 0.25) cls = 'r1';
        else if (rate < 0.5) cls = 'r2';
        else if (rate < 0.75) cls = 'r3';
        else if (rate < 1) cls = 'r4';
        else cls = 'r5';
        bar = rate > 0;
      }
      if (s === today) cls += ' today';
      cells.push({ key: k++, cls, day: dd, bar });
    }
    this.setData({ calCells: cells });
  },

  renderManage() {
    const ym = todayStr().slice(0, 7);
    const items = this.state.habits.slice().reverse().map(h => ({
      id: h.id, name: h.name, color: h.color, bg: hexToRgba(h.color, 0.12),
      iconSrc: iconSrcOf(h.icon),
      mc: this.monthCountOf(h.id, ym),
      tc: this.habitTotalCount(h.id)
    }));
    let totalRecords = 0;
    Object.keys(this.state.records).forEach(k => { totalRecords += this.state.records[k].length; });
    this.setData({ manageItems: items, totalRecords });
  },

  toggleHabit(e) {
    const id = e.currentTarget.dataset.id;
    const t = todayStr();
    const arr = this.state.records[t] || (this.state.records[t] = []);
    const idx = arr.indexOf(id);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(id);
    this.save();
    this.renderAll();
  },

  openAdd() {
    this.setData({
      showModal: true, modalTitle: '添加习惯', inputName: '', editingId: null,
      colors: COLORS.map(c => ({ hex: c, sel: c === COLORS[0] })),
      iconOptions: ICON_KEYS.map(k => ({ key: k, label: ICON_LABELS[k], src: iconSrcOf(k), sel: k === 'sun' }))
    });
  },
  openEdit(e) {
    const id = e.currentTarget.dataset.id;
    const h = this.state.habits.find(x => x.id === id);
    if (!h) return;
    this.setData({
      showModal: true, modalTitle: '编辑习惯', inputName: h.name, editingId: h.id,
      colors: COLORS.map(c => ({ hex: c, sel: c === h.color })),
      iconOptions: ICON_KEYS.map(k => ({ key: k, label: ICON_LABELS[k], src: iconSrcOf(k), sel: k === (h.icon || 'star') }))
    });
  },
  onNameInput(e) { this.setData({ inputName: e.detail.value }); },
  pickColor(e) {
    const hex = e.currentTarget.dataset.hex;
    const colors = this.data.colors.map(c => ({ hex: c.hex, sel: c.hex === hex }));
    this.setData({ colors });
  },
  pickIcon(e) {
    const key = e.currentTarget.dataset.key;
    const iconOptions = this.data.iconOptions.map(o => ({ key: o.key, label: o.label, src: o.src, sel: o.key === key }));
    this.setData({ iconOptions });
  },
  closeModal() { this.setData({ showModal: false }); },
  noop() {},

  saveModal() {
    const name = (this.data.inputName || '').trim();
    if (!name) { wx.showToast({ title: '请填写习惯名称', icon: 'none' }); return; }
    const picked = this.data.colors.find(c => c.sel) || { hex: COLORS[0] };
    const pickedIcon = this.data.iconOptions.find(o => o.sel) || { key: 'star' };
    if (this.data.editingId) {
      const h = this.state.habits.find(x => x.id === this.data.editingId);
      if (h) { h.name = name; h.color = picked.hex; h.icon = pickedIcon.key; }
      wx.showToast({ title: '已保存', icon: 'success' });
    } else {
      this.state.habits.push({
        id: 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: name, color: picked.hex, icon: pickedIcon.key, createdAt: todayStr()
      });
      wx.showToast({ title: '已添加', icon: 'success' });
    }
    this.save();
    this.setData({ showModal: false });
    this.renderAll();
  },

  confirmDel(e) {
    const id = e.currentTarget.dataset.id;
    const h = this.state.habits.find(x => x.id === id);
    if (!h) return;
    wx.showModal({
      title: '删除习惯',
      content: '确定要删除「' + h.name + '」吗？历史打卡记录也会一并移除。',
      confirmText: '删除', confirmColor: '#B4483C',
      success: (res) => {
        if (res.confirm) {
          this.state.habits = this.state.habits.filter(x => x.id !== id);
          Object.keys(this.state.records).forEach(k => {
            this.state.records[k] = this.state.records[k].filter(x => x !== id);
          });
          this.save(); this.renderAll();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  prevMonth() {
    const [y, m] = this.shownYm.split('-').map(Number);
    const total = y * 12 + (m - 1) - 1;
    this.shownYm = Math.floor(total / 12) + '-' + pad(total % 12 + 1);
    this.renderCalendar();
  },
  nextMonth() {
    const [y, m] = this.shownYm.split('-').map(Number);
    const total = y * 12 + (m - 1) + 1;
    this.shownYm = Math.floor(total / 12) + '-' + pad(total % 12 + 1);
    this.renderCalendar();
  },

  exportData() {
    if (this.state.habits.length === 0) {
      wx.showToast({ title: '暂无数据可导出', icon: 'none' }); return;
    }
    const dataStr = JSON.stringify({
      version: 1, exportDate: todayStr(),
      habits: this.state.habits, records: this.state.records
    });
    wx.setClipboardData({
      data: dataStr,
      success: () => { wx.showToast({ title: '数据已复制到剪贴板', icon: 'success' }); },
      fail: () => { wx.showToast({ title: '复制失败，请重试', icon: 'none' }); }
    });
  },

  showImportBox() { this.setData({ showImportModal: true, importText: '' }); },
  closeImportBox() { this.setData({ showImportModal: false, importText: '' }); },
  onImportInput(e) { this.setData({ importText: e.detail.value }); },

  confirmImport() {
    const text = (this.data.importText || '').trim();
    if (!text) { wx.showToast({ title: '请粘贴备份数据', icon: 'none' }); return; }
    let parsed;
    try { parsed = JSON.parse(text); }
    catch (err) { wx.showToast({ title: '数据格式错误', icon: 'none' }); return; }
    if (!parsed.habits || !Array.isArray(parsed.habits)) {
      wx.showToast({ title: '数据不合法：缺少习惯列表', icon: 'none' }); return;
    }
    if (!parsed.records || typeof parsed.records !== 'object') {
      wx.showToast({ title: '数据不合法：缺少记录', icon: 'none' }); return;
    }
    wx.showModal({
      title: '确认导入',
      content: '导入将覆盖当前所有数据，确定继续吗？',
      confirmText: '确认导入', confirmColor: '#B4483C',
      success: (res) => {
        if (res.confirm) {
          this.state = { habits: parsed.habits, records: parsed.records };
          this.state.habits.forEach(h => { if (!h.icon) h.icon = autoIcon(h.name); });
          this.save(); this.renderAll();
          this.setData({ showImportModal: false, importText: '' });
          wx.showToast({ title: '导入成功', icon: 'success' });
        }
      }
    });
  }
});