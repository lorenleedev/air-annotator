// ──────────────────────────────────────
// Onboarding
// ──────────────────────────────────────
var obSlide = 0;
var OB_TOTAL = 4;

function showOnboarding() {
  obSlide = 0;
  updateSlide();
  document.getElementById("obOverlay").classList.add("show");
}

function closeOnboarding() {
  document.getElementById("obOverlay").classList.remove("show");
}

function nextSlide() {
  if (obSlide >= OB_TOTAL - 1) { closeOnboarding(); return; }
  obSlide++;
  updateSlide();
}

function updateSlide() {
  for (var i = 0; i < OB_TOTAL; i++) {
    document.getElementById("ob-slide-" + i).classList.toggle("active", i === obSlide);
  }
  var dots = document.getElementById("obDots").children;
  for (var i = 0; i < dots.length; i++) {
    dots[i].classList.toggle("active", i === obSlide);
  }
  var t = I18N[currentLang];
  var nb = document.getElementById("obNextBtn");
  nb.textContent = obSlide >= OB_TOTAL - 1 ? (t.ob_done || "Got it") : (t.ob_next || "Next");
}
