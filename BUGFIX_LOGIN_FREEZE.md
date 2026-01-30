# 🐛 バグ修正：ログイン画面フリーズ問題

## 📋 問題の概要

### **症状**
- アプリを開くと「GUEST」状態で表示される
- 「AREA」が「LOADING...」のまま固まる
- ログイン画面が表示されない
- ボタンやフォームがクリック・入力できない（フリーズ状態）

### **根本原因**

**アプリの初期化順序の問題**:

```typescript
// ❌ 修正前：ログイン確認の前にアプリを初期化していた
await initLayer1()          // ← Supabaseからデータ取得を試みる
initEditLayer1()
initFilterLayer1()
initCountSelects()
initBaitSubSelects()

// セッション確認（遅すぎる）
const { data: { session } } = await supabase.auth.getSession()
if (session) handleLoginSuccess(session.user, '')
else document.getElementById('authContainer')!.classList.remove('hidden')
```

**問題点**:
1. `initLayer1()` が `loadFishingData()` を呼び出す
2. `loadFishingData()` が `currentUser` をチェック
3. `currentUser` が null（まだログイン確認してない）
4. でも Supabase への問い合わせが始まる
5. RLS ポリシーで拒否される
6. 「LOADING...」のまま固まる
7. しかもログイン画面も表示されない（初期化が完了してないため）

---

## ✅ 修正内容

### **修正後の初期化順序**:

```typescript
// ✅ 修正後：セッション確認を最初に実行
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  // ログイン済み：アプリを初期化
  handleLoginSuccess(session.user, '')
  await initLayer1()
  initEditLayer1()
  initFilterLayer1()
  initCountSelects()
  initBaitSubSelects()
} else {
  // 未ログイン：ログイン画面を表示、アプリ初期化はスキップ
  document.getElementById('authContainer')!.classList.remove('hidden')
}
```

### **変更のポイント**:

1. **セッション確認を最優先**
   - アプリ初期化の前に認証状態をチェック

2. **条件分岐で初期化を制御**
   - ログイン済み → アプリを初期化
   - 未ログイン → ログイン画面のみ表示

3. **GUEST状態でのデータアクセスを防止**
   - `currentUser` が null のときは Supabase にアクセスしない

---

## 🎯 効果

### **修正前**:
```
ページ読み込み
  ↓
アプリ初期化開始（GUEST状態）
  ↓
initLayer1() 実行
  ↓
loadFishingData() 実行
  ↓
Supabase へアクセス試行（currentUser = null）
  ↓
RLS ポリシーで拒否
  ↓
「LOADING...」で固まる ❌
  ↓
ログイン画面も表示されない ❌
```

### **修正後**:
```
ページ読み込み
  ↓
セッション確認
  ↓
┌─────────────┬─────────────┐
│ ログイン済み │ 未ログイン   │
├─────────────┼─────────────┤
│ アプリ初期化 │ ログイン画面 │
│ データ取得  │ 表示のみ     │
│ ✅ 動作OK   │ ✅ 動作OK   │
└─────────────┴─────────────┘
```

---

## 🔧 追加の改善

### **強制ログアウトボタンの追加**

画面右上に赤い電源ボタン（🔴 ⚡）を追加：

```typescript
document.getElementById('forceLogoutBtn')?.addEventListener('click', async (e) => { 
  e.preventDefault()
  await supabase.auth.signOut()
  localStorage.clear()
  window.location.reload()
})
```

**用途**:
- セッションが中途半端な状態で残っている場合の強制リセット
- ログアウトボタンが見えないときの緊急脱出

---

## 📝 変更されたファイル

### **src/main.ts**

#### **変更1: 初期化順序の変更**
- **行番号**: 208-239
- **内容**: セッション確認を最初に移動、条件分岐で初期化を制御

#### **変更2: handleLoginSuccess の更新**
- **行番号**: 825-851
- **内容**: ログイン成功時に全ての初期化を実行

#### **変更3: 強制ログアウトボタンの追加**
- **行番号**: 245-250
- **内容**: forceLogoutBtn のイベントリスナーを追加

### **index.html**

#### **変更: 強制ログアウトボタンのHTML追加**
- **行番号**: 100-116
- **内容**: 赤い電源ボタンを追加

---

## 🧪 テスト方法

### **テスト1: 未ログイン状態**

1. ブラウザのシークレットモードで開く
2. アプリのURLにアクセス
3. **期待結果**:
   - ✅ ログイン画面が表示される
   - ✅ 「LOADING...」が表示されない
   - ✅ フリーズしない

### **テスト2: ログイン**

1. メールアドレスとパスワードを入力
2. LOGINボタンをクリック
3. **期待結果**:
   - ✅ ログイン成功
   - ✅ アプリ画面が表示される
   - ✅ エリアドロップダウンが正常に動作する
   - ✅ 「LOADING...」が表示されない

### **テスト3: 強制ログアウト**

1. アプリを開く
2. 画面右上の赤いボタンをクリック
3. **期待結果**:
   - ✅ ページがリロードされる
   - ✅ ログイン画面が表示される

---

## 🚀 デプロイ

### **コミット情報**:

```
commit e40e653
Author: AI Assistant
Date: 2026-01-30

fix: Prevent app initialization when not logged in

- Move session check BEFORE initLayer1() to avoid LOADING freeze
- Skip app initialization (dropdowns, data loading) when GUEST
- Only initialize app after successful login
- This fixes the frozen LOADING screen for unauthenticated users
- Users must log in before the app becomes interactive
```

### **デプロイURL**:
- **練習用**: https://record-fishing-practice.pages.dev
- **本番**: https://record-fishing.pages.dev（未反映）

---

## 📚 関連ドキュメント

- [AREA_MANAGEMENT_GUIDE.md](./AREA_MANAGEMENT_GUIDE.md) - エリア管理機能ガイド
- [README.md](./README.md) - プロジェクト概要
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - セットアップガイド

---

## 🎉 結論

**根本原因**: アプリ初期化がログイン確認より先に実行されていた

**解決策**: セッション確認を最優先に移動、条件分岐で初期化を制御

**効果**: 
- ✅ GUEST状態でのフリーズを防止
- ✅ ログイン画面が正しく表示される
- ✅ ログイン後は正常に動作する

---

**修正完了！** 🎊
