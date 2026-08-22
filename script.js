// ---------- live clocks ----------
function ordinal(n){
  const s = ["th","st","nd","rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function updateClocks() {
  const now = new Date();

  // sheet: "Sep 15, 6:38:17 PM"
  const liveEl = document.getElementById("liveTime");
  if (liveEl) {
    liveEl.textContent = now.toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", second: "2-digit"
    });
  }

  // header: "Sep 15th 6:38:15 PM"
  const month = now.toLocaleString("en-US", { month: "short" });
  const time  = now.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });
  const stamp = `${month} ${ordinal(now.getDate())} ${time}`;
  for (const id of ["headerDate", "headerDate2"]) {
    const el = document.getElementById(id);
    if (el) el.textContent = stamp;
  }
}
setInterval(updateClocks, 1000);
updateClocks();

// ---------- elements ----------
const openSheetBtn = document.getElementById("openSheetBtn");
const howBtn       = document.getElementById("howBtn");
const sheet        = document.getElementById("sheet");
const backdrop     = document.getElementById("backdrop");
const cancelBtn    = document.getElementById("cancelSheetBtn");
const redeemBtn    = document.getElementById("redeemBtn");
const animScreen   = document.getElementById("animScreen");
const buyBtn       = document.getElementById("buyBtn");

// ---------- sheet open/close ----------
function openSheet(){
  sheet.classList.add("show");
  backdrop.classList.add("show");
  sheet.setAttribute("aria-hidden", "false");
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}
function closeSheet(){
  sheet.classList.remove("show");
  backdrop.classList.remove("show");
  sheet.setAttribute("aria-hidden", "true");
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

openSheetBtn.addEventListener("click", openSheet);
howBtn.addEventListener("click", openSheet);        // same sheet for demo
cancelBtn.addEventListener("click", closeSheet);
backdrop.addEventListener("click", closeSheet);

// ---------- redeem animation ----------
// check draws in with "Fun, Faster." → check shatters into pieces →
// pieces pull back together as the LL mark → My Passes empty state
const SCATTER = [
  { x: -52, y: -38, r: -120 },
  { x:  10, y: -60, r:   95 },
  { x:  58, y: -30, r:  140 },
  { x: -60, y:  16, r:   80 },
  { x:  48, y:  34, r: -100 },
  { x:  -8, y:  56, r:  130 },
];

function showEmptyState(){
  animScreen.style.display = "none";
  animScreen.style.opacity = "";
  document.getElementById("passCard").style.display = "none";
  document.getElementById("bottomSection").style.display = "none";
  const empty = document.getElementById("noPasses");
  empty.style.display = "flex";
  if (window.gsap) gsap.from(empty, { opacity: 0, duration: 0.3 });
}

redeemBtn.addEventListener("click", () => {
  closeSheet();
  animScreen.style.display = "flex";

  // graceful fallback if GSAP failed to load (e.g. offline)
  if (!window.gsap) { setTimeout(showEmptyState, 800); return; }

  const checkWrap = document.getElementById("checkIcon");
  const circle    = document.getElementById("checkCircle");
  const tick      = document.getElementById("checkTick");
  const fragBox   = document.getElementById("fragments");
  const frags     = gsap.utils.toArray(".frag");
  const logo      = document.getElementById("llLogo");
  const tagline   = document.getElementById("tagline");

  gsap.set(animScreen, { opacity: 1 });
  gsap.set(checkWrap, { display: "block", opacity: 1 });
  gsap.set(circle, { strokeDashoffset: 151 });
  gsap.set(tick, { strokeDashoffset: 35 });
  gsap.set(tagline, { opacity: 0 });
  gsap.set(fragBox, { display: "none" });
  gsap.set(logo, { display: "none" });

  const tl = gsap.timeline();

  // 1) circle + check draw in, tagline fades up
  tl.from(animScreen, { opacity: 0, duration: 0.25 })
    .to(circle, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" })
    .to(tick, { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, "-=0.2")
    .to(tagline, { opacity: 1, duration: 0.7 }, "-=0.4")
    .to({}, { duration: 0.8 })

    // 2) check shatters into pieces, tagline fades out
    .add(() => {
      checkWrap.style.display = "none";
      fragBox.style.display = "block";
    })
    .fromTo(frags,
      { x: 0, y: 0, rotation: 0, opacity: 1 },
      {
        x: i => SCATTER[i].x, y: i => SCATTER[i].y, rotation: i => SCATTER[i].r,
        duration: 0.55, ease: "power2.out", stagger: 0.02
      })
    .to(tagline, { opacity: 0, duration: 0.4 }, "<")

    // 3) pieces pull back in and become the LL mark
    .to(frags, {
      x: 0, y: 0, rotation: i => SCATTER[i].r + 160, opacity: 0,
      duration: 0.45, ease: "power2.in"
    })
    .add(() => {
      fragBox.style.display = "none";
      logo.style.display = "block";
    })
    .from("#llLeft",  { x: -34, opacity: 0, duration: 0.5, ease: "back.out(1.7)" })
    .from("#llRight", { x: 34,  opacity: 0, duration: 0.5, ease: "back.out(1.7)" }, "<0.06")
    .from(logo, { scale: 0.85, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(1.7)" }, "<")
    .to({}, { duration: 0.9 })

    // 4) back to My Passes → empty state
    .to(animScreen, { opacity: 0, duration: 0.35, onComplete: showEmptyState });
});

// "Buy Another Pass" restores the pass so the demo can loop
buyBtn.addEventListener("click", () => {
  document.getElementById("noPasses").style.display = "none";
  document.getElementById("passCard").style.display = "";
  document.getElementById("bottomSection").style.display = "";
});

// ---------- pass expiration: tomorrow 4:00 AM ----------
function updateExpiration() {
  const expEl = document.getElementById("expiresAt");
  if (!expEl) return;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(4, 0, 0, 0);

  const dateStr = tomorrow.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  expEl.textContent = `${dateStr}, 4:00 AM`;
}
updateExpiration();
