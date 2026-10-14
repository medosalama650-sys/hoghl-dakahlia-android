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
assert(html.includes("مشاركة الجهة") && html.includes("navigator.share") && html.includes("clipboard.writeText(text)"), "company directory supports native sharing and clipboard fallback");
assert(html.includes("function savedSearchMatches(job,filters)") && html.includes("notifySavedSearchMatches(job)") && html.includes("saved-search-alert") && html.includes("alertEnabled"), "saved searches support opt-in matching job notifications");
assert(html.includes("sendPasswordResetEmail") || employer.includes("sendPasswordResetEmail"), "password reset flow remains in the app");
assert(html.includes('collection(db,"jobs")'), "main page remains connected to Firestore jobs");
assert(html.includes("visibleJobLimit=20") && html.includes("filtered.slice(0,visibleJobLimit)"), "job list renders in incremental batches");
assert(employer.includes("onAuthStateChanged") && employer.includes("createUserWithEmailAndPassword"), "employer authentication remains available");
assert(rules.includes("function isAdmin()") && rules.includes("validAdminJobUpdate()"), "Firestore rules retain explicit admin checks");
assert(!html.includes("delete jobPayload.ownerUid"), "permission errors cannot silently strip job ownership");
assert(/shoghl-dakahlia-shell-v\d+/.test(sw), "service-worker cache has a versioned app shell");

const moduleMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/i);
assert(Boolean(moduleMatch), "main Firebase module script exists");
function checkModuleSyntax(source, label) {
  if (!source) return;
  const temp = join(tmpdir(), `shoghl-${label}-${process.pid}.mjs`);
  try {
    writeFileSync(temp, source, "utf8");
    execFileSync(process.execPath, ["--check", temp], { stdio: "pipe" });
    console.log(`PASS: ${label} Firebase module has valid JavaScript syntax`);
  } catch (error) {
    console.error(`FAIL: ${label} Firebase module has invalid JavaScript syntax`);
    if (error.stderr) console.error(String(error.stderr));
    process.exitCode = 1;
  } finally {
    try { unlinkSync(temp); } catch {}
  }
}

checkModuleSyntax(moduleMatch?.[1], "main");

const employerModuleMatch = employer.match(/<script type="module">([\s\S]*?)<\/script>/i);
assert(Boolean(employerModuleMatch), "employer dashboard Firebase module exists");
checkModuleSyntax(employerModuleMatch?.[1], "employer");
assert(employer.includes("sendPasswordResetEmail") && employer.includes('id="resetBtn"'), "employer password reset button is wired to Firebase Auth");
assert(employer.includes('where("ownerUid","==",user.uid)'), "employer dashboard scopes job queries to the signed-in owner");
assert(employer.includes('where("ownerUid","==",user.uid)') && rules.includes("resource.data.ownerUid == request.auth.uid"), "owner-only job access is represented in the dashboard and Firestore rules");
assert(employer.includes("function renderSummary()") && employer.includes("job.views") && employer.includes("job.applyClicks"), "employer dashboard displays per-job and account-level analytics");
assert(employer.includes("function jobAdvice(job)") && employer.includes("راجع تفاصيل الإعلان") && employer.includes("يُفضّل مراجعة الإعلان"), "employer dashboard provides age- and engagement-based ad review hints");
assert(employer.includes('id="myJobSearch"') && employer.includes('id="myJobStatus"') && employer.includes("visibleJobs.forEach(job=>{"), "employer dashboard supports searching and filtering owned jobs by status");

if (process.exitCode) process.exit(process.exitCode);
