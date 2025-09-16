// ========== Expiration date ==========
function updateExpiration() {
  const expEl = document.getElementById("expiresAt");
  if (!expEl) return;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(4, 0, 0, 0);

  const options = { month: "short", day: "numeric" };
  const dateStr = tomorrow.toLocaleDateString("en-US", options);
  expEl.textContent = `${dateStr}, 4:00 AM`;
}
updateExpiration();

// ========== Live Time ==========
function updateTime(){
  document.getElementById("liveTime").textContent = new Date().toLocaleString();
}
setInterval(updateTime,1000);

// ========== Modal ==========
function openStaffModal(){
  document.getElementById("staffModal").style.display="flex";
  updateTime();
}
function closeStaffModal(){
  document.getElementById("staffModal").style.display="none";
}

// ========== Redeem Animation ==========
function startAnimation(){
  document.getElementById("staffModal").style.display="none";
  const screen=document.getElementById("animationScreen");
  screen.style.display="flex";

  const loaderArc=document.querySelector("#loaderArc circle");
  const check=document.getElementById("checkIcon");
  const pieces=document.getElementById("pieces");
  const logo=document.getElementById("llLogo");
  const tagline=document.getElementById("tagline");

  gsap.fromTo(loaderArc,{strokeDashoffset:200},{strokeDashoffset:0, duration:1.5, ease:"power2.inOut", onComplete:()=>{
    document.getElementById("loaderArc").style.display="none";
    check.style.display="block";
    gsap.from(check,{scale:0, duration:0.5, ease:"back.out(2)"});
    gsap.to(tagline,{opacity:1, delay:0.5, duration:1});
  }});

  setTimeout(()=>{
    check.style.display="none";
    pieces.style.display="flex";
    gsap.fromTo(pieces.children,{y:0,opacity:1},{y:-80, rotation:180, opacity:0, duration:1, stagger:0.2});
  },3000);

  setTimeout(()=>{
    pieces.style.display="none";
    logo.style.display="block";
    gsap.from(logo,{scale:0, y:-50, duration:0.7, ease:"back.out(1.7)"});
  },4200);

  setTimeout(()=>{
    screen.style.display="none";
    document.getElementById("noPasses").style.display="block";
    document.getElementById("buyBtn").style.display="block";
  },6000);
}
