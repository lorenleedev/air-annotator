// AIR: AI-Readable Annotator v1
// Copyright (c) 2026 은결. All rights reserved.
// Make your design speak to AI

// ──────────────────────────────────────
// Domain interfaces
// ──────────────────────────────────────

interface TagColors {
  bg: RGB;
  text: RGB;
}

interface ThemeColors {
  panelBg: RGB;
  headerBorder: RGB;
  title: RGB;
  subtitle: RGB;
  text: RGB;
  descBg: RGB;
  descText: RGB;
  divider: RGB;
  footer: RGB;
  warnText: RGB;
  linkText: RGB;
  shadow: number;
  tags: Record<string, TagColors>;
}

interface TextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
  url: string;
}

interface TagEntry {
  type: string;
  value: string;
}

interface ParsedTags {
  desc: string[];
  route: string[];
  auth: string[];
  api: string[];
  ux: string[];
  warn: string[];
  memo: string[];
  ordered: TagEntry[];
}

interface HiddenData {
  title: string;
  color: string;
  target: string;
  desc: string;
}

interface WriteResult {
  ok: boolean;
  error?: string;
}

interface BatchResult {
  success: number;
  fail: number;
  errors: string[];
}

interface LayerInfo {
  id: string;
  name: string;
  type: string;
  depth: number;
}

interface SpecInfo {
  num: number;
  title: string;
  desc: string;
  color: string;
  nodeId: string;
  nodeType: string;
  nodeName: string;
}

interface BatchMapping {
  nodeId: string;
  title?: string;
  description: string;
  color?: string;
}

type UIMessage =
  | { type: "init" }
  | { type: "rebuild-all-panels"; theme?: string }
  | { type: "scan-layers" }
  | { type: "read-selection" }
  | { type: "list-specs" }
  | { type: "write-desc"; nodeId: string; title?: string; desc: string; color?: string; theme?: string }
  | { type: "apply-batch"; mappings: BatchMapping[] }
  | { type: "select-node"; nodeId: string }
  | { type: "delete-spec"; nodeId?: string; num?: string }
  | { type: "rebuild-index" }
  | { type: "toggle-visibility"; num: string; visible: boolean }
  | { type: "set-all-visibility"; visible: boolean }
  | { type: "reorder-specs"; order: string[] }
  | { type: "delete-all-specs" }
  | { type: "delete-selected-specs"; nums: string[] }
  | { type: "cancel" };

// ── Relaunch: 패널/마커/대상 노드에서 플러그인 열기 ──
if (figma.command === "edit") {
  const sel: readonly SceneNode[] = figma.currentPage.selection;
  if (sel.length > 0) {
    const n: SceneNode = sel[0];
    let targetId: string = "";

    // 패널 선택
    const panelMatch: RegExpMatchArray | null = n.name.match(/^📋 Annotation: (\d+)/);
    if (panelMatch) {
      try { targetId = n.getPluginData("targetNodeId") || ""; } catch(e) {}
      if (!targetId) {
        const hd: HiddenData | null = readHiddenData(panelMatch[1]);
        if (hd && hd.target) targetId = hd.target;
      }
    }

    // 마커 선택
    if (!targetId) {
      const markerMatch: RegExpMatchArray | null = n.name.match(/^🏷️ (\d+)/);
      if (markerMatch) {
        const hd: HiddenData | null = readHiddenData(markerMatch[1]);
        if (hd && hd.target) targetId = hd.target;
      }
    }

    // 대상 노드로 이동
    if (targetId) {
      (async function(): Promise<void> {
        try {
          const targetNode: BaseNode | null = await figma.getNodeByIdAsync(targetId);
          if (targetNode) {
            figma.currentPage.selection = [targetNode as SceneNode];
            figma.viewport.scrollAndZoomIntoView([targetNode as SceneNode]);
          }
        } catch(e) {}
      })();
    }
  }
}

figma.showUI(__html__, { width: 420, height: 620, themeColors: true });

// 기본 컬러 (마커, 인덱스 등 테마 독립 요소용)
const CLR = {
  headerBg:   { r: 0.05, g: 0.55, b: 0.91 } as RGB,
  white:      { r: 1, g: 1, b: 1 } as RGB,
  text:       { r: 0.13, g: 0.13, b: 0.13 } as RGB,
};

// ──────────────────────────────────────
// 테마 컬러 시스템
// ──────────────────────────────────────
const THEMES: Record<string, ThemeColors> = {
  light: {
    panelBg:    { r: 1, g: 1, b: 1 },
    headerBorder: { r: 0.94, g: 0.94, b: 0.94 },
    title:      { r: 0.10, g: 0.10, b: 0.10 },
    subtitle:   { r: 0.60, g: 0.60, b: 0.60 },
    text:       { r: 0.22, g: 0.25, b: 0.32 },
    descBg:     { r: 0.97, g: 0.97, b: 0.98 },
    descText:   { r: 0.23, g: 0.26, b: 0.31 },
    divider:    { r: 0.85, g: 0.86, b: 0.88 },
    footer:     { r: 0.69, g: 0.69, b: 0.69 },
    warnText:   { r: 0.76, g: 0.25, b: 0.05 },
    linkText:   { r: 0.05, g: 0.45, b: 0.85 },
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
    descText:   { r: 0.73, g: 0.73, b: 0.75 },
    divider:    { r: 0.28, g: 0.28, b: 0.30 },
    footer:     { r: 0.33, g: 0.33, b: 0.33 },
    warnText:   { r: 0.98, g: 0.57, b: 0.24 },
    linkText:   { r: 0.40, g: 0.65, b: 1.00 },
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

let currentTheme: string = "light";

function getTheme(): ThemeColors { return THEMES[currentTheme] || THEMES.light; }

const PANEL_W: number = 360;
const PANEL_GAP: number = 60;

let fontLoaded: boolean = false;
let FONT_R: FontName | undefined;
let FONT_B: FontName | undefined;
let FONT_I: FontName | undefined;
let FONT_BI: FontName | undefined;

async function loadFonts(): Promise<void> {
  const families: string[] = ["Inter", "Roboto", "Arial"];
  for (let i = 0; i < families.length; i++) {
    try {
      await figma.loadFontAsync({ family: families[i], style: "Regular" });
      await figma.loadFontAsync({ family: families[i], style: "Bold" });
      FONT_R = { family: families[i], style: "Regular" };
      FONT_B = { family: families[i], style: "Bold" };
      fontLoaded = true;
      // Attempt italic variants with fallback
      try {
        await figma.loadFontAsync({ family: families[i], style: "Italic" });
        FONT_I = { family: families[i], style: "Italic" };
      } catch(e) { FONT_I = FONT_R; }
      try {
        await figma.loadFontAsync({ family: families[i], style: "Bold Italic" });
        FONT_BI = { family: families[i], style: "Bold Italic" };
      } catch(e) { FONT_BI = FONT_B; }
      return;
    } catch(e) {}
  }
}

// 유틸
function txt(text: string, size: number, color: RGB | undefined, bold: boolean): TextNode {
  const t: TextNode = figma.createText();
  if (bold) {
    if (!FONT_B) throw new Error("Bold font not loaded");
    t.fontName = FONT_B;
  } else {
    if (!FONT_R) throw new Error("Regular font not loaded");
    t.fontName = FONT_R;
  }
  t.characters = text || " ";
  t.fontSize = size || 11;
  if (color) t.fills = [{ type: "SOLID", color: color }];
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  return t;
}

function txtFormatted(input: string, size: number, color: RGB | undefined, linkColor: RGB): TextNode {
  const segments: TextSegment[] = parseInlineFormat(input);
  let plainText: string = "";
  for (let si = 0; si < segments.length; si++) {
    plainText += segments[si].text;
  }
  const t: TextNode = figma.createText();
  if (!FONT_R) throw new Error("Regular font not loaded");
  t.fontName = FONT_R;
  t.characters = plainText || " ";
  t.fontSize = size || 11;
  if (color) t.fills = [{ type: "SOLID", color: color }];
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  // Apply per-segment formatting
  let offset: number = 0;
  for (let si = 0; si < segments.length; si++) {
    const seg: TextSegment = segments[si];
    const len: number = seg.text.length;
    if (len === 0) { continue; }
    const start: number = offset;
    const end: number = offset + len;
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

function alFrame(name: string, dir: "HORIZONTAL" | "VERTICAL", padding: number, gap: number): FrameNode {
  const f: FrameNode = figma.createFrame();
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

function divider(): FrameNode {
  const th: ThemeColors = getTheme();
  const d: FrameNode = figma.createFrame();
  d.name = "divider";
  d.resize(PANEL_W - 36, 1);
  d.fills = [{ type: "SOLID", color: th.divider }];
  d.layoutAlign = "STRETCH";
  return d;
}

function hexToRgb(hex: string): RGB {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255
  };
}

// 태그 파싱
function parseTags(desc: string): ParsedTags {
  const result: ParsedTags = { desc: [], route: [], auth: [], api: [], ux: [], warn: [], memo: [], ordered: [] };
  if (!desc) return result;
  const lines: string[] = desc.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line: string = lines[i].trim();
    if (!line) { result.desc.push(""); continue; }
    if (line.match(/^\[route\]/)) { const v: string = line.replace(/^\[route\]\s*/, ""); result.route.push(v); result.ordered.push({ type: "route", value: v }); }
    else if (line.match(/^\[auth\]/)) { const v: string = line.replace(/^\[auth\]\s*/, ""); result.auth.push(v); result.ordered.push({ type: "auth", value: v }); }
    else if (line.match(/^\[api\]/)) { const v: string = line.replace(/^\[api\]\s*/, ""); result.api.push(v); result.ordered.push({ type: "api", value: v }); }
    else if (line.match(/^\[ux\]/)) { const v: string = line.replace(/^\[ux\]\s*/, ""); result.ux.push(v); result.ordered.push({ type: "ux", value: v }); }
    else if (line.match(/^\[warn\]/)) { const v: string = line.replace(/^\[warn\]\s*/, ""); result.warn.push(v); result.ordered.push({ type: "warn", value: v }); }
    else if (line.match(/^\[memo\]/)) { const v: string = line.replace(/^\[memo\]\s*/, ""); result.memo.push(v); result.ordered.push({ type: "memo", value: v }); }
    else {
      const dm: RegExpMatchArray | null = line.match(/^\[desc\]\s*(.*)/);
      result.desc.push(dm ? dm[1] : line);
    }
  }
  return result;
}

// 인라인 서식 파싱 (bold, italic, URL)
function parseInlineFormat(input: string): TextSegment[] {
  if (!input) return [{ text: "", bold: false, italic: false, url: "" }];
  const segments: TextSegment[] = [];
  const re: RegExp = /(\*\*\*(.+?)\*\*\*)|(\*\*(.+?)\*\*)|(\*(.+?)\*)|(https?:\/\/[^\s\x29]+)/g;
  let lastIndex: number = 0;
  let m: RegExpExecArray | null = re.exec(input);
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

// 레이어명 요약 생성
function makeSummary(desc: string): string {
  if (!desc) return "";
  const parts: string[] = [];
  const lines: string[] = desc.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line: string = lines[i].trim();
    const dm: RegExpMatchArray | null = line.match(/^\[desc\]\s*(.*)/);
    if (dm && parts.length === 0) { parts.push(dm[1].substring(0, 20)); }
    if (line.match(/^\[api\]/)) parts.push("api");
    if (line.match(/^\[ux\]/)) parts.push("ux");
  }
  return parts.length > 0 ? " | " + parts.join(" · ") : "";
}

// ──────────────────────────────────────
// 스펙 패널 생성
// ──────────────────────────────────────
function createSpecPanel(title: string, desc: string, num: string | number, targetNode: SceneNode, markerColor: RGB | undefined): FrameNode {
  const parsed: ParsedTags = parseTags(desc);
  const headerColor: RGB = markerColor || CLR.headerBg;
  const th: ThemeColors = getTheme();

  // ── Panel container ──
  const panel: FrameNode = alFrame("📋 Annotation: " + num, "VERTICAL", 0, 0);
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
  } as DropShadowEffect];

  // ── Header ──
  const header: FrameNode = alFrame("header", "HORIZONTAL", 0, 10);
  header.paddingTop = 14; header.paddingBottom = 12;
  header.paddingLeft = 18; header.paddingRight = 18;
  header.fills = [];
  header.layoutAlign = "STRETCH";
  header.primaryAxisSizingMode = "AUTO";
  header.counterAxisSizingMode = "AUTO";
  header.counterAxisAlignItems = "MIN";

  // Number badge — same style as marker badge
  const numBadge: FrameNode = alFrame("numBadge", "HORIZONTAL", 0, 0);
  numBadge.paddingTop = 2; numBadge.paddingBottom = 2;
  numBadge.paddingLeft = 6; numBadge.paddingRight = 6;
  numBadge.primaryAxisSizingMode = "AUTO";
  numBadge.counterAxisSizingMode = "AUTO";
  numBadge.primaryAxisAlignItems = "CENTER";
  numBadge.counterAxisAlignItems = "CENTER";
  numBadge.cornerRadius = 4;
  numBadge.fills = [{ type: "SOLID", color: headerColor }];
  const numText: TextNode = txt(String(num), 9, { r: 1, g: 1, b: 1 }, true);
  numBadge.appendChild(numText);
  header.appendChild(numBadge);

  // Title + subtitle as single TextNode
  const headerLabel: string = title || "Annotation";
  const now: Date = new Date();
  const pad = function(n: number): string { return n < 10 ? "0" + n : String(n); };
  const updatedAt: string = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
  const userName: string = figma.currentUser ? figma.currentUser.name : "";
  const subtitleStr: string = userName ? updatedAt + " · " + userName : updatedAt;
  const titleFull: string = headerLabel + "\n" + subtitleStr;
  const titleNode: TextNode = figma.createText();
  if (!FONT_B) throw new Error("Bold font not loaded");
  titleNode.fontName = FONT_B;
  titleNode.characters = titleFull;
  titleNode.fontSize = 13;
  titleNode.fills = [{ type: "SOLID", color: th.title }];
  titleNode.textAutoResize = "WIDTH_AND_HEIGHT";
  titleNode.paragraphSpacing = 2;
  const subStart: number = headerLabel.length + 1;
  if (FONT_R) titleNode.setRangeFontName(subStart, titleFull.length, FONT_R);
  titleNode.setRangeFontSize(subStart, titleFull.length, 10);
  titleNode.setRangeFills(subStart, titleFull.length, [{ type: "SOLID", color: th.subtitle }]);
  header.appendChild(titleNode);
  panel.appendChild(header);

  // ── Body ──
  const body: FrameNode = alFrame("body", "VERTICAL", 0, 10);
  body.paddingTop = 0; body.paddingBottom = 10;
  body.paddingLeft = 18; body.paddingRight = 18;
  body.layoutAlign = "STRETCH";
  body.primaryAxisSizingMode = "AUTO";
  body.counterAxisSizingMode = "FIXED";

  // Description block — split by "--" lines into sections with dividers
  let hasDesc: boolean = false;
  for (let di = 0; di < parsed.desc.length; di++) {
    if (parsed.desc[di] && parsed.desc[di] !== "--") { hasDesc = true; break; }
  }
  if (hasDesc) {
    const descBlock: FrameNode = alFrame("descBlock", "VERTICAL", 0, 6);
    descBlock.paddingTop = 12; descBlock.paddingBottom = 12;
    descBlock.paddingLeft = 14; descBlock.paddingRight = 14;
    descBlock.cornerRadius = 8;
    descBlock.fills = [{ type: "SOLID", color: th.descBg }];
    descBlock.layoutAlign = "STRETCH";
    descBlock.counterAxisSizingMode = "AUTO";
    // Group desc lines into sections separated by "--"
    const descSections: string[][] = [[]];
    for (let di = 0; di < parsed.desc.length; di++) {
      if (parsed.desc[di] === "--") {
        descSections.push([]);
      } else {
        descSections[descSections.length - 1].push(parsed.desc[di]);
      }
    }
    let firstSection: boolean = true;
    for (let si = 0; si < descSections.length; si++) {
      let hasSectionContent: boolean = false;
      for (let li = 0; li < descSections[si].length; li++) {
        if (descSections[si][li]) { hasSectionContent = true; break; }
      }
      if (!hasSectionContent) continue;
      if (!firstSection) {
        const dv: FrameNode = figma.createFrame();
        dv.name = "descDivider";
        dv.resize(10, 1);
        dv.layoutAlign = "STRETCH";
        dv.fills = [{ type: "SOLID", color: th.divider }];
        descBlock.appendChild(dv);
      }
      firstSection = false;
      const sectionText: string = descSections[si].join("\n");
      const dt: TextNode = txtFormatted(sectionText, 12, th.descText, th.linkText);
      dt.lineHeight = { value: 160, unit: "PERCENT" };
      dt.layoutAlign = "STRETCH";
      dt.textAutoResize = "HEIGHT";
      descBlock.appendChild(dt);
    }
    body.appendChild(descBlock);
  }

  // Tag row helper — single TextNode per row ("TAG  value" with range formatting)
  function tagRow(tagName: string, value: string, isWarn: boolean): void {
    const tagColors: TagColors = th.tags[tagName] || th.tags.memo;
    const label: string = tagName.toUpperCase();
    const gap: string = "  ";
    const segments: TextSegment[] = parseInlineFormat(value);
    let valuePlain: string = "";
    for (let vi = 0; vi < segments.length; vi++) {
      valuePlain += segments[vi].text;
    }
    const fullText: string = label + gap + valuePlain;
    const t: TextNode = figma.createText();
    if (!FONT_R) throw new Error("Regular font not loaded");
    t.fontName = FONT_R;
    t.characters = fullText || " ";
    t.fontSize = 11.5;
    const valColor: RGB = isWarn ? th.warnText : th.text;
    t.fills = [{ type: "SOLID", color: valColor }];
    t.lineHeight = { value: 150, unit: "PERCENT" };
    t.layoutAlign = "STRETCH";
    t.textAutoResize = "HEIGHT";
    // Tag label styling
    const labelEnd: number = label.length;
    if (FONT_B) t.setRangeFontName(0, labelEnd, FONT_B);
    t.setRangeFills(0, labelEnd, [{ type: "SOLID", color: tagColors.text }]);
    t.setRangeLetterSpacing(0, labelEnd, { value: 0.5, unit: "PIXELS" });
    t.setRangeFontSize(0, labelEnd, 9);
    // Value inline formatting
    let offset: number = labelEnd + gap.length;
    for (let vi = 0; vi < segments.length; vi++) {
      const seg: TextSegment = segments[vi];
      const len: number = seg.text.length;
      if (len === 0) { offset += len; continue; }
      const start: number = offset;
      const end: number = offset + len;
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

  // Render tags in user input order
  for (let oi = 0; oi < parsed.ordered.length; oi++) {
    const entry: TagEntry = parsed.ordered[oi];
    tagRow(entry.type, entry.value, entry.type === "warn");
  }

  panel.appendChild(body);

  // Position
  panel.x = targetNode.absoluteTransform[0][2] + targetNode.width + PANEL_GAP;
  panel.y = targetNode.absoluteTransform[1][2];

  return panel;
}

// ──────────────────────────────────────
// 넘버링
// ──────────────────────────────────────
function stripPrefix(name: string): string {
  return name.replace(/^\[AIR-\d+\]\s*/, "").replace(/\s*\|.*$/, "");
}

function getNextNum(): number {
  // 항상 페이지 스캔 수행하여 실제 최대 번호 확인
  let max: number = 0;
  const children: readonly SceneNode[] = figma.currentPage.children;
  for (let i = 0; i < children.length; i++) {
    const c: SceneNode = children[i];
    const m: RegExpMatchArray | null = c.name.match(/^\[AIR-(\d+)\]/) ||
            c.name.match(/^📋 Annotation: (\d+)/) ||
            c.name.match(/^🏷️ (\d+)/);
    if (m) { const n: number = parseInt(m[1]); if (n > max) max = n; }
  }
  // 스캔 결과만 사용 (캐시 제거 — 삭제 후 번호 재사용 허용)
  const next: number = max + 1;
  return next;
}

// ──────────────────────────────────────
// 기존 산출물 제거
// ──────────────────────────────────────
async function removeExistingArtifacts(num: string | number): Promise<void> {
  const panelName: string = "📋 Annotation: " + num;
  const markerName: string = "🏷️ " + num;

  let targetNodeId: string = "";
  const children: readonly SceneNode[] = figma.currentPage.children;
  // 1차 패스: targetNodeId 수집 (패널 pluginData)
  for (let i = 0; i < children.length; i++) {
    const c: SceneNode = children[i];
    if (!targetNodeId && c.name === panelName) {
      try { targetNodeId = c.getPluginData("targetNodeId") || ""; } catch(e) {}
    }
  }
  // 폴백: 인덱스에서 targetNodeId 조회
  if (!targetNodeId) {
    const indexData: HiddenData | null = readHiddenData(String(num));
    if (indexData && indexData.target) targetNodeId = indexData.target;
  }
  // 2차 패스: 산출물 삭제
  for (let i = children.length - 1; i >= 0; i--) {
    const c: SceneNode = children[i];
    const n: string = c.name;
    if (n === panelName || n === markerName) {
      c.remove();
    }
  }

  // Check target node's direct children for nested marker badge
  if (targetNodeId) {
    const targetNode: BaseNode | null = await figma.getNodeByIdAsync(targetNodeId);
    if (targetNode && "children" in targetNode) {
      const tChildren: readonly SceneNode[] = (targetNode as FrameNode).children;
      for (let k = tChildren.length - 1; k >= 0; k--) {
        const tc: SceneNode = tChildren[k];
        if (tc.name === markerName) {
          tc.remove();
        }
      }
    }
  }
}

// ──────────────────────────────────────
// 숨김 텍스트 노드 (AI 읽기용)
// ──────────────────────────────────────
const INDEX_NAME: string = "📑 AIR: AI-Readable Annotator Index";

function readHiddenData(num: string | number): HiddenData | null {
  // Try index first
  const indexMap: Map<string, HiddenData> = readIndexMap();
  const fromIndex: HiddenData | undefined = indexMap.get(String(num));
  if (fromIndex) return fromIndex;
  return null;
}

function buildHiddenDataMap(): Map<string, HiddenData> {
  return readIndexMap();
}

function parseIndexText(content: string): Map<string, HiddenData> {
  const map: Map<string, HiddenData> = new Map();
  if (!content) return map;

  // 현재 포맷 감지: [AIRA:N] 헤더가 있으면 현재 포맷
  if (/\[AIRA:\d+\]/.test(content)) {
    // ── 현재 포맷 파싱 ──
    const blocks: string[] = content.split(/\n(?=\[AIRA:\d+\])/);
    for (let bi = 0; bi < blocks.length; bi++) {
      const block: string = blocks[bi].trim();
      const headerMatch: RegExpMatchArray | null = block.match(/\[AIRA:(\d+)\]/);
      if (!headerMatch) continue;
      const num: string = headerMatch[1];
      const lineStart: number = block.indexOf("[AIRA:" + num + "]");
      const afterHeader: string = block.substring(lineStart);
      const lines: string[] = afterHeader.split("\n");
      let title: string = "", color: string = "", target: string = "";
      let pastSep: boolean = false;
      const descLines: string[] = [];
      for (let li = 1; li < lines.length; li++) {
        const ln: string = lines[li];
        if (ln === "===") { pastSep = true; continue; }
        if (pastSep) {
          if (ln.indexOf("\u2550\u2550\u2550\u2550") === 0) break;
          descLines.push(ln); continue;
        }
        if (ln.indexOf("title: ") === 0) { title = ln.substring(7); }
        else if (ln.indexOf("color: ") === 0) { color = ln.substring(7); }
        else if (ln.indexOf("target: ") === 0) { target = ln.substring(8); }
      }
      while (descLines.length > 0 && (descLines[descLines.length - 1] === "" || descLines[descLines.length - 1] === "*---*")) descLines.pop();
      const desc: string = descLines.join("\n");
      map.set(num, { title: title, desc: desc, color: color, target: target });
    }
    return map;
  }

  // ── 레거시 포맷 파싱 (v1 마이그레이션) ──
  // 헤더: [AIR-N] Title  (TYPE, nodeId) 또는 [AIR-N] Title
  // desc: 2칸 들여쓰기된 줄, 빈 줄로 구분
  const legacyBlocks: string[] = content.split(/\n(?=\[AIR-\d+\])/);
  for (let bi = 0; bi < legacyBlocks.length; bi++) {
    const block: string = legacyBlocks[bi].trim();
    // [AIR-N] Title  (TYPE, nodeId) 형식 파싱
    const hm: RegExpMatchArray | null = block.match(/^\[AIR-(\d+)\]\s+(.*?)(?:\s{2,}\((\w+),\s*([\w:;]+)\))?\s*$/m);
    if (!hm) continue;
    const num: string = hm[1];
    const title: string = hm[2].trim();
    const target: string = hm[4] ? hm[4].trim() : "";
    // 헤더 이후 줄들이 desc (2칸 들여쓰기 제거)
    const lines: string[] = block.split("\n");
    const descLines: string[] = [];
    for (let li = 1; li < lines.length; li++) {
      const ln: string = lines[li];
      if (ln.indexOf("\u2550\u2550\u2550\u2550") === 0) break;
      // 2칸 들여쓰기 제거, 빈 줄 보존
      if (ln.length === 0) { descLines.push(""); continue; }
      descLines.push(ln.indexOf("  ") === 0 ? ln.substring(2) : ln);
    }
    while (descLines.length > 0 && descLines[descLines.length - 1] === "") descLines.pop();
    const desc: string = descLines.join("\n");
    map.set(num, { title: title, desc: desc, color: "", target: target });
  }
  return map;
}

function readIndexMap(): Map<string, HiddenData> {
  // Try to read from index frame first
  const children: readonly SceneNode[] = figma.currentPage.children;
  for (let i = 0; i < children.length; i++) {
    const c: SceneNode = children[i];
    if (c.name === INDEX_NAME && "children" in c) {
      const frame = c as FrameNode;
      for (let j = 0; j < frame.children.length; j++) {
        if (frame.children[j].type === "TEXT") {
          const content: string = (frame.children[j] as TextNode).characters || "";
          const map: Map<string, HiddenData> = parseIndexText(content);
          if (map.size > 0) return map;
        }
      }
    }
  }
  return new Map();
}

// ──────────────────────────────────────
// 어노테이션 숨김/표시 관리
// ──────────────────────────────────────
function getHiddenNums(): Set<number> {
  const raw: string = figma.currentPage.getPluginData("airHiddenNums") || "";
  if (!raw) return new Set();
  try {
    const arr: number[] = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr);
  } catch(e) {
    return new Set();
  }
}

function setHiddenNums(nums: Set<number>): void {
  const arr: number[] = [];
  nums.forEach(function(n: number) { arr.push(n); });
  arr.sort(function(a: number, b: number) { return a - b; });
  figma.currentPage.setPluginData("airHiddenNums", JSON.stringify(arr));
}

async function setAnnotationVisibility(num: number, isVisible: boolean): Promise<void> {
  const panelName: string = "📋 Annotation: " + num;
  const markerName: string = "🏷️ " + num;

  let targetNodeId: string = "";
  let foundPanel: boolean = false;
  let foundMarker: boolean = false;
  const children: readonly SceneNode[] = figma.currentPage.children;
  for (let i = 0; i < children.length; i++) {
    const c: SceneNode = children[i];
    if (!foundPanel && c.name === panelName) {
      c.visible = isVisible;
      try { targetNodeId = c.getPluginData("targetNodeId") || ""; } catch(e) {}
      foundPanel = true;
    } else if (!foundMarker && c.name === markerName) {
      c.visible = isVisible;
      foundMarker = true;
    }
    if (foundPanel && foundMarker) break;
  }

  // Check target node's children for nested marker badge
  if (targetNodeId) {
    const targetNode: BaseNode | null = await figma.getNodeByIdAsync(targetNodeId);
    if (targetNode && "children" in targetNode) {
      const tChildren: readonly SceneNode[] = (targetNode as FrameNode).children;
      for (let k = 0; k < tChildren.length; k++) {
        if (tChildren[k].name === markerName) {
          tChildren[k].visible = isVisible;
          break;
        }
      }
    }
  }
}

// ──────────────────────────────────────
// 📑 AI용 스펙 인덱스 (MCP 연동)
// ──────────────────────────────────────

async function updateSpecIndex(excludeNums?: Set<string>): Promise<void> {
  // 1단계: 기존 인덱스 프레임 검색 + 텍스트를 비우기 전에 파싱 (primary data)
  let existingIdx: FrameNode | null = null;
  let existingTxt: TextNode | null = null;
  let indexMap: Map<string, HiddenData> = new Map();
  for (let ri = figma.currentPage.children.length - 1; ri >= 0; ri--) {
    const rc: SceneNode = figma.currentPage.children[ri];
    if (rc.name === INDEX_NAME) {
      if (!existingIdx && "children" in rc) {
        const idxFrame: FrameNode = rc as FrameNode;
        for (let ti = 0; ti < idxFrame.children.length; ti++) {
          if (idxFrame.children[ti].type === "TEXT") {
            existingIdx = idxFrame;
            existingTxt = idxFrame.children[ti] as TextNode;
            // 비우기 전에 먼저 파싱하여 인덱스 데이터 보존
            const indexContent: string = existingTxt.characters || "";
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
    excludeNums.forEach(function(n: string) { indexMap.delete(n); });
  }
  const hiddenNums: Set<number> = getHiddenNums();

  // 2단계: 패널 pluginData 수집 (패널이 있으면 최신 데이터)
  interface PanelInfo {
    desc: string;
    color: string;
    target: string;
  }
  const panelDataMap: Record<string, PanelInfo> = {};

  const pageChildren: readonly SceneNode[] = figma.currentPage.children;
  for (let i = pageChildren.length - 1; i >= 0; i--) {
    const c: SceneNode = pageChildren[i];
    if (c.name === INDEX_NAME) { continue; }

    const fpMatch: RegExpMatchArray | null = c.name.match(/^📋 Annotation: (\d+)/);
    if (fpMatch) {
      const fpnum: string = fpMatch[1];
      let fpDesc: string = "", fpColor: string = "", fpTarget: string = "";
      try {
        fpDesc = c.getPluginData("specTags") || "";
        fpColor = c.getPluginData("markerColor") || "";
        fpTarget = c.getPluginData("targetNodeId") || "";
      } catch(e) {}
      if (fpTarget && !panelDataMap[fpnum]) {
        panelDataMap[fpnum] = { desc: fpDesc, color: fpColor, target: fpTarget };
      }
      continue;
    }
  }

  // 3단계: 병합 — 패널 존재 시 패널 우선(최신), 없으면 인덱스(보존)
  const allNums: Set<string> = new Set();
  indexMap.forEach(function(_data: HiddenData, num: string) { allNums.add(num); });
  for (const pn in panelDataMap) allNums.add(pn);

  const specs: SpecInfo[] = [];
  interface PendingResolve {
    num: string;
    targetNodeId: string;
    title: string;
    desc: string;
    color: string;
  }
  const pendingResolve: PendingResolve[] = [];
  allNums.forEach(function(num: string) {
    const panel: PanelInfo | undefined = panelDataMap[num];
    const idx: HiddenData | undefined = indexMap.get(num);
    if (panel) {
      // 패널 존재 → 패널 데이터가 최신 (writeSpec이 방금 업데이트)
      pendingResolve.push({
        num: num,
        targetNodeId: panel.target,
        title: idx ? idx.title : "",
        desc: panel.desc,
        color: panel.color || (idx ? idx.color : "")
      });
    } else if (idx) {
      // 패널 없음 → 인덱스 데이터 보존 (수동 삭제된 패널)
      pendingResolve.push({
        num: num,
        targetNodeId: idx.target,
        title: idx.title,
        desc: idx.desc,
        color: idx.color
      });
    }
  });

  // targetNodeId 일괄 병렬 resolve
  const resolvePromises: Array<Promise<BaseNode | null>> = [];
  for (let i = 0; i < pendingResolve.length; i++) {
    if (pendingResolve[i].targetNodeId) {
      resolvePromises.push(figma.getNodeByIdAsync(pendingResolve[i].targetNodeId));
    } else {
      resolvePromises.push(Promise.resolve(null));
    }
  }
  const resolvedNodes: Array<BaseNode | null> = await Promise.all(resolvePromises);

  for (let i = 0; i < pendingResolve.length; i++) {
    const pr: PendingResolve = pendingResolve[i];
    const tNode: BaseNode | null = resolvedNodes[i];
    // title: 타겟 노드에서 추출 (최신), 없으면 인덱스 title
    let resolvedTitle: string = pr.title;
    if (tNode) {
      const tm: RegExpMatchArray | null = tNode.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
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
  specs.sort(function(a: SpecInfo, b: SpecInfo): number { return a.num - b.num; });

  // 인덱스 텍스트 생성 (구조화 데이터)
  const lines: string[] = [];
  lines.push("📑 AI-READABLE ANNOTATOR INDEX");
  lines.push("# title = annotation name");
  lines.push("# color = badge hex color");
  lines.push("# target = Figma node ID of the annotated layer");
  lines.push("════════════════════════════════");
  lines.push("");

  for (let s = 0; s < specs.length; s++) {
    const sp: SpecInfo = specs[s];
    if (s > 0) {
      lines.push("*---*");
      lines.push("");
    }
    let header: string = "[AIRA:" + sp.num + "]";
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
  let footerLine: string = "총 " + specs.length + "개 스펙";
  let hiddenCount: number = 0;
  for (let hci = 0; hci < specs.length; hci++) {
    if (hiddenNums.has(specs[hci].num)) hiddenCount++;
  }
  if (hiddenCount > 0) {
    footerLine += " (" + hiddenCount + "개 숨김)";
  }
  footerLine += " | AIR v1";
  lines.push(footerLine);

  const content: string = lines.join("\n");

  if (existingIdx && existingTxt) {
    // 기존 인덱스 프레임 재사용 — TextNode 내용만 교체
    existingTxt.characters = content;
  } else {
    // 인덱스 프레임 새로 생성 (최초 또는 깨진 경우)
    const idx: FrameNode = figma.createFrame();
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

    const t: TextNode = figma.createText();
    if (!FONT_R) throw new Error("Regular font not loaded");
    t.fontName = FONT_R;
    t.characters = content;
    t.fontSize = 11;
    t.fills = [{ type: "SOLID", color: CLR.text }];
    t.textAutoResize = "WIDTH_AND_HEIGHT";
    idx.appendChild(t);

    // 위치: 모든 컨텐츠 오른쪽 끝에서 +200
    let maxX: number = 0;
    for (let i = 0; i < figma.currentPage.children.length; i++) {
      const child: SceneNode = figma.currentPage.children[i];
      if (child.name === INDEX_NAME) continue;
      const right: number = child.x + (child.width || 0);
      if (right > maxX) maxX = right;
    }
    idx.x = maxX + 200;
    idx.y = 0;

    figma.currentPage.appendChild(idx);
  }
}

// ──────────────────────────────────────
// 마커 뱃지
// ──────────────────────────────────────
function createMarkerBadge(num: string | number, targetNode: SceneNode, markerColor: RGB | undefined): FrameNode {
  const color: RGB = markerColor || CLR.headerBg;
  const marker: FrameNode = alFrame("🏷️ " + num, "HORIZONTAL", 0, 0);
  marker.paddingTop = 2; marker.paddingBottom = 2;
  marker.paddingLeft = 6; marker.paddingRight = 6;
  marker.cornerRadius = 4;
  marker.fills = [{ type: "SOLID", color: color }];
  marker.appendChild(txt(String(num), 9, CLR.white, true));

  const canHaveChildren: boolean = ("children" in targetNode) &&
    (targetNode.type === "FRAME" || targetNode.type === "COMPONENT" ||
     targetNode.type === "COMPONENT_SET" || targetNode.type === "GROUP" ||
     targetNode.type === "SECTION");

  if (canHaveChildren) {
    try {
      (targetNode as FrameNode).appendChild(marker);
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

  marker.setRelaunchData({ edit: '' });
  marker.locked = true;
  return marker;
}

// ──────────────────────────────────────
// 스캔
// ──────────────────────────────────────
function scanLayers(node: BaseNode & ChildrenMixin, depth: number): LayerInfo[] {
  if (depth > 5) return [];
  const results: LayerInfo[] = [];
  if (!("children" in node)) return results;
  for (let i = 0; i < node.children.length; i++) {
    const child: SceneNode = node.children[i];
    if (child.name.indexOf("📋 Annotation:") === 0) continue;
    if (child.name.indexOf("📑 AIR:") === 0) continue;   // 인덱스 프레임 필터
    if (child.name.indexOf("🏷️") === 0) continue;
    if ((child.type as string) === "PAGE" || (child.type as string) === "DOCUMENT") continue;

    results.push({ id: child.id, name: child.name, type: child.type, depth: depth });
    if ("children" in child && child.type !== "INSTANCE") {
      try {
        const sub: LayerInfo[] = scanLayers(child as SceneNode & ChildrenMixin, depth + 1);
        for (let j = 0; j < sub.length; j++) results.push(sub[j]);
      } catch(e) {}
    }
  }
  return results;
}

// ──────────────────────────────────────
// 선택 읽기
// ──────────────────────────────────────
let _readingSelection: boolean = false;
let _readSelectionSeq: number = 0;
async function readSelectedDesc(): Promise<void> {
  if (_readingSelection) return;
  const seq: number = ++_readSelectionSeq;
  const sel: readonly SceneNode[] = figma.currentPage.selection;
  if (sel.length === 0) {
    figma.ui.postMessage({ type: "selection-empty" });
    return;
  }
  const node: SceneNode = sel[0];

  // ── 마커 선택 시 → 원본 노드로 이동 ──
  const markerMatch: RegExpMatchArray | null = node.name.match(/^🏷️ (\d+)/);
  if (markerMatch) {
    const num: string = markerMatch[1];
    let targetId: string = "";

    const hidden: HiddenData | null = readHiddenData(num);
    if (hidden && hidden.target) targetId = hidden.target;

    if (targetId) {
      const targetNode: BaseNode | null = await figma.getNodeByIdAsync(targetId);
      if (seq !== _readSelectionSeq) return;
      if (targetNode) {
        _readingSelection = true;
        try {
          figma.currentPage.selection = [targetNode as SceneNode];
          figma.viewport.scrollAndZoomIntoView([targetNode as SceneNode]);
        } finally {
          _readingSelection = false;
        }
        return;
      }
    }
  }

  // ── 패널 선택 시 → 주석 데이터 표시 (선택 이동 없이) ──
  const panelMatch: RegExpMatchArray | null = node.name.match(/^📋 Annotation: (\d+)/);
  if (panelMatch) {
    const pNum: string = panelMatch[1];
    let pTitle: string = "", pDesc: string = "", pColor: string = "";
    let pTargetId: string = "";
    let pTargetName: string = "";
    let pTargetType: string = "";
    const pHidden: HiddenData | null = readHiddenData(pNum);
    if (pHidden) {
      pTitle = pHidden.title; pDesc = pHidden.desc; pColor = pHidden.color;
      pTargetId = pHidden.target;
    } else {
      try { pDesc = node.getPluginData("specTags") || ""; pColor = node.getPluginData("markerColor") || ""; } catch(e) {}
    }
    if (!pTargetId) {
      try { pTargetId = node.getPluginData("targetNodeId") || ""; } catch(e) {}
    }
    if (pTargetId) {
      const pTarget: BaseNode | null = await figma.getNodeByIdAsync(pTargetId);
      if (seq !== _readSelectionSeq) return;
      if (pTarget) { pTargetName = pTarget.name; pTargetType = pTarget.type; }
    }
    figma.ui.postMessage({
      type: "selection-desc",
      nodeId: pTargetId || node.id, nodeName: pTargetName || node.name, nodeType: pTargetType || node.type,
      title: pTitle, desc: pDesc, color: pColor
    });
    return;
  }

  // ── 데이터 노드 / 인덱스 프레임 선택 방지 ──
  if (node.name.indexOf("📑 AIR:") === 0) {
    figma.ui.postMessage({ type: "selection-empty" });
    return;
  }

  // ── 일반 노드 처리 ──
  let num: string = "";
  const pm: RegExpMatchArray | null = node.name.match(/^\[AIR-(\d+)\]/);
  if (pm) num = pm[1];

  let title: string = "", desc: string = "", color: string = "";
  if (num) {
    const hidden: HiddenData | null = readHiddenData(num);
    if (hidden) {
      title = hidden.title;
      desc = hidden.desc;
      color = hidden.color;
    } else {
      const panelName: string = "📋 Annotation: " + num;
      for (let i = 0; i < figma.currentPage.children.length; i++) {
        const cin: string = figma.currentPage.children[i].name;
        if (cin === panelName) {
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
async function writeSpec(node: BaseNode, title: string, desc: string, num: string, colorHex: string): Promise<WriteResult> {
  const nodeId: string = node.id;
  const markerColor: RGB = colorHex ? hexToRgb(colorHex) : CLR.headerBg;

  try {
    let currentNum: string = num;
    if (!currentNum) {
      const em: RegExpMatchArray | null = node.name.match(/^\[AIR-(\d+)\]/);
      if (em) currentNum = em[1];
    }
    if (currentNum) {
      const cleanName: string = stripPrefix(node.name);
      const summary: string = makeSummary(desc);
      const displayTitle: string = title || cleanName;
      node.name = "[AIR-" + currentNum + "] " + displayTitle + summary;
    }
    if (!currentNum) return { ok: false, error: "번호가 없습니다." };

    // 단일 패스: 기존 패널 위치 저장 + 산출물 삭제
    let existingPos: { x: number; y: number } | null = null;
    const panelName: string = "📋 Annotation: " + currentNum;
    const markerName: string = "🏷️ " + currentNum;
    const wChildren: readonly SceneNode[] = figma.currentPage.children;
    for (let wi = wChildren.length - 1; wi >= 0; wi--) {
      const wc: SceneNode = wChildren[wi];
      const wn: string = wc.name;
      if (wn === panelName) {
        if (!existingPos) existingPos = { x: wc.x, y: wc.y };
        wc.remove();
      } else if (wn === markerName) {
        wc.remove();
      }
    }
    // 타겟 노드 내부의 중첩 마커 뱃지 제거
    if ("children" in node) {
      const tChildren: readonly SceneNode[] = (node as FrameNode).children;
      for (let tk = tChildren.length - 1; tk >= 0; tk--) {
        if (tChildren[tk].name === markerName) tChildren[tk].remove();
      }
    }
    if (!desc || !desc.trim()) {
      // desc가 비어있으면 [AIR-N] 접두사 제거 (고아 방지)
      node.name = stripPrefix(node.name);
      return { ok: true };
    }

    const panel: FrameNode = createSpecPanel(title, desc, currentNum, node as SceneNode, markerColor);
    figma.currentPage.appendChild(panel);

    // 기존 위치가 있으면 복원
    if (existingPos) {
      panel.x = existingPos.x;
      panel.y = existingPos.y;
    }
    createMarkerBadge(currentNum, node as SceneNode, markerColor);

    panel.setPluginData("specTags", desc);
    panel.setPluginData("targetNodeId", nodeId);
    panel.setPluginData("markerColor", colorHex || "");
    panel.setRelaunchData({ edit: '' });
    // 패널은 이동 가능, 내부 텍스트는 편집 불가
    for (let ci = 0; ci < panel.children.length; ci++) {
      panel.children[ci].locked = true;
    }

    // 대상 노드에도 Relaunch 버튼 설정
    (node as SceneNode).setRelaunchData({ edit: '' });

    // Clear from hidden set if present
    const writeHiddenSet: Set<number> = getHiddenNums();
    if (writeHiddenSet.has(parseInt(currentNum))) {
      writeHiddenSet.delete(parseInt(currentNum));
      setHiddenNums(writeHiddenSet);
    }

    return { ok: true };
  } catch(e: unknown) {
    return { ok: false, error: (e as Error).message };
  }
}

// ──────────────────────────────────────
// 일괄
// ──────────────────────────────────────
async function applyBatch(mappings: BatchMapping[]): Promise<BatchResult> {
  let success: number = 0, fail: number = 0;
  const errors: string[] = [];
  const nextNum: number = getNextNum();
  for (let i = 0; i < mappings.length; i++) {
    const m: BatchMapping = mappings[i];
    const num: number = nextNum + i;
    const batchNode: BaseNode | null = await figma.getNodeByIdAsync(m.nodeId);
    if (!batchNode) { fail++; errors.push("노드를 찾을 수 없습니다: " + m.nodeId); continue; }
    const result: WriteResult = await writeSpec(batchNode, m.title || "", m.description, String(num), m.color || "");
    if (result.ok) success++;
    else { fail++; errors.push(result.error!); }
  }
  return { success: success, fail: fail, errors: errors };
}

// ──────────────────────────────────────
async function renumberAllSpecs(): Promise<void> {
  // Collect current annotation numbers from panels
  const currentNums: number[] = [];
  const children: readonly SceneNode[] = figma.currentPage.children;
  for (let i = 0; i < children.length; i++) {
    const m: RegExpMatchArray | null = children[i].name.match(/^📋 Annotation: (\d+)/);
    if (m) currentNums.push(parseInt(m[1]));
  }
  currentNums.sort(function(a: number, b: number): number { return a - b; });

  // Check if already sequential 1,2,...,N
  let needsRenumber: boolean = false;
  for (let i = 0; i < currentNums.length; i++) {
    if (currentNums[i] !== i + 1) { needsRenumber = true; break; }
  }
  if (!needsRenumber || currentNums.length === 0) return;

  // Build order array as strings (existing reorder format)
  const order: string[] = [];
  for (let i = 0; i < currentNums.length; i++) order.push(String(currentNums[i]));

  // Build oldToNew mapping
  const oldToNew: Record<string, number> = {};
  for (let oi = 0; oi < order.length; oi++) {
    oldToNew[order[oi]] = oi + 1;
  }

  // Collect phase
  const reorderHiddenMap: Map<string, HiddenData> = buildHiddenDataMap();
  const reorderHiddenNums: Set<number> = getHiddenNums();

  interface RenumberEntry {
    oldNum: string;
    newNum: number;
    data: HiddenData;
    panelPos: { x: number; y: number } | null;
    wasHidden: boolean;
  }

  const entries: RenumberEntry[] = [];
  const rnChildren: readonly SceneNode[] = figma.currentPage.children;

  for (let oi = 0; oi < order.length; oi++) {
    const oldNum: string = order[oi];
    const newNum: number = oldToNew[oldNum];
    let data: HiddenData | null = reorderHiddenMap.get(oldNum) || null;

    // Fallback to panel pluginData
    if (!data) {
      for (let ci = 0; ci < rnChildren.length; ci++) {
        const cn: string = rnChildren[ci].name;
        if (cn === "📋 Annotation: " + oldNum) {
          try {
            const pd: string = rnChildren[ci].getPluginData("specTags") || "";
            const pc: string = rnChildren[ci].getPluginData("markerColor") || "";
            const pt: string = rnChildren[ci].getPluginData("targetNodeId") || "";
            let pTitle: string = "";
            if (pt) {
              const tn: BaseNode | null = await figma.getNodeByIdAsync(pt);
              if (tn) {
                const tm: RegExpMatchArray | null = tn.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
                pTitle = tm ? tm[1] : tn.name;
              }
            }
            data = { title: pTitle, desc: pd, color: pc, target: pt };
          } catch(e) {}
          break;
        }
      }
    }

    if (!data || !data.target) continue;

    // Save panel position
    let panelPos: { x: number; y: number } | null = null;
    for (let ci = 0; ci < rnChildren.length; ci++) {
      const cn: string = rnChildren[ci].name;
      if (cn === "📋 Annotation: " + oldNum) {
        panelPos = { x: rnChildren[ci].x, y: rnChildren[ci].y };
        break;
      }
    }

    entries.push({
      oldNum: oldNum,
      newNum: newNum,
      data: data,
      panelPos: panelPos,
      wasHidden: reorderHiddenNums.has(parseInt(oldNum))
    });
  }

  // Delete phase
  for (let ei = 0; ei < entries.length; ei++) {
    await removeExistingArtifacts(entries[ei].oldNum);
    if (entries[ei].data.target) {
      const tNode: BaseNode | null = await figma.getNodeByIdAsync(entries[ei].data.target);
      if (tNode) tNode.name = stripPrefix(tNode.name);
    }
  }

  // Recreate phase
  for (let ei = 0; ei < entries.length; ei++) {
    const entry: RenumberEntry = entries[ei];
    const tNode: BaseNode | null = await figma.getNodeByIdAsync(entry.data.target);
    if (!tNode) continue;

    const newNumStr: string = String(entry.newNum);
    const mColor: RGB = entry.data.color ? hexToRgb(entry.data.color) : CLR.headerBg;
    const summary: string = makeSummary(entry.data.desc);
    const displayTitle: string = entry.data.title || stripPrefix(tNode.name);

    tNode.name = "[AIR-" + newNumStr + "] " + displayTitle + summary;

    const panel: FrameNode = createSpecPanel(entry.data.title, entry.data.desc, newNumStr, tNode as SceneNode, mColor);
    figma.currentPage.appendChild(panel);
    if (entry.panelPos) {
      panel.x = entry.panelPos.x;
      panel.y = entry.panelPos.y;
    }
    panel.setPluginData("specTags", entry.data.desc);
    panel.setPluginData("targetNodeId", entry.data.target);
    panel.setPluginData("markerColor", entry.data.color || "");
    panel.setRelaunchData({ edit: '' });
    for (let ci = 0; ci < panel.children.length; ci++) {
      panel.children[ci].locked = true;
    }

    createMarkerBadge(newNumStr, tNode as SceneNode, mColor);
    (tNode as SceneNode).setRelaunchData({ edit: '' });

    if (entry.wasHidden) {
      await setAnnotationVisibility(entry.newNum, false);
    }
  }

  // Remap hidden nums
  const newHiddenNums: Set<number> = new Set();
  reorderHiddenNums.forEach(function(n: number) {
    const oldStr: string = String(n);
    if (oldToNew[oldStr]) {
      newHiddenNums.add(oldToNew[oldStr]);
    } else {
      newHiddenNums.add(n);
    }
  });
  setHiddenNums(newHiddenNums);

  // Update index after renumbering
  await updateSpecIndex();
}

// ──────────────────────────────────────
// 이벤트
// ──────────────────────────────────────
figma.on("selectionchange", function(): void { readSelectedDesc(); });
figma.on("currentpagechange", function(): void {
  readSelectedDesc();
  figma.ui.postMessage({ type: "page-changed" });
});

figma.ui.onmessage = async function(msg: UIMessage): Promise<void> {
  if (msg.type === "init") {
    await loadFonts();
    if (!fontLoaded) {
      figma.notify("❌ 폰트를 로드할 수 없습니다.", { error: true });
      return;
    }
    // Restore saved theme
    const savedTheme: string = figma.root.getPluginData("airTheme");
    if (savedTheme === "light" || savedTheme === "dark") currentTheme = savedTheme;
    let canEdit: boolean = true;
    try {
      figma.root.setPluginData("__airEditTest__", "1");
      figma.root.setPluginData("__airEditTest__", "");
    } catch (e) {
      canEdit = false;
    }
    figma.ui.postMessage({ type: "init-done", fileKey: figma.fileKey || "", theme: currentTheme, canEdit: canEdit });
    readSelectedDesc();
  }

  if (msg.type === "rebuild-all-panels") {
    if (msg.theme) {
      currentTheme = msg.theme;
      figma.root.setPluginData("airTheme", currentTheme);
    }
    let rebuilt: number = 0;
    const children: readonly SceneNode[] = figma.currentPage.children;
    // Collect all spec data first
    const allSpecs: Array<{ num: string; data: HiddenData }> = [];
    const foundNums: Record<string, boolean> = {};
    const rebuildHiddenMap: Map<string, HiddenData> = buildHiddenDataMap();
    // 1차: buildHiddenDataMap에서 (인덱스 또는 숨김 노드)
    rebuildHiddenMap.forEach(function(rdata: HiddenData, rnum: string) {
      allSpecs.push({ num: rnum, data: rdata });
      foundNums[rnum] = true;
    });
    // 2차: 패널 pluginData 폴백
    for (let rk = 0; rk < children.length; rk++) {
      const rck: SceneNode = children[rk];
      const rpMatch: RegExpMatchArray | null = rck.name.match(/^📋 Annotation: (\d+)/);
      if (!rpMatch) continue;
      const rpnum: string = rpMatch[1];
      if (foundNums[rpnum]) continue;
      let rpDesc: string = "", rpColor: string = "", rpTarget: string = "";
      try {
        rpDesc = rck.getPluginData("specTags") || "";
        rpColor = rck.getPluginData("markerColor") || "";
        rpTarget = rck.getPluginData("targetNodeId") || "";
      } catch(e) {}
      if (rpTarget) {
        let rpTitle: string = "";
        try {
          const rpNode: BaseNode | null = await figma.getNodeByIdAsync(rpTarget);
          if (rpNode) {
            const rptm: RegExpMatchArray | null = rpNode.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
            rpTitle = rptm ? rptm[1] : rpNode.name;
          }
        } catch(e) {}
        allSpecs.push({ num: rpnum, data: { title: rpTitle, desc: rpDesc, color: rpColor, target: rpTarget } });
        foundNums[rpnum] = true;
      }
    }
    // Rebuild each panel — 병렬로 target 노드 resolve
    const rebuildTargetIds: string[] = [];
    for (let si = 0; si < allSpecs.length; si++) {
      rebuildTargetIds.push(allSpecs[si].data.target || "");
    }
    const rebuildNodePromises: Array<Promise<BaseNode | null>> = [];
    for (let si = 0; si < rebuildTargetIds.length; si++) {
      rebuildNodePromises.push(rebuildTargetIds[si] ? figma.getNodeByIdAsync(rebuildTargetIds[si]) : Promise.resolve(null));
    }
    const rebuildResolvedNodes: Array<BaseNode | null> = await Promise.all(rebuildNodePromises);

    for (let si = 0; si < allSpecs.length; si++) {
      const spec: { num: string; data: HiddenData } = allSpecs[si];
      const targetId: string = spec.data.target;
      if (!targetId) continue;
      const tNode: BaseNode | null = rebuildResolvedNodes[si];
      if (!tNode) continue;

      // Save existing panel position
      const panelName: string = "📋 Annotation: " + spec.num;
      let existPos: { x: number; y: number } | null = null;
      for (let pi = 0; pi < figma.currentPage.children.length; pi++) {
        const pn: string = figma.currentPage.children[pi].name;
        if (pn === panelName) {
          existPos = { x: figma.currentPage.children[pi].x, y: figma.currentPage.children[pi].y };
          break;
        }
      }

      // Remove old panel only (keep marker)
      for (let di = figma.currentPage.children.length - 1; di >= 0; di--) {
        const dn: string = figma.currentPage.children[di].name;
        if (dn === panelName) {
          figma.currentPage.children[di].remove();
        }
      }

      // Create new panel with current theme
      const mColor: RGB = spec.data.color ? hexToRgb(spec.data.color) : CLR.headerBg;
      const newPanel: FrameNode = createSpecPanel(spec.data.title, spec.data.desc, spec.num, tNode as SceneNode, mColor);
      figma.currentPage.appendChild(newPanel);
      if (existPos) { newPanel.x = existPos.x; newPanel.y = existPos.y; }
      newPanel.setPluginData("specTags", spec.data.desc);
      newPanel.setPluginData("targetNodeId", targetId);
      newPanel.setPluginData("markerColor", spec.data.color || "");
      newPanel.setRelaunchData({ edit: '' });
      for (let ci = 0; ci < newPanel.children.length; ci++) {
        newPanel.children[ci].locked = true;
      }
      rebuilt++;
    }
    // Restore hidden state after rebuild
    const rebuildHiddenNums: Set<number> = getHiddenNums();
    if (rebuildHiddenNums.size > 0) {
      for (let hi = 0; hi < allSpecs.length; hi++) {
        if (rebuildHiddenNums.has(parseInt(allSpecs[hi].num))) {
          await setAnnotationVisibility(parseInt(allSpecs[hi].num), false);
        }
      }
    }
    const themeLabel: string = currentTheme === "dark" ? "Dark" : "Light";
    figma.notify("🎨 " + themeLabel + " theme applied to " + rebuilt + " panel(s)");
    figma.ui.postMessage({ type: "rebuild-done" });
  }

  if (msg.type === "scan-layers") {
    figma.ui.postMessage({ type: "layers-scanned", layers: scanLayers(figma.currentPage, 0) });
  }

  if (msg.type === "read-selection") { readSelectedDesc(); }

  if (msg.type === "list-specs") {
    const specs: Array<{ num: string; title: string; color: string; desc: string; targetNodeId: string; preview: string; hidden: boolean }> = [];
    const foundNums: Record<string, boolean> = {};
    const children: readonly SceneNode[] = figma.currentPage.children;
    const listHiddenMap: Map<string, HiddenData> = buildHiddenDataMap();
    const listHiddenNums: Set<number> = getHiddenNums();

    // 패널 targetNodeId 캐시 (O(n) 단일 패스)
    const panelTargetMap: Record<string, string> = {};
    for (let pi = 0; pi < children.length; pi++) {
      const pm: RegExpMatchArray | null = children[pi].name.match(/^📋 Annotation: (\d+)/);
      if (pm) {
        try { panelTargetMap[pm[1]] = children[pi].getPluginData("targetNodeId") || ""; } catch(e) {}
      }
    }

    // 1차: buildHiddenDataMap에서 (인덱스 또는 숨김 노드)
    listHiddenMap.forEach(function(data: HiddenData, num: string) {
      let targetId: string = data.target || "";
      if (!targetId) {
        targetId = panelTargetMap[num] || "";
      }
      specs.push({
        num: num,
        title: data.title,
        color: data.color,
        desc: data.desc,
        targetNodeId: targetId,
        preview: data.desc ? data.desc.split("\n").slice(0, 2).join(" ") : "",
        hidden: listHiddenNums.has(parseInt(num))
      });
      foundNums[num] = true;
    });

    // 2차: 패널 pluginData에서 폴백 스캔 (숨김 노드가 사라진 경우)
    for (let k = 0; k < children.length; k++) {
      const ck: SceneNode = children[k];
      const panelMatch: RegExpMatchArray | null = ck.name.match(/^📋 Annotation: (\d+)/);
      if (!panelMatch) continue;
      const pnum: string = panelMatch[1];
      if (foundNums[pnum]) continue;

      let pDesc: string = "", pColor: string = "", pTargetId: string = "";
      try {
        pDesc = ck.getPluginData("specTags") || "";
        pColor = ck.getPluginData("markerColor") || "";
        pTargetId = ck.getPluginData("targetNodeId") || "";
      } catch(e) {}

      let pTitle: string = "";
      if (pTargetId) {
        try {
          const tNode: BaseNode | null = await figma.getNodeByIdAsync(pTargetId);
          if (tNode) {
            const tm: RegExpMatchArray | null = tNode.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
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
        preview: pDesc ? pDesc.split("\n").slice(0, 2).join(" ") : "",
        hidden: listHiddenNums.has(parseInt(pnum))
      });
      foundNums[pnum] = true;

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
    const node: BaseNode | null = await figma.getNodeByIdAsync(msg.nodeId);
    if (!node) {
      figma.notify("❌ 노드를 찾을 수 없습니다.", { error: true });
      figma.ui.postMessage({ type: "write-error" });
      return;
    }
    let existingNum: string | null = null;
    const pm: RegExpMatchArray | null = node.name.match(/^\[AIR-(\d+)\]/);
    if (pm) existingNum = pm[1];
    if (!existingNum) existingNum = String(getNextNum());

    const result: WriteResult = await writeSpec(node, msg.title || "", msg.desc, existingNum, msg.color || "");
    if (result.ok) {
      figma.notify("✅ [AIR-" + existingNum + "] " + (msg.title || "저장 완료"));
      figma.ui.postMessage({ type: "write-success", nodeId: msg.nodeId });
      // 패널 선택 상태에서 저장 시 타겟 노드 선택 복원 (node 재사용)
      _readingSelection = true;
      figma.currentPage.selection = [node as SceneNode];
      _readingSelection = false;
      await updateSpecIndex();
      readSelectedDesc();
    } else {
      figma.notify("❌ " + result.error, { error: true });
      figma.ui.postMessage({ type: "write-error" });
    }
  }

  if (msg.type === "apply-batch") {
    const result: BatchResult = await applyBatch(msg.mappings);
    const notice: string = "✅ " + result.success + "개 저장 완료" + (result.fail > 0 ? " / " + result.fail + "개 실패" : "");
    figma.notify(notice);
    figma.ui.postMessage({ type: "batch-done", result: result });
    figma.ui.postMessage({ type: "layers-scanned", layers: scanLayers(figma.currentPage, 0) });
    await updateSpecIndex();
  }

  if (msg.type === "select-node") {
    const node: BaseNode | null = await figma.getNodeByIdAsync(msg.nodeId);
    if (node) {
      figma.currentPage.selection = [node as SceneNode];
      figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
    }
  }

  if (msg.type === "delete-spec") {
    // msg.nodeId = 어노테이션이 달린 원래 노드 ID
    // msg.num = 번호 (선택사항, nodeId에서도 추출 가능)
    const node: BaseNode | null = msg.nodeId ? await figma.getNodeByIdAsync(msg.nodeId) : null;
    let num: string | null = msg.num || null;

    // 노드에서 번호 추출
    if (!num && node) {
      const pm: RegExpMatchArray | null = node.name.match(/^\[AIR-(\d+)\]/);
      if (pm) num = pm[1];
    }

    if (!num) {
      figma.notify("❌ 삭제할 어노테이션을 찾을 수 없습니다.", { error: true });
      return;
    }

    // 패널 + 마커 + 데이터 노드 제거
    await removeExistingArtifacts(num);

    // Clean hidden set for deleted num
    const delHiddenSet: Set<number> = getHiddenNums();
    if (delHiddenSet.has(parseInt(num))) {
      delHiddenSet.delete(parseInt(num));
      setHiddenNums(delHiddenSet);
    }

    // 노드 이름에서 [AIR-N] 접두사 제거
    if (node) {
      node.name = stripPrefix(node.name);
    }

    await updateSpecIndex(new Set([num]));
    await renumberAllSpecs();
    figma.notify("🗑️ [AIR-" + num + "] 어노테이션 삭제 완료");
    figma.ui.postMessage({ type: "delete-done", num: num });
    readSelectedDesc();
  }

  if (msg.type === "rebuild-index") {
    await updateSpecIndex();
    figma.notify("📑 AI용 스펙 인덱스를 최신 상태로 갱신했어요");
    figma.ui.postMessage({ type: "rebuild-done" });
  }

  if (msg.type === "toggle-visibility") {
    const num: number = parseInt(msg.num);
    const hiddenSet: Set<number> = getHiddenNums();
    if (msg.visible) {
      hiddenSet.delete(num);
    } else {
      hiddenSet.add(num);
    }
    setHiddenNums(hiddenSet);
    await setAnnotationVisibility(num, msg.visible);
    figma.ui.postMessage({ type: "visibility-changed", num: msg.num, visible: msg.visible });
    await updateSpecIndex();
  }

  if (msg.type === "set-all-visibility") {
    const allNums: number[] = [];
    const seen: Record<number, boolean> = {};
    const targetNodeIds: string[] = [];

    // Single pass: set visibility + collect nums and target IDs
    const children: readonly SceneNode[] = figma.currentPage.children;
    for (let i = 0; i < children.length; i++) {
      const c: SceneNode = children[i];
      const pm: RegExpMatchArray | null = c.name.match(/^📋 Annotation: (\d+)/);
      if (pm) {
        c.visible = msg.visible;
        const pnum: number = parseInt(pm[1]);
        if (!seen[pnum]) { allNums.push(pnum); seen[pnum] = true; }
        try {
          const tid: string = c.getPluginData("targetNodeId") || "";
          if (tid) targetNodeIds.push(tid);
        } catch(e) {}
        continue;
      }
      const mm: RegExpMatchArray | null = c.name.match(/^🏷️ (\d+)$/);
      if (mm) {
        c.visible = msg.visible;
        const mnum: number = parseInt(mm[1]);
        if (!seen[mnum]) { allNums.push(mnum); seen[mnum] = true; }
        continue;
      }
    }

    // Also collect nums and targets from index/hidden data
    const visIndexMap: Map<string, HiddenData> = readIndexMap();
    visIndexMap.forEach(function(data: HiddenData, num: string) {
      const dnum: number = parseInt(num);
      if (!seen[dnum]) { allNums.push(dnum); seen[dnum] = true; }
      if (data.target) targetNodeIds.push(data.target);
    });

    // Parallel resolve all target nodes for nested markers
    const targetPromises: Array<Promise<BaseNode | null>> = [];
    for (let i = 0; i < targetNodeIds.length; i++) {
      targetPromises.push(figma.getNodeByIdAsync(targetNodeIds[i]));
    }
    const resolvedTargets: Array<BaseNode | null> = await Promise.all(targetPromises);
    for (let i = 0; i < resolvedTargets.length; i++) {
      const tNode: BaseNode | null = resolvedTargets[i];
      if (tNode && "children" in tNode) {
        const tChildren: readonly SceneNode[] = (tNode as FrameNode).children;
        for (let k = 0; k < tChildren.length; k++) {
          if (tChildren[k].name.match(/^🏷️ \d+$/)) {
            tChildren[k].visible = msg.visible;
          }
        }
      }
    }

    // Update hidden set
    const hiddenSet: Set<number> = getHiddenNums();
    if (msg.visible) {
      hiddenSet.clear();
    } else {
      for (let i = 0; i < allNums.length; i++) {
        hiddenSet.add(allNums[i]);
      }
    }
    setHiddenNums(hiddenSet);

    const label: string = msg.visible ? "shown" : "hidden";
    figma.notify("👁️ " + allNums.length + " annotation(s) " + label);
    figma.ui.postMessage({ type: "all-visibility-changed", visible: msg.visible });
    await updateSpecIndex();
  }

  if (msg.type === "reorder-specs") {
    const order: string[] = msg.order;
    if (!order || order.length === 0) return;

    // Build oldToNew mapping: order[0] becomes 1, order[1] becomes 2, etc.
    const oldToNew: Record<string, number> = {};
    for (let oi = 0; oi < order.length; oi++) {
      oldToNew[order[oi]] = oi + 1;
    }

    // Collect phase
    const reorderHiddenMap: Map<string, HiddenData> = buildHiddenDataMap();
    const reorderHiddenNums: Set<number> = getHiddenNums();

    interface ReorderEntry {
      oldNum: string;
      newNum: number;
      data: HiddenData;
      panelPos: { x: number; y: number } | null;
      wasHidden: boolean;
    }

    const entries: ReorderEntry[] = [];
    const children: readonly SceneNode[] = figma.currentPage.children;

    for (let oi = 0; oi < order.length; oi++) {
      const oldNum: string = order[oi];
      const newNum: number = oldToNew[oldNum];
      let data: HiddenData | null = reorderHiddenMap.get(oldNum) || null;

      // Fallback to panel pluginData
      if (!data) {
        for (let ci = 0; ci < children.length; ci++) {
          const cn: string = children[ci].name;
          if (cn === "📋 Annotation: " + oldNum) {
            try {
              const pd: string = children[ci].getPluginData("specTags") || "";
              const pc: string = children[ci].getPluginData("markerColor") || "";
              const pt: string = children[ci].getPluginData("targetNodeId") || "";
              let pTitle: string = "";
              if (pt) {
                const tn: BaseNode | null = await figma.getNodeByIdAsync(pt);
                if (tn) {
                  const tm: RegExpMatchArray | null = tn.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
                  pTitle = tm ? tm[1] : tn.name;
                }
              }
              data = { title: pTitle, desc: pd, color: pc, target: pt };
            } catch(e) {}
            break;
          }
        }
      }

      if (!data || !data.target) continue;

      // Save panel position
      let panelPos: { x: number; y: number } | null = null;
      for (let ci = 0; ci < children.length; ci++) {
        const cn: string = children[ci].name;
        if (cn === "📋 Annotation: " + oldNum) {
          panelPos = { x: children[ci].x, y: children[ci].y };
          break;
        }
      }

      entries.push({
        oldNum: oldNum,
        newNum: newNum,
        data: data,
        panelPos: panelPos,
        wasHidden: reorderHiddenNums.has(parseInt(oldNum))
      });
    }

    // Delete phase - remove all artifacts for old numbers
    for (let ei = 0; ei < entries.length; ei++) {
      await removeExistingArtifacts(entries[ei].oldNum);
      // Strip prefix from target node
      if (entries[ei].data.target) {
        const tNode: BaseNode | null = await figma.getNodeByIdAsync(entries[ei].data.target);
        if (tNode) {
          tNode.name = stripPrefix(tNode.name);
        }
      }
    }

    // Recreate phase - create with new numbers
    for (let ei = 0; ei < entries.length; ei++) {
      const entry: ReorderEntry = entries[ei];
      const tNode: BaseNode | null = await figma.getNodeByIdAsync(entry.data.target);
      if (!tNode) continue;

      const newNumStr: string = String(entry.newNum);
      const mColor: RGB = entry.data.color ? hexToRgb(entry.data.color) : CLR.headerBg;
      const summary: string = makeSummary(entry.data.desc);
      const displayTitle: string = entry.data.title || stripPrefix(tNode.name);

      // Update layer name
      tNode.name = "[AIR-" + newNumStr + "] " + displayTitle + summary;

      // Create panel
      const panel: FrameNode = createSpecPanel(entry.data.title, entry.data.desc, newNumStr, tNode as SceneNode, mColor);
      figma.currentPage.appendChild(panel);
      if (entry.panelPos) {
        panel.x = entry.panelPos.x;
        panel.y = entry.panelPos.y;
      }
      panel.setPluginData("specTags", entry.data.desc);
      panel.setPluginData("targetNodeId", entry.data.target);
      panel.setPluginData("markerColor", entry.data.color || "");
      panel.setRelaunchData({ edit: '' });
      for (let ci = 0; ci < panel.children.length; ci++) {
        panel.children[ci].locked = true;
      }

      // Create marker
      createMarkerBadge(newNumStr, tNode as SceneNode, mColor);

      // Relaunch data on target
      (tNode as SceneNode).setRelaunchData({ edit: '' });

      // Restore hidden state
      if (entry.wasHidden) {
        await setAnnotationVisibility(entry.newNum, false);
      }
    }

    // Remap hidden nums
    const newHiddenNums: Set<number> = new Set();
    reorderHiddenNums.forEach(function(n: number) {
      const oldStr: string = String(n);
      if (oldToNew[oldStr]) {
        newHiddenNums.add(oldToNew[oldStr]);
      } else {
        newHiddenNums.add(n);
      }
    });
    setHiddenNums(newHiddenNums);

    // Update airMaxNum cache
    let maxNewNum: number = 0;
    for (let ei = 0; ei < entries.length; ei++) {
      if (entries[ei].newNum > maxNewNum) maxNewNum = entries[ei].newNum;
    }
    // Also check existing non-reordered annotations
    const afterChildren: readonly SceneNode[] = figma.currentPage.children;
    for (let ai = 0; ai < afterChildren.length; ai++) {
      const am: RegExpMatchArray | null = afterChildren[ai].name.match(/^\[AIR-(\d+)\]/) ||
              afterChildren[ai].name.match(/^📋 Annotation: (\d+)/);
      if (am) {
        const an: number = parseInt(am[1]);
        if (an > maxNewNum) maxNewNum = an;
      }
    }
    await updateSpecIndex();
    figma.notify("🔢 " + entries.length + "개 어노테이션 순서 변경");
    figma.ui.postMessage({ type: "reorder-done" });
  }

  if (msg.type === "delete-all-specs") {
    // Collect all annotation numbers
    const allNums: Set<string> = new Set();
    const targetIds: Record<string, string> = {};
    const children: readonly SceneNode[] = figma.currentPage.children;
    for (let i = 0; i < children.length; i++) {
      const c: SceneNode = children[i];
      let m: RegExpMatchArray | null = c.name.match(/^📋 Annotation: (\d+)/);
      if (m) {
        allNums.add(m[1]);
        try { const tid: string = c.getPluginData("targetNodeId") || ""; if (tid) targetIds[m[1]] = tid; } catch(e) {}
        continue;
      }
      m = c.name.match(/^🏷️ (\d+)/);
      if (m) { allNums.add(m[1]); continue; }
      m = c.name.match(/^\[AIR-(\d+)\]/);
      if (m) { allNums.add(m[1]); continue; }
    }
    // Also get target IDs from index map
    const delAllMap: Map<string, HiddenData> = buildHiddenDataMap();
    delAllMap.forEach(function(data: HiddenData, num: string) {
      allNums.add(num);
      if (data.target && !targetIds[num]) targetIds[num] = data.target;
    });

    const numArr: string[] = [];
    allNums.forEach(function(n: string) { numArr.push(n); });

    // Remove all artifacts
    for (let i = 0; i < numArr.length; i++) {
      await removeExistingArtifacts(numArr[i]);
    }
    // Strip [AIR-N] prefix from target nodes
    for (let i = 0; i < numArr.length; i++) {
      const tid: string = targetIds[numArr[i]] || "";
      if (tid) {
        const tNode: BaseNode | null = await figma.getNodeByIdAsync(tid);
        if (tNode) tNode.name = stripPrefix(tNode.name);
      }
    }
    // Remove index frame
    for (let i = figma.currentPage.children.length - 1; i >= 0; i--) {
      if (figma.currentPage.children[i].name === INDEX_NAME) {
        figma.currentPage.children[i].remove();
      }
    }
    // Clear hidden nums
    setHiddenNums(new Set());
    figma.notify("🗑️ " + numArr.length + "개 어노테이션 전체 삭제 완료");
    figma.ui.postMessage({ type: "delete-all-done" });
  }

  if (msg.type === "delete-selected-specs") {
    const nums: string[] = msg.nums;
    if (!nums || nums.length === 0) return;
    const delMap: Map<string, HiddenData> = buildHiddenDataMap();
    const delHidden: Set<number> = getHiddenNums();
    for (let i = 0; i < nums.length; i++) {
      const num: string = nums[i];
      // Get target node ID before removing artifacts
      let targetId: string = "";
      const data: HiddenData | undefined = delMap.get(num);
      if (data && data.target) targetId = data.target;
      if (!targetId) {
        // Try panel pluginData
        for (let pi = 0; pi < figma.currentPage.children.length; pi++) {
          const pc: SceneNode = figma.currentPage.children[pi];
          const pm: RegExpMatchArray | null = pc.name.match(/^📋 Annotation: (\d+)/);
          if (pm && pm[1] === num) {
            try { targetId = pc.getPluginData("targetNodeId") || ""; } catch(e) {}
            break;
          }
        }
      }
      await removeExistingArtifacts(num);
      // Strip [AIR-N] prefix from target node
      if (targetId) {
        const tNode: BaseNode | null = await figma.getNodeByIdAsync(targetId);
        if (tNode) tNode.name = stripPrefix(tNode.name);
      }
      delHidden.delete(parseInt(num));
    }
    setHiddenNums(delHidden);
    const excludeSet: Set<string> = new Set(nums);
    await updateSpecIndex(excludeSet);
    await renumberAllSpecs();
    figma.notify("🗑️ " + nums.length + "개 어노테이션 삭제 완료");
    figma.ui.postMessage({ type: "delete-selected-done" });
  }

  if (msg.type === "cancel") { figma.closePlugin(); }
};
