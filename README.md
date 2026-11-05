# 香港官方經濟指標儀表板

以香港官方統計、政策部門與監管機構資料來源建立的靜態儀表板，透過 GitHub Actions 定時抓取並部署到 GitHub Pages。

## 技術組成

- `Vite + React + TypeScript`
- `Node.js` 抓取與轉換官方資料
- `zod` 驗證輸出 schema
- `GitHub Actions` 每日兩次更新

## 本地開發

```bash
npm install
npm run generate:data
npm run dev
```

## 建置

```bash
npm run generate:data
npm run build
```

## 輸出檔案

- `public/data/dashboard.json`
- `public/data/manifest.json`
- `public/data/history/<card-id>.json`

## 注意事項

- 前端不直接呼叫官方 API；所有資料都在建置階段先整理成 JSON。
- 若單一來源失敗，腳本會優先保留上一版資料，並把該指標標記為 `更新失敗`。
- 目前庫務署季度帳目與部分 C&SD 表格 parser 採用欄位與文字特徵辨識，首次實際連網執行後應再根據真實欄位名微調。

## 圖表範圍與資料核對

每張圖表可切換近 1、3、5、7 年。一年按月顯示，多年取每年最後可用一期；原始期別仍在提示欄顯示，不會把季度／月度數字當成全年總數。資料不足時只顯示現有觀測。

```bash
npm run generate:data
npm test
npm run build
```

歷史快照測試固定使用 `tests/fixtures/march-2026`；即時資料的期別、單位、來源、歷史及指標清單由 invariant tests 驗證。每日部署前會還原上次已發佈資料作來源失敗時的備援，並執行完整測試。

詳見 [2026-11-06 資料核對報告](docs/data-audit-2026-11-06.md)。
