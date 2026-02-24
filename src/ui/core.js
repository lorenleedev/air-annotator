// ──────────────────────────────────────
// Core
// ──────────────────────────────────────
function escHtml(s) {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

var currentNodeId = null;
var selectedColor = "#F24E1E";
var canEdit = true;
var COLORS = ["#F24E1E", "#FF7262", "#A259FF", "#1ABCFE", "#0ACF83", "#0D0D0D"];

function initPalette() {
  var pal = document.getElementById("colorPalette");
  pal.innerHTML = "";
  for (var i = 0; i < COLORS.length; i++) {
    var dot = document.createElement("div");
    dot.className = "color-dot" + (COLORS[i] === selectedColor ? " selected" : "");
    dot.style.background = COLORS[i];
    dot.style.borderColor = COLORS[i];
    dot.dataset.color = COLORS[i];
    dot.onclick = function() { pickColor(this.dataset.color); };
    pal.appendChild(dot);
  }
  var custom = document.createElement("div");
  custom.className = "color-custom";
  var plusIcon = '<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><line x1="4.5" y1="1.5" x2="4.5" y2="7.5"/><line x1="1.5" y1="4.5" x2="7.5" y2="4.5"/></svg>';
  var swapIcon = '<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 4.5a3 3 0 0 1 5.2-2"/><path d="M7.5 4.5a3 3 0 0 1-5.2 2"/><polyline points="5.5,1 6.7,2.5 5.2,3.2"/><polyline points="3.5,8 2.3,6.5 3.8,5.8"/></svg>';
  custom.innerHTML = '<span>' + plusIcon + '</span><input type="color" value="' + selectedColor + '">';
  function updateCustomIcon() {
    var hasCustom = pal.querySelector(".color-dot-custom");
    custom.querySelector("span").innerHTML = hasCustom ? swapIcon : plusIcon;
  }
  custom.querySelector("input").oninput = function() {
    var hex = this.value;
    if (COLORS.indexOf(hex) === -1) {
      var existing = pal.querySelector(".color-dot-custom");
      if (existing) existing.remove();
      var cdot = document.createElement("div");
      cdot.className = "color-dot color-dot-custom";
      cdot.style.background = hex;
      cdot.style.borderColor = hex;
      cdot.dataset.color = hex;
      cdot.onclick = function() { pickColor(this.dataset.color); };
      pal.insertBefore(cdot, custom);
      updateCustomIcon();
    }
    pickColor(hex);
  };
  pal.appendChild(custom);
  // 기존 어노테이션이 커스텀 컬러면 프리뷰 닷 표시
  if (COLORS.indexOf(selectedColor) === -1 && selectedColor !== COLORS[0]) {
    var cdot = document.createElement("div");
    cdot.className = "color-dot color-dot-custom selected";
    cdot.style.background = selectedColor;
    cdot.style.borderColor = selectedColor;
    cdot.dataset.color = selectedColor;
    cdot.onclick = function() { pickColor(this.dataset.color); };
    pal.insertBefore(cdot, custom);
  }
  updateCustomIcon();
}

var _dirtyTimer = null;
function markDirty() {
  var btn = document.getElementById("btnSave");
  if (!btn) return;
  btn.classList.remove("btn-muted");
  // 디바운스: 입력 멈추고 500ms 후 펄스
  clearTimeout(_dirtyTimer);
  _dirtyTimer = setTimeout(function() {
    btn.classList.remove("btn-dirty");
    void btn.offsetWidth;
    btn.classList.add("btn-dirty");
  }, 500);
}
function markClean() {
  clearTimeout(_dirtyTimer);
  var btn = document.getElementById("btnSave");
  if (!btn) return;
  btn.classList.add("btn-muted");
  btn.classList.remove("btn-dirty");
}

function pickColor(hex) {
  selectedColor = hex;
  var dots = document.querySelectorAll(".color-dot");
  for (var i = 0; i < dots.length; i++) dots[i].classList.toggle("selected", dots[i].dataset.color === hex);
  document.getElementById("nodeBadge").style.background = hex;
  markDirty();
}

function switchTab(id) {
  var tabIds = ["sel", "list"];
  document.querySelectorAll(".seg-btn").forEach(function(t, i) { t.classList.toggle("active", tabIds[i] === id); });
  for (var i = 0; i < tabIds.length; i++) {
    var el = document.getElementById("tab-" + tabIds[i]);
    if (el) el.classList.toggle("active", tabIds[i] === id);
  }
  if (id === "list") refreshList();
}

function refreshList() { parent.postMessage({ pluginMessage: { type: "list-specs" } }, "*"); }
function rebuildIndex() { parent.postMessage({ pluginMessage: { type: "rebuild-index" } }, "*"); }

function applyViewMode() {
  // Hide write-only UI elements for view-only users
  var ids = ["btnSave", "btnDelete", "colorPalette", "chipRow"];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el) el.style.display = "none";
  }
  // Title → readonly
  var title = document.getElementById("selTitle");
  if (title) { title.readOnly = true; title.style.opacity = "0.7"; }
  // Desc → readonly
  var desc = document.getElementById("selDesc");
  if (desc) { desc.readOnly = true; desc.style.opacity = "0.7"; }
  // Hide theme toggle (writes pluginData)
  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.style.display = "none";
  // Hide Index rebuild button
  document.querySelectorAll(".list-btn").forEach(function(btn) {
    if (btn.textContent === "Index" || btn.onclick === rebuildIndex) btn.style.display = "none";
  });
}
