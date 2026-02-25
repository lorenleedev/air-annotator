window.onmessage = function(e) {
  var msg = e.data.pluginMessage;
  if (!msg) return;
  if (msg.type === "init-done") {
    figmaFileKey = msg.fileKey || "";
    if (msg.theme) { panelTheme = msg.theme; updateThemeBtn(); }
    canEdit = msg.canEdit !== false;
    initPalette(); applyLang();
    if (!canEdit) applyViewMode();
  }
  if (msg.type === "selection-empty") {
    document.getElementById("selEmpty").style.display = "flex";
    document.getElementById("selContent").style.display = "none";
    currentNodeId = null;
    updateDeleteBtn(false);
  }
  if (msg.type === "selection-desc") {
    showSelContent(msg.nodeName, msg.nodeType + "\u200a\u00b7\u200a" + msg.nodeId, msg.title, msg.desc);
    currentNodeId = msg.nodeId;
    currentNodeNum = msg.num || null;
    if (msg.color) { selectedColor = msg.color; pickColor(msg.color); }
    document.getElementById("nodeBadge").style.background = msg.color || selectedColor || "#F24E1E";
    markClean();
  }
  if (msg.type === "specs-listed") renderSpecList(msg.specs || []);
  if (msg.type === "write-success") {
    var btn = document.getElementById("btnSave");
    var t = I18N[currentLang];
    btn.textContent = t.btn_save;
    btn.disabled = false;
    markClean();
    parent.postMessage({ pluginMessage: { type: "list-specs" } }, "*");
  }
  if (msg.type === "write-error") {
    var btn = document.getElementById("btnSave");
    var t = I18N[currentLang];
    btn.textContent = t.btn_save;
    btn.disabled = false;
  }
  if (msg.type === "batch-done") parent.postMessage({ pluginMessage: { type: "list-specs" } }, "*");
  if (msg.type === "delete-done") {
    clearDesc();
    currentNodeId = null;
    document.getElementById("selEmpty").style.display = "flex";
    document.getElementById("selContent").style.display = "none";
    updateDeleteBtn(false);
    parent.postMessage({ pluginMessage: { type: "list-specs" } }, "*");
  }
  if (msg.type === "delete-all-done") {
    clearDesc();
    currentNodeId = null;
    document.getElementById("selEmpty").style.display = "flex";
    document.getElementById("selContent").style.display = "none";
    updateDeleteBtn(false);
    selectedNums.clear();
    parent.postMessage({ pluginMessage: { type: "list-specs" } }, "*");
  }
  if (msg.type === "delete-selected-done") {
    selectedNums.clear();
    clearDesc();
    currentNodeId = null;
    document.getElementById("selEmpty").style.display = "flex";
    document.getElementById("selContent").style.display = "none";
    updateDeleteBtn(false);
    parent.postMessage({ pluginMessage: { type: "list-specs" } }, "*");
  }
  if (msg.type === "rebuild-done") {
    parent.postMessage({ pluginMessage: { type: "list-specs" } }, "*");
  }
  if (msg.type === "visibility-changed") {
    refreshList();
  }
  if (msg.type === "all-visibility-changed") {
    refreshList();
  }
  if (msg.type === "reorder-done") {
    hideReorderLoading();
    refreshList();
  }
  if (msg.type === "page-changed") {
    // 페이지 이동 시 Edit 탭 초기화 + Annotations 탭 갱신
    clearDesc();
    currentNodeId = null;
    document.getElementById("selEmpty").style.display = "flex";
    document.getElementById("selContent").style.display = "none";
    updateDeleteBtn(false);
    parent.postMessage({ pluginMessage: { type: "list-specs" } }, "*");
  }
};
