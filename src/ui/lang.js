var currentLang = "en";

function applyLang() {
  var t = I18N[currentLang];
  document.querySelectorAll("[data-i18n]").forEach(function(el) {
    var key = el.getAttribute("data-i18n");
    if (t[key]) el.textContent = t[key];
  });
  document.querySelectorAll("[data-i18n-html]").forEach(function(el) {
    var key = el.getAttribute("data-i18n-html");
    if (t[key]) el.innerHTML = t[key];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(function(el) {
    var key = el.getAttribute("data-i18n-ph");
    if (t[key]) el.placeholder = t[key];
  });
  document.querySelectorAll("[data-i18n-tip]").forEach(function(el) {
    var key = el.getAttribute("data-i18n-tip");
    if (t[key]) el.setAttribute("data-tip", t[key]);
  });
  renderChips();
  // Update onboarding next/skip if visible
  var nb = document.getElementById("obNextBtn");
  if (nb) nb.textContent = obSlide >= OB_TOTAL - 1 ? (t.ob_done || "Got it") : (t.ob_next || "Next");
}

function toggleLang() {
  currentLang = currentLang === "en" ? "ko" : "en";
  var label = document.getElementById("langLabel");
  if (label) label.textContent = currentLang === "en" ? "EN" : "KR";
  applyLang();
}
