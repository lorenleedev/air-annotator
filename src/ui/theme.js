// ──────────────────────────────────────
// Panel Theme
// ──────────────────────────────────────
var panelTheme = "light";

function toggleTheme() {
  panelTheme = panelTheme === "light" ? "dark" : "light";
  updateThemeBtn();
  // 전체 패널 재생성
  parent.postMessage({ pluginMessage: { type: "rebuild-all-panels", theme: panelTheme } }, "*");
}

function updateThemeBtn() {
  var label = document.getElementById("themeLabel");
  var icon = document.getElementById("themeIcon");
  var btn = document.getElementById("themeBtn");
  if (!label || !icon || !btn) return;
  if (panelTheme === "dark") {
    label.textContent = "Dark";
    btn.title = "Panel theme: Dark";
    icon.innerHTML = '<path d="M13 8a5 5 0 1 1-5.93-4.97A7 7 0 0 0 13 8z"/>';
  } else {
    label.textContent = "Light";
    btn.title = "Panel theme: Light";
    icon.innerHTML = '<circle cx="8" cy="8" r="3.5"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"/>';
  }
}

function renderChips() {
  var row = document.getElementById("chipRow");
  if (!row) return;
  row.innerHTML = "";
  var chips = I18N[currentLang].chips;
  for (var i = 0; i < chips.length; i++) {
    var btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = chips[i].label;
    btn.onclick = (function(tag) { return function() { insertTag(tag); }; })(chips[i].tag);
    row.appendChild(btn);
  }
}
