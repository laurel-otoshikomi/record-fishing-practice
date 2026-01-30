import './style.css'
import { createClient } from '@supabase/supabase-js'
import Chart from 'chart.js/auto'

// 環境変数からSupabase設定を読み取る
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// 環境変数が設定されていない場合はエラー
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabase環境変数が設定されていません。.envファイルを確認してください。')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const HELP_URL = 'https://note.com/laurelkurodai/n/n0d9b9dbf0696'

const LS_USER_NAME = 'kurodai_userName'
const LS_LAST_AUTH_NAME = 'kurodai_lastAuthName'

// Vite define で注入されるバージョン
declare const __APP_VERSION__: string

// MAIN/サブ共通のエサ候補（★赤イソメ追加済み）
const BAIT_LIST = ["イガイ", "ミジ貝", "フジツボ", "パイプ", "カニ", "赤イソメ", "青コガネ", "その他"]

type FishingData = { [area: string]: { [loc: string]: string[] } }

const FISHING_DATA: FishingData = {
  "北港エリア": { "スリット": ["関門", "ヤイタ", "レーダー", "水門", "1コーナー", "出島", "事務所前"], "関電": ["灯台", "真ん中", "根本"], "中の灯台": [], "ヨット": [] },
  "南港エリア": { "新波止": ["真ん中", "赤灯側", "白灯側"], "Jグリーン": [] },
  "久保渡船": { "尼崎フェニックス": ["スリット", "運河筋", "川筋ヤグラまで", "川筋ヤグラ奥"], "武庫川一文字(久保)": [] },
  "武庫川渡船": { "武庫川一文字(武庫川)": ["2番", "3番", "4番", "5番", "6番"] },
  "西野渡船": { "導流堤": [], "武庫川一文字(西野)": ["7番", "8番", "9番"] },
  "岸和田渡船": { "岸和田沖の一文字": ["沖の北"], "旧一文字": ["赤灯", "2番", "3番", "4番", "カーブ", "白灯"], "中波止": ["2番", "3番"] },
  "中京エリア": { "四日市一文字": [], "霞一文字": [] },
  "その他エリア": { "その他": [] }
}

let currentUser: any = null
let currentProfileName = localStorage.getItem(LS_USER_NAME) || ''

let myChart: any = null
let baitChart: any = null
let areaChart: any = null
let weatherChart: any = null
let tideChart: any = null
let windChart: any = null

let allLogs: any[] = []
let filteredLogs: any[] = []
let deleteTargetId: string | null = null

// ---------------- utils ----------------
function normalize(s: string) {
  return (s ?? '').trim()
}
function defaultNameFromEmail(email: string) {
  const e = normalize(email)
  if (!e.includes('@')) return 'GUEST'
  const head = e.split('@')[0].trim()
  return head || 'GUEST'
}

function preserveLocalStorage(keys: string[]) {
  const preserved: Record<string, string> = {}
  keys.forEach(k => {
    const v = localStorage.getItem(k)
    if (v !== null) preserved[k] = v
  })
  return preserved
}
function restoreLocalStorage(preserved: Record<string, string>) {
  Object.keys(preserved).forEach(k => localStorage.setItem(k, preserved[k]))
}

function setDisplay(id: string, show: boolean) {
  const el = document.getElementById(id)
  if (!el) return
  if (show) el.classList.remove('hidden')
  else el.classList.add('hidden')
}

function pad2(n: number) { return String(n).padStart(2, '0') }
function todayYMD() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}
function nowHM() {
  const d = new Date()
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
function normalizeHM(v: string) {
  const s = normalize(v)
  const m = s.match(/^(\d{2}:\d{2})/)
  return m ? m[1] : ''
}
function buildDateText(ymd: string, startHM: string) {
  const d = normalize(ymd)
  const t = normalizeHM(startHM) || '00:00'
  if (!d) return ''
  return `${d}T${t}`
}
function extractHMFromDateText(dateText: string): string {
  const v = normalize(dateText)
  const m = v.match(/T(\d{2}:\d{2})/)
  return m ? m[1] : ''
}

// input[type=date] には YYYY-MM-DD しか入れない（空になる事故防止）
function setDateInputValueSmart(el: HTMLInputElement, dateText: string) {
  const v = normalize(dateText)
  if (!v) { el.value = ''; return }
  if (el.type === 'date') {
    el.value = v.slice(0, 10)
    return
  }
  if (el.type === 'datetime-local') {
    el.value = v.includes('T') ? v.slice(0, 16) : (v.slice(0, 10) + 'T00:00')
    return
  }
  el.value = v
}

// location 文字列: "場所 (ポイント)" を分解
function splitLocation(locationText: string): { base: string; point: string } {
  const s = normalize(locationText)
  if (!s) return { base: '', point: '' }
  const m = s.match(/^(.*?)\s*\((.*?)\)\s*$/)
  if (!m) return { base: s, point: '' }
  return { base: normalize(m[1]), point: normalize(m[2]) }
}

function isOptionValue(select: HTMLSelectElement, value: string) {
  const v = normalize(value)
  if (!v) return true
  return Array.from(select.options).some(o => o.value === v)
}

// selectに値がない場合は「その他」に落としてinputに入れる
function setSelectWithOther(
  selectEl: HTMLSelectElement,
  actualValue: string,
  otherInputEl: HTMLInputElement | null,
  otherInputIdToToggle: string | null
) {
  const v = normalize(actualValue)
  if (!v) {
    selectEl.value = ''
    if (otherInputEl) otherInputEl.value = ''
    if (otherInputIdToToggle) setDisplay(otherInputIdToToggle, false)
    return
  }

  if (isOptionValue(selectEl, v)) {
    selectEl.value = v
    if (otherInputEl) otherInputEl.value = ''
    if (otherInputIdToToggle) setDisplay(otherInputIdToToggle, false)
  } else {
    selectEl.value = 'その他'
    if (otherInputEl) otherInputEl.value = v
    if (otherInputIdToToggle) setDisplay(otherInputIdToToggle, true)
  }
}

// ---------------- HELP (PWA対応) ----------------
function isStandaloneMode(): boolean {
  const mm = window.matchMedia?.('(display-mode: standalone)')?.matches
  const iosStandalone = (navigator as any).standalone === true
  return Boolean(mm || iosStandalone)
}
function bindHelpButton() {
  const el = document.getElementById('helpBtn') as HTMLAnchorElement | null
  if (!el) return
  el.addEventListener('click', (ev) => {
    if (isStandaloneMode()) {
      ev.preventDefault()
      window.location.href = HELP_URL
    }
  })
}

// ---------------- version ----------------
function setAppVersion() {
  const el = document.getElementById('appVersion')
  if (!el) return
  const v =
    (typeof __APP_VERSION__ !== 'undefined' && __APP_VERSION__)
      ? __APP_VERSION__
      : ''
  el.textContent = `Ver.${v || 'dev'}`
}

// ---------------- init ----------------
document.addEventListener('DOMContentLoaded', async () => {
  setAppVersion()

  // LOG: DATE / TIME 初期値
  const dateEl = document.getElementById('date') as HTMLInputElement | null
  if (dateEl) dateEl.value = todayYMD()

  const startEl = document.getElementById('startTime') as HTMLInputElement | null
  if (startEl && !startEl.value) startEl.value = nowHM()

  const endEl = document.getElementById('endTime') as HTMLInputElement | null
  if (endEl && !endEl.value) endEl.value = ''

  // Filter 初期値
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const today = todayYMD()
  const startOfMonth = `${y}-${m}-01`
  ;(document.getElementById('filterStartDate') as HTMLInputElement).value = startOfMonth
  ;(document.getElementById('filterEndDate') as HTMLInputElement).value = today

  // ドロップダウンを初期化（エリアデータを読み込む）
  await initLayer1()
  initEditLayer1()
  initFilterLayer1()
  initCountSelects()
  initBaitSubSelects()

  // authName復元
  const authNameEl = document.getElementById('authName') as HTMLInputElement | null
  if (authNameEl) {
    authNameEl.value =
      localStorage.getItem(LS_LAST_AUTH_NAME) ||
      localStorage.getItem(LS_USER_NAME) ||
      ''
    authNameEl.addEventListener('input', () => {
      localStorage.setItem(LS_LAST_AUTH_NAME, authNameEl.value)
    })
  }

  // セッション確認
  const { data: { session } } = await supabase.auth.getSession()
  if (session) handleLoginSuccess(session.user, '')
  else document.getElementById('authContainer')!.classList.remove('hidden')

  // auth buttons
  document.getElementById('signInBtn')?.addEventListener('click', (e) => { e.preventDefault(); signIn() })
  document.getElementById('signUpBtn')?.addEventListener('click', (e) => { e.preventDefault(); signUp() })
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); signOut() })
  document.getElementById('appReloadBtn')?.addEventListener('click', (e) => { e.preventDefault(); window.location.reload() })

  bindHelpButton()

  // LOG: area/location/point
  document.getElementById('areaSelect')?.addEventListener('change', updateLocations)
  document.getElementById('locationSelect')?.addEventListener('change', updatePoints)

  // EDIT: area/location/point
  document.getElementById('editAreaSelect')?.addEventListener('change', updateEditLocations)
  document.getElementById('editLocationSelect')?.addEventListener('change', updateEditPoints)

  // LOG: method/bait
  document.getElementById('method')?.addEventListener('change', updateMethod)
  document.getElementById('bait')?.addEventListener('change', () => { updateBait(); calculateMainBaitCount() })

  // EDIT: method/bait
  document.getElementById('editMethod')?.addEventListener('change', updateEditMethod)
  document.getElementById('editBait')?.addEventListener('change', () => { updateEditBait(); requestAnimationFrame(() => calculateEditMainBaitCount()) })

  // LOG: bait detail
  document.getElementById('baitDetailSwitch')?.addEventListener('change', toggleBaitDetailMode)
  document.getElementById('count')?.addEventListener('change', () => requestAnimationFrame(() => calculateMainBaitCount()))
  document.querySelectorAll('#baitDetailContainer .bait-sub-select, #baitDetailContainer .bait-count-select')
    .forEach(el => el.addEventListener('change', () => requestAnimationFrame(() => calculateMainBaitCount())))

  // EDIT: bait detail（★スイッチは必ずここで1回だけイベント登録）
  document.getElementById('editBaitDetailSwitch')?.addEventListener('change', () => {
    toggleEditBaitDetailMode()
    requestAnimationFrame(() => calculateEditMainBaitCount()) // iPhone保険
  })
  const recalcEditBait = () => requestAnimationFrame(() => calculateEditMainBaitCount())
  document.getElementById('editCount')?.addEventListener('change', recalcEditBait)
  document.querySelectorAll('#editBaitDetailContainer .bait-sub-select, #editBaitDetailContainer .bait-count-select')
    .forEach(el => el.addEventListener('change', recalcEditBait))

  // LOG: condition
  document.getElementById('weatherSelect')?.addEventListener('change', toggleCustomWeather)
  document.getElementById('windSelect')?.addEventListener('change', toggleCustomWind)
  document.getElementById('conditionSwitch')?.addEventListener('change', toggleConditionMode)

  // EDIT: condition
  document.getElementById('editWeatherSelect')?.addEventListener('change', toggleEditCustomWeather)
  document.getElementById('editWindSelect')?.addEventListener('change', toggleEditCustomWind)

  // LOG: size breakdown
  document.getElementById('detailModeSwitch')?.addEventListener('change', toggleDetailMode)

  // filter
  document.getElementById('filterAreaSelect')?.addEventListener('change', updateFilterLocations)

  // submit / export / profile
  document.getElementById('submitBtn')?.addEventListener('click', (e) => { e.preventDefault(); submitData() })
  document.getElementById('applyFilterBtn')?.addEventListener('click', (e) => { e.preventDefault(); filterLogs() })
  document.getElementById('exportBtn')?.addEventListener('click', (e) => { e.preventDefault(); exportCSV() })
  document.getElementById('saveProfileBtn')?.addEventListener('click', (e) => { e.preventDefault(); saveProfileName() })

  // delete all modal
  document.getElementById('openDeleteAllModalBtn')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('deleteAllModal')!.classList.remove('hidden') })
  document.getElementById('cancelDeleteAllModalBtn')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('deleteAllModal')!.classList.add('hidden') })
  document.getElementById('executeDeleteAllBtn')?.addEventListener('click', (e) => { e.preventDefault(); executeDeleteAll() })

  // edit modal / confirm modal
  document.getElementById('closeModalBtn')?.addEventListener('click', (e) => { e.preventDefault(); closeEditModal() })
  document.getElementById('updateLogBtn')?.addEventListener('click', (e) => { e.preventDefault(); updateLog() })
  document.getElementById('cancelDeleteBtn')?.addEventListener('click', (e) => { e.preventDefault(); closeConfirmModal() })
  document.getElementById('confirmDeleteBtn')?.addEventListener('click', (e) => { e.preventDefault(); executeDeleteLog() })

  // tabs
  document.getElementById('tab-record')?.addEventListener('click', () => showTab('record'))
  document.getElementById('tab-dashboard')?.addEventListener('click', () => showTab('dashboard'))
  document.getElementById('tab-area')?.addEventListener('click', () => showTab('area'))
  document.getElementById('tab-settings')?.addEventListener('click', () => showTab('settings'))

  // nickname modal
  document.getElementById('nicknameLogoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); signOut() })
  document.getElementById('nicknameSaveBtn')?.addEventListener('click', (e) => { e.preventDefault(); saveNicknameFromModal() })
})

// ---------------- layer (LOG) ----------------
// Supabaseからエリアデータを取得してFISHING_DATAと統合
let COMBINED_FISHING_DATA: FishingData = {}

async function loadFishingData() {
  // まずFISHING_DATAをコピー
  COMBINED_FISHING_DATA = JSON.parse(JSON.stringify(FISHING_DATA))
  
  if (!currentUser) {
    // ログインしていない場合は既存データのみ
    return
  }
  
  try {
    // Supabaseからユーザーデータと初期データを取得
    const { data, error } = await supabase
      .from('fishing_areas')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${currentUser.id}`)
      .order('area_name', { ascending: true })
      .order('location_name', { ascending: true })
      .order('point_name', { ascending: true, nullsFirst: false })
    
    if (error) throw error
    
    if (data && data.length > 0) {
      // Supabaseデータを統合
      data.forEach((row: any) => {
        const area = row.area_name
        const location = row.location_name
        const point = row.point_name
        
        // エリアがなければ作成
        if (!COMBINED_FISHING_DATA[area]) {
          COMBINED_FISHING_DATA[area] = {}
        }
        
        // 場所がなければ作成
        if (!COMBINED_FISHING_DATA[area][location]) {
          COMBINED_FISHING_DATA[area][location] = []
        }
        
        // ポイントを追加（重複を避ける）
        if (point && !COMBINED_FISHING_DATA[area][location].includes(point)) {
          COMBINED_FISHING_DATA[area][location].push(point)
        }
      })
    }
  } catch (error) {
    console.error('Error loading fishing data from Supabase:', error)
  }
}

async function initLayer1() {
  // まずSupabaseデータを読み込む
  await loadFishingData()
  
  const select = document.getElementById('areaSelect') as HTMLSelectElement | null
  if (!select) return
  select.innerHTML = '<option value="">エリアを選択</option>'
  for (const area in COMBINED_FISHING_DATA) {
    const option = document.createElement('option')
    option.value = area
    option.textContent = area
    select.appendChild(option)
  }
}

function updateLocations() {
  const area = (document.getElementById('areaSelect') as HTMLSelectElement).value
  const locSelect = document.getElementById('locationSelect') as HTMLSelectElement
  const ptSelect = document.getElementById('pointSelect') as HTMLSelectElement

  locSelect.innerHTML = '<option value="">---</option>'
  locSelect.disabled = true
  ptSelect.innerHTML = '<option value="">---</option>'
  ptSelect.disabled = true

  if (!area) {
    setDisplay('customAreaGroup', false)
    setDisplay('locationSelect', true)
    setDisplay('customLocationInput', false)
    return
  }

  if (area === "その他エリア") {
    setDisplay('customAreaGroup', true)
    setDisplay('locationSelect', false)
    setDisplay('customLocationInput', true)
    return
  }

  setDisplay('customAreaGroup', false)
  setDisplay('locationSelect', true)
  setDisplay('customLocationInput', false)

  locSelect.disabled = false
  locSelect.innerHTML = '<option value="">釣り場を選択</option>'
  // 統合データを使用
  for (const spot in COMBINED_FISHING_DATA[area]) {
    const opt = document.createElement('option')
    opt.value = spot
    opt.text = spot
    locSelect.appendChild(opt)
  }
}

function updatePoints() {
  const area = (document.getElementById('areaSelect') as HTMLSelectElement).value
  const loc = (document.getElementById('locationSelect') as HTMLSelectElement).value
  const ptSelect = document.getElementById('pointSelect') as HTMLSelectElement

  ptSelect.innerHTML = '<option value="">---</option>'
  ptSelect.disabled = true

  // 統合データを使用
  if (area !== "その他エリア" && COMBINED_FISHING_DATA[area] && COMBINED_FISHING_DATA[area][loc]) {
    const points = COMBINED_FISHING_DATA[area][loc]
    if (points && points.length > 0) {
      ptSelect.disabled = false
      ptSelect.innerHTML = '<option value="">ポイント詳細</option>'
      points.forEach(pt => {
        const opt = document.createElement('option')
        opt.value = pt
        opt.text = pt
        ptSelect.appendChild(opt)
      })
    }
  }
}

// ---------------- layer (EDIT) ----------------
function initEditLayer1() {
  const select = document.getElementById('editAreaSelect') as HTMLSelectElement | null
  if (!select) return
  select.innerHTML = '<option value="">エリアを選択</option>'
  // 統合データを使用
  for (const area in COMBINED_FISHING_DATA) {
    const option = document.createElement('option')
    option.value = area
    option.textContent = area
    select.appendChild(option)
  }
}

function updateEditLocations() {
  const area = (document.getElementById('editAreaSelect') as HTMLSelectElement).value
  const locSelect = document.getElementById('editLocationSelect') as HTMLSelectElement
  const ptSelect = document.getElementById('editPointSelect') as HTMLSelectElement

  locSelect.innerHTML = '<option value="">---</option>'
  locSelect.disabled = true
  ptSelect.innerHTML = '<option value="">---</option>'
  ptSelect.disabled = true

  if (!area) {
    setDisplay('editCustomAreaGroup', false)
    setDisplay('editLocationSelect', true)
    setDisplay('editCustomLocationInput', false)
    return
  }

  if (area === "その他エリア") {
    setDisplay('editCustomAreaGroup', true)
    setDisplay('editLocationSelect', false)
    setDisplay('editCustomLocationInput', true)
    return
  }

  setDisplay('editCustomAreaGroup', false)
  setDisplay('editLocationSelect', true)
  setDisplay('editCustomLocationInput', false)

  locSelect.disabled = false
  locSelect.innerHTML = '<option value="">釣り場を選択</option>'
  // 統合データを使用
  for (const spot in COMBINED_FISHING_DATA[area]) {
    const opt = document.createElement('option')
    opt.value = spot
    opt.text = spot
    locSelect.appendChild(opt)
  }
}

function updateEditPoints() {
  const area = (document.getElementById('editAreaSelect') as HTMLSelectElement).value
  const loc = (document.getElementById('editLocationSelect') as HTMLSelectElement).value
  const ptSelect = document.getElementById('editPointSelect') as HTMLSelectElement

  ptSelect.innerHTML = '<option value="">---</option>'
  ptSelect.disabled = true

  // 統合データを使用
  if (area !== "その他エリア" && COMBINED_FISHING_DATA[area] && COMBINED_FISHING_DATA[area][loc]) {
    const points = COMBINED_FISHING_DATA[area][loc]
    if (points && points.length > 0) {
      ptSelect.disabled = false
      ptSelect.innerHTML = '<option value="">ポイント詳細</option>'
      points.forEach(pt => {
        const opt = document.createElement('option')
        opt.value = pt
        opt.text = pt
        ptSelect.appendChild(opt)
      })
    }
  }
}

// ---------------- method/bait ----------------
function updateMethod() {
  const val = (document.getElementById('method') as HTMLSelectElement).value
  setDisplay('customMethodInput', val === 'その他')
}
function updateBait() {
  const val = (document.getElementById('bait') as HTMLSelectElement).value
  setDisplay('customBaitInput', val === 'その他')
}
function updateEditMethod() {
  const val = (document.getElementById('editMethod') as HTMLSelectElement).value
  setDisplay('editCustomMethodInput', val === 'その他')
}
function updateEditBait() {
  const val = (document.getElementById('editBait') as HTMLSelectElement).value
  setDisplay('editCustomBaitInput', val === 'その他')
}

// ---------------- condition (LOG/EDIT) ----------------
function toggleCustomWeather() {
  const val = (document.getElementById('weatherSelect') as HTMLSelectElement).value
  setDisplay('customWeather', val === 'その他')
}
function toggleCustomWind() {
  const val = (document.getElementById('windSelect') as HTMLSelectElement).value
  setDisplay('customWind', val === 'その他')
}
function toggleConditionMode() {
  const isChecked = (document.getElementById('conditionSwitch') as HTMLInputElement).checked
  const container = document.getElementById('conditionContainer') as HTMLElement
  if (isChecked) {
    container.classList.remove('hidden')
  } else {
    container.classList.add('hidden')
    ;(document.getElementById('weatherSelect') as HTMLSelectElement).value = ""
    ;(document.getElementById('tideSelect') as HTMLSelectElement).value = ""
    ;(document.getElementById('windSelect') as HTMLSelectElement).value = ""
    setDisplay('customWeather', false)
    setDisplay('customWind', false)
  }
}
function toggleEditCustomWeather() {
  const val = (document.getElementById('editWeatherSelect') as HTMLSelectElement).value
  setDisplay('editCustomWeather', val === 'その他')
}
function toggleEditCustomWind() {
  const val = (document.getElementById('editWindSelect') as HTMLSelectElement).value
  setDisplay('editCustomWind', val === 'その他')
}

// ---------------- bait breakdown (LOG) ----------------
function toggleBaitDetailMode() {
  const isChecked = (document.getElementById('baitDetailSwitch') as HTMLInputElement).checked
  const container = document.getElementById('baitDetailContainer') as HTMLElement
  if (isChecked) {
    container.classList.remove('hidden')
    requestAnimationFrame(() => calculateMainBaitCount())
  } else {
    container.classList.add('hidden')
    document.querySelectorAll('#baitDetailContainer .bait-sub-select').forEach((el: any) => el.value = "")
    document.querySelectorAll('#baitDetailContainer .bait-count-select').forEach((el: any) => el.value = "0")
    requestAnimationFrame(() => calculateMainBaitCount())
  }
}

function calculateMainBaitCount() {
  const total = parseInt((document.getElementById('count') as HTMLSelectElement).value) || 0

  let mainBaitName = (document.getElementById('bait') as HTMLSelectElement).value
  if (mainBaitName === 'その他') {
    mainBaitName = normalize((document.getElementById('customBaitInput') as HTMLInputElement).value) || 'その他'
  }

  let subSum = 0
  for (let i = 1; i <= 3; i++) {
    const subName = (document.getElementById(`baitSub${i}`) as HTMLSelectElement).value
    const subCount = parseInt((document.getElementById(`baitCount${i}`) as HTMLSelectElement).value) || 0
    if (subName) subSum += subCount
  }

  let mainCount = total - subSum
  if (mainCount < 0) mainCount = 0

  ;(document.getElementById('displayMainBait') as HTMLInputElement).value = mainBaitName
  ;(document.getElementById('displayMainBaitCount') as HTMLInputElement).value = String(mainCount)
}

// ---------------- bait breakdown (EDIT) ----------------
function toggleEditBaitDetailMode() {
  const sw = document.getElementById('editBaitDetailSwitch') as HTMLInputElement | null
  const container = document.getElementById('editBaitDetailContainer') as HTMLElement | null
  const err = document.getElementById('editBaitDetailError') as HTMLElement | null

  if (!sw || !container) return
  if (err) err.innerText = ''

  if (sw.checked) {
    container.classList.remove('hidden')
    requestAnimationFrame(() => calculateEditMainBaitCount())
  } else {
    container.classList.add('hidden')
    for (let i = 1; i <= 3; i++) {
      const sub = document.getElementById(`editBaitSub${i}`) as HTMLSelectElement | null
      const cnt = document.getElementById(`editBaitCount${i}`) as HTMLSelectElement | null
      if (sub) sub.value = ''
      if (cnt) cnt.value = '0'
    }
    requestAnimationFrame(() => calculateEditMainBaitCount())
  }
}

function calculateEditMainBaitCount() {
  const total = parseInt((document.getElementById('editCount') as HTMLSelectElement).value) || 0

  let mainBaitName = (document.getElementById('editBait') as HTMLSelectElement).value
  if (mainBaitName === 'その他') {
    mainBaitName = normalize((document.getElementById('editCustomBaitInput') as HTMLInputElement).value) || 'その他'
  }

  let subSum = 0
  for (let i = 1; i <= 3; i++) {
    const subName = (document.getElementById(`editBaitSub${i}`) as HTMLSelectElement).value
    const subCount = parseInt((document.getElementById(`editBaitCount${i}`) as HTMLSelectElement).value) || 0
    if (subName) subSum += subCount
  }

  let mainCount = total - subSum
  if (mainCount < 0) mainCount = 0

  ;(document.getElementById('editDisplayMainBait') as HTMLInputElement).value = mainBaitName
  ;(document.getElementById('editDisplayMainBaitCount') as HTMLInputElement).value = String(mainCount)

  const err = document.getElementById('editBaitDetailError') as HTMLElement | null
  if (err) {
    if (subSum > total) err.innerText = 'エサ内訳がトータルを超えています'
    else err.innerText = ''
  }
}

// ---------------- size breakdown (LOG) ----------------
function toggleDetailMode() {
  const isChecked = (document.getElementById('detailModeSwitch') as HTMLInputElement).checked
  const detailInputs = document.getElementById('detailSizeInputs') as HTMLElement
  if (isChecked) {
    detailInputs?.classList.remove('hidden')
  } else {
    detailInputs?.classList.add('hidden')
    ;(document.getElementById('size45') as HTMLSelectElement).value = "0"
    ;(document.getElementById('size40') as HTMLSelectElement).value = "0"
  }
}

// ---------------- selects init ----------------
function initCountSelects() {
  const targets = ['count', 'toshinashi', 'size45', 'size40', 'editCount', 'editToshinashi', 'editSize45', 'editSize40']
  targets.forEach(id => {
    const select = document.getElementById(id) as HTMLSelectElement | null
    if (!select) return
    select.innerHTML = ''
    for (let i = 0; i <= 99; i++) {
      const opt = document.createElement('option')
      opt.value = String(i)
      opt.text = String(i)
      select.appendChild(opt)
    }
  })
}

function initBaitSubSelects() {
  const selects = document.querySelectorAll('.bait-sub-select')
  const counts = document.querySelectorAll('.bait-count-select')

  selects.forEach(sel => {
    const s = sel as HTMLSelectElement
    s.innerHTML = '<option value="">エサを選択</option>'
    BAIT_LIST.forEach(b => {
      const opt = document.createElement('option')
      opt.value = b
      opt.text = b
      s.appendChild(opt)
    })
  })

  counts.forEach(sel => {
    const s = sel as HTMLSelectElement
    s.innerHTML = '<option value="0">0</option>'
    for (let i = 1; i <= 50; i++) {
      const opt = document.createElement('option')
      opt.value = String(i)
      opt.text = String(i)
      s.appendChild(opt)
    }
  })
}

// ---------------- filter init ----------------
function initFilterLayer1() {
  const select = document.getElementById('filterAreaSelect') as HTMLSelectElement | null
  if (!select) return
  select.innerHTML = '<option value="">ALL AREAS</option>'
  // 統合データを使用
  for (const area in COMBINED_FISHING_DATA) {
    const option = document.createElement('option')
    option.value = area
    option.textContent = area
    select.appendChild(option)
  }
}

function updateFilterLocations() {
  const area = (document.getElementById('filterAreaSelect') as HTMLSelectElement).value
  const locSelect = document.getElementById('filterLocationSelect') as HTMLSelectElement

  locSelect.innerHTML = '<option value="">ALL LOCATIONS</option>'
  locSelect.disabled = true

  if (!area || area === "その他エリア") return

  // 統合データを使用
  if (COMBINED_FISHING_DATA[area]) {
    locSelect.disabled = false
    for (const spot in COMBINED_FISHING_DATA[area]) {
      const opt = document.createElement('option')
      opt.value = spot
      opt.text = spot
      locSelect.appendChild(opt)
    }
  }
}

// ---------------- auth ----------------
async function signIn() {
  const email = normalize((document.getElementById('email') as HTMLInputElement).value)
  const password = (document.getElementById('password') as HTMLInputElement).value
  const typedName = normalize((document.getElementById('authName') as HTMLInputElement | null)?.value || '')
  const msg = document.getElementById('authMessage') as HTMLElement | null

  if (typedName) localStorage.setItem(LS_LAST_AUTH_NAME, typedName)
  if (!email || !password) { if (msg) msg.innerText = "メールとパスワードを入力してください"; return }

  const btn = document.getElementById('signInBtn') as HTMLButtonElement | null
  if (btn) { btn.disabled = true; btn.innerText = "LOADING..." }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    if (msg) msg.innerText = "ログイン失敗: " + error.message
    if (btn) { btn.disabled = false; btn.innerText = "LOGIN" }
  } else {
    handleLoginSuccess(data.user, typedName)
  }
}

async function signUp() {
  const email = normalize((document.getElementById('email') as HTMLInputElement).value)
  const password = (document.getElementById('password') as HTMLInputElement).value
  const typedName = normalize((document.getElementById('authName') as HTMLInputElement | null)?.value || '')
  const msg = document.getElementById('authMessage') as HTMLElement | null

  if (typedName) localStorage.setItem(LS_LAST_AUTH_NAME, typedName)
  if (!email || !password) { if (msg) msg.innerText = "メールとパスワードを入力してください"; return }
  if (password.length < 6) { if (msg) msg.innerText = "パスワードは6文字以上必要です"; return }

  const btn = document.getElementById('signUpBtn') as HTMLButtonElement | null
  if (btn) { btn.disabled = true; btn.innerText = "REGISTERING..." }

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    if (msg) msg.innerText = "登録失敗: " + error.message
  } else {
    showToast("登録完了！ログインしました")
    handleLoginSuccess(data.user, typedName)
  }

  if (btn) { btn.disabled = false; btn.innerText = "新規登録 (SIGN UP)" }
}

async function signOut() {
  const keep = preserveLocalStorage([LS_USER_NAME, LS_LAST_AUTH_NAME])
  await supabase.auth.signOut()
  localStorage.clear()
  restoreLocalStorage(keep)
  window.location.reload()
}

function handleLoginSuccess(user: any, typedName: string) {
  currentUser = user
  document.getElementById('authContainer')!.classList.add('hidden')
  document.getElementById('logoutBtn')!.classList.remove('hidden')

  const emailDisplay = document.getElementById('currentUserEmail')
  if (emailDisplay) emailDisplay.innerText = user.email

  if (!currentProfileName && typedName) {
    currentProfileName = typedName
    localStorage.setItem(LS_USER_NAME, typedName)
  }
  if (typedName) localStorage.setItem(LS_LAST_AUTH_NAME, typedName)

  updateHeaderInfo()

  if (!normalize(currentProfileName)) {
    document.getElementById('nicknameModal')?.classList.remove('hidden')
  }

  // エリアデータを読み込んでドロップダウンを更新
  initLayer1().then(() => {
    initEditLayer1()
  })

  loadData()
}

function saveNicknameFromModal() {
  const inp = document.getElementById('nicknameModalInput') as HTMLInputElement | null
  const name = normalize(inp?.value || '')
  if (!name) { showToast('ニックネームが空やで', true); return }
  currentProfileName = name
  localStorage.setItem(LS_USER_NAME, name)
  localStorage.setItem(LS_LAST_AUTH_NAME, name)
  updateHeaderInfo()
  document.getElementById('nicknameModal')?.classList.add('hidden')
  showToast('NICKNAME SAVED!')
}

function saveProfileName() {
  const name = normalize((document.getElementById('userNameInput') as HTMLInputElement).value)
  localStorage.setItem(LS_USER_NAME, name)
  localStorage.setItem(LS_LAST_AUTH_NAME, name)
  currentProfileName = name
  updateHeaderInfo()
  showToast("NICKNAME SAVED!")
}

function updateHeaderInfo() {
  const disp = document.getElementById('userInfoDisplay') as HTMLElement | null
  const nameInp = document.getElementById('userNameInput') as HTMLInputElement | null

  if (normalize(currentProfileName)) {
    if (disp) disp.innerText = currentProfileName
    if (nameInp) nameInp.value = currentProfileName
  } else {
    if (disp) disp.innerText = "GUEST"
  }
}

// ---------------- tabs ----------------
function showTab(tabName: string) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'))
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
  document.getElementById(tabName + 'Tab')?.classList.add('active')
  document.getElementById('tab-' + tabName)?.classList.add('active')
  if (tabName === 'dashboard') loadData()
  if (tabName === 'area') loadAreas()
}

// ---------------- submit (LOG) ----------------
async function submitData() {
  if (!currentUser) { showToast("ログインしてください", true); return }

  const area = (document.getElementById('areaSelect') as HTMLSelectElement).value
  if (!area) { showToast("エリアを選択してください", true); return }

  // LOCATION生成
  let finalLoc = ""
  if (area === "その他エリア") {
    const customArea = normalize((document.getElementById('customAreaInput') as HTMLInputElement).value)
    const customLoc = normalize((document.getElementById('customLocationInput') as HTMLInputElement).value)
    if (!customArea) { showToast("エリア名を入力してください", true); return }
    finalLoc = customArea
    if (customLoc) finalLoc += ` (${customLoc})`
  } else {
    const loc = (document.getElementById('locationSelect') as HTMLSelectElement).value
    if (!loc) { showToast("釣り場を選択してください", true); return }
    const pt = (document.getElementById('pointSelect') as HTMLSelectElement).value
    finalLoc = loc
    if (pt) finalLoc += ` (${pt})`
  }

  // method/bait
  let methodVal = (document.getElementById('method') as HTMLSelectElement).value
  if (methodVal === 'その他') methodVal = normalize((document.getElementById('customMethodInput') as HTMLInputElement).value) || 'その他'

  let baitVal = (document.getElementById('bait') as HTMLSelectElement).value
  if (baitVal === 'その他') baitVal = normalize((document.getElementById('customBaitInput') as HTMLInputElement).value) || 'その他'

  // date/time
  const ymd = normalize((document.getElementById('date') as HTMLInputElement).value)
  const startTime = normalizeHM((document.getElementById('startTime') as HTMLInputElement).value)
  const endTime = normalizeHM((document.getElementById('endTime') as HTMLInputElement).value)

  if (!ymd) { showToast("DATEが空やで", true); return }
  const dateText = buildDateText(ymd, startTime)

  // numbers
  const countVal = parseInt((document.getElementById('count') as HTMLSelectElement).value) || 0
  const toshiVal = parseInt((document.getElementById('toshinashi') as HTMLSelectElement).value) || 0
  const s45 = parseInt((document.getElementById('size45') as HTMLSelectElement).value) || 0
  const s40 = parseInt((document.getElementById('size40') as HTMLSelectElement).value) || 0

  // condition（スイッチOFFなら空にする）
  let weatherVal = (document.getElementById('weatherSelect') as HTMLSelectElement).value
  if (weatherVal === 'その他') weatherVal = normalize((document.getElementById('customWeather') as HTMLInputElement).value)

  let windVal = (document.getElementById('windSelect') as HTMLSelectElement).value
  if (windVal === 'その他') windVal = normalize((document.getElementById('customWind') as HTMLInputElement).value)

  let tideVal = (document.getElementById('tideSelect') as HTMLSelectElement).value

  const isConditionOn = (document.getElementById('conditionSwitch') as HTMLInputElement).checked
  if (!isConditionOn) { weatherVal = ""; windVal = ""; tideVal = "" }

  // bait_details（LOG）
  let baitDetails: { [key: string]: number } | null = null
  if ((document.getElementById('baitDetailSwitch') as HTMLInputElement).checked) {
    baitDetails = {}
    let detailSum = 0
    for (let i = 1; i <= 3; i++) {
      const bSub = (document.getElementById(`baitSub${i}`) as HTMLSelectElement).value
      const bCnt = parseInt((document.getElementById(`baitCount${i}`) as HTMLSelectElement).value) || 0
      if (bSub && bCnt > 0) {
        baitDetails[bSub] = (baitDetails[bSub] || 0) + bCnt
        detailSum += bCnt
      }
    }
    const mainCount = countVal - detailSum
    if (mainCount < 0) { showToast("エサ内訳がトータルを超えています", true); return }
    if (mainCount > 0) {
      baitDetails[baitVal] = (baitDetails[baitVal] || 0) + mainCount
    }
  }

  if (toshiVal + s45 + s40 > countVal) { showToast("サイズ内訳がトータルを超えています", true); return }

  const btn = document.getElementById('submitBtn') as HTMLButtonElement
  const originalText = btn.innerText
  btn.innerText = "SENDING..."
  btn.disabled = true

  const safeUserName =
    normalize(currentProfileName) ||
    defaultNameFromEmail(currentUser?.email || '')

  try {
    const { error } = await supabase.from('logs').insert([{
      auth_user_id: currentUser.id,
      user_id: currentUser.id,
      user_name: safeUserName,

      // 互換維持：YYYY-MM-DDTHH:MM
      date: dateText,
      start_time: startTime || null,
      end_time: endTime || null,

      area: area,
      location: finalLoc,
      method: methodVal,
      bait: baitVal,
      bait_details: baitDetails,

      count: countVal,
      toshinashi: toshiVal,
      size_45: s45,
      size_40: s40,

      memo: (document.getElementById('memo') as HTMLTextAreaElement).value,

      weather: weatherVal,
      wind: windVal,
      tide: tideVal
    }])

    if (error) throw error
    showToast("RECORDED SUCCESSFULLY!")

    // reset（最低限）
    ;(document.getElementById('count') as HTMLSelectElement).value = "0"
    ;(document.getElementById('toshinashi') as HTMLSelectElement).value = "0"
    ;(document.getElementById('size45') as HTMLSelectElement).value = "0"
    ;(document.getElementById('size40') as HTMLSelectElement).value = "0"
    ;(document.getElementById('memo') as HTMLTextAreaElement).value = ""

    ;(document.getElementById('customAreaInput') as HTMLInputElement).value = ""
    ;(document.getElementById('customLocationInput') as HTMLInputElement).value = ""
    ;(document.getElementById('customMethodInput') as HTMLInputElement).value = ""
    ;(document.getElementById('customBaitInput') as HTMLInputElement).value = ""

    ;(document.getElementById('endTime') as HTMLInputElement).value = ""

    ;(document.getElementById('conditionSwitch') as HTMLInputElement).checked = false
    toggleConditionMode()

    ;(document.getElementById('baitDetailSwitch') as HTMLInputElement).checked = false
    toggleBaitDetailMode()
  } catch (e: any) {
    showToast("保存エラー: " + e.message, true)
  } finally {
    btn.innerText = originalText
    btn.disabled = false
    loadData()
  }
}

// ---------------- load/filter/render ----------------
async function loadData() {
  if (!currentUser) return
  const btn = document.getElementById('applyFilterBtn')
  if (btn) (btn as HTMLElement).innerText = "LOADING..."

  const { data, error } = await supabase.from('logs')
    .select('*')
    .eq('auth_user_id', currentUser.id)
    .order('date', { ascending: false })

  if (btn) (btn as HTMLElement).innerText = "APPLY & RELOAD"
  if (error) return

  allLogs = data || []
  filterLogs()
}

function filterLogs() {
  const start = (document.getElementById('filterStartDate') as HTMLInputElement).value
  const end = (document.getElementById('filterEndDate') as HTMLInputElement).value
  const filterArea = (document.getElementById('filterAreaSelect') as HTMLSelectElement).value
  const filterLoc = (document.getElementById('filterLocationSelect') as HTMLSelectElement).value

  filteredLogs = allLogs.filter(log => {
    const logDate = normalize(log.date || '').slice(0, 10)
    let isDateOk = true
    let isAreaOk = true
    let isLocOk = true

    if (start && logDate < start) isDateOk = false
    if (end && logDate > end) isDateOk = false
    if (filterArea && log.area !== filterArea) isAreaOk = false

    if (filterLoc) {
      const logLocName = normalize(log.location || '').split(' (')[0]
      if (logLocName !== filterLoc) isLocOk = false
    }
    return isDateOk && isAreaOk && isLocOk
  })

  renderDashboard(filteredLogs, filterArea, filterLoc)
}

function renderDashboard(logs: any[], currentArea: string = "", currentLoc: string = "") {
  const list = document.getElementById('logList') as HTMLElement
  list.innerHTML = ''

  let total = 0
  let toshi = 0

  const monthlyStats: { [key: string]: { others: number, s40: number, s45: number, s50: number } } = {}
  const baitStats: { [key: string]: number } = {}
  const areaStats: { [key: string]: number } = {}
  const weatherStats: { [key: string]: number } = {}
  const tideStats: { [key: string]: number } = {}
  const windStats: { [key: string]: number } = {}

  let areaChartTitle = "AREA RATIO"
  if (currentArea && !currentLoc) areaChartTitle = "LOCATION RATIO"
  else if (currentArea && currentLoc) areaChartTitle = "POINT RATIO"
  const areaChartTitleEl = document.querySelector('#areaPieChart')?.previousElementSibling as HTMLElement
  if (areaChartTitleEl) areaChartTitleEl.innerText = areaChartTitle

  if (logs.length === 0) {
    list.innerHTML = '<li style="padding:15px; text-align:center; color:#888;">NO DATA</li>'
  } else {
    logs.forEach(d => {
      const c = d.count || 0
      const t = d.toshinashi || 0
      const s45 = d.size_45 || 0
      const s40 = d.size_40 || 0

      let others = c - (t + s45 + s40)
      if (others < 0) others = 0

      total += c
      toshi += t

      const mKey = normalize(d.date || '').substring(0, 7)
      if (!monthlyStats[mKey]) monthlyStats[mKey] = { others: 0, s40: 0, s45: 0, s50: 0 }
      monthlyStats[mKey].others += others
      monthlyStats[mKey].s40 += s40
      monthlyStats[mKey].s45 += s45
      monthlyStats[mKey].s50 += t

      // area pie drilldown
      let key = ""
      if (!currentArea) key = d.area || "不明"
      else if (!currentLoc) key = normalize(d.location || '').split(' (')[0] || "不明"
      else {
        const match = normalize(d.location || '').match(/\((.*?)\)/)
        key = match ? match[1] : "全体/不明"
      }
      if (key) {
        if (!areaStats[key]) areaStats[key] = 0
        areaStats[key] += c
      }

      // bait stats
      if (d.bait_details) {
        for (const bKey in d.bait_details) {
          if (!baitStats[bKey]) baitStats[bKey] = 0
          baitStats[bKey] += d.bait_details[bKey]
        }
      } else {
        const bKey = d.bait || "不明"
        if (!baitStats[bKey]) baitStats[bKey] = 0
        baitStats[bKey] += c
      }

      // condition stats
      if (d.weather) { const w = d.weather; if (!weatherStats[w]) weatherStats[w] = 0; weatherStats[w] += c }
      if (d.tide) { const ti = d.tide; if (!tideStats[ti]) tideStats[ti] = 0; tideStats[ti] += c }
      if (d.wind) { const wi = d.wind; if (!windStats[wi]) windStats[wi] = 0; windStats[wi] += c }

      // list item
      const li = document.createElement('li')
      const dateStr = normalize(d.date || '').slice(5, 16).replace('T', ' ')
      const toshiBadge = t > 0 ? `<span style="color:#c5a059; font-size:0.8em; margin-left:5px;">★${t}</span>` : ''

      let conditionStr = ""
      if (d.tide || d.wind || d.weather) {
        const parts: string[] = []
        if (d.weather) parts.push(d.weather)
        if (d.tide) parts.push(d.tide)
        if (d.wind) parts.push(d.wind)
        conditionStr = `<div style="font-size:0.65rem; color:#888; margin-top:2px;">${parts.join(' / ')}</div>`
      }

      li.innerHTML = `
        <div class="log-info">
          <span class="log-date">${dateStr}</span>
          <span class="log-detail" style="font-weight:500; color:#fff;">${d.location}</span>
          <span style="display:block; font-size:0.75rem; color:#666;">${d.method} / ${d.bait}</span>
          ${conditionStr}
        </div>
        <div class="log-actions">
          <div class="log-count">${c}枚${toshiBadge}</div>
          <button class="action-btn edit-btn" data-id="${d.id}"><i class="fas fa-pen"></i></button>
          <button class="action-btn del-btn" data-id="${d.id}"><i class="fas fa-trash"></i></button>
        </div>`

      list.appendChild(li)
    })
  }

  document.querySelectorAll('.edit-btn').forEach(b =>
    b.addEventListener('click', (e: any) => openEditModal(e.target.closest('button').dataset.id))
  )
  document.querySelectorAll('.del-btn').forEach(b =>
    b.addEventListener('click', (e: any) => openConfirmModal(e.target.closest('button').dataset.id))
  )

  document.getElementById('totalCatch')!.innerText = String(total)
  document.getElementById('totalToshinashi')!.innerText = String(toshi)
  document.getElementById('logCount')!.innerText = String(logs.length)

  // monthly chart
  const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement
  if (canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const keys = Object.keys(monthlyStats).sort()
      const dataOthers = keys.map(k => monthlyStats[k].others)
      const data40 = keys.map(k => monthlyStats[k].s40)
      const data45 = keys.map(k => monthlyStats[k].s45)
      const data50 = keys.map(k => monthlyStats[k].s50)

      if (myChart) myChart.destroy()
      myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: keys,
          datasets: [
            { label: '<40cm', data: dataOthers, backgroundColor: '#333333' },
            { label: '40-44cm', data: data40, backgroundColor: '#4a90e2' },
            { label: '45-49cm', data: data45, backgroundColor: '#cf4545' },
            { label: '50cm+', data: data50, backgroundColor: '#c5a059' }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true, grid: { color: '#333' }, ticks: { color: '#888' } },
            y: { stacked: true, beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#888' } }
          }
        }
      })
    }
  }

  renderPieChart('baitPieChart', baitStats, baitChart, (chart) => baitChart = chart)
  renderPieChart('areaPieChart', areaStats, areaChart, (chart) => areaChart = chart)
  renderPieChart('weatherPieChart', weatherStats, weatherChart, (chart) => weatherChart = chart)
  renderPieChart('tidePieChart', tideStats, tideChart, (chart) => tideChart = chart)
  renderPieChart('windPieChart', windStats, windChart, (chart) => windChart = chart)
}

function renderPieChart(canvasId: string, dataObj: { [key: string]: number }, chartInstance: any, setChart: (c: any) => void) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const labels = Object.keys(dataObj)
  const dataVals = Object.values(dataObj)
  if (labels.length === 0) {
    if (chartInstance) chartInstance.destroy()
    return
  }

  const colors = ['#c5a059', '#4a90e2', '#cf4545', '#888888', '#555555', '#333333', '#dddddd']
  if (chartInstance) chartInstance.destroy()

  const newChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: labels, datasets: [{ data: dataVals, backgroundColor: colors, borderWidth: 1, borderColor: '#161616' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#888', font: { size: 10 } } } } }
  })
  setChart(newChart)
}

// ======== Part 1 END（ここで止めずに、この下にPart 2を続けて貼って） ========
// ---------------- edit modal ----------------
function openEditModal(id: string) {
  const log = allLogs.find(l => l.id == id)
  if (!log) return

  ;(document.getElementById('editLogId') as HTMLInputElement).value = String(id)

  // DATE
  const editDateEl = document.getElementById('editDate') as HTMLInputElement
  setDateInputValueSmart(editDateEl, log.date || '')

  // START/END（昔ログは空でOK）
  const start = normalizeHM(log.start_time || '') || normalizeHM(extractHMFromDateText(log.date || ''))
  const end = normalizeHM(log.end_time || '')
  ;(document.getElementById('editStartTime') as HTMLInputElement).value = start
  ;(document.getElementById('editEndTime') as HTMLInputElement).value = end

  // AREA/LOCATION/POINT
  const area = normalize(log.area || '')
  const locText = normalize(log.location || '')
  const { base, point } = splitLocation(locText)

  const editAreaSelect = document.getElementById('editAreaSelect') as HTMLSelectElement
  editAreaSelect.value = area
  updateEditLocations()

  if (area === 'その他エリア') {
    ;(document.getElementById('editCustomAreaInput') as HTMLInputElement).value = base
    ;(document.getElementById('editCustomLocationInput') as HTMLInputElement).value = point
  } else {
    const editLocSelect = document.getElementById('editLocationSelect') as HTMLSelectElement
    if (isOptionValue(editLocSelect, base)) {
      editLocSelect.value = base
      updateEditPoints()
      const editPtSelect = document.getElementById('editPointSelect') as HTMLSelectElement
      if (point && isOptionValue(editPtSelect, point)) editPtSelect.value = point
    } else {
      editLocSelect.value = ''
      updateEditPoints()
    }
  }

  // 互換用hidden（UIでは使わんが、念のため入れておく）
  ;(document.getElementById('editLocation') as HTMLInputElement).value = locText

  // STYLE（その他対応）
  const editMethodSel = document.getElementById('editMethod') as HTMLSelectElement
  const editCustomMethod = document.getElementById('editCustomMethodInput') as HTMLInputElement
  setSelectWithOther(editMethodSel, normalize(log.method || ''), editCustomMethod, 'editCustomMethodInput')
  updateEditMethod()

  // BAIT（その他対応）
  const editBaitSel = document.getElementById('editBait') as HTMLSelectElement
  const editCustomBait = document.getElementById('editCustomBaitInput') as HTMLInputElement
  setSelectWithOther(editBaitSel, normalize(log.bait || ''), editCustomBait, 'editCustomBaitInput')
  updateEditBait()

  // 数値（select）
  ;(document.getElementById('editCount') as HTMLSelectElement).value = String(log.count ?? 0)
  ;(document.getElementById('editToshinashi') as HTMLSelectElement).value = String(log.toshinashi ?? 0)
  ;(document.getElementById('editSize45') as HTMLSelectElement).value = String(log.size_45 ?? 0)
  ;(document.getElementById('editSize40') as HTMLSelectElement).value = String(log.size_40 ?? 0)

  // CONDITION（その他対応）
  const ewSel = document.getElementById('editWeatherSelect') as HTMLSelectElement
  const ewCustom = document.getElementById('editCustomWeather') as HTMLInputElement
  setSelectWithOther(ewSel, normalize(log.weather || ''), ewCustom, 'editCustomWeather')
  toggleEditCustomWeather()

  const etSel = document.getElementById('editTideSelect') as HTMLSelectElement
  const tideVal = normalize(log.tide || '')
  etSel.value = isOptionValue(etSel, tideVal) ? tideVal : ''

  const ewiSel = document.getElementById('editWindSelect') as HTMLSelectElement
  const ewiCustom = document.getElementById('editCustomWind') as HTMLInputElement
  setSelectWithOther(ewiSel, normalize(log.wind || ''), ewiCustom, 'editCustomWind')
  toggleEditCustomWind()

  // BAIT BREAKDOWN（既存データをEDIT UIへ展開）
  const editBaitDetailSwitch = document.getElementById('editBaitDetailSwitch') as HTMLInputElement
  const editBaitDetailContainer = document.getElementById('editBaitDetailContainer') as HTMLElement
  const editBaitDetailError = document.getElementById('editBaitDetailError') as HTMLElement

  editBaitDetailError.innerText = ''
  for (let i = 1; i <= 3; i++) {
    ;(document.getElementById(`editBaitSub${i}`) as HTMLSelectElement).value = ''
    ;(document.getElementById(`editBaitCount${i}`) as HTMLSelectElement).value = '0'
  }

  // メインエサ名（その他対応）
  let mainBaitName = (document.getElementById('editBait') as HTMLSelectElement).value
  if (mainBaitName === 'その他') {
    mainBaitName = normalize((document.getElementById('editCustomBaitInput') as HTMLInputElement).value) || 'その他'
  }

  const bd = log.bait_details as Record<string, number> | null
  const entries = bd ? Object.entries(bd).filter(([_, v]) => (v ?? 0) > 0) : []

  const subEntries = entries
    .filter(([k]) => normalize(k) && normalize(k) !== normalize(mainBaitName))
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 3)

  if (subEntries.length > 0) {
    editBaitDetailSwitch.checked = true
    editBaitDetailContainer.classList.remove('hidden')

    subEntries.forEach(([baitName, cnt], idx) => {
      const i = idx + 1
      const subSel = document.getElementById(`editBaitSub${i}`) as HTMLSelectElement
      const cntSel = document.getElementById(`editBaitCount${i}`) as HTMLSelectElement

      // サブは候補制（未知のエサ名は表示できない）
      if (BAIT_LIST.includes(baitName)) {
        subSel.value = baitName
        const v = Math.max(0, Math.min(50, Number(cnt ?? 0)))
        cntSel.value = String(v)
        if (Number(cnt ?? 0) > 50) {
          editBaitDetailError.innerText = '※内訳が50を超えるデータは、EDIT画面で一部表示できません'
        }
      }
    })

    requestAnimationFrame(() => calculateEditMainBaitCount())
  } else {
    editBaitDetailSwitch.checked = false
    editBaitDetailContainer.classList.add('hidden')
    requestAnimationFrame(() => calculateEditMainBaitCount())
  }

  // MEMO
  ;(document.getElementById('editMemo') as HTMLTextAreaElement).value = log.memo || ''

  document.getElementById('editModal')!.classList.remove('hidden')
}

function closeEditModal() {
  document.getElementById('editModal')!.classList.add('hidden')
}

function openConfirmModal(id: string) {
  deleteTargetId = id
  document.getElementById('confirmModal')!.classList.remove('hidden')
}

function closeConfirmModal() {
  deleteTargetId = null
  document.getElementById('confirmModal')!.classList.add('hidden')
}

// ---------------- update (EDIT) ----------------
async function updateLog() {
  const id = normalize((document.getElementById('editLogId') as HTMLInputElement).value)
  if (!id) return

  // AREA/LOCATION/POINT -> 保存用生成
  const area = (document.getElementById('editAreaSelect') as HTMLSelectElement).value
  if (!area) { showToast('エリアを選択してな', true); return }

  let finalLoc = ''
  if (area === 'その他エリア') {
    const customArea = normalize((document.getElementById('editCustomAreaInput') as HTMLInputElement).value)
    const customLoc = normalize((document.getElementById('editCustomLocationInput') as HTMLInputElement).value)
    if (!customArea) { showToast('エリア名を入力してな', true); return }
    finalLoc = customArea
    if (customLoc) finalLoc += ` (${customLoc})`
  } else {
    const loc = (document.getElementById('editLocationSelect') as HTMLSelectElement).value
    if (!loc) { showToast('釣り場（LOCATION）を選択してな', true); return }
    const pt = (document.getElementById('editPointSelect') as HTMLSelectElement).value
    finalLoc = loc
    if (pt) finalLoc += ` (${pt})`
  }

  // STYLE（その他対応）
  let methodVal = (document.getElementById('editMethod') as HTMLSelectElement).value
  if (methodVal === 'その他') methodVal = normalize((document.getElementById('editCustomMethodInput') as HTMLInputElement).value) || 'その他'

  // BAIT（その他対応）
  let baitVal = (document.getElementById('editBait') as HTMLSelectElement).value
  if (baitVal === 'その他') baitVal = normalize((document.getElementById('editCustomBaitInput') as HTMLInputElement).value) || 'その他'

  // DATE/TIME
  const ymd = normalize((document.getElementById('editDate') as HTMLInputElement).value)
  const startTime = normalizeHM((document.getElementById('editStartTime') as HTMLInputElement).value)
  const endTime = normalizeHM((document.getElementById('editEndTime') as HTMLInputElement).value)
  if (!ymd) { showToast('DATEが空やで', true); return }
  const dateText = buildDateText(ymd, startTime)

  // 数値
  const count = parseInt((document.getElementById('editCount') as HTMLSelectElement).value) || 0
  const toshi = parseInt((document.getElementById('editToshinashi') as HTMLSelectElement).value) || 0
  const s45 = parseInt((document.getElementById('editSize45') as HTMLSelectElement).value) || 0
  const s40 = parseInt((document.getElementById('editSize40') as HTMLSelectElement).value) || 0
  if (toshi + s45 + s40 > count) { showToast("サイズ内訳がトータルを超えています", true); return }

  // CONDITION（その他対応）
  let weatherVal = (document.getElementById('editWeatherSelect') as HTMLSelectElement).value
  if (weatherVal === 'その他') weatherVal = normalize((document.getElementById('editCustomWeather') as HTMLInputElement).value)

  let windVal = (document.getElementById('editWindSelect') as HTMLSelectElement).value
  if (windVal === 'その他') windVal = normalize((document.getElementById('editCustomWind') as HTMLInputElement).value)

  const tideVal = (document.getElementById('editTideSelect') as HTMLSelectElement).value

  // BAIT BREAKDOWN（EDIT）
  const isBaitDetailOn = (document.getElementById('editBaitDetailSwitch') as HTMLInputElement).checked
  let baitDetails: { [key: string]: number } | null = null

  if (isBaitDetailOn) {
    baitDetails = {}
    let subSum = 0
    for (let i = 1; i <= 3; i++) {
      const bSub = (document.getElementById(`editBaitSub${i}`) as HTMLSelectElement).value
      const bCnt = parseInt((document.getElementById(`editBaitCount${i}`) as HTMLSelectElement).value) || 0
      if (bSub && bCnt > 0) {
        baitDetails[bSub] = (baitDetails[bSub] || 0) + bCnt
        subSum += bCnt
      }
    }
    const mainCount = count - subSum
    if (mainCount < 0) { showToast("エサ内訳がトータルを超えています", true); return }
    if (mainCount > 0) {
      baitDetails[baitVal] = (baitDetails[baitVal] || 0) + mainCount
    }
  }

  const updates: any = {
    date: dateText,
    start_time: startTime || null,
    end_time: endTime || null,

    area: area,
    location: finalLoc,

    method: methodVal,
    bait: baitVal,
    bait_details: baitDetails,

    count: count,
    toshinashi: toshi,
    size_45: s45,
    size_40: s40,

    memo: (document.getElementById('editMemo') as HTMLTextAreaElement).value,

    weather: weatherVal || "",
    tide: tideVal || "",
    wind: windVal || ""
  }

  const { error } = await supabase.from('logs').update(updates).eq('id', id)
  if (error) showToast("更新エラー: " + error.message, true)
  else {
    closeEditModal()
    showToast("UPDATED!", false)
    loadData()
  }
}

// ---------------- delete ----------------
async function executeDeleteLog() {
  if (!deleteTargetId) return
  const { error } = await supabase.from('logs').delete().eq('id', deleteTargetId)
  if (error) showToast("削除エラー: " + error.message, true)
  else { closeConfirmModal(); showToast("DELETED", false); loadData() }
}

async function executeDeleteAll() {
  if (!currentUser) return
  document.getElementById('deleteAllModal')!.classList.add('hidden')
  const { error } = await supabase.from('logs').delete().eq('auth_user_id', currentUser.id)
  if (error) showToast("削除エラー: " + error.message, true)
  else { showToast("ALL DATA DELETED", false); loadData() }
}

// ---------------- export ----------------
function exportCSV() {
  if (filteredLogs.length === 0) { showToast("データがないで", true); return }
  let csvContent = "data:text/csv;charset=utf-8,"
  csvContent += "Date,StartTime,EndTime,Area,Location,Method,Bait,Count,Toshinashi,Size45,Size40,Weather,Tide,Wind,Memo\n"
  filteredLogs.forEach(log => {
    const row = [
      log.date || "",
      log.start_time || "",
      log.end_time || "",
      log.area || "",
      `"${(log.location || '').replace(/"/g, '""')}"`,
      log.method || "",
      log.bait || "",
      log.count ?? 0,
      log.toshinashi ?? 0,
      log.size_45 ?? 0,
      log.size_40 ?? 0,
      log.weather || "",
      log.tide || "",
      log.wind || "",
      `"${(log.memo || '').replace(/"/g, '""')}"`
    ].join(",")
    csvContent += row + "\n"
  })

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `kurodai_log.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ---------------- toast ----------------
function showToast(message: string, isError: boolean = false) {
  const toast = document.getElementById('toast') as HTMLElement
  toast.innerText = message
  toast.className = 'toast show'
  if (isError) toast.classList.add('error')
  setTimeout(() => { toast.className = 'toast' }, 3000)
}

// ---------------- エリア管理機能 ----------------
type FishingArea = {
  id: string
  user_id: string | null
  area_name: string
  location_name: string
  point_name: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

// エリア一覧を読み込み
async function loadAreas() {
  if (!currentUser) {
    showToast("ログインしてください", true)
    return
  }

  const container = document.getElementById('areaListContainer')
  if (!container) return

  container.innerHTML = '<p style="color:#888; font-size:0.9rem;">読み込み中...</p>'

  try {
    // 初期データ + ユーザーのデータを取得
    const { data, error } = await supabase
      .from('fishing_areas')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${currentUser.id}`)
      .order('area_name', { ascending: true })
      .order('location_name', { ascending: true })
      .order('point_name', { ascending: true, nullsFirst: false })

    if (error) throw error

    if (!data || data.length === 0) {
      container.innerHTML = '<p style="color:#888; font-size:0.9rem;">登録されているエリアがありません</p>'
      return
    }

    // エリアごとにグループ化
    const grouped: { [area: string]: FishingArea[] } = {}
    data.forEach((row: FishingArea) => {
      if (!grouped[row.area_name]) grouped[row.area_name] = []
      grouped[row.area_name].push(row)
    })

    // HTML生成
    let html = ''
    for (const areaName in grouped) {
      html += `<div class="area-group" style="margin-bottom:20px; padding:10px; border:1px solid #333; border-radius:4px;">`
      html += `<h4 style="color:#fff; margin-bottom:10px;">${areaName}</h4>`

      // 場所ごとにグループ化
      const locations: { [loc: string]: FishingArea[] } = {}
      grouped[areaName].forEach(row => {
        if (!locations[row.location_name]) locations[row.location_name] = []
        locations[row.location_name].push(row)
      })

      for (const locationName in locations) {
        html += `<div style="margin-left:15px; margin-bottom:10px;">`
        html += `<strong style="color:#aaa;">📍 ${locationName}</strong>`

        const points = locations[locationName]
        if (points.length > 0 && points[0].point_name) {
          html += `<ul style="margin:5px 0 0 20px; list-style:none; padding:0;">`
          points.forEach(point => {
            if (point.point_name) {
              const canDelete = !point.is_default
              html += `<li style="color:#888; font-size:0.9rem; margin:3px 0;">`
              html += `• ${point.point_name}`
              if (canDelete) {
                html += ` <button class="delete-area-btn" data-id="${point.id}" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:0.8rem; margin-left:8px;" title="削除"><i class="fas fa-trash"></i></button>`
              }
              html += `</li>`
            }
          })
          html += `</ul>`
        } else {
          // ポイントなしの場合
          const canDelete = !points[0].is_default
          if (canDelete) {
            html += ` <button class="delete-area-btn" data-id="${points[0].id}" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:0.8rem; margin-left:8px;" title="削除"><i class="fas fa-trash"></i></button>`
          }
        }

        html += `</div>`
      }

      html += `</div>`
    }

    container.innerHTML = html

    // 削除ボタンのイベント
    document.querySelectorAll('.delete-area-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault()
        const id = (btn as HTMLElement).getAttribute('data-id')
        if (id && confirm('このエリアを削除しますか？')) {
          await deleteArea(id)
        }
      })
    })

  } catch (error) {
    console.error('Error loading areas:', error)
    container.innerHTML = '<p style="color:#ff4444; font-size:0.9rem;">エリアの読み込みに失敗しました</p>'
    showToast('エリアの読み込みに失敗しました', true)
  }
}

// エリア追加ボタンのイベント
document.getElementById('addAreaBtn')?.addEventListener('click', async (e) => {
  e.preventDefault()
  await addArea()
})

// エリアを追加
async function addArea() {
  if (!currentUser) {
    showToast("ログインしてください", true)
    return
  }

  const areaName = normalize((document.getElementById('newAreaName') as HTMLInputElement).value)
  const locationName = normalize((document.getElementById('newLocationName') as HTMLInputElement).value)
  const pointName = normalize((document.getElementById('newPointName') as HTMLInputElement).value) || null

  if (!areaName) {
    showToast("エリア名を入力してください", true)
    return
  }

  if (!locationName) {
    showToast("場所名を入力してください", true)
    return
  }

  try {
    const { error } = await supabase
      .from('fishing_areas')
      .insert({
        user_id: currentUser.id,
        area_name: areaName,
        location_name: locationName,
        point_name: pointName,
        is_default: false
      })

    if (error) throw error

    showToast('エリアを追加しました')

    // フォームをクリア
    ;(document.getElementById('newAreaName') as HTMLInputElement).value = ''
    ;(document.getElementById('newLocationName') as HTMLInputElement).value = ''
    ;(document.getElementById('newPointName') as HTMLInputElement).value = ''

    // 一覧を再読み込み
    await loadAreas()
    
    // 釣果記録画面のドロップダウンも更新
    await initLayer1()
    initEditLayer1()
    initFilterLayer1()

  } catch (error) {
    console.error('Error adding area:', error)
    showToast('エリアの追加に失敗しました', true)
  }
}

// エリアを削除
async function deleteArea(id: string) {
  if (!currentUser) {
    showToast("ログインしてください", true)
    return
  }

  try {
    const { error } = await supabase
      .from('fishing_areas')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id)

    if (error) throw error

    showToast('エリアを削除しました')
    await loadAreas()
    
    // 釣果記録画面のドロップダウンも更新
    await initLayer1()
    initEditLayer1()
    initFilterLayer1()

  } catch (error) {
    console.error('Error deleting area:', error)
    showToast('エリアの削除に失敗しました', true)
  }
}
