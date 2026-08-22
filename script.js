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

// tab links are placeholders — stop them from jumping/scrolling the page
document.querySelectorAll(".tabs .tab").forEach(tab =>
  tab.addEventListener("click", e => e.preventDefault())
);

// ---------- redeem animation ----------
// spinner arc grows into the circle → check grows from a dot in the middle
// with "Fun, Faster." → circle+check shatter into shards that drift up →
// shards pull back together as the LL mark → My Passes empty state
const FRAG_FROM = [0, 90, 180, 270, 40, -35];   // resting rotations (ring + check bits)
const SCATTER = [
  { x:  30, y: -52, r:  150 },
  { x:  62, y: -16, r:  260 },
  { x:  10, y: -66, r:  300 },
  { x: -34, y: -38, r:  180 },
  { x:  44, y: -58, r:  200 },
  { x: -10, y: -26, r: -140 },
];

let redeeming = false;

function showEmptyState(){
  animScreen.style.display = "none";
  animScreen.style.opacity = "";
  document.getElementById("passCard").style.display = "none";
  document.getElementById("bottomSection").style.display = "none";
  const empty = document.getElementById("noPasses");
  empty.style.display = "flex";
  if (window.gsap) gsap.from(empty, { opacity: 0, duration: 0.3 });
  redeeming = false;
}

redeemBtn.addEventListener("click", () => {
  if (redeeming) return;              // ignore double taps
  redeeming = true;
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
  gsap.set("#spinGroup", { rotation: 0, svgOrigin: "26 26" });
  gsap.set(circle, { strokeDashoffset: 151 });
  gsap.set(tick, { scale: 0, svgOrigin: "26 26" });
  gsap.set(tagline, { opacity: 0 });
  gsap.set(fragBox, { display: "none" });
  gsap.set(logo, { display: "none" });

  const tl = gsap.timeline();

  // 1) loading: the arc grows while spinning (revealed as the sheet slides away)
  tl.to(circle, { strokeDashoffset: 0, duration: 1.1, ease: "power1.inOut" }, 0.2)
    .to("#spinGroup", { rotation: 300, svgOrigin: "26 26", duration: 1.1, ease: "power1.out" }, "<")

    // 2) check grows from a dot in the middle, tagline fades up
    .to(tick, { scale: 1, duration: 0.45, ease: "back.out(2.2)" }, "-=0.15")
    .to(tagline, { opacity: 1, duration: 0.6 }, "-=0.2")
    .to({}, { duration: 0.7 })

    // 3) circle + check shatter into shards that drift up, tagline fades out
    .add(() => {
      checkWrap.style.display = "none";
      fragBox.style.display = "block";
    })
    .fromTo(frags,
      { x: 0, y: 0, scale: 1, opacity: 1, rotation: i => FRAG_FROM[i] },
      {
        x: i => SCATTER[i].x, y: i => SCATTER[i].y,
        rotation: i => FRAG_FROM[i] + SCATTER[i].r, scale: 0.8,
        duration: 0.55, ease: "power2.out", stagger: 0.02
      })
    .to(tagline, { opacity: 0, duration: 0.35 }, "<")

    // 4) shards pull back in and become the LL mark
    .to(frags, {
      x: 0, y: 0, scale: 0.5, opacity: 0,
      rotation: i => FRAG_FROM[i] + SCATTER[i].r + 120,
      duration: 0.4, ease: "power2.in"
    })
    .add(() => {
      fragBox.style.display = "none";
      logo.style.display = "block";
    })
    .from("#llLeft",  { x: -34, opacity: 0, duration: 0.5, ease: "back.out(1.7)" })
    .from("#llRight", { x: 34,  opacity: 0, duration: 0.5, ease: "back.out(1.7)" }, "<0.06")
    .from(logo, { scale: 0.85, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(1.7)" }, "<")
    .to({}, { duration: 0.9 })

    // 5) swap to the empty state underneath, then fade the anim screen away
    .add(() => {
      document.getElementById("passCard").style.display = "none";
      document.getElementById("bottomSection").style.display = "none";
      document.getElementById("noPasses").style.display = "flex";
    })
    .to(animScreen, {
      opacity: 0, duration: 0.35,
      onComplete: () => {
        animScreen.style.display = "none";
        animScreen.style.opacity = "";
        redeeming = false;
      }
    });
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
