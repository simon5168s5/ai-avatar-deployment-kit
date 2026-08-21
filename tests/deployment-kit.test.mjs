import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workflowSha = "d7cc155ae472df3fdd3cd73f6095d2edf04183ef";
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

async function createStudentProject() {
  const project = await mkdtemp(path.join(os.tmpdir(), "avatar-kit-test-"));
  for (const relativePath of [
    "package.json",
    "pnpm-lock.yaml",
    "apps/api/package.json",
    "apps/web/package.json",
    "apps/voice-agent/pyproject.toml",
    "apps/voice-agent/requirements.lock",
    "supabase/config.toml",
    "supabase/migrations/20260821000000_initial.sql",
  ]) {
    const destination = path.join(project, relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, "fixture\n");
  }
  execFileSync("git", ["init", "--quiet", project]);
  return project;
}

test("student workflows call an immutable Deployment Kit commit", async () => {
  const workflows = await Promise.all([
    read("student-template/.github/workflows/verify.yml"),
    read("student-template/.github/workflows/initialize-livekit.yml"),
    read("student-template/.github/workflows/deploy-livekit.yml"),
  ]);

  for (const workflow of workflows) {
    assert.match(workflow, new RegExp(`ai-avatar-deployment-kit/.github/workflows/.+@${workflowSha}`));
    assert.doesNotMatch(workflow, /@(?:main|master|v1)\b/);
  }
  assert.match(workflows[2], /DEPLOYMENT_ENABLED == 'true'/);
});

test("all third-party actions are pinned to full commit SHAs", async () => {
  const workflows = await Promise.all([
    read(".github/workflows/kit-ci.yml"),
    read(".github/workflows/reusable-verify.yml"),
    read(".github/workflows/reusable-livekit-create.yml"),
    read(".github/workflows/reusable-livekit-deploy.yml"),
  ]);

  for (const workflow of workflows) {
    const actionReferences = workflow.matchAll(/uses:\s+([^\s]+)\/([^\s]+)@([^\s#]+)/g);
    for (const [, owner, repository, reference] of actionReferences) {
      assert.match(reference, /^[a-f0-9]{40}$/, `${owner}/${repository} 沒有固定完整 SHA`);
    }
  }
});

test("Render Blueprint keeps secrets out of source and waits for CI checks", async () => {
  const blueprint = await read("student-template/render.yaml");

  assert.match(blueprint, /plan: free/);
  assert.match(blueprint, /autoDeployTrigger: checksPass/g);
  assert.match(blueprint, /API_HOST\n\s+value: 0\.0\.0\.0/);
  assert.match(blueprint, /SUPABASE_SECRET_KEY\n\s+sync: false/);
  assert.match(blueprint, /LIVEKIT_API_SECRET\n\s+sync: false/);
  assert.doesNotMatch(blueprint, /sb_secret_|sk-[A-Za-z0-9]/);
});

test("installer adds only deployment files and is idempotent", async () => {
  const project = await createStudentProject();
  const first = spawnSync("bash", [path.join(root, "install.sh"), project], {
    encoding: "utf8",
  });
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /安裝完成/);

  const expected = [
    ".github/workflows/verify.yml",
    ".github/workflows/initialize-livekit.yml",
    ".github/workflows/deploy-livekit.yml",
    "render.yaml",
    "apps/voice-agent/Dockerfile",
    "apps/voice-agent/.dockerignore",
  ];
  for (const relativePath of expected) {
    assert.equal(
      await readFile(path.join(project, relativePath), "utf8"),
      await readFile(path.join(root, "student-template", relativePath), "utf8"),
    );
  }

  const second = spawnSync("bash", [path.join(root, "install.sh"), project], {
    encoding: "utf8",
  });
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /已是最新版本/);
});

test("installer stops before writing when any target conflicts", async () => {
  const project = await createStudentProject();
  const conflictingWorkflow = path.join(project, ".github/workflows/verify.yml");
  await mkdir(path.dirname(conflictingWorkflow), { recursive: true });
  await writeFile(conflictingWorkflow, "student-owned workflow\n");

  const result = spawnSync("bash", [path.join(root, "install.sh"), project], {
    encoding: "utf8",
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /未修改任何檔案/);
  await assert.rejects(readFile(path.join(project, "render.yaml"), "utf8"));
  assert.equal(await readFile(conflictingWorkflow, "utf8"), "student-owned workflow\n");
});
