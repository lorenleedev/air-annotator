// AIR: AI-Readable Annotator v1
// Copyright (c) 2026 은결. All rights reserved.
// Make your design speak to AI
figma.showUI(__html__, { width: 420, height: 620, themeColors: true });

// 기본 컬러 (마커, 인덱스 등 테마 독립 요소용)
var CLR = {
  headerBg:   { r: 0.05, g: 0.55, b: 0.91 },
  white:      { r: 1, g: 1, b: 1 },
  text:       { r: 0.13, g: 0.13, b: 0.13 },
};

// ──────────────────────────────────────
// 테마 컬러 시스템
// ──────────────────────────────────────
var THEMES = {
  light: {
    panelBg:    { r: 1, g: 1, b: 1 },
    headerBorder: { r: 0.94, g: 0.94, b: 0.94 },
    title:      { r: 0.10, g: 0.10, b: 0.10 },
    subtitle:   { r: 0.60, g: 0.60, b: 0.60 },
    text:       { r: 0.22, g: 0.25, b: 0.32 },
    descBg:     { r: 0.98, g: 0.98, b: 0.98 },
    descText:   { r: 0.29, g: 0.33, b: 0.39 },
    divider:    { r: 0.95, g: 0.96, b: 0.96 },
    footer:     { r: 0.69, g: 0.69, b: 0.69 },
    warnText:   { r: 0.76, g: 0.25, b: 0.05 },
    shadow:     0.08,
    tags: {
      route: { bg: { r: 0.93, g: 0.95, b: 1.00 }, text: { r: 0.31, g: 0.27, b: 0.90 } },
      auth:  { bg: { r: 0.94, g: 0.99, b: 0.96 }, text: { r: 0.09, g: 0.64, b: 0.25 } },
      desc:  { bg: { r: 0.97, g: 0.98, b: 0.99 }, text: { r: 0.39, g: 0.46, b: 0.53 } },
      api:   { bg: { r: 0.94, g: 0.96, b: 1.00 }, text: { r: 0.15, g: 0.39, b: 0.92 } },
      warn:  { bg: { r: 1.00, g: 0.97, b: 0.93 }, text: { r: 0.92, g: 0.35, b: 0.05 } },
      memo:  { bg: { r: 0.96, g: 0.96, b: 0.96 }, text: { r: 0.45, g: 0.45, b: 0.45 } },
      ux:    { bg: { r: 0.99, g: 0.96, b: 1.00 }, text: { r: 0.66, g: 0.33, b: 0.95 } },
    }
  },
  dark: {
    panelBg:    { r: 0.12, g: 0.12, b: 0.12 },
    headerBorder: { r: 0.18, g: 0.18, b: 0.18 },
    title:      { r: 0.90, g: 0.90, b: 0.90 },
    subtitle:   { r: 0.44, g: 0.44, b: 0.44 },
    text:       { r: 0.82, g: 0.84, b: 0.86 },
    descBg:     { r: 0.15, g: 0.15, b: 0.15 },
    descText:   { r: 0.69, g: 0.69, b: 0.69 },
    divider:    { r: 0.18, g: 0.18, b: 0.18 },
    footer:     { r: 0.33, g: 0.33, b: 0.33 },
    warnText:   { r: 0.98, g: 0.57, b: 0.24 },
    shadow:     0.3,
    tags: {
      route: { bg: { r: 0.15, g: 0.15, b: 0.28 }, text: { r: 0.51, g: 0.55, b: 0.97 } },
      auth:  { bg: { r: 0.08, g: 0.20, b: 0.16 }, text: { r: 0.29, g: 0.87, b: 0.50 } },
      desc:  { bg: { r: 0.12, g: 0.16, b: 0.23 }, text: { r: 0.58, g: 0.64, b: 0.72 } },
      api:   { bg: { r: 0.09, g: 0.15, b: 0.33 }, text: { r: 0.38, g: 0.65, b: 0.98 } },
      warn:  { bg: { r: 0.23, g: 0.10, b: 0.03 }, text: { r: 0.98, g: 0.57, b: 0.24 } },
      memo:  { bg: { r: 0.15, g: 0.15, b: 0.15 }, text: { r: 0.64, g: 0.64, b: 0.64 } },
      ux:    { bg: { r: 0.18, g: 0.07, b: 0.22 }, text: { r: 0.75, g: 0.52, b: 0.99 } },
    }
  }
};

var currentTheme = "light";

function getTheme() { return THEMES[currentTheme] || THEMES.light; }

var PANEL_W = 360;
var PANEL_GAP = 60;

var fontLoaded = false;
var FONT_R, FONT_B;

async function loadFonts() {
  var families = ["Inter", "Roboto", "Arial"];
  for (var i = 0; i < families.length; i++) {
    try {
      await figma.loadFontAsync({ family: families[i], style: "Regular" });
      await figma.loadFontAsync({ family: families[i], style: "Bold" });
      FONT_R = { family: families[i], style: "Regular" };
      FONT_B = { family: families[i], style: "Bold" };
      fontLoaded = true;
      return;
    } catch(e) {}
  }
}

// 유틸
function txt(text, size, color, bold) {
  var t = figma.createText();
  t.fontName = bold ? FONT_B : FONT_R;
  t.characters = text || " ";
  t.fontSize = size || 11;
  if (color) t.fills = [{ type: "SOLID", color: color }];
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  return t;
}

function alFrame(name, dir, padding, gap) {
  var f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir || "VERTICAL";
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.paddingTop = padding || 0;
  f.paddingBottom = padding || 0;
  f.paddingLeft = padding || 0;
  f.paddingRight = padding || 0;
  f.itemSpacing = gap || 0;
  f.fills = [];
  return f;
}

function divider() {
  var th = getTheme();
  var d = figma.createFrame();
  d.name = "divider";
  d.resize(PANEL_W - 36, 1);
  d.fills = [{ type: "SOLID", color: th.divider }];
  d.layoutAlign = "STRETCH";
  return d;
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255
  };
}

// 태그 파싱
function parseTags(desc) {
  var result = { desc: [], route: [], auth: [], api: [], ux: [], warn: [], memo: [] };
  if (!desc) return result;
  var lines = desc.split("\n");
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    if (line.match(/^\[route\]/)) result.route.push(line.replace(/^\[route\]\s*/, ""));
    else if (line.match(/^\[auth\]/)) result.auth.push(line.replace(/^\[auth\]\s*/, ""));
    else if (line.match(/^\[api\]/)) result.api.push(line.replace(/^\[api\]\s*/, ""));
    else if (line.match(/^\[ux\]/)) result.ux.push(line.replace(/^\[ux\]\s*/, ""));
    else if (line.match(/^\[warn\]/)) result.warn.push(line.replace(/^\[warn\]\s*/, ""));
    else if (line.match(/^\[memo\]/)) result.memo.push(line.replace(/^\[memo\]\s*/, ""));
    else {
      var dm = line.match(/^\[desc\]\s*(.*)/);
      result.desc.push(dm ? dm[1] : line);
    }
  }
  return result;
}

// 레이어명 요약 생성
function makeSummary(desc) {
  if (!desc) return "";
  var parts = [];
  var lines = desc.split("\n");
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    var dm = line.match(/^\[desc\]\s*(.*)/);
    if (dm && parts.length === 0) { parts.push(dm[1].substring(0, 20)); }
    if (line.match(/^\[api\]/)) parts.push("api");
    if (line.match(/^\[ux\]/)) parts.push("ux");
  }
  return parts.length > 0 ? " | " + parts.join(" · ") : "";
}

// ──────────────────────────────────────
// 스펙 패널 생성
// ──────────────────────────────────────
function createSpecPanel(title, desc, num, targetNode, markerColor) {
  var parsed = parseTags(desc);
  var headerColor = markerColor || CLR.headerBg;
  var th = getTheme();

  // ── Panel container ──
  var panel = alFrame("📋 Annotation: " + num, "VERTICAL", 0, 0);
  panel.resize(PANEL_W, 10);
  panel.counterAxisSizingMode = "FIXED";
  panel.primaryAxisSizingMode = "AUTO";
  panel.fills = [{ type: "SOLID", color: th.panelBg }];
  panel.cornerRadius = 12;
  panel.itemSpacing = 0;
  panel.effects = [{
    type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: th.shadow },
    offset: { x: 0, y: 2 }, radius: 8, spread: 0, visible: true,
    blendMode: "NORMAL"
  }];

  // ── Header ──
  var header = alFrame("header", "HORIZONTAL", 0, 10);
  header.paddingTop = 14; header.paddingBottom = 12;
  header.paddingLeft = 18; header.paddingRight = 18;
  header.fills = [];
  header.layoutAlign = "STRETCH";
  header.primaryAxisSizingMode = "AUTO";
  header.counterAxisSizingMode = "AUTO";
  header.counterAxisAlignItems = "MIN";

  // Number badge — same style as marker badge
  var numBadge = alFrame("numBadge", "HORIZONTAL", 0, 0);
  numBadge.paddingTop = 2; numBadge.paddingBottom = 2;
  numBadge.paddingLeft = 6; numBadge.paddingRight = 6;
  numBadge.primaryAxisSizingMode = "AUTO";
  numBadge.counterAxisSizingMode = "AUTO";
  numBadge.primaryAxisAlignItems = "CENTER";
  numBadge.counterAxisAlignItems = "CENTER";
  numBadge.cornerRadius = 4;
  numBadge.fills = [{ type: "SOLID", color: headerColor }];
  var numText = txt(String(num), 9, { r: 1, g: 1, b: 1 }, true);
  numBadge.appendChild(numText);
  header.appendChild(numBadge);

  // Title column
  var titleCol = alFrame("titleCol", "VERTICAL", 0, 1);
  titleCol.primaryAxisSizingMode = "AUTO";
  titleCol.counterAxisSizingMode = "AUTO";
  var headerLabel = title || "Annotation";
  titleCol.appendChild(txt(headerLabel, 13, th.title, true));
  var nodeType = "";
  try { nodeType = targetNode.type || ""; } catch(e) {}
  titleCol.appendChild(txt(nodeType, 10, th.subtitle, false));
  header.appendChild(titleCol);
  panel.appendChild(header);

  // Header border
  var hBorder = figma.createFrame();
  hBorder.name = "headerBorder";
  hBorder.resize(PANEL_W, 1);
  hBorder.layoutAlign = "STRETCH";
  hBorder.fills = [{ type: "SOLID", color: th.headerBorder }];
  panel.appendChild(hBorder);

  // ── Body ──
  var body = alFrame("body", "VERTICAL", 0, 12);
  body.paddingTop = 14; body.paddingBottom = 10;
  body.paddingLeft = 18; body.paddingRight = 18;
  body.layoutAlign = "STRETCH";
  body.primaryAxisSizingMode = "AUTO";
  body.counterAxisSizingMode = "AUTO";

  // Description block
  if (parsed.desc.length > 0) {
    var descBlock = alFrame("descBlock", "VERTICAL", 0, 4);
    descBlock.paddingTop = 10; descBlock.paddingBottom = 10;
    descBlock.paddingLeft = 12; descBlock.paddingRight = 12;
    descBlock.cornerRadius = 8;
    descBlock.fills = [{ type: "SOLID", color: th.descBg }];
    descBlock.layoutAlign = "STRETCH";
    descBlock.counterAxisSizingMode = "AUTO";
    for (var di = 0; di < parsed.desc.length; di++) {
      var dt = txt(parsed.desc[di], 11.5, th.descText, false);
      dt.lineHeight = { value: 160, unit: "PERCENT" };
      dt.layoutAlign = "STRETCH";
      dt.textAutoResize = "HEIGHT";
      descBlock.appendChild(dt);
    }
    body.appendChild(descBlock);
  }

  // Tag row helper
  function tagRow(tagName, value, isWarn) {
    var row = alFrame("prop", "HORIZONTAL", 0, 8);
    row.layoutAlign = "STRETCH";
    row.counterAxisSizingMode = "AUTO";
    row.counterAxisAlignItems = "MIN";

    // Tag pill — same size as marker badge
    var tagColors = th.tags[tagName] || th.tags.memo;
    var pill = alFrame("tag", "HORIZONTAL", 0, 0);
    pill.paddingTop = 2; pill.paddingBottom = 2;
    pill.paddingLeft = 6; pill.paddingRight = 6;
    pill.cornerRadius = 4;
    pill.fills = [{ type: "SOLID", color: tagColors.bg }];
    pill.primaryAxisSizingMode = "AUTO";
    pill.counterAxisSizingMode = "AUTO";
    pill.primaryAxisAlignItems = "CENTER";
    pill.counterAxisAlignItems = "CENTER";
    var tagLabel = txt(tagName.toUpperCase(), 9, tagColors.text, true);
    tagLabel.letterSpacing = { value: 0.5, unit: "PIXELS" };
    pill.appendChild(tagLabel);
    row.appendChild(pill);

    // Value
    var valColor = isWarn ? th.warnText : th.text;
    var valText = txt(value, 11.5, valColor, false);
    valText.lineHeight = { value: 150, unit: "PERCENT" };
    valText.textAutoResize = "HEIGHT";
    valText.layoutGrow = 1;
    row.appendChild(valText);

    body.appendChild(row);
  }

  // Render properties in order
  var propOrder = [
    { key: "route", items: parsed.route },
    { key: "auth", items: parsed.auth },
    { key: "api", items: parsed.api },
    { key: "ux", items: parsed.ux },
  ];
  var warnOrder = [
    { key: "warn", items: parsed.warn },
    { key: "memo", items: parsed.memo },
  ];

  var hasProps = false;
  for (var pi = 0; pi < propOrder.length; pi++) {
    for (var pj = 0; pj < propOrder[pi].items.length; pj++) {
      tagRow(propOrder[pi].key, propOrder[pi].items[pj], false);
      hasProps = true;
    }
  }

  var hasWarn = false;
  for (var wi = 0; wi < warnOrder.length; wi++) {
    if (warnOrder[wi].items.length > 0) hasWarn = true;
  }

  if (hasProps && hasWarn) {
    body.appendChild(divider());
  }

  for (var wi = 0; wi < warnOrder.length; wi++) {
    var isW = warnOrder[wi].key === "warn";
    for (var wj = 0; wj < warnOrder[wi].items.length; wj++) {
      tagRow(warnOrder[wi].key, warnOrder[wi].items[wj], isW);
    }
  }

  panel.appendChild(body);

  // ── Footer ──
  var fBorder = figma.createFrame();
  fBorder.name = "footerBorder";
  fBorder.resize(PANEL_W, 1);
  fBorder.layoutAlign = "STRETCH";
  fBorder.fills = [{ type: "SOLID", color: th.divider }];
  panel.appendChild(fBorder);

  var footer = alFrame("footer", "HORIZONTAL", 0, 6);
  footer.paddingTop = 8; footer.paddingBottom = 10;
  footer.paddingLeft = 18; footer.paddingRight = 18;
  footer.layoutAlign = "STRETCH";
  footer.primaryAxisSizingMode = "AUTO";
  footer.counterAxisSizingMode = "AUTO";
  footer.counterAxisAlignItems = "CENTER";
  footer.appendChild(txt("AIR: AI-Readable Annotator · Do not edit directly", 9, th.footer, false));
  panel.appendChild(footer);

  // Position
  panel.x = targetNode.absoluteTransform[0][2] + targetNode.width + PANEL_GAP;
  panel.y = targetNode.absoluteTransform[1][2];

  return panel;
}

// ──────────────────────────────────────
// 넘버링
// ──────────────────────────────────────
function stripPrefix(name) {
  return name.replace(/^\[AIR-\d+\]\s*/, "").replace(/\s*\|.*$/, "");
}

function getNextNum() {
  // 캐시된 최대 번호 확인 (성능 최적화)
  var cached = parseInt(figma.currentPage.getPluginData("airMaxNum") || "0");
  var max = cached;
  // 캐시 이후 추가된 번호가 있는지 빠르게 확인
  var children = figma.currentPage.children;
  for (var i = 0; i < children.length; i++) {
    var m = children[i].name.match(/^\[AIR-(\d+)\]/) ||
            children[i].name.match(/^📋 Annotation: (\d+)/) ||
            children[i].name.match(/^📋 Spec: (\d+)/);
    if (m) { var n = parseInt(m[1]); if (n > max) max = n; }
  }
  // 캐시 갱신
  figma.currentPage.setPluginData("airMaxNum", String(max));
  return max + 1;
}

// ──────────────────────────────────────
// 기존 산출물 제거
// ──────────────────────────────────────
function removeExistingArtifacts(num) {
  var panelName = "📋 Annotation: " + num;
  var oldPanelName = "📋 Spec: " + num;  // 마이그레이션 호환
  var markerName = "🏷️ " + num;
  var dataName = "__specData_" + num + "__";

  var children = figma.currentPage.children;
  for (var i = children.length - 1; i >= 0; i--) {
    var n = children[i].name;
    if (n === panelName || n === oldPanelName || n === markerName || n === dataName) children[i].remove();
  }

  function removeDeep(node) {
    if (!("children" in node)) return;
    try {
      for (var i = node.children.length - 1; i >= 0; i--) {
        var cn = node.children[i].name;
        if (cn === markerName || cn === dataName) node.children[i].remove();
        else removeDeep(node.children[i]);
      }
    } catch(e) {}
  }
  for (var j = 0; j < figma.currentPage.children.length; j++) {
    removeDeep(figma.currentPage.children[j]);
  }
}

// ──────────────────────────────────────
// 숨김 텍스트 노드 (AI 읽기용)
// ──────────────────────────────────────
function createHiddenDataNode(num, title, desc, colorHex, targetNodeId) {
  var data = "[AIRA:" + num + "]\n";
  data += "title: " + (title || "") + "\n";
  data += "color: " + (colorHex || "") + "\n";
  data += "target: " + (targetNodeId || "") + "\n";
  data += "===\n";
  data += desc || "";

  var t = figma.createText();
  t.fontName = FONT_R;
  t.characters = data;
  t.fontSize = 1;
  t.name = "__specData_" + num + "__";
  t.visible = false;
  t.locked = true;
  figma.currentPage.appendChild(t);
  return t;
}

function readHiddenData(num) {
  var dataName = "__specData_" + num + "__";
  var children = figma.currentPage.children;
  for (var i = 0; i < children.length; i++) {
    if (children[i].name === dataName && children[i].type === "TEXT") {
      try {
        var raw = children[i].characters || "";
        var titleMatch = raw.match(/title:[ ]*(.*)/);
        var colorMatch = raw.match(/color:[ ]*(.*)/);
        var targetMatch = raw.match(/target:[ ]*(.*)/);
        var idx = raw.indexOf("===\n");
        var desc = idx >= 0 ? raw.substring(idx + 4) : "";
        return {
          title: titleMatch ? titleMatch[1].trim() : "",
          color: colorMatch ? colorMatch[1].trim() : "",
          target: targetMatch ? targetMatch[1].trim() : "",
          desc: desc.trim()
        };
      } catch(e) {}
    }
  }
  return null;
}

// ──────────────────────────────────────
// 📑 AI용 스펙 인덱스 (MCP 연동)
// ──────────────────────────────────────
var INDEX_NAME = "📑 AIR: AI-Readable Annotator Index";

function updateSpecIndex() {
  // 기존 인덱스 제거
  var children = figma.currentPage.children;
  for (var i = children.length - 1; i >= 0; i--) {
    if (children[i].name === INDEX_NAME) children[i].remove();
  }

  // 모든 스펙 수집
  var specs = [];
  var foundNums = {};

  // 1차: 숨김 데이터 노드에서
  for (var i = 0; i < figma.currentPage.children.length; i++) {
    var c = figma.currentPage.children[i];
    if (c.name.indexOf("__specData_") === 0 && c.type === "TEXT") {
      var nm = c.name.match(/__specData_(\d+)__/);
      if (!nm) continue;
      var num = nm[1];
      var data = readHiddenData(num);
      if (!data) continue;

      // 패널에서 targetNodeId 읽기
      var targetNodeId = data.target || "";
      var targetType = "";
      var targetName = "";
      if (!targetNodeId) {
        for (var j = 0; j < figma.currentPage.children.length; j++) {
          var p = figma.currentPage.children[j];
          if (p.name === "📋 Annotation: " + num || p.name === "📋 Spec: " + num) {
            try { targetNodeId = p.getPluginData("targetNodeId") || ""; } catch(e) {}
            break;
          }
        }
      }
      if (targetNodeId) {
        try {
          var tNode = figma.getNodeById(targetNodeId);
          if (tNode) {
            targetType = tNode.type;
            targetName = tNode.name;
          }
        } catch(e) {}
      }

      specs.push({
        num: parseInt(num),
        title: data.title,
        desc: data.desc,
        nodeId: targetNodeId,
        nodeType: targetType,
        nodeName: targetName
      });
      foundNums[num] = true;
    }
  }

  // 2차: 패널 pluginData 폴백
  for (var fi = 0; fi < figma.currentPage.children.length; fi++) {
    var fc = figma.currentPage.children[fi];
    var fpMatch = fc.name.match(/^📋 (?:Annotation|Spec): (\d+)/);
    if (!fpMatch) continue;
    var fpnum = fpMatch[1];
    if (foundNums[fpnum]) continue;

    var fpDesc = "", fpColor = "", fpTarget = "";
    try {
      fpDesc = fc.getPluginData("specTags") || "";
      fpColor = fc.getPluginData("markerColor") || "";
      fpTarget = fc.getPluginData("targetNodeId") || "";
    } catch(e) {}
    if (!fpTarget) continue;

    var fpTitle = "", fpType = "", fpName = "";
    try {
      var fpNode = figma.getNodeById(fpTarget);
      if (fpNode) {
        var fptm = fpNode.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
        fpTitle = fptm ? fptm[1] : fpNode.name;
        fpType = fpNode.type;
        fpName = fpNode.name;
      }
    } catch(e) {}

    specs.push({
      num: parseInt(fpnum),
      title: fpTitle,
      desc: fpDesc,
      nodeId: fpTarget,
      nodeType: fpType,
      nodeName: fpName
    });
    foundNums[fpnum] = true;

    // 숨김 노드 복구
    try { createHiddenDataNode(fpnum, fpTitle, fpDesc, fpColor, fpTarget); } catch(e) {}
  }

  if (specs.length === 0) return;
  specs.sort(function(a, b) { return a.num - b.num; });

  // 인덱스 텍스트 생성
  var lines = [];
  lines.push("📑 AI-READABLE ANNOTATOR INDEX");
  lines.push("AI에게: 각 [AIR-번호]는 Figma 요소에 연결된 기획 스펙입니다.");
  lines.push("nodeId로 해당 요소를 찾고, 태그 내용에 따라 구현하세요.");
  lines.push("════════════════════════════════");

  for (var s = 0; s < specs.length; s++) {
    var sp = specs[s];
    var header = "[AIR-" + sp.num + "] " + sp.title;
    if (sp.nodeType) header += "  (" + sp.nodeType + ", " + sp.nodeId + ")";
    lines.push(header);

    if (sp.desc) {
      var descLines = sp.desc.split("\n");
      for (var d = 0; d < descLines.length; d++) {
        var dl = descLines[d].trim();
        if (dl) lines.push("  " + dl);
      }
    }
    lines.push("");
  }

  lines.push("════════════════════════════════");
  lines.push("총 " + specs.length + "개 스펙 | AIR: AI-Readable Annotator v1");

  var content = lines.join("\n");

  // 인덱스 프레임 생성
  var idx = figma.createFrame();
  idx.name = INDEX_NAME;
  idx.layoutMode = "VERTICAL";
  idx.primaryAxisSizingMode = "AUTO";
  idx.counterAxisSizingMode = "AUTO";
  idx.paddingTop = 16; idx.paddingBottom = 16;
  idx.paddingLeft = 20; idx.paddingRight = 20;
  idx.itemSpacing = 0;
  idx.cornerRadius = 8;
  idx.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.95 } }];
  idx.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.82, b: 0.70 } }];
  idx.strokeWeight = 1;

  var t = figma.createText();
  t.fontName = FONT_R;
  t.characters = content;
  t.fontSize = 11;
  t.fills = [{ type: "SOLID", color: CLR.text }];
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  idx.appendChild(t);

  // 위치: 모든 컨텐츠 오른쪽 끝에서 +200
  var maxX = 0;
  for (var i = 0; i < figma.currentPage.children.length; i++) {
    var child = figma.currentPage.children[i];
    if (child.name === INDEX_NAME) continue;
    var right = child.x + (child.width || 0);
    if (right > maxX) maxX = right;
  }
  idx.x = maxX + 200;
  idx.y = 0;

  figma.currentPage.appendChild(idx);
}

// ──────────────────────────────────────
// 마커 뱃지
// ──────────────────────────────────────
function createMarkerBadge(num, targetNode, markerColor) {
  var color = markerColor || CLR.headerBg;
  var marker = alFrame("🏷️ " + num, "HORIZONTAL", 0, 0);
  marker.paddingTop = 2; marker.paddingBottom = 2;
  marker.paddingLeft = 6; marker.paddingRight = 6;
  marker.cornerRadius = 4;
  marker.fills = [{ type: "SOLID", color: color }];
  marker.appendChild(txt(String(num), 9, CLR.white, true));

  var canHaveChildren = ("children" in targetNode) &&
    (targetNode.type === "FRAME" || targetNode.type === "COMPONENT" ||
     targetNode.type === "COMPONENT_SET" || targetNode.type === "GROUP" ||
     targetNode.type === "SECTION");

  if (canHaveChildren) {
    try {
      targetNode.appendChild(marker);
      marker.layoutPositioning = "ABSOLUTE";
      marker.x = 4;
      marker.y = 4;
    } catch(e) {
      figma.currentPage.appendChild(marker);
      marker.x = targetNode.absoluteTransform[0][2];
      marker.y = targetNode.absoluteTransform[1][2] - 20;
    }
  } else {
    figma.currentPage.appendChild(marker);
    marker.x = targetNode.absoluteTransform[0][2];
    marker.y = targetNode.absoluteTransform[1][2] - 20;
  }

  marker.locked = true;
  return marker;
}

// ──────────────────────────────────────
// 스캔
// ──────────────────────────────────────
function scanLayers(node, depth) {
  if (depth > 5) return [];
  var results = [];
  if (!("children" in node)) return results;
  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    if (child.name.indexOf("📋 Annotation:") === 0) continue;
    if (child.name.indexOf("📋 Spec:") === 0) continue;  // 마이그레이션 호환
    if (child.name.indexOf("📑 AIR:") === 0) continue;   // 인덱스 프레임 필터
    if (child.name.indexOf("🏷️") === 0) continue;
    if (child.name.indexOf("__specData_") === 0) continue;
    if (child.type === "PAGE" || child.type === "DOCUMENT") continue;

    results.push({ id: child.id, name: child.name, type: child.type, depth: depth });
    if ("children" in child && child.type !== "INSTANCE") {
      try {
        var sub = scanLayers(child, depth + 1);
        for (var j = 0; j < sub.length; j++) results.push(sub[j]);
      } catch(e) {}
    }
  }
  return results;
}

// ──────────────────────────────────────
// 선택 읽기
// ──────────────────────────────────────
var _readingSelection = false;
function readSelectedDesc() {
  if (_readingSelection) return;
  var sel = figma.currentPage.selection;
  if (sel.length === 0) {
    figma.ui.postMessage({ type: "selection-empty" });
    return;
  }
  var node = sel[0];

  // ── 마커 선택 시 → 원본 노드로 이동 ──
  var markerMatch = node.name.match(/^🏷️ (\d+)/);
  if (markerMatch) {
    var num = markerMatch[1];
    var targetId = "";

    var hidden = readHiddenData(num);
    if (hidden && hidden.target) targetId = hidden.target;

    if (targetId) {
      var targetNode = figma.getNodeById(targetId);
      if (targetNode) {
        _readingSelection = true;
        figma.currentPage.selection = [targetNode];
        figma.viewport.scrollAndZoomIntoView([targetNode]);
        _readingSelection = false;
        return;
      }
    }
  }

  // ── 일반 노드 처리 ──
  var num = "";
  var pm = node.name.match(/^\[AIR-(\d+)\]/);
  if (pm) num = pm[1];

  var title = "", desc = "", color = "";
  if (num) {
    var hidden = readHiddenData(num);
    if (hidden) {
      title = hidden.title;
      desc = hidden.desc;
      color = hidden.color;
    } else {
      var panelName = "📋 Annotation: " + num;
      var oldPanelName = "📋 Spec: " + num;
      for (var i = 0; i < figma.currentPage.children.length; i++) {
        var cin = figma.currentPage.children[i].name;
        if (cin === panelName || cin === oldPanelName) {
          try {
            desc = figma.currentPage.children[i].getPluginData("specTags") || "";
            color = figma.currentPage.children[i].getPluginData("markerColor") || "";
          } catch(e) {}
          break;
        }
      }
    }
  }

  figma.ui.postMessage({
    type: "selection-desc",
    nodeId: node.id, nodeName: node.name, nodeType: node.type,
    title: title, desc: desc, color: color
  });
}

// ──────────────────────────────────────
// 쓰기
// ──────────────────────────────────────
function writeSpec(nodeId, title, desc, num, colorHex) {
  var node = figma.getNodeById(nodeId);
  if (!node) return { ok: false, error: "노드를 찾을 수 없습니다." };
  var markerColor = colorHex ? hexToRgb(colorHex) : CLR.headerBg;

  try {
    if (num) {
      var cleanName = stripPrefix(node.name);
      var summary = makeSummary(desc);
      var displayTitle = title || cleanName;
      node.name = "[AIR-" + num + "] " + displayTitle + summary;
    } else {
      var em = node.name.match(/^\[AIR-(\d+)\]/);
      if (em) num = em[1];
    }
    if (!num) return { ok: false, error: "번호가 없습니다." };

    // 기존 패널 위치 저장
    var existingPos = null;
    var panelName = "📋 Annotation: " + num;
    var oldPanelName = "📋 Spec: " + num;  // 마이그레이션 호환
    for (var pi = 0; pi < figma.currentPage.children.length; pi++) {
      var pn = figma.currentPage.children[pi].name;
      if (pn === panelName || pn === oldPanelName) {
        existingPos = {
          x: figma.currentPage.children[pi].x,
          y: figma.currentPage.children[pi].y
        };
        break;
      }
    }

    removeExistingArtifacts(num);
    if (!desc || !desc.trim()) return { ok: true };

    var panel = createSpecPanel(title, desc, num, node, markerColor);
    figma.currentPage.appendChild(panel);

    // 기존 위치가 있으면 복원
    if (existingPos) {
      panel.x = existingPos.x;
      panel.y = existingPos.y;
    }
    createMarkerBadge(num, node, markerColor);
    createHiddenDataNode(num, title, desc, colorHex, nodeId);

    panel.setPluginData("specTags", desc);
    panel.setPluginData("targetNodeId", nodeId);
    panel.setPluginData("markerColor", colorHex || "");
    // 패널은 이동 가능, 내부 텍스트는 편집 불가
    for (var ci = 0; ci < panel.children.length; ci++) {
      panel.children[ci].locked = true;
    }

    return { ok: true };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ──────────────────────────────────────
// 일괄
// ──────────────────────────────────────
function applyBatch(mappings) {
  var success = 0, fail = 0, errors = [];
  var nextNum = getNextNum();
  for (var i = 0; i < mappings.length; i++) {
    var m = mappings[i];
    var num = nextNum + i;
    var result = writeSpec(m.nodeId, m.title || "", m.description, String(num), m.color || "");
    if (result.ok) success++;
    else { fail++; errors.push(result.error); }
  }
  return { success: success, fail: fail, errors: errors };
}

// ──────────────────────────────────────
// 이벤트
// ──────────────────────────────────────
figma.on("selectionchange", function() { readSelectedDesc(); });
figma.on("currentpagechange", function() {
  readSelectedDesc();
  figma.ui.postMessage({ type: "page-changed" });
});

figma.ui.onmessage = async function(msg) {
  if (msg.type === "init") {
    await loadFonts();
    if (!fontLoaded) {
      figma.notify("❌ 폰트를 로드할 수 없습니다.", { error: true });
      return;
    }
    // Restore saved theme
    var savedTheme = figma.root.getPluginData("airTheme");
    if (savedTheme === "light" || savedTheme === "dark") currentTheme = savedTheme;
    figma.ui.postMessage({ type: "init-done", fileKey: figma.fileKey || "", theme: currentTheme });
    readSelectedDesc();
  }

  if (msg.type === "rebuild-all-panels") {
    if (msg.theme) {
      currentTheme = msg.theme;
      figma.root.setPluginData("airTheme", currentTheme);
    }
    var rebuilt = 0;
    var children = figma.currentPage.children;
    // Collect all spec data first
    var allSpecs = [];
    var foundNums = {};
    // 1차: 숨김 데이터 노드에서
    for (var ri = 0; ri < children.length; ri++) {
      var rc = children[ri];
      if (rc.name.indexOf("__specData_") === 0 && rc.type === "TEXT") {
        var rm = rc.name.match(/__specData_(\d+)__/);
        if (!rm) continue;
        var rnum = rm[1];
        var rdata = readHiddenData(rnum);
        if (rdata) { allSpecs.push({ num: rnum, data: rdata }); foundNums[rnum] = true; }
      }
    }
    // 2차: 패널 pluginData 폴백
    for (var rk = 0; rk < children.length; rk++) {
      var rck = children[rk];
      var rpMatch = rck.name.match(/^📋 (?:Annotation|Spec): (\d+)/);
      if (!rpMatch) continue;
      var rpnum = rpMatch[1];
      if (foundNums[rpnum]) continue;
      var rpDesc = "", rpColor = "", rpTarget = "";
      try {
        rpDesc = rck.getPluginData("specTags") || "";
        rpColor = rck.getPluginData("markerColor") || "";
        rpTarget = rck.getPluginData("targetNodeId") || "";
      } catch(e) {}
      if (rpTarget) {
        var rpTitle = "";
        try {
          var rpNode = figma.getNodeById(rpTarget);
          if (rpNode) {
            var rptm = rpNode.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
            rpTitle = rptm ? rptm[1] : rpNode.name;
          }
        } catch(e) {}
        allSpecs.push({ num: rpnum, data: { title: rpTitle, desc: rpDesc, color: rpColor, target: rpTarget } });
        foundNums[rpnum] = true;
        try { createHiddenDataNode(rpnum, rpTitle, rpDesc, rpColor, rpTarget); } catch(e) {}
      }
    }
    // Rebuild each panel
    for (var si = 0; si < allSpecs.length; si++) {
      var spec = allSpecs[si];
      var targetId = spec.data.target;
      if (!targetId) continue;
      var tNode = null;
      try { tNode = figma.getNodeById(targetId); } catch(e) {}
      if (!tNode) continue;

      // Save existing panel position (check both old and new name)
      var panelName = "📋 Annotation: " + spec.num;
      var oldPanelName = "📋 Spec: " + spec.num;
      var existPos = null;
      for (var pi = 0; pi < figma.currentPage.children.length; pi++) {
        var pn = figma.currentPage.children[pi].name;
        if (pn === panelName || pn === oldPanelName) {
          existPos = { x: figma.currentPage.children[pi].x, y: figma.currentPage.children[pi].y };
          break;
        }
      }

      // Remove old panel only (keep data node, keep marker) — both names
      for (var di = figma.currentPage.children.length - 1; di >= 0; di--) {
        var dn = figma.currentPage.children[di].name;
        if (dn === panelName || dn === oldPanelName) {
          figma.currentPage.children[di].remove();
        }
      }

      // Create new panel with current theme
      var mColor = spec.data.color ? hexToRgb(spec.data.color) : CLR.headerBg;
      var newPanel = createSpecPanel(spec.data.title, spec.data.desc, spec.num, tNode, mColor);
      figma.currentPage.appendChild(newPanel);
      if (existPos) { newPanel.x = existPos.x; newPanel.y = existPos.y; }
      newPanel.setPluginData("specTags", spec.data.desc);
      newPanel.setPluginData("targetNodeId", targetId);
      newPanel.setPluginData("markerColor", spec.data.color || "");
      for (var ci = 0; ci < newPanel.children.length; ci++) {
        newPanel.children[ci].locked = true;
      }
      rebuilt++;
    }
    var themeLabel = currentTheme === "dark" ? "Dark" : "Light";
    figma.notify("🎨 " + themeLabel + " theme applied to " + rebuilt + " panel(s)");
    figma.ui.postMessage({ type: "rebuild-done" });
  }

  if (msg.type === "scan-layers") {
    figma.ui.postMessage({ type: "layers-scanned", layers: scanLayers(figma.currentPage, 0) });
  }

  if (msg.type === "read-selection") { readSelectedDesc(); }

  if (msg.type === "list-specs") {
    var specs = [];
    var foundNums = {};
    var children = figma.currentPage.children;

    // 1차: 숨김 데이터 노드에서 스캔 (기존 방식)
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c.name.indexOf("__specData_") === 0 && c.type === "TEXT") {
        var numMatch = c.name.match(/__specData_(\d+)__/);
        if (!numMatch) continue;
        var num = numMatch[1];
        var data = readHiddenData(num);
        var targetId = (data && data.target) ? data.target : "";
        if (!targetId) {
          for (var j = 0; j < children.length; j++) {
            var cjn = children[j].name;
            if (cjn === "📋 Annotation: " + num || cjn === "📋 Spec: " + num) {
              try { targetId = children[j].getPluginData("targetNodeId") || ""; } catch(e) {}
              break;
            }
          }
        }
        specs.push({
          num: num,
          title: data ? data.title : "",
          color: data ? data.color : "",
          desc: data ? data.desc : "",
          targetNodeId: targetId,
          preview: data && data.desc ? data.desc.split("\n").slice(0, 2).join(" ") : ""
        });
        foundNums[num] = true;
      }
    }

    // 2차: 패널 pluginData에서 폴백 스캔 (숨김 노드가 사라진 경우)
    for (var k = 0; k < children.length; k++) {
      var ck = children[k];
      var panelMatch = ck.name.match(/^📋 (?:Annotation|Spec): (\d+)/);
      if (!panelMatch) continue;
      var pnum = panelMatch[1];
      if (foundNums[pnum]) continue;

      var pDesc = "", pColor = "", pTargetId = "";
      try {
        pDesc = ck.getPluginData("specTags") || "";
        pColor = ck.getPluginData("markerColor") || "";
        pTargetId = ck.getPluginData("targetNodeId") || "";
      } catch(e) {}

      var pTitle = "";
      if (pTargetId) {
        try {
          var tNode = figma.getNodeById(pTargetId);
          if (tNode) {
            var tm = tNode.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
            pTitle = tm ? tm[1] : tNode.name;
          }
        } catch(e) {}
      }

      specs.push({
        num: pnum,
        title: pTitle,
        color: pColor,
        desc: pDesc,
        targetNodeId: pTargetId,
        preview: pDesc ? pDesc.split("\n").slice(0, 2).join(" ") : ""
      });
      foundNums[pnum] = true;

      // 숨김 노드 복구
      if (pDesc && pTargetId) {
        try { createHiddenDataNode(pnum, pTitle, pDesc, pColor, pTargetId); } catch(e) {}
      }
    }
    // 번호순 정렬
    specs.sort(function(a, b) { return parseInt(a.num) - parseInt(b.num); });
    figma.ui.postMessage({ type: "specs-listed", specs: specs });
  }

  if (msg.type === "write-desc") {
    if (msg.theme) {
      currentTheme = msg.theme;
      figma.root.setPluginData("airTheme", currentTheme);
    }
    var node = figma.getNodeById(msg.nodeId);
    var existingNum = null;
    if (node) {
      var pm = node.name.match(/^\[AIR-(\d+)\]/);
      if (pm) existingNum = pm[1];
    }
    if (!existingNum) existingNum = String(getNextNum());

    var result = writeSpec(msg.nodeId, msg.title || "", msg.desc, existingNum, msg.color || "");
    if (result.ok) {
      figma.notify("✅ [AIR-" + existingNum + "] " + (msg.title || "저장 완료"));
      updateSpecIndex();
      figma.ui.postMessage({ type: "write-success", nodeId: msg.nodeId });
      readSelectedDesc();
    } else {
      figma.notify("❌ " + result.error, { error: true });
    }
  }

  if (msg.type === "apply-batch") {
    var result = applyBatch(msg.mappings);
    var notice = "✅ " + result.success + "개 저장 완료";
    if (result.fail > 0) notice += " / " + result.fail + "개 실패";
    figma.notify(notice);
    updateSpecIndex();
    figma.ui.postMessage({ type: "batch-done", result: result });
    figma.ui.postMessage({ type: "layers-scanned", layers: scanLayers(figma.currentPage, 0) });
  }

  if (msg.type === "select-node") {
    var node = figma.getNodeById(msg.nodeId);
    if (node) {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  }

  if (msg.type === "delete-spec") {
    // msg.nodeId = 어노테이션이 달린 원래 노드 ID
    // msg.num = 번호 (선택사항, nodeId에서도 추출 가능)
    var node = msg.nodeId ? figma.getNodeById(msg.nodeId) : null;
    var num = msg.num || null;

    // 노드에서 번호 추출
    if (!num && node) {
      var pm = node.name.match(/^\[AIR-(\d+)\]/);
      if (pm) num = pm[1];
    }

    if (!num) {
      figma.notify("❌ 삭제할 어노테이션을 찾을 수 없습니다.", { error: true });
      return;
    }

    // 패널 + 마커 + 데이터 노드 제거
    removeExistingArtifacts(num);

    // 노드 이름에서 [AIR-N] 접두사 제거
    if (node) {
      node.name = stripPrefix(node.name);
    }

    updateSpecIndex();
    figma.notify("🗑️ [AIR-" + num + "] 어노테이션 삭제 완료");
    figma.ui.postMessage({ type: "delete-done", num: num });
    readSelectedDesc();
  }

  if (msg.type === "rebuild-index") {
    updateSpecIndex();
    figma.notify("📑 AI용 스펙 인덱스를 최신 상태로 갱신했어요");
  }

  if (msg.type === "cancel") { figma.closePlugin(); }
};
