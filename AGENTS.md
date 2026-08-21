# Deployment Kit 維護規則

- 不得在 Repository 內保存 API Key、密碼、Token、Service Role 或 `.env`。
- 安裝器不得覆蓋學生既有檔案；遇到衝突必須在寫入前停止。
- 共用 Workflow 必須固定第三方 Action 的完整 Commit SHA。
- Pull Request 只執行驗證，不部署。
- 正式部署必須有 `DEPLOYMENT_ENABLED=true` 明確開關。
- Reusable Workflow 的 Secret 必須由呼叫端逐一傳入，不使用跨帳號的隱式繼承。
- 修改部署契約時必須同步更新測試、README 與 DEV_LOG.md。
