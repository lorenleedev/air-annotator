parent.postMessage({ pluginMessage: { type: "init" } }, "*");

// Cmd+S / Ctrl+S 단축키로 저장
document.addEventListener("keydown", function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === "s") {
    e.preventDefault();
    var _sb = document.getElementById("btnSave");
    if (currentNodeId && !_sb.disabled && !_sb.classList.contains("btn-muted")) {
      saveDesc();
    }
  }
});
