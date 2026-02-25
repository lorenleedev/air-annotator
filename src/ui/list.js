var selectedNums = new Set();
var dragSrcNum = null;

function showReorderLoading() {
  var t = I18N[currentLang];
  var overlay = document.getElementById("reorderOverlay");
  document.getElementById("reorderLabel").textContent = t.reorder_loading || "Reordering...";
  overlay.classList.add("show");
}
function hideReorderLoading() {
  document.getElementById("reorderOverlay").classList.remove("show");
}

function renderSpecList(specs) {
  cachedSpecs = specs || [];
  var container = document.getElementById("specList"), empty = document.getElementById("specListEmpty");
  container.innerHTML = "";
  if (!specs || specs.length === 0) { empty.style.display = "flex"; selectedNums.clear(); updateToggleAllBtn(); updateBatchBar(); return; }
  empty.style.display = "none";
  dragSrcNum = null;
  for (var i = 0; i < specs.length; i++) {
    var s = specs[i], item = document.createElement("div");
    item.className = "spec-item" + (s.hidden ? " hidden" : "");
    var numColor = s.color || "#F24E1E";
    var eyeIcon = s.hidden
      ? '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l12 12"/><path d="M6.5 6.5a2.5 2.5 0 003.5 3.5"/><path d="M4.2 4.2C2.4 5.6 1 8 1 8s2.5 5 7 5c1.4 0 2.6-.5 3.6-1.2"/><path d="M11 4.7C13.3 6 15 8 15 8s-2.5 5-7 5c-.5 0-1-.1-1.5-.2"/></svg>'
      : '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2.5"/></svg>';
    item.setAttribute("draggable", "true");
    item.dataset.num = s.num;
    item.innerHTML =
      '<div class="spec-body">' +
        '<div class="spec-title-row">' +
          '<div class="spec-num" style="background:' + escHtml(numColor) + '">' + escHtml(s.num) + '</div>' +
          '<div class="spec-title">' + escHtml(s.title || '(untitled)') + '</div>' +
        '</div>' +
        '<div class="spec-preview">' + escHtml(s.preview || '\u2014') + '</div>' +
      '</div>' +
      '<button class="spec-delete" data-num="' + escHtml(s.num) + '" data-target="' + escHtml(s.targetNodeId || '') + '" title="Delete">' +
        '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v8.5a1 1 0 001 1h4a1 1 0 001-1V4"/></svg>' +
      '</button>' +
      '<button class="spec-vis" data-num="' + s.num + '" data-hidden="' + (s.hidden ? '1' : '0') + '" title="' + (s.hidden ? 'Show' : 'Hide') + '">' + eyeIcon + '</button>' +
      '<input type="checkbox" class="spec-check" data-num="' + escHtml(s.num) + '"' + (selectedNums.has(s.num) ? ' checked' : '') + '>' +
      '<div class="spec-drag">' +
        '<svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">' +
          '<circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/>' +
          '<circle cx="2" cy="7" r="1.2"/><circle cx="6" cy="7" r="1.2"/>' +
          '<circle cx="2" cy="12" r="1.2"/><circle cx="6" cy="12" r="1.2"/>' +
        '</svg>' +
      '</div>';
    // View-only: hide write controls in list items
    if (!canEdit) {
      item.querySelector(".spec-delete").style.display = "none";
      item.querySelector(".spec-vis").style.display = "none";
      item.querySelector(".spec-drag").style.display = "none";
      item.querySelector(".spec-check").style.display = "none";
      item.setAttribute("draggable", "false");
    }
    // Number badge click → navigate to target on canvas
    item.querySelector(".spec-num").onclick = (function(targetId) {
      return function(e) {
        e.stopPropagation();
        if (targetId) parent.postMessage({ pluginMessage: { type: "select-node", nodeId: targetId } }, "*");
      };
    })(s.targetNodeId);
    // Eye toggle click
    item.querySelector(".spec-vis").onclick = (function(num, isHidden) {
      return function(e) {
        e.stopPropagation();
        toggleVisibility(num, isHidden);
      };
    })(s.num, !!s.hidden);
    // Delete button click
    item.querySelector(".spec-delete").onclick = (function(num, targetId) {
      return function(e) {
        e.stopPropagation();
        deleteFromList(num, targetId);
      };
    })(s.num, s.targetNodeId);
    // Checkbox click
    item.querySelector(".spec-check").onclick = (function(num) {
      return function(e) {
        e.stopPropagation();
        if (this.checked) {
          selectedNums.add(num);
        } else {
          selectedNums.delete(num);
        }
        updateBatchBar();
        updateItemSelection();
      };
    })(s.num);
    // Item click → Edit tab (선택 이동 없이 데이터만 표시)
    item.onclick = (function(spec) {
      return function() {
        var name = "[AIR-" + spec.num + "] " + (spec.title || "");
        showSelContent(name, spec.targetNodeId || "", spec.title || "", spec.desc || "");
        currentNodeId = spec.targetNodeId || null;
        if (spec.color) { selectedColor = spec.color; pickColor(spec.color); }
        document.getElementById("nodeBadge").style.background = spec.color || selectedColor || "#F24E1E";
        switchTab("sel");
      };
    })(s);
    item.ondragstart = (function(num) {
      return function(e) {
        dragSrcNum = String(num);
        this.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      };
    })(s.num);
    item.ondragend = function() {
      this.classList.remove("dragging");
      container.querySelectorAll(".drag-over").forEach(function(el) {
        el.classList.remove("drag-over");
      });
    };
    item.ondragover = function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      // Remove drag-over from all items, add to this one
      container.querySelectorAll(".drag-over").forEach(function(el) {
        el.classList.remove("drag-over");
      });
      this.classList.add("drag-over");
    };
    item.ondragleave = function() {
      this.classList.remove("drag-over");
    };
    item.ondrop = (function(itemNum) {
      return function(e) {
        e.preventDefault();
        this.classList.remove("drag-over");
        var srcNum = String(dragSrcNum);
        var dstNum = String(itemNum);
        if (srcNum === dstNum) return;
        var items = container.querySelectorAll(".spec-item");
        var order = [];
        for (var j = 0; j < items.length; j++) order.push(items[j].dataset.num);
        var fromIdx = order.indexOf(srcNum);
        if (fromIdx === -1) return;
        order.splice(fromIdx, 1);
        var toIdx = order.indexOf(dstNum);
        if (toIdx === -1) return;
        order.splice(toIdx, 0, srcNum);
        showReorderLoading();
        parent.postMessage({ pluginMessage: { type: "reorder-specs", order: order } }, "*");
      };
    })(s.num);
    container.appendChild(item);
  }
  // Prune stale selections (deleted items still in selectedNums)
  var currentNums = new Set();
  for (var i = 0; i < specs.length; i++) currentNums.add(String(specs[i].num));
  selectedNums.forEach(function(n) { if (!currentNums.has(String(n))) selectedNums.delete(n); });
  updateToggleAllBtn();
  updateBatchBar();
  updateItemSelection();
}

function showSelContent(name, meta, title, desc) {
  document.getElementById("selEmpty").style.display = "none";
  document.getElementById("selContent").style.display = "flex";
  var displayName = name.replace(/^\[AIR-\d+\]\s*/, "");
  document.getElementById("selName").textContent = displayName;
  document.getElementById("selMeta").textContent = meta;
  document.getElementById("selTitle").value = title || "";
  document.getElementById("selDesc").value = desc || "";

  // 뱃지: [N] 번호 있으면 표시, 없으면 작은 점
  var badge = document.getElementById("nodeBadge");
  var numMatch = name.match(/^\[AIR-(\d+)\]/);
  if (numMatch) {
    badge.textContent = numMatch[1];
    badge.classList.remove("empty");
  } else {
    badge.textContent = "";
    badge.classList.add("empty");
  }

  var hasAnnotation = !!numMatch;
  updateDeleteBtn(hasAnnotation);
  markClean();
}

function saveDesc() {
  if (!currentNodeId) return;
  var btn = document.getElementById("btnSave");
  if (btn.disabled) return;
  var t = I18N[currentLang];
  btn.textContent = t.btn_saving || "Saving...";
  btn.classList.add("btn-muted");
  btn.disabled = true;
  parent.postMessage({ pluginMessage: {
    type: "write-desc", nodeId: currentNodeId,
    title: document.getElementById("selTitle").value.trim(),
    desc: document.getElementById("selDesc").value,
    color: selectedColor,
    theme: panelTheme
  }}, "*");
}

function clearDesc() { document.getElementById("selTitle").value = ""; document.getElementById("selDesc").value = ""; }

function focusCurrentNode() {
  if (!currentNodeId) return;
  parent.postMessage({ pluginMessage: { type: "select-node", nodeId: currentNodeId } }, "*");
}

function deleteDesc() {
  if (!currentNodeId) return;
  var t = I18N[currentLang];
  if (!confirm(t.confirm_delete || "Delete this annotation?")) return;
  parent.postMessage({ pluginMessage: { type: "delete-spec", nodeId: currentNodeId } }, "*");
}

function updateDeleteBtn(hasAnnotation) {
  var btn = document.getElementById("btnDelete");
  if (btn) btn.style.display = hasAnnotation ? "" : "none";
}

function deleteFromList(num, targetNodeId) {
  var t = I18N[currentLang];
  if (!confirm(t.confirm_delete || "Delete this annotation?")) return;
  parent.postMessage({ pluginMessage: { type: "delete-spec", nodeId: targetNodeId, num: num } }, "*");
}

function toggleVisibility(num, isCurrentlyHidden) {
  parent.postMessage({ pluginMessage: { type: "toggle-visibility", num: String(num), visible: isCurrentlyHidden } }, "*");
}

function toggleAllVisibility() {
  var anyVisible = cachedSpecs.some(function(s) { return !s.hidden; });
  parent.postMessage({ pluginMessage: { type: "set-all-visibility", visible: !anyVisible } }, "*");
}

function updateToggleAllBtn() {
  var btn = document.getElementById("btnToggleAllVis");
  if (!btn) return;
  var t = I18N[currentLang];
  if (!cachedSpecs || cachedSpecs.length === 0) {
    btn.style.display = "none";
    var delAll = document.getElementById("btnDeleteAll");
    if (delAll) delAll.style.display = "none";
    return;
  }
  btn.style.display = "";
  var delAll = document.getElementById("btnDeleteAll");
  if (delAll) delAll.style.display = "";
  var allHidden = cachedSpecs.every(function(s) { return s.hidden; });
  if (allHidden) {
    btn.setAttribute("data-tip", t.tip_show_all || "Show all annotations on canvas");
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l12 12"/><path d="M6.5 6.5a2.5 2.5 0 003.5 3.5"/><path d="M4.2 4.2C2.4 5.6 1 8 1 8s2.5 5 7 5c1.4 0 2.6-.5 3.6-1.2"/><path d="M11 4.7C13.3 6 15 8 15 8s-2.5 5-7 5c-.5 0-1-.1-1.5-.2"/></svg>';
  } else {
    btn.setAttribute("data-tip", t.tip_hide_all || "Hide all annotations on canvas");
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2.5"/></svg>';
  }
}

function insertTag(tag) {
  var ta = document.getElementById("selDesc"), val = ta.value, start = ta.selectionStart;
  var prefix = (start > 0 && val[start - 1] !== "\n") ? "\n" : "";
  ta.value = val.substring(0, start) + prefix + tag + val.substring(start);
  ta.focus();
  var newPos = start + prefix.length + tag.length;
  ta.setSelectionRange(newPos, newPos);
  markDirty();
}

function updateBatchBar() {
  var bar = document.getElementById("batchBar");
  var t = I18N[currentLang];
  if (selectedNums.size > 0) {
    bar.style.display = "flex";
    document.getElementById("batchCount").textContent = (t.batch_selected || "{n} selected").replace("{n}", selectedNums.size);
  } else {
    bar.style.display = "none";
  }
}

function updateItemSelection() {
  var items = document.querySelectorAll(".spec-item");
  for (var i = 0; i < items.length; i++) {
    var num = items[i].dataset.num;
    items[i].classList.toggle("selected", selectedNums.has(num));
  }
}

function clearSelection() {
  selectedNums.clear();
  var checks = document.querySelectorAll(".spec-check");
  for (var i = 0; i < checks.length; i++) checks[i].checked = false;
  updateBatchBar();
  updateItemSelection();
}

function deleteAllSpecs() {
  if (!cachedSpecs || cachedSpecs.length === 0) return;
  var t = I18N[currentLang];
  if (!confirm(t.confirm_delete_all || "Delete ALL annotations on this page? This cannot be undone.")) return;
  parent.postMessage({ pluginMessage: { type: "delete-all-specs" } }, "*");
}

function deleteSelectedSpecs() {
  if (selectedNums.size === 0) return;
  var t = I18N[currentLang];
  var msg = (t.confirm_delete_selected || "Delete {n} selected annotation(s)? This cannot be undone.").replace("{n}", selectedNums.size);
  if (!confirm(msg)) return;
  var nums = [];
  selectedNums.forEach(function(n) { nums.push(n); });
  parent.postMessage({ pluginMessage: { type: "delete-selected-specs", nums: nums } }, "*");
}
