# DEV LOG

## 2026-08-22 — Session 02：補齊學生 Render 語音流量設定

### 改動摘要
將學生安裝範本的正式語音同時通話、語音建立與聲音試聽限制統一設為五，並新增自動測試避免未來版本遺漏。

### 詳細改動
**Render Blueprint：**
- 新增 `VOICE_GLOBAL_CONCURRENCY_LIMIT=5`。
- 新增 `VOICE_SETUP_RATE_LIMIT=5`。
- 保留既有 `VOICE_PREVIEW_RATE_LIMIT=5`。

**部署契約與測試：**
- 自動測試同時驗證三個限制值。
- README 說明三個設定的用途與適用範圍。
- Deployment Kit 版本更新為 `v1.0.3`。

**修改檔案：**
- `student-template/render.yaml` — 補齊兩個語音流量環境變數。
- `tests/deployment-kit.test.mjs` — 驗證三個語音限制均為五。
- `README.md` — 更新版本與學生部署契約。
- `package.json`、`VERSION` — 更新版本為 `1.0.3`。
- `DEV_LOG.md` — 記錄本次變更。

**部署：** 尚未部署；Deployment Kit 不會直接修改既有學生專案或正式平台。

---

**已解決：**
- 新安裝學生不會因 Render 範本缺少環境變數而回到單通或不一致的應用層限制。

**尚未解決：**
- 已安裝舊版 Kit 的學生仍需在自己的專案與 Render 環境個別更新。

**待執行：**
- [ ] Merge 後建立 `v1.0.3` Release Tag。
- [ ] 用一個乾淨學生測試專案驗證 `v1.0.3` 安裝流程。

## 2026-08-21 — Session 01：建立 Deployment Kit 共用工作流程

### 改動摘要
建立學員專案可跨 Repository 呼叫的測試與 LiveKit Cloud Reusable Workflows。所有第三方 Actions 固定完整 Commit SHA，Secrets 只由學生自己的 Repository 執行期間傳入。

### 詳細改動
**共用工作流程：**
- TypeScript／Web 與 Python Voice Agent 驗證。
- LiveKit Production Agent 首次建立與後續部署。
- 首次建立只產生學生專屬 `livekit.toml` 分支，不直接修改 `main`。

**部署：** 尚未部署。

---

**已解決：**
- 建立 Deployment Kit 核心 Reusable Workflows。
- 修正 GitHub Runner 將 YAML 驗證指令內 `#` 誤判為註解而截斷的問題。
- `main` 更新時也會執行驗證，讓 Render 的 `checksPass` Auto-Deploy 有真實 CI 結果可等待。
- `VOICE_INTERNAL_TOKEN` 改由學生產生一次並同時填入 Render 與 LiveKit Secret List，避免兩端取得不同值。

**尚未解決：**
- 學員安裝包、Render Blueprint、測試與正式 `v1.0.0` Tag 尚未完成。

**待執行：**
- [x] 建立安全安裝器與學員範本。
- [x] 完成 Kit 自動測試。
- [ ] 以主專案進行第一次試裝。
