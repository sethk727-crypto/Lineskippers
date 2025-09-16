// live time updater (for the sheet)
function updateLiveTime() {
  const el = document.getElementById("liveTime");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", second: "2-digit"
  });
}
setInterval(updateLiveTime, 1000);
updateLiveTime();

// elements
const openSheetBtn = document.getElementById("openSheetBtn");
const howBtn       = document.getElementById("howBtn");
const sheet        = document.getElementById("sheet");
const backdrop     = document.getElementById("backdrop");
const cancelBtn    = document.getElementById("cancelSheetBtn");
const redeemBtn    = document.getElementById("redeemBtn");
const animScreen   = document.getElementById("animScreen");

// sheet open/close helpers
function openSheet(){
  sheet.classList.add("show");
  backdrop.classList.add("show");
  sheet.setAttribute("aria-hidden", "false");
  // lock body scroll behind sheet
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

// bind clicks
openSheetBtn.addEventListener("click", openSheet);
howBtn.addEventListener("click", openSheet);        // same sheet for demo
cancelBtn.addEventListener("click", closeSheet);
backdrop.addEventListener("click", closeSheet);

// redeem flow animation — loader arc → check → pieces → LL logo → end
redeemBtn.addEventListener("click", () => {
  closeSheet();
  animScreen.style.display = "flex";

  const arcCircle = document.querySelector("#loaderArc circle");
  const check     = document.getElementById("checkIcon");
  const pieces    = document.getElementById("pieces");
  const logo      = document.getElementById("llLogo");
  const tagline   = document.getElementById("tagline");

  // 1) draw the arc
  gsap.fromTo(
    arcCircle,
    { strokeDashoffset: 200 },
    {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => {
        // 2) show check
        document.getElementById("loaderArc").style.display = "none";
        check.style.display = "block";
        gsap.from(check, { scale: 0, duration: 0.6, ease: "back.out(1.8)" });
        gsap.to(tagline, { opacity: 1, delay: 0.4, duration: 1.0 });
      }
    }
  );

  // 3) pieces break
  setTimeout(() => {
    check.style.display = "none";
    pieces.style.display = "block";
    gsap.fromTo(
      pieces,
      { y: 0, opacity: 1 },
      { y: -80, rotation: 180, opacity: 0, duration: 1.0 }
    );
  }, 3000);

  // 4) show final logo
  setTimeout(() => {
    pieces.style.display = "none";
    logo.style.display = "block";
    gsap.from(logo, { scale: 0, y: -40, duration: 0.7, ease: "back.out(1.7)" });
  }, 4200);

  // 5) end → no passes
  setTimeout(() => {
    animScreen.style.display = "none";
    document.getElementById("noPasses").style.display = "flex";
  }, 6000);
});
