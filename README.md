# AI Avatar Deployment Kit

提供學員 AI 分身專案共用的 GitHub Actions、Render Blueprint 與安全安裝工具。

這個 Repository 只保存部署設定，不保存任何學生的 Web、Core API、Voice Agent 程式碼，也不保存 API Key、密碼或 Token。

## 老師維護方式

老師在這個 Repository 維護 Reusable Workflows，並以不可變的 Commit SHA 讓學生專案呼叫。更新共用流程時發布新版本，不移動既有版本的 Tag。

## 學生安裝方式

學生保留自己的程式碼，另外 Clone 本 Kit 到相鄰資料夾，再執行安裝器：

```bash
git clone --depth 1 --branch v1.0.3 https://github.com/simon5168s5/ai-avatar-deployment-kit.git
./ai-avatar-deployment-kit/install.sh /學生專案的完整路徑
```

安裝器只加入以下檔案：

- `.github/workflows/verify.yml`
- `.github/workflows/initialize-livekit.yml`
- `.github/workflows/deploy-livekit.yml`
- `render.yaml`
- `apps/voice-agent/Dockerfile`
- `apps/voice-agent/.dockerignore`

若任一檔案已存在且內容不同，安裝器會在寫入前停止，不覆蓋任何學生檔案。學生自己的 `supabase/migrations` 不會被 Kit 修改。

## 學生專案部署契約

目前 `v1.0.3` 適用於以下結構：

```text
apps/web
apps/api
apps/voice-agent
supabase/config.toml
supabase/migrations/*.sql
package.json
pnpm-lock.yaml
```

根目錄必須提供 `pnpm verify`，Voice Agent 必須提供 `requirements.lock`、`pyproject.toml` 與 `tests/`。

學生 Render Blueprint 預設使用以下語音流量保護值：

- `VOICE_GLOBAL_CONCURRENCY_LIMIT=5`：整個專案最多同時五通正式語音。
- `VOICE_SETUP_RATE_LIMIT=5`：整個專案每分鐘最多建立五個語音房間。
- `VOICE_PREVIEW_RATE_LIMIT=5`：同一使用者的聲音試聽請求限制為五次。

這些值不是 LiveKit 免費方案本身的額度，而是 Core API 的應用層保護設定；學生若要調整，必須同步檢查自己的 Core API 與 Supabase Migration。

## 第一次平台設定

1. Supabase 建立 Free Project，連接學生自己的 GitHub Repository。
2. LiveKit Cloud 建立 Project，將學生自己的憑證加入 GitHub Repository Secrets。
3. Render 以學生 Repository 根目錄的 `render.yaml` 建立 Blueprint。
4. 在 GitHub 設定 `DEPLOYMENT_ENABLED=true` 前，LiveKit 正式部署會安全略過。
5. 手動執行「初始化 LiveKit Production Agent」一次，合併它產生的 `livekit.toml` Pull Request。
6. 完成 Web、Core、Supabase 與 LiveKit 驗收後，才啟用正式部署。

## GitHub Repository Secrets

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_AGENT_SECRET_LIST`

只保存名稱，不得將任何實際值提交到 GitHub。
