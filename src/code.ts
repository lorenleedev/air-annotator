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
  shadow: number;
  tags: Record<string, TagColors>;
}

interface ParsedTags {
  desc: string[];
  route: string[];
  auth: string[];
  api: string[];
  ux: string[];
  warn: string[];
  memo: string[];
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
  | { type: "cancel" };

// ── Relaunch: 패널/마커/대상 노드에서 플러그인 열기 ──
if (figma.command === "edit") {
  const sel: readonly SceneNode[] = figma.currentPage.selection;
  if (sel.length > 0) {
    const n: SceneNode = sel[0];
    let targetId: string = "";

    // 패널 선택
    const panelMatch: RegExpMatchArray | null = n.name.match(/^📋 (?:Annotation|Spec): (\d+)/);
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
        const targetNode: BaseNode | null = await figma.getNodeByIdAsync(targetId);
        if (targetNode) {
          figma.currentPage.selection = [targetNode as SceneNode];
          figma.viewport.scrollAndZoomIntoView([targetNode as SceneNode]);
        }
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

let currentTheme: string = "light";

function getTheme(): ThemeColors { return THEMES[currentTheme] || THEMES.light; }

const PANEL_W: number = 360;
const PANEL_GAP: number = 60;

let fontLoaded: boolean = false;
let FONT_R: FontName | undefined;
let FONT_B: FontName | undefined;

async function loadFonts(): Promise<void> {
  const families: string[] = ["Inter", "Roboto", "Arial"];
  for (let i = 0; i < families.length; i++) {
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
  const result: ParsedTags = { desc: [], route: [], auth: [], api: [], ux: [], warn: [], memo: [] };
  if (!desc) return result;
  const lines: string[] = desc.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line: string = lines[i].trim();
    if (!line) continue;
    if (line.match(/^\[route\]/)) result.route.push(line.replace(/^\[route\]\s*/, ""));
    else if (line.match(/^\[auth\]/)) result.auth.push(line.replace(/^\[auth\]\s*/, ""));
    else if (line.match(/^\[api\]/)) result.api.push(line.replace(/^\[api\]\s*/, ""));
    else if (line.match(/^\[ux\]/)) result.ux.push(line.replace(/^\[ux\]\s*/, ""));
    else if (line.match(/^\[warn\]/)) result.warn.push(line.replace(/^\[warn\]\s*/, ""));
    else if (line.match(/^\[memo\]/)) result.memo.push(line.replace(/^\[memo\]\s*/, ""));
    else {
      const dm: RegExpMatchArray | null = line.match(/^\[desc\]\s*(.*)/);
      result.desc.push(dm ? dm[1] : line);
    }
  }
  return result;
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

  // Title column
  const titleCol: FrameNode = alFrame("titleCol", "VERTICAL", 0, 1);
  titleCol.primaryAxisSizingMode = "AUTO";
  titleCol.counterAxisSizingMode = "AUTO";
  const headerLabel: string = title || "Annotation";
  titleCol.appendChild(txt(headerLabel, 13, th.title, true));
  let nodeType: string = "";
  try { nodeType = targetNode.type || ""; } catch(e) {}
  titleCol.appendChild(txt(nodeType, 10, th.subtitle, false));
  header.appendChild(titleCol);
  panel.appendChild(header);

  // Header border
  const hBorder: FrameNode = figma.createFrame();
  hBorder.name = "headerBorder";
  hBorder.resize(PANEL_W, 1);
  hBorder.layoutAlign = "STRETCH";
  hBorder.fills = [{ type: "SOLID", color: th.headerBorder }];
  panel.appendChild(hBorder);

  // ── Body ──
  const body: FrameNode = alFrame("body", "VERTICAL", 0, 12);
  body.paddingTop = 14; body.paddingBottom = 10;
  body.paddingLeft = 18; body.paddingRight = 18;
  body.layoutAlign = "STRETCH";
  body.primaryAxisSizingMode = "AUTO";
  body.counterAxisSizingMode = "AUTO";

  // Description block
  if (parsed.desc.length > 0) {
    const descBlock: FrameNode = alFrame("descBlock", "VERTICAL", 0, 4);
    descBlock.paddingTop = 10; descBlock.paddingBottom = 10;
    descBlock.paddingLeft = 12; descBlock.paddingRight = 12;
    descBlock.cornerRadius = 8;
    descBlock.fills = [{ type: "SOLID", color: th.descBg }];
    descBlock.layoutAlign = "STRETCH";
    descBlock.counterAxisSizingMode = "AUTO";
    for (let di = 0; di < parsed.desc.length; di++) {
      const dt: TextNode = txt(parsed.desc[di], 11.5, th.descText, false);
      dt.lineHeight = { value: 160, unit: "PERCENT" };
      dt.layoutAlign = "STRETCH";
      dt.textAutoResize = "HEIGHT";
      descBlock.appendChild(dt);
    }
    body.appendChild(descBlock);
  }

  // Tag row helper
  function tagRow(tagName: string, value: string, isWarn: boolean): void {
    const row: FrameNode = alFrame("prop", "HORIZONTAL", 0, 8);
    row.layoutAlign = "STRETCH";
    row.counterAxisSizingMode = "AUTO";
    row.counterAxisAlignItems = "MIN";

    // Tag pill — same size as marker badge
    const tagColors: TagColors = th.tags[tagName] || th.tags.memo;
    const pill: FrameNode = alFrame("tag", "HORIZONTAL", 0, 0);
    pill.paddingTop = 2; pill.paddingBottom = 2;
    pill.paddingLeft = 6; pill.paddingRight = 6;
    pill.cornerRadius = 4;
    pill.fills = [{ type: "SOLID", color: tagColors.bg }];
    pill.primaryAxisSizingMode = "AUTO";
    pill.counterAxisSizingMode = "AUTO";
    pill.primaryAxisAlignItems = "CENTER";
    pill.counterAxisAlignItems = "CENTER";
    const tagLabel: TextNode = txt(tagName.toUpperCase(), 9, tagColors.text, true);
    tagLabel.letterSpacing = { value: 0.5, unit: "PIXELS" };
    pill.appendChild(tagLabel);
    row.appendChild(pill);

    // Value
    const valColor: RGB = isWarn ? th.warnText : th.text;
    const valText: TextNode = txt(value, 11.5, valColor, false);
    valText.lineHeight = { value: 150, unit: "PERCENT" };
    valText.textAutoResize = "HEIGHT";
    valText.layoutGrow = 1;
    row.appendChild(valText);

    body.appendChild(row);
  }

  // Render properties in order
  const propOrder: Array<{ key: string; items: string[] }> = [
    { key: "route", items: parsed.route },
    { key: "auth", items: parsed.auth },
    { key: "api", items: parsed.api },
    { key: "ux", items: parsed.ux },
  ];
  const warnOrder: Array<{ key: string; items: string[] }> = [
    { key: "warn", items: parsed.warn },
    { key: "memo", items: parsed.memo },
  ];

  let hasProps: boolean = false;
  for (let pi = 0; pi < propOrder.length; pi++) {
    for (let pj = 0; pj < propOrder[pi].items.length; pj++) {
      tagRow(propOrder[pi].key, propOrder[pi].items[pj], false);
      hasProps = true;
    }
  }

  let hasWarn: boolean = false;
  for (let wi = 0; wi < warnOrder.length; wi++) {
    if (warnOrder[wi].items.length > 0) hasWarn = true;
  }

  if (hasProps && hasWarn) {
    body.appendChild(divider());
  }

  for (let wi = 0; wi < warnOrder.length; wi++) {
    const isW: boolean = warnOrder[wi].key === "warn";
    for (let wj = 0; wj < warnOrder[wi].items.length; wj++) {
      tagRow(warnOrder[wi].key, warnOrder[wi].items[wj], isW);
    }
  }

  panel.appendChild(body);

  // ── Footer ──
  const fBorder: FrameNode = figma.createFrame();
  fBorder.name = "footerBorder";
  fBorder.resize(PANEL_W, 1);
  fBorder.layoutAlign = "STRETCH";
  fBorder.fills = [{ type: "SOLID", color: th.divider }];
  panel.appendChild(fBorder);

  const footer: FrameNode = alFrame("footer", "HORIZONTAL", 0, 6);
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
function stripPrefix(name: string): string {
  return name.replace(/^\[AIR-\d+\]\s*/, "").replace(/\s*\|.*$/, "");
}

function getNextNum(): number {
  // 캐시된 최대 번호 확인 (성능 최적화)
  const cached: string = figma.currentPage.getPluginData("airMaxNum") || "";
  if (cached && parseInt(cached) > 0) {
    // 캐시가 있고 유효하면 캐시를 신뢰하고 다음 번호 반환
    const next: number = parseInt(cached) + 1;
    figma.currentPage.setPluginData("airMaxNum", String(next));
    return next;
  }
  // 캐시가 없거나 0이면 전체 스캔 수행
  let max: number = 0;
  const children: readonly SceneNode[] = figma.currentPage.children;
  for (let i = 0; i < children.length; i++) {
    const m: RegExpMatchArray | null = children[i].name.match(/^\[AIR-(\d+)\]/) ||
            children[i].name.match(/^📋 Annotation: (\d+)/) ||
            children[i].name.match(/^📋 Spec: (\d+)/);
    if (m) { const n: number = parseInt(m[1]); if (n > max) max = n; }
  }
  // 캐시 갱신
  figma.currentPage.setPluginData("airMaxNum", String(max));
  return max + 1;
}

// ──────────────────────────────────────
// 기존 산출물 제거
// ──────────────────────────────────────
async function removeExistingArtifacts(num: string | number): Promise<void> {
  const panelName: string = "📋 Annotation: " + num;
  const oldPanelName: string = "📋 Spec: " + num;  // 마이그레이션 호환
  const markerName: string = "🏷️ " + num;
  const dataName: string = "__specData_" + num + "__";

  let targetNodeId: string = "";
  const children: readonly SceneNode[] = figma.currentPage.children;
  for (let i = children.length - 1; i >= 0; i--) {
    const c: SceneNode = children[i];
    const n: string = c.name;
    if (n === panelName || n === oldPanelName) {
      try { targetNodeId = c.getPluginData("targetNodeId") || ""; } catch(e) {}
      c.remove();
    } else if (n === markerName || n === dataName) {
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
function createHiddenDataNode(num: string | number, title: string, desc: string, colorHex: string | undefined, targetNodeId: string): TextNode {
  let data: string = "[AIRA:" + num + "]\n";
  data += "title: " + (title || "") + "\n";
  data += "color: " + (colorHex || "") + "\n";
  data += "target: " + (targetNodeId || "") + "\n";
  data += "===\n";
  data += desc || "";

  const t: TextNode = figma.createText();
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

function readHiddenData(num: string | number): HiddenData | null {
  const dataName: string = "__specData_" + num + "__";
  const children: readonly SceneNode[] = figma.currentPage.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].name === dataName && children[i].type === "TEXT") {
      try {
        const textNode = children[i] as TextNode;
        const raw: string = textNode.characters || "";
        const titleMatch: RegExpMatchArray | null = raw.match(/title:[ ]*(.*)/);
        const colorMatch: RegExpMatchArray | null = raw.match(/color:[ ]*(.*)/);
        const targetMatch: RegExpMatchArray | null = raw.match(/target:[ ]*(.*)/);
        const idx: number = raw.indexOf("===\n");
        const desc: string = idx >= 0 ? raw.substring(idx + 4) : "";
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

function buildHiddenDataMap(): Map<string, HiddenData> {
  const map: Map<string, HiddenData> = new Map();
  const children: readonly SceneNode[] = figma.currentPage.children;
  for (let i = 0; i < children.length; i++) {
    const c: SceneNode = children[i];
    if (c.name.indexOf("__specData_") !== 0 || c.type !== "TEXT") continue;
    const nm: RegExpMatchArray | null = c.name.match(/__specData_(\d+)__/);
    if (!nm) continue;
    const raw: string = (c as TextNode).characters;
    const headerMatch: RegExpMatchArray | null = raw.match(/^\[AIRA:(\d+)\]/);
    if (!headerMatch) continue;
    const lines: string[] = raw.split("\n");
    let title: string = "", color: string = "", target: string = "";
    let pastSep: boolean = false;
    const descLines: string[] = [];
    for (let li = 1; li < lines.length; li++) {
      const ln: string = lines[li];
      if (ln === "===") { pastSep = true; continue; }
      if (pastSep) { descLines.push(ln); continue; }
      if (ln.indexOf("title: ") === 0) { title = ln.substring(7); }
      else if (ln.indexOf("color: ") === 0) { color = ln.substring(7); }
      else if (ln.indexOf("target: ") === 0) { target = ln.substring(8); }
    }
    const desc: string = descLines.join("\n");
    map.set(nm[1], { title: title, desc: desc, color: color, target: target });
  }
  return map;
}

// ──────────────────────────────────────
// 📑 AI용 스펙 인덱스 (MCP 연동)
// ──────────────────────────────────────
const INDEX_NAME: string = "📑 AIR: AI-Readable Annotator Index";

async function updateSpecIndex(): Promise<void> {
  // hiddenMap 먼저 빌드 (단일 페이지 스캔)
  const hiddenMap: Map<string, HiddenData> = buildHiddenDataMap();

  // 단일 패스: 인덱스 제거 + 숨김 노드/패널 동시 수집
  interface PendingHidden {
    num: string;
    data: HiddenData;
    targetNodeId: string;
  }
  interface PendingFallback {
    num: string;
    fpDesc: string;
    fpColor: string;
    fpTarget: string;
  }

  const pendingHidden: PendingHidden[] = [];
  const pendingFallback: PendingFallback[] = [];
  const foundNums: Record<string, boolean> = {};
  const panelTargetCache: Record<string, string> = {};

  const pageChildren: readonly SceneNode[] = figma.currentPage.children;
  for (let i = pageChildren.length - 1; i >= 0; i--) {
    const c: SceneNode = pageChildren[i];

    // 기존 인덱스 제거
    if (c.name === INDEX_NAME) { c.remove(); continue; }

    // 패널 후보 수집 (폴백 + targetNodeId 캐시용)
    const fpMatch: RegExpMatchArray | null = c.name.match(/^📋 (?:Annotation|Spec): (\d+)/);
    if (fpMatch) {
      const fpnum: string = fpMatch[1];
      let fpDesc: string = "", fpColor: string = "", fpTarget: string = "";
      try {
        fpDesc = c.getPluginData("specTags") || "";
        fpColor = c.getPluginData("markerColor") || "";
        fpTarget = c.getPluginData("targetNodeId") || "";
      } catch(e) {}
      if (fpTarget) {
        panelTargetCache[fpnum] = fpTarget;
        pendingFallback.push({ num: fpnum, fpDesc: fpDesc, fpColor: fpColor, fpTarget: fpTarget });
      }
      continue;
    }

    // 숨김 데이터 노드 수집
    if (c.name.indexOf("__specData_") === 0 && c.type === "TEXT") {
      const nm: RegExpMatchArray | null = c.name.match(/__specData_(\d+)__/);
      if (!nm) continue;
      const num: string = nm[1];
      const data: HiddenData | null = hiddenMap.get(num) || null;
      if (!data) continue;

      // targetNodeId: hidden data 우선, 없으면 패널 캐시(패널이 앞에서 이미 처리됐을 수 있음)
      let targetNodeId: string = data.target || panelTargetCache[num] || "";
      pendingHidden.push({ num: num, data: data, targetNodeId: targetNodeId });
      foundNums[num] = true;
    }
  }

  // 숨김 노드에서 targetNodeId가 없는 경우 패널 캐시를 재확인
  // (역방향 순회로 패널을 먼저 처리했을 수 있으므로 panelTargetCache가 이미 채워진 경우 처리됨)
  // 단, 정방향 순회에서 패널이 숨김 노드보다 뒤에 있는 경우를 위해 한번 더 보완
  for (let i = 0; i < pendingHidden.length; i++) {
    if (!pendingHidden[i].targetNodeId && panelTargetCache[pendingHidden[i].num]) {
      pendingHidden[i].targetNodeId = panelTargetCache[pendingHidden[i].num];
    }
  }

  // 1차: 숨김 데이터 → targetNodeId 일괄 병렬 resolve
  const hiddenNodePromises: Array<Promise<BaseNode | null>> = [];
  for (let i = 0; i < pendingHidden.length; i++) {
    if (pendingHidden[i].targetNodeId) {
      hiddenNodePromises.push(figma.getNodeByIdAsync(pendingHidden[i].targetNodeId));
    } else {
      hiddenNodePromises.push(Promise.resolve(null));
    }
  }
  const hiddenResolvedNodes: Array<BaseNode | null> = await Promise.all(hiddenNodePromises);

  const specs: SpecInfo[] = [];
  for (let i = 0; i < pendingHidden.length; i++) {
    const ph: PendingHidden = pendingHidden[i];
    const tNode: BaseNode | null = hiddenResolvedNodes[i];
    specs.push({
      num: parseInt(ph.num),
      title: ph.data.title,
      desc: ph.data.desc,
      nodeId: ph.targetNodeId,
      nodeType: tNode ? tNode.type : "",
      nodeName: tNode ? tNode.name : ""
    });
  }

  // 2차: 패널 pluginData 폴백 → 숨김 노드가 없는 것만 일괄 병렬 resolve
  const filteredFallback: PendingFallback[] = [];
  for (let i = 0; i < pendingFallback.length; i++) {
    if (!foundNums[pendingFallback[i].num]) {
      filteredFallback.push(pendingFallback[i]);
    }
  }

  const fallbackNodePromises: Array<Promise<BaseNode | null>> = [];
  for (let i = 0; i < filteredFallback.length; i++) {
    fallbackNodePromises.push(figma.getNodeByIdAsync(filteredFallback[i].fpTarget));
  }
  const fallbackResolvedNodes: Array<BaseNode | null> = await Promise.all(fallbackNodePromises);

  for (let i = 0; i < filteredFallback.length; i++) {
    const fb: PendingFallback = filteredFallback[i];
    const fpNode: BaseNode | null = fallbackResolvedNodes[i];
    let fpTitle: string = "", fpType: string = "", fpName: string = "";
    if (fpNode) {
      const fptm: RegExpMatchArray | null = fpNode.name.match(/^\[AIR-\d+\]\s*(.*?)(\s*\|.*)?$/);
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

    // 숨김 노드 복구
    try { createHiddenDataNode(fb.num, fpTitle, fb.fpDesc, fb.fpColor, fb.fpTarget); } catch(e) {}
  }

  if (specs.length === 0) return;
  specs.sort(function(a: SpecInfo, b: SpecInfo): number { return a.num - b.num; });

  // 인덱스 텍스트 생성
  const lines: string[] = [];
  lines.push("📑 AI-READABLE ANNOTATOR INDEX");
  lines.push("AI에게: 각 [AIR-번호]는 Figma 요소에 연결된 기획 스펙입니다.");
  lines.push("nodeId로 해당 요소를 찾고, 태그 내용에 따라 구현하세요.");
  lines.push("════════════════════════════════");

  for (let s = 0; s < specs.length; s++) {
    const sp: SpecInfo = specs[s];
    let header: string = "[AIR-" + sp.num + "] " + sp.title;
    if (sp.nodeType) header += "  (" + sp.nodeType + ", " + sp.nodeId + ")";
    lines.push(header);

    if (sp.desc) {
      const descLines: string[] = sp.desc.split("\n");
      for (let d = 0; d < descLines.length; d++) {
        const dl: string = descLines[d].trim();
        if (dl) lines.push("  " + dl);
      }
    }
    lines.push("");
  }

  lines.push("════════════════════════════════");
  lines.push("총 " + specs.length + "개 스펙 | AIR: AI-Readable Annotator v1");

  const content: string = lines.join("\n");

  // 인덱스 프레임 생성
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
    if (child.name.indexOf("📋 Spec:") === 0) continue;  // 마이그레이션 호환
    if (child.name.indexOf("📑 AIR:") === 0) continue;   // 인덱스 프레임 필터
    if (child.name.indexOf("🏷️") === 0) continue;
    if (child.name.indexOf("__specData_") === 0) continue;
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
async function readSelectedDesc(): Promise<void> {
  if (_readingSelection) return;
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
      if (targetNode) {
        _readingSelection = true;
        figma.currentPage.selection = [targetNode as SceneNode];
        figma.viewport.scrollAndZoomIntoView([targetNode as SceneNode]);
        _readingSelection = false;
        return;
      }
    }
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
      const oldPanelName: string = "📋 Spec: " + num;
      for (let i = 0; i < figma.currentPage.children.length; i++) {
        const cin: string = figma.currentPage.children[i].name;
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
async function writeSpec(nodeId: string, title: string, desc: string, num: string, colorHex: string): Promise<WriteResult> {
  const node: BaseNode | null = await figma.getNodeByIdAsync(nodeId);
  if (!node) return { ok: false, error: "노드를 찾을 수 없습니다." };
  const markerColor: RGB = colorHex ? hexToRgb(colorHex) : CLR.headerBg;

  try {
    let currentNum: string = num;
    if (currentNum) {
      const cleanName: string = stripPrefix(node.name);
      const summary: string = makeSummary(desc);
      const displayTitle: string = title || cleanName;
      node.name = "[AIR-" + currentNum + "] " + displayTitle + summary;
    } else {
      const em: RegExpMatchArray | null = node.name.match(/^\[AIR-(\d+)\]/);
      if (em) currentNum = em[1];
    }
    if (!currentNum) return { ok: false, error: "번호가 없습니다." };

    // 기존 패널 위치 저장
    let existingPos: { x: number; y: number } | null = null;
    const panelName: string = "📋 Annotation: " + currentNum;
    const oldPanelName: string = "📋 Spec: " + currentNum;  // 마이그레이션 호환
    for (let pi = 0; pi < figma.currentPage.children.length; pi++) {
      const pn: string = figma.currentPage.children[pi].name;
      if (pn === panelName || pn === oldPanelName) {
        existingPos = {
          x: figma.currentPage.children[pi].x,
          y: figma.currentPage.children[pi].y
        };
        break;
      }
    }

    await removeExistingArtifacts(currentNum);
    if (!desc || !desc.trim()) return { ok: true };

    const panel: FrameNode = createSpecPanel(title, desc, currentNum, node as SceneNode, markerColor);
    figma.currentPage.appendChild(panel);

    // 기존 위치가 있으면 복원
    if (existingPos) {
      panel.x = existingPos.x;
      panel.y = existingPos.y;
    }
    createMarkerBadge(currentNum, node as SceneNode, markerColor);
    createHiddenDataNode(currentNum, title, desc, colorHex, nodeId);

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
    const result: WriteResult = await writeSpec(m.nodeId, m.title || "", m.description, String(num), m.color || "");
    if (result.ok) success++;
    else { fail++; errors.push(result.error!); }
  }
  return { success: success, fail: fail, errors: errors };
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
    figma.ui.postMessage({ type: "init-done", fileKey: figma.fileKey || "", theme: currentTheme });
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
    // 1차: 숨김 데이터 노드에서
    for (let ri = 0; ri < children.length; ri++) {
      const rc: SceneNode = children[ri];
      if (rc.name.indexOf("__specData_") === 0 && rc.type === "TEXT") {
        const rm: RegExpMatchArray | null = rc.name.match(/__specData_(\d+)__/);
        if (!rm) continue;
        const rnum: string = rm[1];
        const rdata: HiddenData | null = rebuildHiddenMap.get(rnum) || null;
        if (rdata) { allSpecs.push({ num: rnum, data: rdata }); foundNums[rnum] = true; }
      }
    }
    // 2차: 패널 pluginData 폴백
    for (let rk = 0; rk < children.length; rk++) {
      const rck: SceneNode = children[rk];
      const rpMatch: RegExpMatchArray | null = rck.name.match(/^📋 (?:Annotation|Spec): (\d+)/);
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
        try { createHiddenDataNode(rpnum, rpTitle, rpDesc, rpColor, rpTarget); } catch(e) {}
      }
    }
    // Rebuild each panel
    for (let si = 0; si < allSpecs.length; si++) {
      const spec: { num: string; data: HiddenData } = allSpecs[si];
      const targetId: string = spec.data.target;
      if (!targetId) continue;
      let tNode: BaseNode | null = null;
      try { tNode = await figma.getNodeByIdAsync(targetId); } catch(e) {}
      if (!tNode) continue;

      // Save existing panel position (check both old and new name)
      const panelName: string = "📋 Annotation: " + spec.num;
      const oldPanelName: string = "📋 Spec: " + spec.num;
      let existPos: { x: number; y: number } | null = null;
      for (let pi = 0; pi < figma.currentPage.children.length; pi++) {
        const pn: string = figma.currentPage.children[pi].name;
        if (pn === panelName || pn === oldPanelName) {
          existPos = { x: figma.currentPage.children[pi].x, y: figma.currentPage.children[pi].y };
          break;
        }
      }

      // Remove old panel only (keep data node, keep marker) — both names
      for (let di = figma.currentPage.children.length - 1; di >= 0; di--) {
        const dn: string = figma.currentPage.children[di].name;
        if (dn === panelName || dn === oldPanelName) {
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
    const themeLabel: string = currentTheme === "dark" ? "Dark" : "Light";
    figma.notify("🎨 " + themeLabel + " theme applied to " + rebuilt + " panel(s)");
    figma.ui.postMessage({ type: "rebuild-done" });
  }

  if (msg.type === "scan-layers") {
    figma.ui.postMessage({ type: "layers-scanned", layers: scanLayers(figma.currentPage, 0) });
  }

  if (msg.type === "read-selection") { readSelectedDesc(); }

  if (msg.type === "list-specs") {
    const specs: Array<{ num: string; title: string; color: string; desc: string; targetNodeId: string; preview: string }> = [];
    const foundNums: Record<string, boolean> = {};
    const children: readonly SceneNode[] = figma.currentPage.children;
    const listHiddenMap: Map<string, HiddenData> = buildHiddenDataMap();

    // 1차: 숨김 데이터 노드에서 스캔 (기존 방식)
    for (let i = 0; i < children.length; i++) {
      const c: SceneNode = children[i];
      if (c.name.indexOf("__specData_") === 0 && c.type === "TEXT") {
        const numMatch: RegExpMatchArray | null = c.name.match(/__specData_(\d+)__/);
        if (!numMatch) continue;
        const num: string = numMatch[1];
        const data: HiddenData | null = listHiddenMap.get(num) || null;
        let targetId: string = (data && data.target) ? data.target : "";
        if (!targetId) {
          for (let j = 0; j < children.length; j++) {
            const cjn: string = children[j].name;
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
    for (let k = 0; k < children.length; k++) {
      const ck: SceneNode = children[k];
      const panelMatch: RegExpMatchArray | null = ck.name.match(/^📋 (?:Annotation|Spec): (\d+)/);
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
    const node: BaseNode | null = await figma.getNodeByIdAsync(msg.nodeId);
    let existingNum: string | null = null;
    if (node) {
      const pm: RegExpMatchArray | null = node.name.match(/^\[AIR-(\d+)\]/);
      if (pm) existingNum = pm[1];
    }
    if (!existingNum) existingNum = String(getNextNum());

    const result: WriteResult = await writeSpec(msg.nodeId, msg.title || "", msg.desc, existingNum, msg.color || "");
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
    const result: BatchResult = await applyBatch(msg.mappings);
    const notice: string = "✅ " + result.success + "개 저장 완료" + (result.fail > 0 ? " / " + result.fail + "개 실패" : "");
    figma.notify(notice);
    figma.ui.postMessage({ type: "batch-done", result: result });
    figma.ui.postMessage({ type: "layers-scanned", layers: scanLayers(figma.currentPage, 0) });
    updateSpecIndex();
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

    // 노드 이름에서 [AIR-N] 접두사 제거
    if (node) {
      node.name = stripPrefix(node.name);
    }

    figma.notify("🗑️ [AIR-" + num + "] 어노테이션 삭제 완료");
    figma.ui.postMessage({ type: "delete-done", num: num });
    readSelectedDesc();
    updateSpecIndex();
  }

  if (msg.type === "rebuild-index") {
    await updateSpecIndex();
    figma.notify("📑 AI용 스펙 인덱스를 최신 상태로 갱신했어요");
  }

  if (msg.type === "cancel") { figma.closePlugin(); }
};
