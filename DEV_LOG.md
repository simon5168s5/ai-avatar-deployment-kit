# DEV LOG

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

**尚未解決：**
- 學員安裝包、Render Blueprint、測試與正式 `v1.0.0` Tag 尚未完成。

**待執行：**
- [ ] 建立安全安裝器與學員範本。
- [ ] 完成 Kit 自動測試。
- [ ] 以主專案進行第一次試裝。
