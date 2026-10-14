import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const read = (p) => readFileSync(join(root, p), "utf8");
const html = read("index.html");
const employer = read("employer.html");
const sw = read("sw.js");
const rules = read("firestore.rules");

const assert = (condition, message) => {
  if (!condition) {
    console.error("FAIL:", message);
    process.exitCode = 1;
  } else {
    console.log("PASS:", message);
  }
};

assert(html.includes('lang="ar" dir="rtl"'), "main page keeps Arabic RTL layout");
assert(html.includes('https://wa.me/'), "WhatsApp application links remain available");
assert(html.includes("sendPasswordResetEmail") || employer.includes("sendPasswordResetEmail"), "password reset flow remains in the app");
assert(html.includes('collection(db,"jobs")'), "main page remains connected to Firestore jobs");
assert(html.includes("visibleJobLimit=20") && html.includes("filtered.slice(0,visibleJobLimit)"), "job list renders in incremental batches");
assert(employer.includes("onAuthStateChanged") && employer.includes("createUserWithEmailAndPassword"), "employer authentication remains available");
assert(rules.includes("function isAdmin()") && rules.includes("validAdminJobUpdate()"), "Firestore rules retain explicit admin checks");
assert(!html.includes("delete jobPayload.ownerUid"), "permission errors cannot silently strip job ownership");
assert(/shoghl-dakahlia-shell-v\d+/.test(sw), "service-worker cache has a versioned app shell");

const moduleMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/i);
assert(Boolean(moduleMatch), "main Firebase module script exists");
if (moduleMatch) {
  const temp = join(tmpdir(), `shoghl-module-${process.pid}.mjs`);
  try {
    writeFileSync(temp, moduleMatch[1], "utf8");
    execFileSync(process.execPath, ["--check", temp], { stdio: "pipe" });
    console.log("PASS: main Firebase module has valid JavaScript syntax");
  } catch (error) {
    console.error("FAIL: main Firebase module has invalid JavaScript syntax");
    if (error.stderr) console.error(String(error.stderr));
    process.exitCode = 1;
  } finally {
    try { unlinkSync(temp); } catch {}
  }
}

if (process.exitCode) process.exit(process.exitCode);
