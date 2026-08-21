#!/usr/bin/env bash

set -euo pipefail

kit_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
template_root="$kit_root/student-template"
target_input="${1:-$PWD}"

if ! target_root="$(git -C "$target_input" rev-parse --show-toplevel 2>/dev/null)"; then
  echo "錯誤：目標必須是已初始化的 Git Repository。" >&2
  exit 1
fi

target_root="$(cd "$target_root" && pwd -P)"
requested_root="$(cd "$target_input" && pwd -P)"
if [[ "$target_root" != "$requested_root" ]]; then
  echo "錯誤：請指定學生專案的 Git Repository 根目錄。" >&2
  exit 1
fi

required_paths=(
  package.json
  pnpm-lock.yaml
  apps/api/package.json
  apps/web/package.json
  apps/voice-agent/pyproject.toml
  apps/voice-agent/requirements.lock
  supabase/config.toml
)

for relative_path in "${required_paths[@]}"; do
  if [[ ! -f "$target_root/$relative_path" ]]; then
    echo "錯誤：找不到部署契約檔案 $relative_path。" >&2
    exit 1
  fi
done

if ! compgen -G "$target_root/supabase/migrations/*.sql" > /dev/null; then
  echo "錯誤：supabase/migrations 內至少需要一個 Migration SQL。" >&2
  exit 1
fi

manifest=(
  .github/workflows/verify.yml
  .github/workflows/initialize-livekit.yml
  .github/workflows/deploy-livekit.yml
  render.yaml
  apps/voice-agent/Dockerfile
  apps/voice-agent/.dockerignore
)

conflicts=()
for relative_path in "${manifest[@]}"; do
  source_path="$template_root/$relative_path"
  target_path="$target_root/$relative_path"
  if [[ -e "$target_path" ]] && ! cmp --silent "$source_path" "$target_path"; then
    conflicts+=("$relative_path")
  fi
done

if (( ${#conflicts[@]} > 0 )); then
  echo "停止安裝：下列檔案已存在且內容不同，未修改任何檔案：" >&2
  printf '  - %s\n' "${conflicts[@]}" >&2
  exit 2
fi

installed=0
for relative_path in "${manifest[@]}"; do
  source_path="$template_root/$relative_path"
  target_path="$target_root/$relative_path"
  if [[ ! -e "$target_path" ]]; then
    mkdir -p "$(dirname "$target_path")"
    cp "$source_path" "$target_path"
    echo "已加入：$relative_path"
    installed=$((installed + 1))
  fi
done

if (( installed == 0 )); then
  echo "Deployment Kit 已是最新版本，沒有需要加入的檔案。"
else
  echo "Deployment Kit 安裝完成；請先檢查 git diff，再 Commit 到功能分支。"
fi
