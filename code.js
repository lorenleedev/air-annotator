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
      const panelMatch = n.name.match(/^📋 Annotation: (\d+)/);
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
            try {
              const targetNode = yield figma.getNodeByIdAsync(targetId);
              if (targetNode) {
                figma.currentPage.selection = [targetNode];
                figma.viewport.scrollAndZoomIntoView([targetNode]);
              }
            } catch (e) {
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
      descBg: { r: 0.97, g: 0.97, b: 0.98 },
      descText: { r: 0.23, g: 0.26, b: 0.31 },
      divider: { r: 0.85, g: 0.86, b: 0.88 },
      footer: { r: 0.69, g: 0.69, b: 0.69 },
      warnText: { r: 0.76, g: 0.25, b: 0.05 },
      linkText: { r: 0.05, g: 0.45, b: 0.85 },
      shadow: 0.08,
      tags: {
        route: { bg: { r: 0.93, g: 0.95, b: 1 }, text: { r: 0.31, g: 0.27, b: 0.9 } },
        auth: { bg: { r: 0.94, g: 0.99, b: 0.96 }, text: { r: 0.09, g: 0.64, b: 0.25 } },
        desc: { bg: { r: 0.97, g: 0.98, b: 0.99 }, text: { r: 0.39, g: 0.46, b: 0.53 } },
        api: { bg: { r: 0.94, g: 0.96, b: 1 }, text: { r: 0.15, g: 0.39, b: 0.92 } },
        warn: { bg: { r: 1, g: 0.97, b: 0.93 }, text: { r: 0.92, g: 0.35, b: 0.05 } },
        memo: { bg: { r: 0.96, g: 0.96, b: 0.96 }, text: { r: 0.45, g: 0.45, b: 0.45 } },
        ux: { bg: { r: 0.99, g: 0.96, b: 1 }, text: { r: 0.66, g: 0.33, b: 0.95 } }
      }
    },
    dark: {
      panelBg: { r: 0.12, g: 0.12, b: 0.12 },
      headerBorder: { r: 0.18, g: 0.18, b: 0.18 },
      title: { r: 0.9, g: 0.9, b: 0.9 },
      subtitle: { r: 0.44, g: 0.44, b: 0.44 },
      text: { r: 0.82, g: 0.84, b: 0.86 },
      descBg: { r: 0.15, g: 0.15, b: 0.15 },
      descText: { r: 0.73, g: 0.73, b: 0.75 },
      divider: { r: 0.28, g: 0.28, b: 0.3 },
      footer: { r: 0.33, g: 0.33, b: 0.33 },
      warnText: { r: 0.98, g: 0.57, b: 0.24 },
      linkText: { r: 0.4, g: 0.65, b: 1 },
      shadow: 0.3,
      tags: {
        route: { bg: { r: 0.15, g: 0.15, b: 0.28 }, text: { r: 0.51, g: 0.55, b: 0.97 } },
        auth: { bg: { r: 0.08, g: 0.2, b: 0.16 }, text: { r: 0.29, g: 0.87, b: 0.5 } },
        desc: { bg: { r: 0.12, g: 0.16, b: 0.23 }, text: { r: 0.58, g: 0.64, b: 0.72 } },
        api: { bg: { r: 0.09, g: 0.15, b: 0.33 }, text: { r: 0.38, g: 0.65, b: 0.98 } },
        warn: { bg: { r: 0.23, g: 0.1, b: 0.03 }, text: { r: 0.98, g: 0.57, b: 0.24 } },
        memo: { bg: { r: 0.15, g: 0.15, b: 0.15 }, text: { r: 0.64, g: 0.64, b: 0.64 } },
        ux: { bg: { r: 0.18, g: 0.07, b: 0.22 }, text: { r: 0.75, g: 0.52, b: 0.99 } }
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
  var FONT_I;
  var FONT_BI;
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
          try {
            yield figma.loadFontAsync({ family: families[i], style: "Italic" });
            FONT_I = { family: families[i], style: "Italic" };
          } catch (e) {
            FONT_I = FONT_R;
          }
          try {
            yield figma.loadFontAsync({ family: families[i], style: "Bold Italic" });
            FONT_BI = { family: families[i], style: "Bold Italic" };
          } catch (e) {
            FONT_BI = FONT_B;
          }
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
  function txtFormatted(input, size, color, linkColor) {
    const segments = parseInlineFormat(input);
    let plainText = "";
    for (let si = 0; si < segments.length; si++) {
      plainText += segments[si].text;
    }
    const t = figma.createText();
    if (!FONT_R) throw new Error("Regular font not loaded");
    t.fontName = FONT_R;
    t.characters = plainText || " ";
    t.fontSize = size || 11;
    if (color) t.fills = [{ type: "SOLID", color }];
    t.textAutoResize = "WIDTH_AND_HEIGHT";
    let offset = 0;
    for (let si = 0; si < segments.length; si++) {
      const seg = segments[si];
      const len = seg.text.length;
      if (len === 0) {
        continue;
      }
      const start = offset;
      const end = offset + len;
      if (seg.bold && seg.italic && FONT_BI) {
        t.setRangeFontName(start, end, FONT_BI);
      } else if (seg.bold && FONT_B) {
        t.setRangeFontName(start, end, FONT_B);
      } else if (seg.italic && FONT_I) {
        t.setRangeFontName(start, end, FONT_I);
      }
      if (seg.url) {
        t.setRangeHyperlink(start, end, { type: "URL", value: seg.url });
        t.setRangeFills(start, end, [{ type: "SOLID", color: linkColor }]);
        t.setRangeTextDecoration(start, end, "UNDERLINE");
      }
      offset = end;
    }
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
    const result = { desc: [], route: [], auth: [], api: [], ux: [], warn: [], memo: [], ordered: [] };
    if (!desc) return result;
    const lines = desc.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        result.desc.push("");
        continue;
      }
      if (line.match(/^\[route\]/)) {
        const v = line.replace(/^\[route\]\s*/, "");
        result.route.push(v);
        result.ordered.push({ type: "route", value: v });
      } else if (line.match(/^\[auth\]/)) {
        const v = line.replace(/^\[auth\]\s*/, "");
        result.auth.push(v);
        result.ordered.push({ type: "auth", value: v });
      } else if (line.match(/^\[api\]/)) {
        const v = line.replace(/^\[api\]\s*/, "");
        result.api.push(v);
        result.ordered.push({ type: "api", value: v });
      } else if (line.match(/^\[ux\]/)) {
        const v = line.replace(/^\[ux\]\s*/, "");
        result.ux.push(v);
        result.ordered.push({ type: "ux", value: v });
      } else if (line.match(/^\[warn\]/)) {
        const v = line.replace(/^\[warn\]\s*/, "");
        result.warn.push(v);
        result.ordered.push({ type: "warn", value: v });
      } else if (line.match(/^\[memo\]/)) {
        const v = line.replace(/^\[memo\]\s*/, "");
        result.memo.push(v);
        result.ordered.push({ type: "memo", value: v });
      } else {
        const dm = line.match(/^\[desc\]\s*(.*)/);
        result.desc.push(dm ? dm[1] : line);
      }
    }
    return result;
  }
  function parseInlineFormat(input) {
    if (!input) return [{ text: "", bold: false, italic: false, url: "" }];
    const segments = [];
    const re = /(\*\*\*(.+?)\*\*\*)|(\*\*(.+?)\*\*)|(\*(.+?)\*)|(https?:\/\/[^\s\x29]+)/g;
    let lastIndex = 0;
    let m = re.exec(input);
    while (m !== null) {
      if (m.index > lastIndex) {
        segments.push({ text: input.substring(lastIndex, m.index), bold: false, italic: false, url: "" });
      }
      if (m[1]) {
        segments.push({ text: m[2], bold: true, italic: true, url: "" });
      } else if (m[3]) {
        segments.push({ text: m[4], bold: true, italic: false, url: "" });
      } else if (m[5]) {
        segments.push({ text: m[6], bold: false, italic: true, url: "" });
      } else if (m[7]) {
        segments.push({ text: m[7], bold: false, italic: false, url: m[7] });
      }
      lastIndex = m.index + m[0].length;
      m = re.exec(input);
    }
    if (lastIndex < input.length) {
      segments.push({ text: input.substring(lastIndex), bold: false, italic: false, url: "" });
    }
    if (segments.length === 0) {
      segments.push({ text: input, bold: false, italic: false, url: "" });
    }
    return segments;
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
    const headerLabel = title || "Annotation";
    const now = /* @__PURE__ */ new Date();
    const pad = function(n) {
      return n < 10 ? "0" + n : String(n);
    };
    const updatedAt = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    const userName = figma.currentUser ? figma.currentUser.name : "";
    const subtitleStr = userName ? updatedAt + " · " + userName : updatedAt;
    const titleFull = headerLabel + "\n" + subtitleStr;
    const titleNode = figma.createText();
    if (!FONT_B) throw new Error("Bold font not loaded");
    titleNode.fontName = FONT_B;
    titleNode.characters = titleFull;
    titleNode.fontSize = 13;
    titleNode.fills = [{ type: "SOLID", color: th.title }];
    titleNode.textAutoResize = "WIDTH_AND_HEIGHT";
    titleNode.paragraphSpacing = 2;
    const subStart = headerLabel.length + 1;
    if (FONT_R) titleNode.setRangeFontName(subStart, titleFull.length, FONT_R);
    titleNode.setRangeFontSize(subStart, titleFull.length, 10);
    titleNode.setRangeFills(subStart, titleFull.length, [{ type: "SOLID", color: th.subtitle }]);
    header.appendChild(titleNode);
    panel.appendChild(header);
    const body = alFrame("body", "VERTICAL", 0, 10);
    body.paddingTop = 0;
    body.paddingBottom = 10;
    body.paddingLeft = 18;
    body.paddingRight = 18;
    body.layoutAlign = "STRETCH";
    body.primaryAxisSizingMode = "AUTO";
    body.counterAxisSizingMode = "FIXED";
    let hasDesc = false;
    for (let di = 0; di < parsed.desc.length; di++) {
      if (parsed.desc[di] && parsed.desc[di] !== "--") {
        hasDesc = true;
        break;
      }
    }
    if (hasDesc) {
      const descBlock = alFrame("descBlock", "VERTICAL", 0, 6);
      descBlock.paddingTop = 12;
      descBlock.paddingBottom = 12;
      descBlock.paddingLeft = 14;
      descBlock.paddingRight = 14;
      descBlock.cornerRadius = 8;
      descBlock.fills = [{ type: "SOLID", color: th.descBg }];
      descBlock.layoutAlign = "STRETCH";
      descBlock.counterAxisSizingMode = "AUTO";
      const descSections = [[]];
      for (let di = 0; di < parsed.desc.length; di++) {
        if (parsed.desc[di] === "--") {
          descSections.push([]);
        } else {
          descSections[descSections.length - 1].push(parsed.desc[di]);
        }
      }
      let firstSection = true;
      for (let si = 0; si < descSections.length; si++) {
        let hasSectionContent = false;
        for (let li = 0; li < descSections[si].length; li++) {
          if (descSections[si][li]) {
            hasSectionContent = true;
            break;
          }
        }
        if (!hasSectionContent) continue;
        if (!firstSection) {
          const dv = figma.createFrame();
          dv.name = "descDivider";
          dv.resize(10, 1);
          dv.layoutAlign = "STRETCH";
          dv.fills = [{ type: "SOLID", color: th.divider }];
          descBlock.appendChild(dv);
        }
        firstSection = false;
        const sectionText = descSections[si].join("\n");
        const dt = txtFormatted(sectionText, 12, th.descText, th.linkText);
        dt.lineHeight = { value: 160, unit: "PERCENT" };
        dt.layoutAlign = "STRETCH";
        dt.textAutoResize = "HEIGHT";
        descBlock.appendChild(dt);
      }
      body.appendChild(descBlock);
    }
    function tagRow(tagName, value, isWarn) {
      const tagColors = th.tags[tagName] || th.tags.memo;
      const label = tagName.toUpperCase();
      const gap = "  ";
      const segments = parseInlineFormat(value);
      let valuePlain = "";
      for (let vi = 0; vi < segments.length; vi++) {
        valuePlain += segments[vi].text;
      }
      const fullText = label + gap + valuePlain;
      const t = figma.createText();
      if (!FONT_R) throw new Error("Regular font not loaded");
      t.fontName = FONT_R;
      t.characters = fullText || " ";
      t.fontSize = 11.5;
      const valColor = isWarn ? th.warnText : th.text;
      t.fills = [{ type: "SOLID", color: valColor }];
      t.lineHeight = { value: 150, unit: "PERCENT" };
      t.layoutAlign = "STRETCH";
      t.textAutoResize = "HEIGHT";
      const labelEnd = label.length;
      if (FONT_B) t.setRangeFontName(0, labelEnd, FONT_B);
      t.setRangeFills(0, labelEnd, [{ type: "SOLID", color: tagColors.text }]);
      t.setRangeLetterSpacing(0, labelEnd, { value: 0.5, unit: "PIXELS" });
      t.setRangeFontSize(0, labelEnd, 9);
      let offset = labelEnd + gap.length;
      for (let vi = 0; vi < segments.length; vi++) {
        const seg = segments[vi];
        const len = seg.text.length;
        if (len === 0) {
          offset += len;
          continue;
        }
        const start = offset;
        const end = offset + len;
        if (seg.bold && seg.italic && FONT_BI) {
          t.setRangeFontName(start, end, FONT_BI);
        } else if (seg.bold && FONT_B) {
          t.setRangeFontName(start, end, FONT_B);
        } else if (seg.italic && FONT_I) {
          t.setRangeFontName(start, end, FONT_I);
        }
        if (seg.url) {
          t.setRangeHyperlink(start, end, { type: "URL", value: seg.url });
          t.setRangeFills(start, end, [{ type: "SOLID", color: th.linkText }]);
          t.setRangeTextDecoration(start, end, "UNDERLINE");
        }
        offset = end;
      }
      body.appendChild(t);
    }
    for (let oi = 0; oi < parsed.ordered.length; oi++) {
      const entry = parsed.ordered[oi];
      tagRow(entry.type, entry.value, entry.type === "warn");
    }
    panel.appendChild(body);
    panel.x = targetNode.absoluteTransform[0][2] + targetNode.width + PANEL_GAP;
    panel.y = targetNode.absoluteTransform[1][2];
    return panel;
  }
  function stripPrefix(name) {
    return name.replace(/^\[AIR-\d+\]\s*/, "").replace(/\s*\|.*$/, "");
  }
  function getNextNum() {
    let max = 0;
    const children = figma.currentPage.children;
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      const m = c.name.match(/^\[AIR-(\d+)\]/) || c.name.match(/^📋 Annotation: (\d+)/) || c.name.match(/^🏷️ (\d+)/);
      if (m) {
        const n = parseInt(m[1]);
        if (n > max) max = n;
      }
    }
    const next = max + 1;
    return next;
  }
  function removeExistingArtifacts(num) {
    return __async(this, null, function* () {
      const panelName = "📋 Annotation: " + num;
      const markerName = "🏷️ " + num;
      let targetNodeId = "";
      const children = figma.currentPage.children;
      for (let i = 0; i < children.length; i++) {
        const c = children[i];
        if (!targetNodeId && c.name === panelName) {
          try {
            targetNodeId = c.getPluginData("targetNodeId") || "";
          } catch (e) {
          }
        }
      }
      if (!targetNodeId) {
        const indexData = readHiddenData(String(num));
        if (indexData && indexData.target) targetNodeId = indexData.target;
      }
      for (let i = children.length - 1; i >= 0; i--) {
        const c = children[i];
        const n = c.name;
        if (n === panelName || n === markerName) {
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
  var INDEX_NAME = "📑 AIR: AI-Readable Annotator Index";
  function readHiddenData(num) {
    const indexMap = readIndexMap();
    const fromIndex = indexMap.get(String(num));
    if (fromIndex) return fromIndex;
    return null;
  }
  function buildHiddenDataMap() {
    return readIndexMap();
  }
  function parseIndexText(content) {
    const map = /* @__PURE__ */ new Map();
    if (!content) return map;
    if (/\[AIRA:\d+\]/.test(content)) {
      const blocks = content.split(/\n(?=\[AIRA:\d+\])/);
      for (let bi = 0; bi < blocks.length; bi++) {
        const block = blocks[bi].trim();
        const headerMatch = block.match(/\[AIRA:(\d+)\]/);
        if (!headerMatch) continue;
        const num = headerMatch[1];
        const lineStart = block.indexOf("[AIRA:" + num + "]");
        const afterHeader = block.substring(lineStart);
        const lines = afterHeader.split("\n");
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
            if (ln.indexOf("════") === 0) break;
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
        while (descLines.length > 0 && (descLines[descLines.length - 1] === "" || descLines[descLines.length - 1] === "*---*")) descLines.pop();
        const desc = descLines.join("\n");
        map.set(num, { title, desc, color, target });
      }
      return map;
    }
    const legacyBlocks = content.split(/\n(?=\[AIR-\d+\])/);
    for (let bi = 0; bi < legacyBlocks.length; bi++) {
      const block = legacyBlocks[bi].trim();
      const hm = block.match(/^\[AIR-(\d+)\]\s+(.*?)(?:\s{2,}\((\w+),\s*([\w:;]+)\))?\s*$/m);
      if (!hm) continue;
      const num = hm[1];
      const title = hm[2].trim();
      const target = hm[4] ? hm[4].trim() : "";
      const lines = block.split("\n");
      const descLines = [];
      for (let li = 1; li < lines.length; li++) {
        const ln = lines[li];
        if (ln.indexOf("════") === 0) break;
        if (ln.length === 0) {
          descLines.push("");
          continue;
        }
        descLines.push(ln.indexOf("  ") === 0 ? ln.substring(2) : ln);
      }
      while (descLines.length > 0 && descLines[descLines.length - 1] === "") descLines.pop();
      const desc = descLines.join("\n");
      map.set(num, { title, desc, color: "", target });
    }
    return map;
  }
  function readIndexMap() {
    const children = figma.currentPage.children;
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (c.name === INDEX_NAME && "children" in c) {
        const frame = c;
        for (let j = 0; j < frame.children.length; j++) {
          if (frame.children[j].type === "TEXT") {
            const content = frame.children[j].characters || "";
            const map = parseIndexText(content);
            if (map.size > 0) return map;
          }
        }
      }
    }
    return /* @__PURE__ */ new Map();
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
      const markerName = "🏷️ " + num;
      let targetNodeId = "";
      let foundPanel = false;
      let foundMarker = false;
      const children = figma.currentPage.children;
      for (let i = 0; i < children.length; i++) {
        const c = children[i];
        if (!foundPanel && c.name === panelName) {
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
  function updateSpecIndex(excludeNums) {
    return __async(this, null, function* () {
      let existingIdx = null;
      let existingTxt = null;
      let indexMap = /* @__PURE__ */ new Map();
      for (let ri = figma.currentPage.children.length - 1; ri >= 0; ri--) {
        const rc = figma.currentPage.children[ri];
        if (rc.name === INDEX_NAME) {
          if (!existingIdx && "children" in rc) {
            const idxFrame = rc;
            for (let ti = 0; ti < idxFrame.children.length; ti++) {
              if (idxFrame.children[ti].type === "TEXT") {
                existingIdx = idxFrame;
                existingTxt = idxFrame.children[ti];
                const indexContent = existingTxt.characters || "";
                indexMap = parseIndexText(indexContent);
                existingTxt.characters = "";
                break;
              }
            }
            if (!existingTxt) rc.remove();
          } else {
            rc.remove();
          }
        }
      }
      if (excludeNums) {
        excludeNums.forEach(function(n) {
          indexMap.delete(n);
        });
      }
      const hiddenNums = getHiddenNums();
      const panelDataMap = {};
      const pageChildren = figma.currentPage.children;
      for (let i = pageChildren.length - 1; i >= 0; i--) {
        const c = pageChildren[i];
        if (c.name === INDEX_NAME) {
          continue;
        }
        const fpMatch = c.name.match(/^📋 Annotation: (\d+)/);
        if (fpMatch) {
          const fpnum = fpMatch[1];
          let fpDesc = "", fpColor = "", fpTarget = "";
          try {
            fpDesc = c.getPluginData("specTags") || "";
            fpColor = c.getPluginData("markerColor") || "";
            fpTarget = c.getPluginData("targetNodeId") || "";
          } catch (e) {
          }
          if (fpTarget && !panelDataMap[fpnum]) {
            panelDataMap[fpnum] = { desc: fpDesc, color: fpColor, target: fpTarget };
          }
          continue;
        }
      }
      const allNums = /* @__PURE__ */ new Set();
      indexMap.forEach(function(_data, num) {
        allNums.add(num);
      });
      for (const pn in panelDataMap) allNums.add(pn);
      const specs = [];
      const pendingResolve = [];
      allNums.forEach(function(num) {
        const panel = panelDataMap[num];
        const idx = indexMap.get(num);
        if (panel) {
          pendingResolve.push({
            num,
            targetNodeId: panel.target,
            title: idx ? idx.title : "",
            desc: panel.desc,
            color: panel.color || (idx ? idx.color : "")
          });
        } else if (idx) {
          pendingResolve.push({
            num,
            targetNodeId: idx.target,
            title: idx.title,
            desc: idx.desc,
            color: idx.color
          });
        }
      });
      const resolvePromises = [];
      for (let i = 0; i < pendingResolve.length; i++) {
        if (pendingResolve[i].targetNodeId) {
          resolvePromises.push(figma.getNodeByIdAsync(pendingResolve[i].targetNodeId));
        } else {
          resolvePromises.push(Promise.resolve(null));
        }
      }
      const resolvedNodes = yield Promise.all(resolvePromises);
      for (let i = 0; i < pendingResolve.length; i++) {
        const pr = pendingResolve[i];
        const tNode = resolvedNodes[i];
        let resolvedTitle = pr.title;
        if (tNode) {
          const tm = tNode.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
          if (tm) resolvedTitle = tm[1];
        }
        specs.push({
          num: parseInt(pr.num),
          title: resolvedTitle,
          desc: pr.desc,
          color: pr.color,
          nodeId: pr.targetNodeId,
          nodeType: tNode ? tNode.type : "",
          nodeName: tNode ? tNode.name : ""
        });
      }
      if (specs.length === 0) {
        if (existingIdx) existingIdx.remove();
        return;
      }
      specs.sort(function(a, b) {
        return a.num - b.num;
      });
      const lines = [];
      lines.push("📑 AI-READABLE ANNOTATOR INDEX");
      lines.push("# title = annotation name");
      lines.push("# color = badge hex color");
      lines.push("# target = Figma node ID of the annotated layer");
      lines.push("════════════════════════════════");
      lines.push("");
      for (let s = 0; s < specs.length; s++) {
        const sp = specs[s];
        if (s > 0) {
          lines.push("*---*");
          lines.push("");
        }
        let header = "[AIRA:" + sp.num + "]";
        if (hiddenNums.has(sp.num)) header += "  [HIDDEN]";
        lines.push(header);
        lines.push("title: " + sp.title);
        lines.push("color: " + sp.color);
        lines.push("target: " + sp.nodeId);
        lines.push("===");
        if (sp.desc) {
          lines.push(sp.desc);
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
      footerLine += " | AIR v1";
      lines.push(footerLine);
      const content = lines.join("\n");
      if (existingIdx && existingTxt) {
        existingTxt.characters = content;
      } else {
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
      }
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
      if (child.name.indexOf("📑 AIR:") === 0) continue;
      if (child.name.indexOf("🏷️") === 0) continue;
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
  var _readSelectionSeq = 0;
  function readSelectedDesc() {
    return __async(this, null, function* () {
      if (_readingSelection) return;
      const seq = ++_readSelectionSeq;
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
          if (seq !== _readSelectionSeq) return;
          if (targetNode) {
            _readingSelection = true;
            try {
              figma.currentPage.selection = [targetNode];
              figma.viewport.scrollAndZoomIntoView([targetNode]);
            } finally {
              _readingSelection = false;
            }
            return;
          }
        }
      }
      const panelMatch = node.name.match(/^📋 Annotation: (\d+)/);
      if (panelMatch) {
        const pNum = panelMatch[1];
        let pTitle = "", pDesc = "", pColor = "";
        let pTargetId = "";
        let pTargetName = "";
        let pTargetType = "";
        const pHidden = readHiddenData(pNum);
        if (pHidden) {
          pTitle = pHidden.title;
          pDesc = pHidden.desc;
          pColor = pHidden.color;
          pTargetId = pHidden.target;
        } else {
          try {
            pDesc = node.getPluginData("specTags") || "";
            pColor = node.getPluginData("markerColor") || "";
          } catch (e) {
          }
        }
        if (!pTargetId) {
          try {
            pTargetId = node.getPluginData("targetNodeId") || "";
          } catch (e) {
          }
        }
        if (pTargetId) {
          const pTarget = yield figma.getNodeByIdAsync(pTargetId);
          if (seq !== _readSelectionSeq) return;
          if (pTarget) {
            pTargetName = pTarget.name;
            pTargetType = pTarget.type;
          }
        }
        figma.ui.postMessage({
          type: "selection-desc",
          nodeId: pTargetId || node.id,
          nodeName: pTargetName || node.name,
          nodeType: pTargetType || node.type,
          title: pTitle,
          desc: pDesc,
          color: pColor
        });
        return;
      }
      if (node.name.indexOf("📑 AIR:") === 0) {
        figma.ui.postMessage({ type: "selection-empty" });
        return;
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
          for (let i = 0; i < figma.currentPage.children.length; i++) {
            const cin = figma.currentPage.children[i].name;
            if (cin === panelName) {
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
  function writeSpec(node, title, desc, num, colorHex) {
    return __async(this, null, function* () {
      const nodeId = node.id;
      const markerColor = colorHex ? hexToRgb(colorHex) : CLR.headerBg;
      try {
        let currentNum = num;
        if (!currentNum) {
          const em = node.name.match(/^\[AIR-(\d+)\]/);
          if (em) currentNum = em[1];
        }
        if (currentNum) {
          const cleanName = stripPrefix(node.name);
          const summary = makeSummary(desc);
          const displayTitle = title || cleanName;
          node.name = "[AIR-" + currentNum + "] " + displayTitle + summary;
        }
        if (!currentNum) return { ok: false, error: "번호가 없습니다." };
        let existingPos = null;
        const panelName = "📋 Annotation: " + currentNum;
        const markerName = "🏷️ " + currentNum;
        const wChildren = figma.currentPage.children;
        for (let wi = wChildren.length - 1; wi >= 0; wi--) {
          const wc = wChildren[wi];
          const wn = wc.name;
          if (wn === panelName) {
            if (!existingPos) existingPos = { x: wc.x, y: wc.y };
            wc.remove();
          } else if (wn === markerName) {
            wc.remove();
          }
        }
        if ("children" in node) {
          const tChildren = node.children;
          for (let tk = tChildren.length - 1; tk >= 0; tk--) {
            if (tChildren[tk].name === markerName) tChildren[tk].remove();
          }
        }
        if (!desc || !desc.trim()) {
          node.name = stripPrefix(node.name);
          return { ok: true };
        }
        const panel = createSpecPanel(title, desc, currentNum, node, markerColor);
        figma.currentPage.appendChild(panel);
        if (existingPos) {
          panel.x = existingPos.x;
          panel.y = existingPos.y;
        }
        createMarkerBadge(currentNum, node, markerColor);
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
        const batchNode = yield figma.getNodeByIdAsync(m.nodeId);
        if (!batchNode) {
          fail++;
          errors.push("노드를 찾을 수 없습니다: " + m.nodeId);
          continue;
        }
        const result = yield writeSpec(batchNode, m.title || "", m.description, String(num), m.color || "");
        if (result.ok) success++;
        else {
          fail++;
          errors.push(result.error);
        }
      }
      return { success, fail, errors };
    });
  }
  function renumberAllSpecs() {
    return __async(this, null, function* () {
      const currentNums = [];
      const children = figma.currentPage.children;
      for (let i = 0; i < children.length; i++) {
        const m = children[i].name.match(/^📋 Annotation: (\d+)/);
        if (m) currentNums.push(parseInt(m[1]));
      }
      currentNums.sort(function(a, b) {
        return a - b;
      });
      let needsRenumber = false;
      for (let i = 0; i < currentNums.length; i++) {
        if (currentNums[i] !== i + 1) {
          needsRenumber = true;
          break;
        }
      }
      if (!needsRenumber || currentNums.length === 0) return;
      const order = [];
      for (let i = 0; i < currentNums.length; i++) order.push(String(currentNums[i]));
      const oldToNew = {};
      for (let oi = 0; oi < order.length; oi++) {
        oldToNew[order[oi]] = oi + 1;
      }
      const reorderHiddenMap = buildHiddenDataMap();
      const reorderHiddenNums = getHiddenNums();
      const entries = [];
      const rnChildren = figma.currentPage.children;
      for (let oi = 0; oi < order.length; oi++) {
        const oldNum = order[oi];
        const newNum = oldToNew[oldNum];
        let data = reorderHiddenMap.get(oldNum) || null;
        if (!data) {
          for (let ci = 0; ci < rnChildren.length; ci++) {
            const cn = rnChildren[ci].name;
            if (cn === "📋 Annotation: " + oldNum) {
              try {
                const pd = rnChildren[ci].getPluginData("specTags") || "";
                const pc = rnChildren[ci].getPluginData("markerColor") || "";
                const pt = rnChildren[ci].getPluginData("targetNodeId") || "";
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
        for (let ci = 0; ci < rnChildren.length; ci++) {
          const cn = rnChildren[ci].name;
          if (cn === "📋 Annotation: " + oldNum) {
            panelPos = { x: rnChildren[ci].x, y: rnChildren[ci].y };
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
          if (tNode) tNode.name = stripPrefix(tNode.name);
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
      yield updateSpecIndex();
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
        let canEdit = true;
        try {
          figma.root.setPluginData("__airEditTest__", "1");
          figma.root.setPluginData("__airEditTest__", "");
        } catch (e) {
          canEdit = false;
        }
        figma.ui.postMessage({ type: "init-done", fileKey: figma.fileKey || "", theme: currentTheme, canEdit });
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
        rebuildHiddenMap.forEach(function(rdata, rnum) {
          allSpecs.push({ num: rnum, data: rdata });
          foundNums[rnum] = true;
        });
        for (let rk = 0; rk < children.length; rk++) {
          const rck = children[rk];
          const rpMatch = rck.name.match(/^📋 Annotation: (\d+)/);
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
          }
        }
        const rebuildTargetIds = [];
        for (let si = 0; si < allSpecs.length; si++) {
          rebuildTargetIds.push(allSpecs[si].data.target || "");
        }
        const rebuildNodePromises = [];
        for (let si = 0; si < rebuildTargetIds.length; si++) {
          rebuildNodePromises.push(rebuildTargetIds[si] ? figma.getNodeByIdAsync(rebuildTargetIds[si]) : Promise.resolve(null));
        }
        const rebuildResolvedNodes = yield Promise.all(rebuildNodePromises);
        for (let si = 0; si < allSpecs.length; si++) {
          const spec = allSpecs[si];
          const targetId = spec.data.target;
          if (!targetId) continue;
          const tNode = rebuildResolvedNodes[si];
          if (!tNode) continue;
          const panelName = "📋 Annotation: " + spec.num;
          let existPos = null;
          for (let pi = 0; pi < figma.currentPage.children.length; pi++) {
            const pn = figma.currentPage.children[pi].name;
            if (pn === panelName) {
              existPos = { x: figma.currentPage.children[pi].x, y: figma.currentPage.children[pi].y };
              break;
            }
          }
          for (let di = figma.currentPage.children.length - 1; di >= 0; di--) {
            const dn = figma.currentPage.children[di].name;
            if (dn === panelName) {
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
        const panelTargetMap = {};
        for (let pi = 0; pi < children.length; pi++) {
          const pm = children[pi].name.match(/^📋 Annotation: (\d+)/);
          if (pm) {
            try {
              panelTargetMap[pm[1]] = children[pi].getPluginData("targetNodeId") || "";
            } catch (e) {
            }
          }
        }
        listHiddenMap.forEach(function(data, num) {
          let targetId = data.target || "";
          if (!targetId) {
            targetId = panelTargetMap[num] || "";
          }
          specs.push({
            num,
            title: data.title,
            color: data.color,
            desc: data.desc,
            targetNodeId: targetId,
            preview: data.desc ? data.desc.split("\n").slice(0, 2).join(" ") : "",
            hidden: listHiddenNums.has(parseInt(num))
          });
          foundNums[num] = true;
        });
        for (let k = 0; k < children.length; k++) {
          const ck = children[k];
          const panelMatch = ck.name.match(/^📋 Annotation: (\d+)/);
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
        if (!node) {
          figma.notify("❌ 노드를 찾을 수 없습니다.", { error: true });
          figma.ui.postMessage({ type: "write-error" });
          return;
        }
        let existingNum = null;
        const pm = node.name.match(/^\[AIR-(\d+)\]/);
        if (pm) existingNum = pm[1];
        if (!existingNum) existingNum = String(getNextNum());
        const result = yield writeSpec(node, msg.title || "", msg.desc, existingNum, msg.color || "");
        if (result.ok) {
          figma.notify("✅ [AIR-" + existingNum + "] " + (msg.title || "저장 완료"));
          figma.ui.postMessage({ type: "write-success", nodeId: msg.nodeId });
          _readingSelection = true;
          figma.currentPage.selection = [node];
          _readingSelection = false;
          yield updateSpecIndex();
          readSelectedDesc();
        } else {
          figma.notify("❌ " + result.error, { error: true });
          figma.ui.postMessage({ type: "write-error" });
        }
      }
      if (msg.type === "apply-batch") {
        const result = yield applyBatch(msg.mappings);
        const notice = "✅ " + result.success + "개 저장 완료" + (result.fail > 0 ? " / " + result.fail + "개 실패" : "");
        figma.notify(notice);
        figma.ui.postMessage({ type: "batch-done", result });
        figma.ui.postMessage({ type: "layers-scanned", layers: scanLayers(figma.currentPage, 0) });
        yield updateSpecIndex();
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
        yield updateSpecIndex(/* @__PURE__ */ new Set([num]));
        yield renumberAllSpecs();
        figma.notify("🗑️ [AIR-" + num + "] 어노테이션 삭제 완료");
        figma.ui.postMessage({ type: "delete-done", num });
        readSelectedDesc();
      }
      if (msg.type === "rebuild-index") {
        yield updateSpecIndex();
        figma.notify("📑 AI용 스펙 인덱스를 최신 상태로 갱신했어요");
        figma.ui.postMessage({ type: "rebuild-done" });
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
        yield updateSpecIndex();
      }
      if (msg.type === "set-all-visibility") {
        const allNums = [];
        const seen = {};
        const targetNodeIds = [];
        const children = figma.currentPage.children;
        for (let i = 0; i < children.length; i++) {
          const c = children[i];
          const pm = c.name.match(/^📋 Annotation: (\d+)/);
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
        }
        const visIndexMap = readIndexMap();
        visIndexMap.forEach(function(data, num) {
          const dnum = parseInt(num);
          if (!seen[dnum]) {
            allNums.push(dnum);
            seen[dnum] = true;
          }
          if (data.target) targetNodeIds.push(data.target);
        });
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
        yield updateSpecIndex();
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
              if (cn === "📋 Annotation: " + oldNum) {
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
            if (cn === "📋 Annotation: " + oldNum) {
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
          const am = afterChildren[ai].name.match(/^\[AIR-(\d+)\]/) || afterChildren[ai].name.match(/^📋 Annotation: (\d+)/);
          if (am) {
            const an = parseInt(am[1]);
            if (an > maxNewNum) maxNewNum = an;
          }
        }
        yield updateSpecIndex();
        figma.notify("🔢 " + entries.length + "개 어노테이션 순서 변경");
        figma.ui.postMessage({ type: "reorder-done" });
      }
      if (msg.type === "delete-all-specs") {
        const allNums = /* @__PURE__ */ new Set();
        const targetIds = {};
        const children = figma.currentPage.children;
        for (let i = 0; i < children.length; i++) {
          const c = children[i];
          let m = c.name.match(/^📋 Annotation: (\d+)/);
          if (m) {
            allNums.add(m[1]);
            try {
              const tid = c.getPluginData("targetNodeId") || "";
              if (tid) targetIds[m[1]] = tid;
            } catch (e) {
            }
            continue;
          }
          m = c.name.match(/^🏷️ (\d+)/);
          if (m) {
            allNums.add(m[1]);
            continue;
          }
          m = c.name.match(/^\[AIR-(\d+)\]/);
          if (m) {
            allNums.add(m[1]);
            continue;
          }
        }
        const delAllMap = buildHiddenDataMap();
        delAllMap.forEach(function(data, num) {
          allNums.add(num);
          if (data.target && !targetIds[num]) targetIds[num] = data.target;
        });
        const numArr = [];
        allNums.forEach(function(n) {
          numArr.push(n);
        });
        for (let i = 0; i < numArr.length; i++) {
          yield removeExistingArtifacts(numArr[i]);
        }
        for (let i = 0; i < numArr.length; i++) {
          const tid = targetIds[numArr[i]] || "";
          if (tid) {
            const tNode = yield figma.getNodeByIdAsync(tid);
            if (tNode) tNode.name = stripPrefix(tNode.name);
          }
        }
        for (let i = figma.currentPage.children.length - 1; i >= 0; i--) {
          if (figma.currentPage.children[i].name === INDEX_NAME) {
            figma.currentPage.children[i].remove();
          }
        }
        setHiddenNums(/* @__PURE__ */ new Set());
        figma.notify("🗑️ " + numArr.length + "개 어노테이션 전체 삭제 완료");
        figma.ui.postMessage({ type: "delete-all-done" });
      }
      if (msg.type === "delete-selected-specs") {
        const nums = msg.nums;
        if (!nums || nums.length === 0) return;
        const delMap = buildHiddenDataMap();
        const delHidden = getHiddenNums();
        for (let i = 0; i < nums.length; i++) {
          const num = nums[i];
          let targetId = "";
          const data = delMap.get(num);
          if (data && data.target) targetId = data.target;
          if (!targetId) {
            for (let pi = 0; pi < figma.currentPage.children.length; pi++) {
              const pc = figma.currentPage.children[pi];
              const pm = pc.name.match(/^📋 Annotation: (\d+)/);
              if (pm && pm[1] === num) {
                try {
                  targetId = pc.getPluginData("targetNodeId") || "";
                } catch (e) {
                }
                break;
              }
            }
          }
          yield removeExistingArtifacts(num);
          if (targetId) {
            const tNode = yield figma.getNodeByIdAsync(targetId);
            if (tNode) tNode.name = stripPrefix(tNode.name);
          }
          delHidden.delete(parseInt(num));
        }
        setHiddenNums(delHidden);
        const excludeSet = new Set(nums);
        yield updateSpecIndex(excludeSet);
        yield renumberAllSpecs();
        figma.notify("🗑️ " + nums.length + "개 어노테이션 삭제 완료");
        figma.ui.postMessage({ type: "delete-selected-done" });
      }
      if (msg.type === "cancel") {
        figma.closePlugin();
      }
    });
  };
})();
