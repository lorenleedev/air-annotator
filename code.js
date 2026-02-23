"use strict";
(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/code.ts
  if (figma.command === "edit") {
    const sel = figma.currentPage.selection;
    if (sel.length > 0) {
      const n = sel[0];
      let targetId = "";
      const panelMatch = n.name.match(/^📋 (?:Annotation|Spec): (\d+)/);
      if (panelMatch) {
        try {
          targetId = n.getPluginData("targetNodeId") || "";
        } catch (e) {
        }
        if (!targetId) {
          const hd = readHiddenData(panelMatch[1]);
          if (hd && hd.target) targetId = hd.target;
        }
      }
      if (!targetId) {
        const markerMatch = n.name.match(/^🏷️ (\d+)/);
        if (markerMatch) {
          const hd = readHiddenData(markerMatch[1]);
          if (hd && hd.target) targetId = hd.target;
        }
      }
      if (targetId) {
        (function() {
          return __async(this, null, function* () {
            const targetNode = yield figma.getNodeByIdAsync(targetId);
            if (targetNode) {
              figma.currentPage.selection = [targetNode];
              figma.viewport.scrollAndZoomIntoView([targetNode]);
            }
          });
        })();
      }
    }
  }
  figma.showUI(__html__, { width: 420, height: 620, themeColors: true });
  var CLR = {
    headerBg: { r: 0.05, g: 0.55, b: 0.91 },
    white: { r: 1, g: 1, b: 1 },
    text: { r: 0.13, g: 0.13, b: 0.13 }
  };
  var THEMES = {
    light: {
      panelBg: { r: 1, g: 1, b: 1 },
      headerBorder: { r: 0.94, g: 0.94, b: 0.94 },
      title: { r: 0.1, g: 0.1, b: 0.1 },
      subtitle: { r: 0.6, g: 0.6, b: 0.6 },
      text: { r: 0.22, g: 0.25, b: 0.32 },
      descBg: { r: 0.98, g: 0.98, b: 0.98 },
      descText: { r: 0.29, g: 0.33, b: 0.39 },
      divider: { r: 0.95, g: 0.96, b: 0.96 },
      footer: { r: 0.69, g: 0.69, b: 0.69 },
      warnText: { r: 0.76, g: 0.25, b: 0.05 },
      shadow: 0.08,
      tags: {
        route: { bg: { r: 0.93, g: 0.95, b: 1 }, text: { r: 0.31, g: 0.27, b: 0.9 } },
        auth: { bg: { r: 0.94, g: 0.99, b: 0.96 }, text: { r: 0.09, g: 0.64, b: 0.25 } },
        desc: { bg: { r: 0.97, g: 0.98, b: 0.99 }, text: { r: 0.39, g: 0.46, b: 0.53 } },
        api: { bg: { r: 0.94, g: 0.96, b: 1 }, text: { r: 0.15, g: 0.39, b: 0.92 } },
        warn: { bg: { r: 1, g: 0.97, b: 0.93 }, text: { r: 0.92, g: 0.35, b: 0.05 } },
        memo: { bg: { r: 0.96, g: 0.96, b: 0.96 }, text: { r: 0.45, g: 0.45, b: 0.45 } },
        ux: { bg: { r: 0.99, g: 0.96, b: 1 }, text: { r: 0.66, g: 0.33, b: 0.95 } },
        sub: { bg: { r: 0.94, g: 0.97, b: 0.94 }, text: { r: 0.18, g: 0.54, b: 0.34 } }
      }
    },
    dark: {
      panelBg: { r: 0.12, g: 0.12, b: 0.12 },
      headerBorder: { r: 0.18, g: 0.18, b: 0.18 },
      title: { r: 0.9, g: 0.9, b: 0.9 },
      subtitle: { r: 0.44, g: 0.44, b: 0.44 },
      text: { r: 0.82, g: 0.84, b: 0.86 },
      descBg: { r: 0.15, g: 0.15, b: 0.15 },
      descText: { r: 0.69, g: 0.69, b: 0.69 },
      divider: { r: 0.18, g: 0.18, b: 0.18 },
      footer: { r: 0.33, g: 0.33, b: 0.33 },
      warnText: { r: 0.98, g: 0.57, b: 0.24 },
      shadow: 0.3,
      tags: {
        route: { bg: { r: 0.15, g: 0.15, b: 0.28 }, text: { r: 0.51, g: 0.55, b: 0.97 } },
        auth: { bg: { r: 0.08, g: 0.2, b: 0.16 }, text: { r: 0.29, g: 0.87, b: 0.5 } },
        desc: { bg: { r: 0.12, g: 0.16, b: 0.23 }, text: { r: 0.58, g: 0.64, b: 0.72 } },
        api: { bg: { r: 0.09, g: 0.15, b: 0.33 }, text: { r: 0.38, g: 0.65, b: 0.98 } },
        warn: { bg: { r: 0.23, g: 0.1, b: 0.03 }, text: { r: 0.98, g: 0.57, b: 0.24 } },
        memo: { bg: { r: 0.15, g: 0.15, b: 0.15 }, text: { r: 0.64, g: 0.64, b: 0.64 } },
        ux: { bg: { r: 0.18, g: 0.07, b: 0.22 }, text: { r: 0.75, g: 0.52, b: 0.99 } },
        sub: { bg: { r: 0.1, g: 0.18, b: 0.12 }, text: { r: 0.45, g: 0.82, b: 0.55 } }
      }
    }
  };
  var currentTheme = "light";
  function getTheme() {
    return THEMES[currentTheme] || THEMES.light;
  }
  var PANEL_W = 360;
  var PANEL_GAP = 60;
  var fontLoaded = false;
  var FONT_R;
  var FONT_B;
  function loadFonts() {
    return __async(this, null, function* () {
      const families = ["Inter", "Roboto", "Arial"];
      for (let i = 0; i < families.length; i++) {
        try {
          yield figma.loadFontAsync({ family: families[i], style: "Regular" });
          yield figma.loadFontAsync({ family: families[i], style: "Bold" });
          FONT_R = { family: families[i], style: "Regular" };
          FONT_B = { family: families[i], style: "Bold" };
          fontLoaded = true;
          return;
        } catch (e) {
        }
      }
    });
  }
  function txt(text, size, color, bold) {
    const t = figma.createText();
    if (bold) {
      if (!FONT_B) throw new Error("Bold font not loaded");
      t.fontName = FONT_B;
    } else {
      if (!FONT_R) throw new Error("Regular font not loaded");
      t.fontName = FONT_R;
    }
    t.characters = text || " ";
    t.fontSize = size || 11;
    if (color) t.fills = [{ type: "SOLID", color }];
    t.textAutoResize = "WIDTH_AND_HEIGHT";
    return t;
  }
  function alFrame(name, dir, padding, gap) {
    const f = figma.createFrame();
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
    const th = getTheme();
    const d = figma.createFrame();
    d.name = "divider";
    d.resize(PANEL_W - 36, 1);
    d.fills = [{ type: "SOLID", color: th.divider }];
    d.layoutAlign = "STRETCH";
    return d;
  }
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    return {
      r: parseInt(hex.substring(0, 2), 16) / 255,
      g: parseInt(hex.substring(2, 4), 16) / 255,
      b: parseInt(hex.substring(4, 6), 16) / 255
    };
  }
  function parseTags(desc) {
    const result = { desc: [], route: [], auth: [], api: [], ux: [], warn: [], memo: [], sub: [] };
    if (!desc) return result;
    const lines = desc.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line.match(/^\[route\]/)) result.route.push(line.replace(/^\[route\]\s*/, ""));
      else if (line.match(/^\[auth\]/)) result.auth.push(line.replace(/^\[auth\]\s*/, ""));
      else if (line.match(/^\[api\]/)) result.api.push(line.replace(/^\[api\]\s*/, ""));
      else if (line.match(/^\[ux\]/)) result.ux.push(line.replace(/^\[ux\]\s*/, ""));
      else if (line.match(/^\[warn\]/)) result.warn.push(line.replace(/^\[warn\]\s*/, ""));
      else if (line.match(/^\[memo\]/)) result.memo.push(line.replace(/^\[memo\]\s*/, ""));
      else if (line.match(/^\[sub\]/)) result.sub.push(line.replace(/^\[sub\]\s*/, ""));
      else {
        const dm = line.match(/^\[desc\]\s*(.*)/);
        result.desc.push(dm ? dm[1] : line);
      }
    }
    return result;
  }
  function makeSummary(desc) {
    if (!desc) return "";
    const parts = [];
    const lines = desc.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const dm = line.match(/^\[desc\]\s*(.*)/);
      if (dm && parts.length === 0) {
        parts.push(dm[1].substring(0, 20));
      }
      if (line.match(/^\[api\]/)) parts.push("api");
      if (line.match(/^\[ux\]/)) parts.push("ux");
    }
    return parts.length > 0 ? " | " + parts.join(" · ") : "";
  }
  function createSpecPanel(title, desc, num, targetNode, markerColor) {
    const parsed = parseTags(desc);
    const headerColor = markerColor || CLR.headerBg;
    const th = getTheme();
    const panel = alFrame("📋 Annotation: " + num, "VERTICAL", 0, 0);
    panel.resize(PANEL_W, 10);
    panel.counterAxisSizingMode = "FIXED";
    panel.primaryAxisSizingMode = "AUTO";
    panel.fills = [{ type: "SOLID", color: th.panelBg }];
    panel.cornerRadius = 12;
    panel.itemSpacing = 0;
    panel.effects = [{
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: th.shadow },
      offset: { x: 0, y: 2 },
      radius: 8,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    }];
    const header = alFrame("header", "HORIZONTAL", 0, 10);
    header.paddingTop = 14;
    header.paddingBottom = 12;
    header.paddingLeft = 18;
    header.paddingRight = 18;
    header.fills = [];
    header.layoutAlign = "STRETCH";
    header.primaryAxisSizingMode = "AUTO";
    header.counterAxisSizingMode = "AUTO";
    header.counterAxisAlignItems = "MIN";
    const numBadge = alFrame("numBadge", "HORIZONTAL", 0, 0);
    numBadge.paddingTop = 2;
    numBadge.paddingBottom = 2;
    numBadge.paddingLeft = 6;
    numBadge.paddingRight = 6;
    numBadge.primaryAxisSizingMode = "AUTO";
    numBadge.counterAxisSizingMode = "AUTO";
    numBadge.primaryAxisAlignItems = "CENTER";
    numBadge.counterAxisAlignItems = "CENTER";
    numBadge.cornerRadius = 4;
    numBadge.fills = [{ type: "SOLID", color: headerColor }];
    const numText = txt(String(num), 9, { r: 1, g: 1, b: 1 }, true);
    numBadge.appendChild(numText);
    header.appendChild(numBadge);
    const titleCol = alFrame("titleCol", "VERTICAL", 0, 1);
    titleCol.primaryAxisSizingMode = "AUTO";
    titleCol.counterAxisSizingMode = "AUTO";
    const headerLabel = title || "Annotation";
    titleCol.appendChild(txt(headerLabel, 13, th.title, true));
    const now = /* @__PURE__ */ new Date();
    const pad = function(n) {
      return n < 10 ? "0" + n : String(n);
    };
    const updatedAt = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    const userName = figma.currentUser ? figma.currentUser.name : "";
    const subtitleText = userName ? updatedAt + " · " + userName : updatedAt;
    titleCol.appendChild(txt(subtitleText, 10, th.subtitle, false));
    header.appendChild(titleCol);
    panel.appendChild(header);
    const hBorder = figma.createFrame();
    hBorder.name = "headerBorder";
    hBorder.resize(PANEL_W, 1);
    hBorder.layoutAlign = "STRETCH";
    hBorder.fills = [{ type: "SOLID", color: th.headerBorder }];
    panel.appendChild(hBorder);
    const body = alFrame("body", "VERTICAL", 0, 12);
    body.paddingTop = 14;
    body.paddingBottom = 10;
    body.paddingLeft = 18;
    body.paddingRight = 18;
    body.layoutAlign = "STRETCH";
    body.primaryAxisSizingMode = "AUTO";
    body.counterAxisSizingMode = "AUTO";
    if (parsed.desc.length > 0) {
      const descBlock = alFrame("descBlock", "VERTICAL", 0, 4);
      descBlock.paddingTop = 10;
      descBlock.paddingBottom = 10;
      descBlock.paddingLeft = 12;
      descBlock.paddingRight = 12;
      descBlock.cornerRadius = 8;
      descBlock.fills = [{ type: "SOLID", color: th.descBg }];
      descBlock.layoutAlign = "STRETCH";
      descBlock.counterAxisSizingMode = "AUTO";
      for (let di = 0; di < parsed.desc.length; di++) {
        const dt = txt(parsed.desc[di], 11.5, th.descText, false);
        dt.lineHeight = { value: 160, unit: "PERCENT" };
        dt.layoutAlign = "STRETCH";
        dt.textAutoResize = "HEIGHT";
        descBlock.appendChild(dt);
      }
      body.appendChild(descBlock);
    }
    function tagRow(tagName, value, isWarn) {
      const row = alFrame("prop", "HORIZONTAL", 0, 8);
      row.layoutAlign = "STRETCH";
      row.counterAxisSizingMode = "AUTO";
      row.counterAxisAlignItems = "MIN";
      const tagColors = th.tags[tagName] || th.tags.memo;
      const pill = alFrame("tag", "HORIZONTAL", 0, 0);
      pill.paddingTop = 2;
      pill.paddingBottom = 2;
      pill.paddingLeft = 6;
      pill.paddingRight = 6;
      pill.cornerRadius = 4;
      pill.fills = [{ type: "SOLID", color: tagColors.bg }];
      pill.primaryAxisSizingMode = "AUTO";
      pill.counterAxisSizingMode = "AUTO";
      pill.primaryAxisAlignItems = "CENTER";
      pill.counterAxisAlignItems = "CENTER";
      const tagLabel = txt(tagName.toUpperCase(), 9, tagColors.text, true);
      tagLabel.letterSpacing = { value: 0.5, unit: "PIXELS" };
      pill.appendChild(tagLabel);
      row.appendChild(pill);
      const valColor = isWarn ? th.warnText : th.text;
      const valText = txt(value, 11.5, valColor, false);
      valText.lineHeight = { value: 150, unit: "PERCENT" };
      valText.textAutoResize = "HEIGHT";
      valText.layoutGrow = 1;
      row.appendChild(valText);
      body.appendChild(row);
    }
    const propOrder = [
      { key: "route", items: parsed.route },
      { key: "auth", items: parsed.auth },
      { key: "api", items: parsed.api },
      { key: "ux", items: parsed.ux }
    ];
    const warnOrder = [
      { key: "warn", items: parsed.warn },
      { key: "memo", items: parsed.memo }
    ];
    let hasProps = false;
    for (let pi = 0; pi < propOrder.length; pi++) {
      for (let pj = 0; pj < propOrder[pi].items.length; pj++) {
        tagRow(propOrder[pi].key, propOrder[pi].items[pj], false);
        hasProps = true;
      }
    }
    for (let si = 0; si < parsed.sub.length; si++) {
      const letter = String.fromCharCode(97 + si);
      tagRow("sub", letter + ") " + parsed.sub[si], false);
      hasProps = true;
    }
    let hasWarn = false;
    for (let wi = 0; wi < warnOrder.length; wi++) {
      if (warnOrder[wi].items.length > 0) hasWarn = true;
    }
    if (hasProps && hasWarn) {
      body.appendChild(divider());
    }
    for (let wi = 0; wi < warnOrder.length; wi++) {
      const isW = warnOrder[wi].key === "warn";
      for (let wj = 0; wj < warnOrder[wi].items.length; wj++) {
        tagRow(warnOrder[wi].key, warnOrder[wi].items[wj], isW);
      }
    }
    panel.appendChild(body);
    const fBorder = figma.createFrame();
    fBorder.name = "footerBorder";
    fBorder.resize(PANEL_W, 1);
    fBorder.layoutAlign = "STRETCH";
    fBorder.fills = [{ type: "SOLID", color: th.divider }];
    panel.appendChild(fBorder);
    const footer = alFrame("footer", "HORIZONTAL", 0, 6);
    footer.paddingTop = 8;
    footer.paddingBottom = 10;
    footer.paddingLeft = 18;
    footer.paddingRight = 18;
    footer.layoutAlign = "STRETCH";
    footer.primaryAxisSizingMode = "AUTO";
    footer.counterAxisSizingMode = "AUTO";
    footer.counterAxisAlignItems = "CENTER";
    footer.appendChild(txt("Click this panel → Edit Annotation (bottom of Inspector)", 9, th.footer, false));
    panel.appendChild(footer);
    panel.x = targetNode.absoluteTransform[0][2] + targetNode.width + PANEL_GAP;
    panel.y = targetNode.absoluteTransform[1][2];
    return panel;
  }
  function stripPrefix(name) {
    return name.replace(/^\[AIR-\d+\]\s*/, "").replace(/\s*\|.*$/, "");
  }
  function getNextNum() {
    const cached = figma.currentPage.getPluginData("airMaxNum") || "";
    if (cached && parseInt(cached) > 0) {
      const next = parseInt(cached) + 1;
      figma.currentPage.setPluginData("airMaxNum", String(next));
      return next;
    }
    let max = 0;
    const children = figma.currentPage.children;
    for (let i = 0; i < children.length; i++) {
      const m = children[i].name.match(/^\[AIR-(\d+)\]/) || children[i].name.match(/^📋 Annotation: (\d+)/) || children[i].name.match(/^📋 Spec: (\d+)/);
      if (m) {
        const n = parseInt(m[1]);
        if (n > max) max = n;
      }
    }
    figma.currentPage.setPluginData("airMaxNum", String(max + 1));
    return max + 1;
  }
  function removeExistingArtifacts(num) {
    return __async(this, null, function* () {
      const panelName = "📋 Annotation: " + num;
      const oldPanelName = "📋 Spec: " + num;
      const markerName = "🏷️ " + num;
      const dataName = "__specData_" + num + "__";
      let targetNodeId = "";
      const children = figma.currentPage.children;
      for (let i = children.length - 1; i >= 0; i--) {
        const c = children[i];
        const n = c.name;
        if (n === panelName || n === oldPanelName) {
          try {
            targetNodeId = c.getPluginData("targetNodeId") || "";
          } catch (e) {
          }
          c.remove();
        } else if (n === markerName || n === dataName) {
          c.remove();
        }
      }
      if (targetNodeId) {
        const targetNode = yield figma.getNodeByIdAsync(targetNodeId);
        if (targetNode && "children" in targetNode) {
          const tChildren = targetNode.children;
          for (let k = tChildren.length - 1; k >= 0; k--) {
            const tc = tChildren[k];
            if (tc.name === markerName) {
              tc.remove();
            }
          }
        }
      }
    });
  }
  function createHiddenDataNode(num, title, desc, colorHex, targetNodeId) {
    let data = "[AIRA:" + num + "]\n";
    data += "title: " + (title || "") + "\n";
    data += "color: " + (colorHex || "") + "\n";
    data += "target: " + (targetNodeId || "") + "\n";
    data += "===\n";
    data += desc || "";
    const t = figma.createText();
    if (!FONT_R) throw new Error("Regular font not loaded");
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
    const dataName = "__specData_" + num + "__";
    const children = figma.currentPage.children;
    for (let i = 0; i < children.length; i++) {
      if (children[i].name === dataName && children[i].type === "TEXT") {
        try {
          const textNode = children[i];
          const raw = textNode.characters || "";
          const titleMatch = raw.match(/title:[ ]*(.*)/);
          const colorMatch = raw.match(/color:[ ]*(.*)/);
          const targetMatch = raw.match(/target:[ ]*(.*)/);
          const idx = raw.indexOf("===\n");
          const desc = idx >= 0 ? raw.substring(idx + 4) : "";
          return {
            title: titleMatch ? titleMatch[1].trim() : "",
            color: colorMatch ? colorMatch[1].trim() : "",
            target: targetMatch ? targetMatch[1].trim() : "",
            desc: desc.trim()
          };
        } catch (e) {
        }
      }
    }
    return null;
  }
  function buildHiddenDataMap() {
    const map = /* @__PURE__ */ new Map();
    const children = figma.currentPage.children;
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (c.name.indexOf("__specData_") !== 0 || c.type !== "TEXT") continue;
      const nm = c.name.match(/__specData_(\d+)__/);
      if (!nm) continue;
      const raw = c.characters;
      const headerMatch = raw.match(/^\[AIRA:(\d+)\]/);
      if (!headerMatch) continue;
      const lines = raw.split("\n");
      let title = "", color = "", target = "";
      let pastSep = false;
      const descLines = [];
      for (let li = 1; li < lines.length; li++) {
        const ln = lines[li];
        if (ln === "===") {
          pastSep = true;
          continue;
        }
        if (pastSep) {
          descLines.push(ln);
          continue;
        }
        if (ln.indexOf("title: ") === 0) {
          title = ln.substring(7);
        } else if (ln.indexOf("color: ") === 0) {
          color = ln.substring(7);
        } else if (ln.indexOf("target: ") === 0) {
          target = ln.substring(8);
        }
      }
      const desc = descLines.join("\n");
      map.set(nm[1], { title, desc, color, target });
    }
    return map;
  }
  function getHiddenNums() {
    const raw = figma.currentPage.getPluginData("airHiddenNums") || "";
    if (!raw) return /* @__PURE__ */ new Set();
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return /* @__PURE__ */ new Set();
      return new Set(arr);
    } catch (e) {
      return /* @__PURE__ */ new Set();
    }
  }
  function setHiddenNums(nums) {
    const arr = [];
    nums.forEach(function(n) {
      arr.push(n);
    });
    arr.sort(function(a, b) {
      return a - b;
    });
    figma.currentPage.setPluginData("airHiddenNums", JSON.stringify(arr));
  }
  function setAnnotationVisibility(num, isVisible) {
    return __async(this, null, function* () {
      const panelName = "📋 Annotation: " + num;
      const oldPanelName = "📋 Spec: " + num;
      const markerName = "🏷️ " + num;
      let targetNodeId = "";
      let foundPanel = false;
      let foundMarker = false;
      const children = figma.currentPage.children;
      for (let i = 0; i < children.length; i++) {
        const c = children[i];
        if (!foundPanel && (c.name === panelName || c.name === oldPanelName)) {
          c.visible = isVisible;
          try {
            targetNodeId = c.getPluginData("targetNodeId") || "";
          } catch (e) {
          }
          foundPanel = true;
        } else if (!foundMarker && c.name === markerName) {
          c.visible = isVisible;
          foundMarker = true;
        }
        if (foundPanel && foundMarker) break;
      }
      if (targetNodeId) {
        const targetNode = yield figma.getNodeByIdAsync(targetNodeId);
        if (targetNode && "children" in targetNode) {
          const tChildren = targetNode.children;
          for (let k = 0; k < tChildren.length; k++) {
            if (tChildren[k].name === markerName) {
              tChildren[k].visible = isVisible;
              break;
            }
          }
        }
      }
    });
  }
  var INDEX_NAME = "📑 AIR: AI-Readable Annotator Index";
  function updateSpecIndex() {
    return __async(this, null, function* () {
      const hiddenMap = buildHiddenDataMap();
      const hiddenNums = getHiddenNums();
      const pendingHidden = [];
      const pendingFallback = [];
      const foundNums = {};
      const panelTargetCache = {};
      const pageChildren = figma.currentPage.children;
      for (let i = pageChildren.length - 1; i >= 0; i--) {
        const c = pageChildren[i];
        if (c.name === INDEX_NAME) {
          c.remove();
          continue;
        }
        const fpMatch = c.name.match(/^📋 (?:Annotation|Spec): (\d+)/);
        if (fpMatch) {
          const fpnum = fpMatch[1];
          let fpDesc = "", fpColor = "", fpTarget = "";
          try {
            fpDesc = c.getPluginData("specTags") || "";
            fpColor = c.getPluginData("markerColor") || "";
            fpTarget = c.getPluginData("targetNodeId") || "";
          } catch (e) {
          }
          if (fpTarget) {
            panelTargetCache[fpnum] = fpTarget;
            pendingFallback.push({ num: fpnum, fpDesc, fpColor, fpTarget });
          }
          continue;
        }
        if (c.name.indexOf("__specData_") === 0 && c.type === "TEXT") {
          const nm = c.name.match(/__specData_(\d+)__/);
          if (!nm) continue;
          const num = nm[1];
          const data = hiddenMap.get(num) || null;
          if (!data) continue;
          let targetNodeId = data.target || panelTargetCache[num] || "";
          pendingHidden.push({ num, data, targetNodeId });
          foundNums[num] = true;
        }
      }
      for (let i = 0; i < pendingHidden.length; i++) {
        if (!pendingHidden[i].targetNodeId && panelTargetCache[pendingHidden[i].num]) {
          pendingHidden[i].targetNodeId = panelTargetCache[pendingHidden[i].num];
        }
      }
      const hiddenNodePromises = [];
      for (let i = 0; i < pendingHidden.length; i++) {
        if (pendingHidden[i].targetNodeId) {
          hiddenNodePromises.push(figma.getNodeByIdAsync(pendingHidden[i].targetNodeId));
        } else {
          hiddenNodePromises.push(Promise.resolve(null));
        }
      }
      const hiddenResolvedNodes = yield Promise.all(hiddenNodePromises);
      const specs = [];
      for (let i = 0; i < pendingHidden.length; i++) {
        const ph = pendingHidden[i];
        const tNode = hiddenResolvedNodes[i];
        specs.push({
          num: parseInt(ph.num),
          title: ph.data.title,
          desc: ph.data.desc,
          nodeId: ph.targetNodeId,
          nodeType: tNode ? tNode.type : "",
          nodeName: tNode ? tNode.name : ""
        });
      }
      const filteredFallback = [];
      for (let i = 0; i < pendingFallback.length; i++) {
        if (!foundNums[pendingFallback[i].num]) {
          filteredFallback.push(pendingFallback[i]);
        }
      }
      const fallbackNodePromises = [];
      for (let i = 0; i < filteredFallback.length; i++) {
        fallbackNodePromises.push(figma.getNodeByIdAsync(filteredFallback[i].fpTarget));
      }
      const fallbackResolvedNodes = yield Promise.all(fallbackNodePromises);
      for (let i = 0; i < filteredFallback.length; i++) {
        const fb = filteredFallback[i];
        const fpNode = fallbackResolvedNodes[i];
        let fpTitle = "", fpType = "", fpName = "";
        if (fpNode) {
          const fptm = fpNode.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
          fpTitle = fptm ? fptm[1] : fpNode.name;
          fpType = fpNode.type;
          fpName = fpNode.name;
        }
        specs.push({
          num: parseInt(fb.num),
          title: fpTitle,
          desc: fb.fpDesc,
          nodeId: fb.fpTarget,
          nodeType: fpType,
          nodeName: fpName
        });
        foundNums[fb.num] = true;
        try {
          createHiddenDataNode(fb.num, fpTitle, fb.fpDesc, fb.fpColor, fb.fpTarget);
        } catch (e) {
        }
      }
      if (specs.length === 0) return;
      specs.sort(function(a, b) {
        return a.num - b.num;
      });
      const lines = [];
      lines.push("📑 AI-READABLE ANNOTATOR INDEX");
      lines.push("AI에게: 각 [AIR-번호]는 Figma 요소에 연결된 기획 스펙입니다.");
      lines.push("nodeId로 해당 요소를 찾고, 태그 내용에 따라 구현하세요.");
      lines.push("════════════════════════════════");
      for (let s = 0; s < specs.length; s++) {
        const sp = specs[s];
        let header = "";
        if (hiddenNums.has(sp.num)) {
          header = "[HIDDEN] [AIR-" + sp.num + "] " + sp.title;
        } else {
          header = "[AIR-" + sp.num + "] " + sp.title;
        }
        if (sp.nodeType) header += "  (" + sp.nodeType + ", " + sp.nodeId + ")";
        lines.push(header);
        if (sp.desc) {
          const descLines = sp.desc.split("\n");
          let subIdx = 0;
          for (let d = 0; d < descLines.length; d++) {
            const dl = descLines[d].trim();
            if (!dl) continue;
            if (dl.match(/^\[sub\]/)) {
              const subVal = dl.replace(/^\[sub\]\s*/, "");
              lines.push("  " + sp.num + "-" + String.fromCharCode(97 + subIdx) + ") " + subVal);
              subIdx++;
            } else {
              lines.push("  " + dl);
            }
          }
        }
        lines.push("");
      }
      lines.push("════════════════════════════════");
      let footerLine = "총 " + specs.length + "개 스펙";
      let hiddenCount = 0;
      for (let hci = 0; hci < specs.length; hci++) {
        if (hiddenNums.has(specs[hci].num)) hiddenCount++;
      }
      if (hiddenCount > 0) {
        footerLine += " (" + hiddenCount + "개 숨김)";
      }
      footerLine += " | AIR: AI-Readable Annotator v1";
      lines.push(footerLine);
      const content = lines.join("\n");
      const idx = figma.createFrame();
      idx.name = INDEX_NAME;
      idx.layoutMode = "VERTICAL";
      idx.primaryAxisSizingMode = "AUTO";
      idx.counterAxisSizingMode = "AUTO";
      idx.paddingTop = 16;
      idx.paddingBottom = 16;
      idx.paddingLeft = 20;
      idx.paddingRight = 20;
      idx.itemSpacing = 0;
      idx.cornerRadius = 8;
      idx.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.95 } }];
      idx.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.82, b: 0.7 } }];
      idx.strokeWeight = 1;
      const t = figma.createText();
      if (!FONT_R) throw new Error("Regular font not loaded");
      t.fontName = FONT_R;
      t.characters = content;
      t.fontSize = 11;
      t.fills = [{ type: "SOLID", color: CLR.text }];
      t.textAutoResize = "WIDTH_AND_HEIGHT";
      idx.appendChild(t);
      let maxX = 0;
      for (let i = 0; i < figma.currentPage.children.length; i++) {
        const child = figma.currentPage.children[i];
        if (child.name === INDEX_NAME) continue;
        const right = child.x + (child.width || 0);
        if (right > maxX) maxX = right;
      }
      idx.x = maxX + 200;
      idx.y = 0;
      figma.currentPage.appendChild(idx);
    });
  }
  function createMarkerBadge(num, targetNode, markerColor) {
    const color = markerColor || CLR.headerBg;
    const marker = alFrame("🏷️ " + num, "HORIZONTAL", 0, 0);
    marker.paddingTop = 2;
    marker.paddingBottom = 2;
    marker.paddingLeft = 6;
    marker.paddingRight = 6;
    marker.cornerRadius = 4;
    marker.fills = [{ type: "SOLID", color }];
    marker.appendChild(txt(String(num), 9, CLR.white, true));
    const canHaveChildren = "children" in targetNode && (targetNode.type === "FRAME" || targetNode.type === "COMPONENT" || targetNode.type === "COMPONENT_SET" || targetNode.type === "GROUP" || targetNode.type === "SECTION");
    if (canHaveChildren) {
      try {
        targetNode.appendChild(marker);
        marker.layoutPositioning = "ABSOLUTE";
        marker.x = 4;
        marker.y = 4;
      } catch (e) {
        figma.currentPage.appendChild(marker);
        marker.x = targetNode.absoluteTransform[0][2];
        marker.y = targetNode.absoluteTransform[1][2] - 20;
      }
    } else {
      figma.currentPage.appendChild(marker);
      marker.x = targetNode.absoluteTransform[0][2];
      marker.y = targetNode.absoluteTransform[1][2] - 20;
    }
    marker.setRelaunchData({ edit: "" });
    marker.locked = true;
    return marker;
  }
  function scanLayers(node, depth) {
    if (depth > 5) return [];
    const results = [];
    if (!("children" in node)) return results;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.name.indexOf("📋 Annotation:") === 0) continue;
      if (child.name.indexOf("📋 Spec:") === 0) continue;
      if (child.name.indexOf("📑 AIR:") === 0) continue;
      if (child.name.indexOf("🏷️") === 0) continue;
      if (child.name.indexOf("__specData_") === 0) continue;
      if (child.type === "PAGE" || child.type === "DOCUMENT") continue;
      results.push({ id: child.id, name: child.name, type: child.type, depth });
      if ("children" in child && child.type !== "INSTANCE") {
        try {
          const sub = scanLayers(child, depth + 1);
          for (let j = 0; j < sub.length; j++) results.push(sub[j]);
        } catch (e) {
        }
      }
    }
    return results;
  }
  var _readingSelection = false;
  function readSelectedDesc() {
    return __async(this, null, function* () {
      if (_readingSelection) return;
      const sel = figma.currentPage.selection;
      if (sel.length === 0) {
        figma.ui.postMessage({ type: "selection-empty" });
        return;
      }
      const node = sel[0];
      const markerMatch = node.name.match(/^🏷️ (\d+)/);
      if (markerMatch) {
        const num2 = markerMatch[1];
        let targetId = "";
        const hidden = readHiddenData(num2);
        if (hidden && hidden.target) targetId = hidden.target;
        if (targetId) {
          const targetNode = yield figma.getNodeByIdAsync(targetId);
          if (targetNode) {
            _readingSelection = true;
            figma.currentPage.selection = [targetNode];
            figma.viewport.scrollAndZoomIntoView([targetNode]);
            _readingSelection = false;
            return;
          }
        }
      }
      let num = "";
      const pm = node.name.match(/^\[AIR-(\d+)\]/);
      if (pm) num = pm[1];
      let title = "", desc = "", color = "";
      if (num) {
        const hidden = readHiddenData(num);
        if (hidden) {
          title = hidden.title;
          desc = hidden.desc;
          color = hidden.color;
        } else {
          const panelName = "📋 Annotation: " + num;
          const oldPanelName = "📋 Spec: " + num;
          for (let i = 0; i < figma.currentPage.children.length; i++) {
            const cin = figma.currentPage.children[i].name;
            if (cin === panelName || cin === oldPanelName) {
              try {
                desc = figma.currentPage.children[i].getPluginData("specTags") || "";
                color = figma.currentPage.children[i].getPluginData("markerColor") || "";
              } catch (e) {
              }
              break;
            }
          }
        }
      }
      figma.ui.postMessage({
        type: "selection-desc",
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        title,
        desc,
        color
      });
    });
  }
  function writeSpec(nodeId, title, desc, num, colorHex) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(nodeId);
      if (!node) return { ok: false, error: "노드를 찾을 수 없습니다." };
      const markerColor = colorHex ? hexToRgb(colorHex) : CLR.headerBg;
      try {
        let currentNum = num;
        if (currentNum) {
          const cleanName = stripPrefix(node.name);
          const summary = makeSummary(desc);
          const displayTitle = title || cleanName;
          node.name = "[AIR-" + currentNum + "] " + displayTitle + summary;
        } else {
          const em = node.name.match(/^\[AIR-(\d+)\]/);
          if (em) currentNum = em[1];
        }
        if (!currentNum) return { ok: false, error: "번호가 없습니다." };
        let existingPos = null;
        const panelName = "📋 Annotation: " + currentNum;
        const oldPanelName = "📋 Spec: " + currentNum;
        for (let pi = 0; pi < figma.currentPage.children.length; pi++) {
          const pn = figma.currentPage.children[pi].name;
          if (pn === panelName || pn === oldPanelName) {
            existingPos = {
              x: figma.currentPage.children[pi].x,
              y: figma.currentPage.children[pi].y
            };
            break;
          }
        }
        yield removeExistingArtifacts(currentNum);
        if (!desc || !desc.trim()) return { ok: true };
        const panel = createSpecPanel(title, desc, currentNum, node, markerColor);
        figma.currentPage.appendChild(panel);
        if (existingPos) {
          panel.x = existingPos.x;
          panel.y = existingPos.y;
        }
        createMarkerBadge(currentNum, node, markerColor);
        createHiddenDataNode(currentNum, title, desc, colorHex, nodeId);
        panel.setPluginData("specTags", desc);
        panel.setPluginData("targetNodeId", nodeId);
        panel.setPluginData("markerColor", colorHex || "");
        panel.setRelaunchData({ edit: "" });
        for (let ci = 0; ci < panel.children.length; ci++) {
          panel.children[ci].locked = true;
        }
        node.setRelaunchData({ edit: "" });
        const writeHiddenSet = getHiddenNums();
        if (writeHiddenSet.has(parseInt(currentNum))) {
          writeHiddenSet.delete(parseInt(currentNum));
          setHiddenNums(writeHiddenSet);
        }
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    });
  }
  function applyBatch(mappings) {
    return __async(this, null, function* () {
      let success = 0, fail = 0;
      const errors = [];
      const nextNum = getNextNum();
      for (let i = 0; i < mappings.length; i++) {
        const m = mappings[i];
        const num = nextNum + i;
        const result = yield writeSpec(m.nodeId, m.title || "", m.description, String(num), m.color || "");
        if (result.ok) success++;
        else {
          fail++;
          errors.push(result.error);
        }
      }
      return { success, fail, errors };
    });
  }
  figma.on("selectionchange", function() {
    readSelectedDesc();
  });
  figma.on("currentpagechange", function() {
    readSelectedDesc();
    figma.ui.postMessage({ type: "page-changed" });
  });
  figma.ui.onmessage = function(msg) {
    return __async(this, null, function* () {
      if (msg.type === "init") {
        yield loadFonts();
        if (!fontLoaded) {
          figma.notify("❌ 폰트를 로드할 수 없습니다.", { error: true });
          return;
        }
        const savedTheme = figma.root.getPluginData("airTheme");
        if (savedTheme === "light" || savedTheme === "dark") currentTheme = savedTheme;
        figma.ui.postMessage({ type: "init-done", fileKey: figma.fileKey || "", theme: currentTheme });
        readSelectedDesc();
      }
      if (msg.type === "rebuild-all-panels") {
        if (msg.theme) {
          currentTheme = msg.theme;
          figma.root.setPluginData("airTheme", currentTheme);
        }
        let rebuilt = 0;
        const children = figma.currentPage.children;
        const allSpecs = [];
        const foundNums = {};
        const rebuildHiddenMap = buildHiddenDataMap();
        for (let ri = 0; ri < children.length; ri++) {
          const rc = children[ri];
          if (rc.name.indexOf("__specData_") === 0 && rc.type === "TEXT") {
            const rm = rc.name.match(/__specData_(\d+)__/);
            if (!rm) continue;
            const rnum = rm[1];
            const rdata = rebuildHiddenMap.get(rnum) || null;
            if (rdata) {
              allSpecs.push({ num: rnum, data: rdata });
              foundNums[rnum] = true;
            }
          }
        }
        for (let rk = 0; rk < children.length; rk++) {
          const rck = children[rk];
          const rpMatch = rck.name.match(/^📋 (?:Annotation|Spec): (\d+)/);
          if (!rpMatch) continue;
          const rpnum = rpMatch[1];
          if (foundNums[rpnum]) continue;
          let rpDesc = "", rpColor = "", rpTarget = "";
          try {
            rpDesc = rck.getPluginData("specTags") || "";
            rpColor = rck.getPluginData("markerColor") || "";
            rpTarget = rck.getPluginData("targetNodeId") || "";
          } catch (e) {
          }
          if (rpTarget) {
            let rpTitle = "";
            try {
              const rpNode = yield figma.getNodeByIdAsync(rpTarget);
              if (rpNode) {
                const rptm = rpNode.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
                rpTitle = rptm ? rptm[1] : rpNode.name;
              }
            } catch (e) {
            }
            allSpecs.push({ num: rpnum, data: { title: rpTitle, desc: rpDesc, color: rpColor, target: rpTarget } });
            foundNums[rpnum] = true;
            try {
              createHiddenDataNode(rpnum, rpTitle, rpDesc, rpColor, rpTarget);
            } catch (e) {
            }
          }
        }
        for (let si = 0; si < allSpecs.length; si++) {
          const spec = allSpecs[si];
          const targetId = spec.data.target;
          if (!targetId) continue;
          let tNode = null;
          try {
            tNode = yield figma.getNodeByIdAsync(targetId);
          } catch (e) {
          }
          if (!tNode) continue;
          const panelName = "📋 Annotation: " + spec.num;
          const oldPanelName = "📋 Spec: " + spec.num;
          let existPos = null;
          for (let pi = 0; pi < figma.currentPage.children.length; pi++) {
            const pn = figma.currentPage.children[pi].name;
            if (pn === panelName || pn === oldPanelName) {
              existPos = { x: figma.currentPage.children[pi].x, y: figma.currentPage.children[pi].y };
              break;
            }
          }
          for (let di = figma.currentPage.children.length - 1; di >= 0; di--) {
            const dn = figma.currentPage.children[di].name;
            if (dn === panelName || dn === oldPanelName) {
              figma.currentPage.children[di].remove();
            }
          }
          const mColor = spec.data.color ? hexToRgb(spec.data.color) : CLR.headerBg;
          const newPanel = createSpecPanel(spec.data.title, spec.data.desc, spec.num, tNode, mColor);
          figma.currentPage.appendChild(newPanel);
          if (existPos) {
            newPanel.x = existPos.x;
            newPanel.y = existPos.y;
          }
          newPanel.setPluginData("specTags", spec.data.desc);
          newPanel.setPluginData("targetNodeId", targetId);
          newPanel.setPluginData("markerColor", spec.data.color || "");
          newPanel.setRelaunchData({ edit: "" });
          for (let ci = 0; ci < newPanel.children.length; ci++) {
            newPanel.children[ci].locked = true;
          }
          rebuilt++;
        }
        const rebuildHiddenNums = getHiddenNums();
        if (rebuildHiddenNums.size > 0) {
          for (let hi = 0; hi < allSpecs.length; hi++) {
            if (rebuildHiddenNums.has(parseInt(allSpecs[hi].num))) {
              yield setAnnotationVisibility(parseInt(allSpecs[hi].num), false);
            }
          }
        }
        const themeLabel = currentTheme === "dark" ? "Dark" : "Light";
        figma.notify("🎨 " + themeLabel + " theme applied to " + rebuilt + " panel(s)");
        figma.ui.postMessage({ type: "rebuild-done" });
      }
      if (msg.type === "scan-layers") {
        figma.ui.postMessage({ type: "layers-scanned", layers: scanLayers(figma.currentPage, 0) });
      }
      if (msg.type === "read-selection") {
        readSelectedDesc();
      }
      if (msg.type === "list-specs") {
        const specs = [];
        const foundNums = {};
        const children = figma.currentPage.children;
        const listHiddenMap = buildHiddenDataMap();
        const listHiddenNums = getHiddenNums();
        for (let i = 0; i < children.length; i++) {
          const c = children[i];
          if (c.name.indexOf("__specData_") === 0 && c.type === "TEXT") {
            const numMatch = c.name.match(/__specData_(\d+)__/);
            if (!numMatch) continue;
            const num = numMatch[1];
            const data = listHiddenMap.get(num) || null;
            let targetId = data && data.target ? data.target : "";
            if (!targetId) {
              for (let j = 0; j < children.length; j++) {
                const cjn = children[j].name;
                if (cjn === "📋 Annotation: " + num || cjn === "📋 Spec: " + num) {
                  try {
                    targetId = children[j].getPluginData("targetNodeId") || "";
                  } catch (e) {
                  }
                  break;
                }
              }
            }
            specs.push({
              num,
              title: data ? data.title : "",
              color: data ? data.color : "",
              desc: data ? data.desc : "",
              targetNodeId: targetId,
              preview: data && data.desc ? data.desc.split("\n").slice(0, 2).join(" ") : "",
              hidden: listHiddenNums.has(parseInt(num))
            });
            foundNums[num] = true;
          }
        }
        for (let k = 0; k < children.length; k++) {
          const ck = children[k];
          const panelMatch = ck.name.match(/^📋 (?:Annotation|Spec): (\d+)/);
          if (!panelMatch) continue;
          const pnum = panelMatch[1];
          if (foundNums[pnum]) continue;
          let pDesc = "", pColor = "", pTargetId = "";
          try {
            pDesc = ck.getPluginData("specTags") || "";
            pColor = ck.getPluginData("markerColor") || "";
            pTargetId = ck.getPluginData("targetNodeId") || "";
          } catch (e) {
          }
          let pTitle = "";
          if (pTargetId) {
            try {
              const tNode = yield figma.getNodeByIdAsync(pTargetId);
              if (tNode) {
                const tm = tNode.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
                pTitle = tm ? tm[1] : tNode.name;
              }
            } catch (e) {
            }
          }
          specs.push({
            num: pnum,
            title: pTitle,
            color: pColor,
            desc: pDesc,
            targetNodeId: pTargetId,
            preview: pDesc ? pDesc.split("\n").slice(0, 2).join(" ") : "",
            hidden: listHiddenNums.has(parseInt(pnum))
          });
          foundNums[pnum] = true;
          if (pDesc && pTargetId) {
            try {
              createHiddenDataNode(pnum, pTitle, pDesc, pColor, pTargetId);
            } catch (e) {
            }
          }
        }
        specs.sort(function(a, b) {
          return parseInt(a.num) - parseInt(b.num);
        });
        figma.ui.postMessage({ type: "specs-listed", specs });
      }
      if (msg.type === "write-desc") {
        if (msg.theme) {
          currentTheme = msg.theme;
          figma.root.setPluginData("airTheme", currentTheme);
        }
        const node = yield figma.getNodeByIdAsync(msg.nodeId);
        let existingNum = null;
        if (node) {
          const pm = node.name.match(/^\[AIR-(\d+)\]/);
          if (pm) existingNum = pm[1];
        }
        if (!existingNum) existingNum = String(getNextNum());
        const result = yield writeSpec(msg.nodeId, msg.title || "", msg.desc, existingNum, msg.color || "");
        if (result.ok) {
          figma.notify("✅ [AIR-" + existingNum + "] " + (msg.title || "저장 완료"));
          figma.ui.postMessage({ type: "write-success", nodeId: msg.nodeId });
          readSelectedDesc();
          updateSpecIndex();
        } else {
          figma.notify("❌ " + result.error, { error: true });
        }
      }
      if (msg.type === "apply-batch") {
        const result = yield applyBatch(msg.mappings);
        const notice = "✅ " + result.success + "개 저장 완료" + (result.fail > 0 ? " / " + result.fail + "개 실패" : "");
        figma.notify(notice);
        figma.ui.postMessage({ type: "batch-done", result });
        figma.ui.postMessage({ type: "layers-scanned", layers: scanLayers(figma.currentPage, 0) });
        updateSpecIndex();
      }
      if (msg.type === "select-node") {
        const node = yield figma.getNodeByIdAsync(msg.nodeId);
        if (node) {
          figma.currentPage.selection = [node];
          figma.viewport.scrollAndZoomIntoView([node]);
        }
      }
      if (msg.type === "delete-spec") {
        const node = msg.nodeId ? yield figma.getNodeByIdAsync(msg.nodeId) : null;
        let num = msg.num || null;
        if (!num && node) {
          const pm = node.name.match(/^\[AIR-(\d+)\]/);
          if (pm) num = pm[1];
        }
        if (!num) {
          figma.notify("❌ 삭제할 어노테이션을 찾을 수 없습니다.", { error: true });
          return;
        }
        yield removeExistingArtifacts(num);
        const delHiddenSet = getHiddenNums();
        if (delHiddenSet.has(parseInt(num))) {
          delHiddenSet.delete(parseInt(num));
          setHiddenNums(delHiddenSet);
        }
        if (node) {
          node.name = stripPrefix(node.name);
        }
        figma.notify("🗑️ [AIR-" + num + "] 어노테이션 삭제 완료");
        figma.ui.postMessage({ type: "delete-done", num });
        readSelectedDesc();
        updateSpecIndex();
      }
      if (msg.type === "rebuild-index") {
        yield updateSpecIndex();
        figma.notify("📑 AI용 스펙 인덱스를 최신 상태로 갱신했어요");
      }
      if (msg.type === "toggle-visibility") {
        const num = parseInt(msg.num);
        const hiddenSet = getHiddenNums();
        if (msg.visible) {
          hiddenSet.delete(num);
        } else {
          hiddenSet.add(num);
        }
        setHiddenNums(hiddenSet);
        yield setAnnotationVisibility(num, msg.visible);
        figma.ui.postMessage({ type: "visibility-changed", num: msg.num, visible: msg.visible });
        updateSpecIndex();
      }
      if (msg.type === "set-all-visibility") {
        const allNums = [];
        const seen = {};
        const targetNodeIds = [];
        const children = figma.currentPage.children;
        for (let i = 0; i < children.length; i++) {
          const c = children[i];
          const pm = c.name.match(/^📋 (?:Annotation|Spec): (\d+)/);
          if (pm) {
            c.visible = msg.visible;
            const pnum = parseInt(pm[1]);
            if (!seen[pnum]) {
              allNums.push(pnum);
              seen[pnum] = true;
            }
            try {
              const tid = c.getPluginData("targetNodeId") || "";
              if (tid) targetNodeIds.push(tid);
            } catch (e) {
            }
            continue;
          }
          const mm = c.name.match(/^🏷️ (\d+)$/);
          if (mm) {
            c.visible = msg.visible;
            const mnum = parseInt(mm[1]);
            if (!seen[mnum]) {
              allNums.push(mnum);
              seen[mnum] = true;
            }
            continue;
          }
          const dm = c.name.match(/__specData_(\d+)__/);
          if (dm) {
            const dnum = parseInt(dm[1]);
            if (!seen[dnum]) {
              allNums.push(dnum);
              seen[dnum] = true;
            }
          }
        }
        const targetPromises = [];
        for (let i = 0; i < targetNodeIds.length; i++) {
          targetPromises.push(figma.getNodeByIdAsync(targetNodeIds[i]));
        }
        const resolvedTargets = yield Promise.all(targetPromises);
        for (let i = 0; i < resolvedTargets.length; i++) {
          const tNode = resolvedTargets[i];
          if (tNode && "children" in tNode) {
            const tChildren = tNode.children;
            for (let k = 0; k < tChildren.length; k++) {
              if (tChildren[k].name.match(/^🏷️ \d+$/)) {
                tChildren[k].visible = msg.visible;
              }
            }
          }
        }
        const hiddenSet = getHiddenNums();
        if (msg.visible) {
          hiddenSet.clear();
        } else {
          for (let i = 0; i < allNums.length; i++) {
            hiddenSet.add(allNums[i]);
          }
        }
        setHiddenNums(hiddenSet);
        const label = msg.visible ? "shown" : "hidden";
        figma.notify("👁️ " + allNums.length + " annotation(s) " + label);
        figma.ui.postMessage({ type: "all-visibility-changed", visible: msg.visible });
        updateSpecIndex();
      }
      if (msg.type === "reorder-specs") {
        const order = msg.order;
        if (!order || order.length === 0) return;
        const oldToNew = {};
        for (let oi = 0; oi < order.length; oi++) {
          oldToNew[order[oi]] = oi + 1;
        }
        const reorderHiddenMap = buildHiddenDataMap();
        const reorderHiddenNums = getHiddenNums();
        const entries = [];
        const children = figma.currentPage.children;
        for (let oi = 0; oi < order.length; oi++) {
          const oldNum = order[oi];
          const newNum = oldToNew[oldNum];
          let data = reorderHiddenMap.get(oldNum) || null;
          if (!data) {
            for (let ci = 0; ci < children.length; ci++) {
              const cn = children[ci].name;
              if (cn === "📋 Annotation: " + oldNum || cn === "📋 Spec: " + oldNum) {
                try {
                  const pd = children[ci].getPluginData("specTags") || "";
                  const pc = children[ci].getPluginData("markerColor") || "";
                  const pt = children[ci].getPluginData("targetNodeId") || "";
                  let pTitle = "";
                  if (pt) {
                    const tn = yield figma.getNodeByIdAsync(pt);
                    if (tn) {
                      const tm = tn.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
                      pTitle = tm ? tm[1] : tn.name;
                    }
                  }
                  data = { title: pTitle, desc: pd, color: pc, target: pt };
                } catch (e) {
                }
                break;
              }
            }
          }
          if (!data || !data.target) continue;
          let panelPos = null;
          for (let ci = 0; ci < children.length; ci++) {
            const cn = children[ci].name;
            if (cn === "📋 Annotation: " + oldNum || cn === "📋 Spec: " + oldNum) {
              panelPos = { x: children[ci].x, y: children[ci].y };
              break;
            }
          }
          entries.push({
            oldNum,
            newNum,
            data,
            panelPos,
            wasHidden: reorderHiddenNums.has(parseInt(oldNum))
          });
        }
        for (let ei = 0; ei < entries.length; ei++) {
          yield removeExistingArtifacts(entries[ei].oldNum);
          if (entries[ei].data.target) {
            const tNode = yield figma.getNodeByIdAsync(entries[ei].data.target);
            if (tNode) {
              tNode.name = stripPrefix(tNode.name);
            }
          }
        }
        for (let ei = 0; ei < entries.length; ei++) {
          const entry = entries[ei];
          const tNode = yield figma.getNodeByIdAsync(entry.data.target);
          if (!tNode) continue;
          const newNumStr = String(entry.newNum);
          const mColor = entry.data.color ? hexToRgb(entry.data.color) : CLR.headerBg;
          const summary = makeSummary(entry.data.desc);
          const displayTitle = entry.data.title || stripPrefix(tNode.name);
          tNode.name = "[AIR-" + newNumStr + "] " + displayTitle + summary;
          const panel = createSpecPanel(entry.data.title, entry.data.desc, newNumStr, tNode, mColor);
          figma.currentPage.appendChild(panel);
          if (entry.panelPos) {
            panel.x = entry.panelPos.x;
            panel.y = entry.panelPos.y;
          }
          panel.setPluginData("specTags", entry.data.desc);
          panel.setPluginData("targetNodeId", entry.data.target);
          panel.setPluginData("markerColor", entry.data.color || "");
          panel.setRelaunchData({ edit: "" });
          for (let ci = 0; ci < panel.children.length; ci++) {
            panel.children[ci].locked = true;
          }
          createMarkerBadge(newNumStr, tNode, mColor);
          createHiddenDataNode(newNumStr, entry.data.title, entry.data.desc, entry.data.color, entry.data.target);
          tNode.setRelaunchData({ edit: "" });
          if (entry.wasHidden) {
            yield setAnnotationVisibility(entry.newNum, false);
          }
        }
        const newHiddenNums = /* @__PURE__ */ new Set();
        reorderHiddenNums.forEach(function(n) {
          const oldStr = String(n);
          if (oldToNew[oldStr]) {
            newHiddenNums.add(oldToNew[oldStr]);
          } else {
            newHiddenNums.add(n);
          }
        });
        setHiddenNums(newHiddenNums);
        let maxNewNum = 0;
        for (let ei = 0; ei < entries.length; ei++) {
          if (entries[ei].newNum > maxNewNum) maxNewNum = entries[ei].newNum;
        }
        const afterChildren = figma.currentPage.children;
        for (let ai = 0; ai < afterChildren.length; ai++) {
          const am = afterChildren[ai].name.match(/^\[AIR-(\d+)\]/) || afterChildren[ai].name.match(/^📋 (?:Annotation|Spec): (\d+)/);
          if (am) {
            const an = parseInt(am[1]);
            if (an > maxNewNum) maxNewNum = an;
          }
        }
        figma.currentPage.setPluginData("airMaxNum", String(maxNewNum));
        yield updateSpecIndex();
        figma.notify("🔢 " + entries.length + "개 어노테이션 순서 변경");
        figma.ui.postMessage({ type: "reorder-done" });
      }
      if (msg.type === "cancel") {
        figma.closePlugin();
      }
    });
  };
})();
