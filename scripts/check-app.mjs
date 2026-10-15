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
const robots = read("robots.txt");
const sitemap = read("sitemap.xml");
const manifest = read("manifest.json");

const assert = (condition, message) => {
  if (!condition) {
    console.error("FAIL:", message);
    process.exitCode = 1;
  } else {
    console.log("PASS:", message);
  }
};

assert(html.includes('lang="ar" dir="rtl"'), "main page keeps Arabic RTL layout");
assert(html.includes('id="shareCareerProfileBtn"') && html.includes("navigator.share") && html.includes('id="downloadCareerProfileBtn"') && html.includes("careerProfileText(profile=collectCareerProfile())"), "job seeker can share/copy their local career profile or download a plain-text backup");
assert(html.includes('family=Cairo:wght@400;500;600;700;800;900&display=swap') && html.includes("Visual refresh: clearer Arabic typography") && html.includes('font-family:"Cairo","Noto Sans Arabic","Segoe UI",Tahoma,Arial,sans-serif') && html.includes("linear-gradient(145deg,#0b2f28 0%,#123f35 58%,#1b5b49 100%)"), "site includes the refreshed Arabic typography, accessible input styling, and consistent visual theme");
assert(html.includes("job-card-head") && html.includes("job-salary-highlight") && html.includes("job-salary-value") && html.includes("💬 قدّم دلوقتي عبر واتساب") && html.includes("Job cards: make title, pay"), "job cards prioritize job title, salary, location/category metadata, and a prominent WhatsApp application action");
assert(html.includes('id="verifiedOnlyFilter"') && html.includes('verifiedOnly=$("verifiedOnlyFilter").checked') && html.includes("j.employerVerified!==true") && html.includes('verifiedOnly:$("verifiedOnlyFilter").checked'), "job seekers can filter verified employers and retain that preference in saved searches");
assert(html.includes('value="endingSoon">الأقرب انتهاءً') && html.includes("job-expiring-label") && html.includes("ينتهي خلال "), "job seekers can sort by expiry and see clear warnings for jobs ending within seven days");
assert(html.includes('id="advancedJobFilters"') && html.includes('class="search-box open" id="searchBox"') && html.includes('class="filters simple-filters"') && html.includes("Jobs page simplification: show the main search") && html.includes('const box=$("advancedJobFilters")'), "jobs page keeps search and common filters visible while collapsing advanced options behind one clear toggle");
assert(html.includes('id="cvCompletion"') && html.includes('id="cvCompletionBar"') && html.includes("function updateCVProgress()") && html.includes('aria-valuemax="8"'), "CV has an accessible live completion meter for eight key fields");
assert(html.includes('id="cvShareTextBtn"') && html.includes('id="cvDownloadTextBtn"') && html.includes("function getCVPlainText()") && html.includes("function copyCVText()"), "CV can be shared/copied or downloaded as a plain-text file locally");
assert(html.includes('id="careerProfileProgress"') && html.includes("function updateCareerProfileProgress()") && html.includes('aria-valuemax="6"') && html.includes('aria-valuenow'), "career profile displays an accessible live completion meter");
assert(html.includes('id="careerProfileForm"') && html.includes("function collectCareerProfile()") && html.includes("function persistCareerProfile(showSuccess=true)") && html.includes('addEventListener("change",()=>{updateCareerProfileProgress();persistCareerProfile(true)})') && html.includes('addEventListener("input",updateCareerProfileProgress)') && html.includes('localStorage.setItem("shoghlCareerProfile",JSON.stringify(profile))'), "career profile auto-saves changed fields locally while validating phone numbers");
assert(html.includes('id="hideAppliedBtn"') && html.includes("hideAppliedMode") && html.includes("hideAppliedMode&&appliedIds.has(j.id)"), "job seekers can hide jobs they have already marked as applied");
assert(html.includes('name="firebase-app-check-site-key" content=""') && html.includes("initializeAppCheck") && html.includes("ReCaptchaV3Provider") && html.includes("isTokenAutoRefreshEnabled:true"), "main page prepares optional Firebase App Check without enforcing it before a site key is configured");
assert(employer.includes('name="firebase-app-check-site-key" content=""') && employer.includes("initializeAppCheck") && employer.includes("ReCaptchaV3Provider") && employer.includes("isTokenAutoRefreshEnabled:true"), "employer portal prepares optional Firebase App Check without changing the existing sign-in flow");
assert(html.includes('"@type": "WebSite"') && html.includes('"publisher"') && html.includes('"areaServed"') && html.includes('"name": "الدقهلية، مصر"'), "SEO structured data identifies the site publisher and its local service area");
assert(html.includes('data-view="safety"') && html.includes('id="view-safety"'), "safety guidance page is available from the navigation");
assert(html.includes("متدفعش فلوس عشان تتوظف") && html.includes("كود OTP") && html.includes("بلّغ عن الإعلان المشبوه"), "safety guidance warns about job fees, verification codes, and suspicious listings");
assert(html.includes('https://wa.me/'), "WhatsApp application links remain available");
assert(html.includes("مشاركة الجهة") && html.includes("navigator.share") && html.includes("clipboard.writeText(text)"), "company directory supports native sharing and clipboard fallback");
assert(html.includes("function savedSearchMatches(job,filters)") && html.includes("notifySavedSearchMatches(job)") && html.includes("saved-search-alert") && html.includes("alertEnabled"), "saved searches support opt-in matching job notifications");
assert(html.includes('id="recentSearchesList"') && html.includes("function recordRecentSearch(filters)") && html.includes('localStorage.setItem("shoghlRecentSearches"') && html.includes('id="clearRecentSearches"'), "recent job search history is saved locally and can be restored or cleared");
assert(html.includes("function cacheSavedJobSnapshots(jobs)") && html.includes("انتهت صلاحية الإعلان في") && html.includes("الوظيفة لم تعد ضمن الإعلانات المنشورة حاليًا") && html.includes('show.disabled=unavailable||isExpired'), "saved jobs clearly identify expired or no-longer-published listings");
assert(html.includes('id="mobileBottomNav"') && html.includes('data-bottom-nav="saved"') && html.includes("function updateMobileSavedCount()") && html.includes('env(safe-area-inset-bottom,0px)'), "mobile quick navigation includes saved jobs and safe-area spacing");
assert(html.includes('id="view-my-applications"') && html.includes('data-view="my-applications"') && html.includes("function listenToApplicantApplications(user)") && html.includes('where("applicantUid","==",user.uid)'), "job seekers can view only their own submitted applications and statuses");
assert(html.includes('id="view-account"') && html.includes('id="seekerAccountForm"') && html.includes("EmailAuthProvider.credential(email,password)") && html.includes("linkWithCredential(user,credential)"), "job seekers can link the current anonymous account to email without changing their UID");
assert(html.includes("async function loginSeekerAccount()") && html.includes("signInWithEmailAndPassword(auth,email,password)") && html.includes("auth/invalid-credential"), "job seekers can log in to an existing email account with understandable errors");
assert(html.includes("sendEmailVerification(user)") && html.includes("function sendSeekerVerification()") && html.includes("function refreshSeekerVerification()") && html.includes("await reload(user)") && html.includes("user.emailVerified"), "job seekers can verify email, resend the verification message, and refresh verification status");
assert(html.includes('id="resetSeekerPasswordBtn"') && html.includes("sendPasswordResetEmail(auth,email)"), "job seekers can request a password reset email");
assert(html.includes('id="appConnectionNotice"') && html.includes("updateAppConnectionNotice") && html.includes('addEventListener("offline"'), "main page shows an accessible warning when the device is offline");
assert(html.includes('ownerUid:String(job.ownerUid||""),applicantUid:user.uid'), "in-platform applications safely handle job posts without an owner UID");
assert(html.includes("getDoc(applicationRef)") && html.includes("setDoc(applicationRef") && html.includes("`${user.uid}_${job.id}`") && html.includes("أنت قدمت بالفعل على الوظيفة دي"), "in-platform applications use a stable applicant/job ID and warn on repeat submissions");
assert(html.includes("function notifyApplicantStatusChange(application)") && html.includes("change.type===\"modified\"") && html.includes("Notification.requestPermission()") && html.includes('id="enableMyApplicationNotifications"'), "job seekers can opt into notifications when an existing application status changes");
assert(html.includes("sendPasswordResetEmail") || employer.includes("sendPasswordResetEmail"), "password reset flow remains in the app");
assert(html.includes('collection(db,"jobs")'), "main page remains connected to Firestore jobs");
assert(html.includes("visibleJobLimit=20") && html.includes("filtered.slice(0,visibleJobLimit)"), "job list renders in incremental batches");
assert(employer.includes("onAuthStateChanged") && employer.includes("createUserWithEmailAndPassword"), "employer authentication remains available");
assert(rules.includes("function isAdmin()") && rules.includes("validAdminJobUpdate()"), "Firestore rules retain explicit admin checks");
assert(rules.includes("function validMetricIncrement(field)") && rules.includes("resource.data.status == 'approved'") && rules.includes("request.resource.data.get(field, 0) == resource.data.get(field, 0) + 1"), "job metrics are limited to one-step increments on approved jobs");
assert(rules.includes("get(/databases/$(database)/documents/jobs/$(request.resource.data.jobId)).data.get('ownerUid', '') == request.resource.data.ownerUid"), "applications must match the referenced job owner");
assert(!rules.includes("allow read, write: if true") && !rules.includes("allow read: if true") && !rules.includes("allow write: if true"), "Firestore rules do not grant blanket public access");
assert(!html.includes("delete jobPayload.ownerUid"), "permission errors cannot silently strip job ownership");
assert(/shoghl-dakahlia-shell-v\d+/.test(sw), "service-worker cache has a versioned app shell");
assert(robots.includes("User-agent: *") && robots.includes("Allow: /"), "robots.txt allows crawlers to access the public site");
assert(robots.includes("https://medosalama650-sys.github.io/hoghl-dakahlia-android/sitemap.xml"), "robots.txt points to the project sitemap URL");
assert(sitemap.includes("<urlset") && sitemap.includes("</urlset>") && sitemap.includes("<loc>https://medosalama650-sys.github.io/hoghl-dakahlia-android/</loc>"), "sitemap.xml contains the canonical public homepage");
try { JSON.parse(manifest); console.log("PASS: web app manifest is valid JSON"); } catch { console.error("FAIL: web app manifest is valid JSON"); process.exitCode = 1; }

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
assert(employer.includes('["معدل ضغط التقديم",rate===null?"—":rate.toLocaleString("ar-EG",{maximumFractionDigits:1})+"%"]') && employer.includes("jobRate===null?"), "employer dashboard calculates account-level and per-job application click rates safely when views are zero");
assert(employer.includes("function jobAdvice(job)") && employer.includes("راجع تفاصيل الإعلان") && employer.includes("يُفضّل مراجعة الإعلان"), "employer dashboard provides age- and engagement-based ad review hints");
assert(employer.includes('id="topJobsReport"') && employer.includes('id="expiryJobsReport"') && employer.includes("function renderEmployerReport()") && employer.includes("function focusEmployerJob(job)"), "employer dashboard shows top-performing ads and actionable expiry reminders");
assert(employer.includes('id="myJobSearch"') && employer.includes('id="myJobStatus"') && employer.includes("visibleJobs.forEach(job=>{"), "employer dashboard supports searching and filtering owned jobs by status");
assert(employer.includes("Timestamp.fromDate(new Date(Date.now()+30*86400000))") && employer.includes('textContent="🔄 تجديد 30 يومًا"') && employer.includes("expiresAt"), "employer can renew a published job expiry without changing its approval status");
assert(employer.includes('id="applicationCounts"') && employer.includes('id="applicationStatusFilter"') && employer.includes("function renderApplicationSummary()") && employer.includes("appStatusFilter"), "employer dashboard summarizes application statuses and filters applicant lists");
assert(employer.includes('id="exportApplicationsBtn"') && employer.includes("function exportApplicationsCsv()") && employer.includes("function csvCell(value)") && employer.includes("currentApplications.map"), "employer can export their own application records as CSV with CSV cell escaping");
assert(employer.includes('id="enableApplicationNotificationsBtn"') && employer.includes("function enableApplicationNotifications()") && employer.includes("Notification.requestPermission()") && employer.includes("snap.docChanges().filter(change=>change.type===\"added\")"), "employer can opt into browser notifications for new in-platform applications");
assert(employer.includes("if(stopApplications){stopApplications();stopApplications=null}applicationSnapshotReady=false"), "application listener is stopped and notification baseline reset on sign out");

if (process.exitCode) process.exit(process.exitCode);
