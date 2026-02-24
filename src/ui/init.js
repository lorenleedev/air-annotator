parent.postMessage({ pluginMessage: { type: "init" } }, "*");

// Cmd+S / Ctrl+S 단축키로 저장
document.addEventListener("keydown", function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === "s") {
    e.preventDefault();
    if (currentNodeId && !document.getElementById("btnSave").classList.contains("btn-muted")) {
      saveDesc();
    }
  }
});
