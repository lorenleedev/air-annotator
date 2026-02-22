/**
 * AIR: AI-Readable Annotator — Test Suite
 * 
 * Usage: node test.js
 * 
 * Figma Plugin API를 모킹하여 순수 로직을 검증합니다.
 * 테스트 범위:
 *   1. 유틸리티 함수 (parseTags, makeSummary, hexToRgb, stripPrefix)
 *   2. 테마 시스템 (getTheme, THEMES)
 *   3. 번호 관리 (getNextNum) + 마이그레이션 호환
 *   4. 데이터 노드 (createHiddenDataNode, readHiddenData)
 *   5. 패널 생성 (createSpecPanel 구조 검증)
 *   6. 산출물 제거 (removeExistingArtifacts) + 마이그레이션 호환
 *   7. 레이어 스캔 필터링 (scanLayers)
 *   8. 쓰기 흐름 (writeSpec)
 *   9. 온보딩/UI 텍스트 일관성
 */

// ══════════════════════════════════════
// Figma API Mock
// ══════════════════════════════════════
var _allNodes = {};
var _nextId = 1000;

function mockNode(overrides) {
  var id = String(_nextId++);
  var node = Object.assign({
    id: id,
    name: "",
    type: "FRAME",
    characters: "",
    children: [],
    visible: true,
    locked: false,
    x: 0, y: 0,
    width: 100, height: 50,
    absoluteTransform: [[1,0,0],[0,1,0]],
    fills: [],
    strokes: [],
    fontName: null,
    fontSize: 11,
    layoutMode: "NONE",
    cornerRadius: 0,
    effects: [],
    setPluginData: function(k, v) { this._pluginData = this._pluginData || {}; this._pluginData[k] = v; },
    getPluginData: function(k) { return (this._pluginData && this._pluginData[k]) || ""; },
    remove: function() {
      delete _allNodes[this.id];
      // parent에서도 제거 (_currentPage 포함)
      var parent = this._parent || _currentPage;
      if (parent && parent.children) {
        var idx = parent.children.indexOf(this);
        if (idx >= 0) parent.children.splice(idx, 1);
      }
    },
    appendChild: function(child) {
      child._parent = this;
      this.children.push(child);
    },
    resize: function() {},
    _pluginData: {}
  }, overrides);
  node.id = id;
  _allNodes[id] = node;
  return node;
}

var _currentPage = {
  children: [],
  selection: [],
  appendChild: function(child) { child._parent = this; this.children.push(child); }
};

var _root = {
  _pluginData: {},
  setPluginData: function(k, v) { this._pluginData[k] = v; },
  getPluginData: function(k) { return this._pluginData[k] || ""; }
};

var _notifications = [];

var figma = {
  showUI: function() {},
  currentPage: _currentPage,
  root: _root,
  fileKey: "test-file-key",
  createFrame: function() { return mockNode({ type: "FRAME" }); },
  createText: function() { return mockNode({ type: "TEXT", textAutoResize: "WIDTH_AND_HEIGHT" }); },
  getNodeById: function(id) { return _allNodes[id] || null; },
  loadFontAsync: function() { return Promise.resolve(); },
  notify: function(msg) { _notifications.push(msg); },
  on: function() {},
  ui: { onmessage: null, postMessage: function() {} },
  viewport: { scrollAndZoomIntoView: function() {} },
  closePlugin: function() {}
};

// Reset helper
function resetMock() {
  _currentPage.children = [];
  _currentPage.selection = [];
  _root._pluginData = {};
  _allNodes = {};
  _nextId = 1000;
  _notifications = [];
}

// ══════════════════════════════════════
// code.js에서 테스트 대상 함수 추출
// ══════════════════════════════════════

// — 순수 함수 (Figma 의존 없음) —

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255
  };
}

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

function stripPrefix(name) {
  return name.replace(/^\[AIR-\d+\]\s*/, "").replace(/\s*\|.*$/, "");
}

// — 테마 —

var THEMES = {
  light: {
    panelBg: { r: 1, g: 1, b: 1 },
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
    panelBg: { r: 0.12, g: 0.12, b: 0.12 },
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

// — Figma 의존 함수 —

function getNextNum() {
  var max = 0;
  function check(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var m = nodes[i].name.match(/^\[AIR-(\d+)\]/);
      if (!m) m = nodes[i].name.match(/^📋 Annotation: (\d+)/);
      if (!m) m = nodes[i].name.match(/^📋 Spec: (\d+)/);
      if (m) { var n = parseInt(m[1]); if (n > max) max = n; }
      if ("children" in nodes[i] && nodes[i].type !== "INSTANCE") {
        try { check(nodes[i].children); } catch(e) {}
      }
    }
  }
  check(figma.currentPage.children);
  return max + 1;
}

function removeExistingArtifacts(num) {
  var panelName = "📋 Annotation: " + num;
  var oldPanelName = "📋 Spec: " + num;
  var markerName = "🏷️ " + num;
  var dataName = "__specData_" + num + "__";
  var children = figma.currentPage.children;
  for (var i = children.length - 1; i >= 0; i--) {
    var n = children[i].name;
    if (n === panelName || n === oldPanelName || n === markerName || n === dataName) children[i].remove();
  }
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

function scanLayers(node, depth) {
  if (depth > 5) return [];
  var results = [];
  if (!("children" in node)) return results;
  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    if (child.name.indexOf("📋 Annotation:") === 0) continue;
    if (child.name.indexOf("📋 Spec:") === 0) continue;
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

// ══════════════════════════════════════
// Test Runner
// ══════════════════════════════════════
var _passed = 0, _failed = 0, _total = 0;
var _currentSuite = "";

function suite(name) {
  _currentSuite = name;
  console.log("\n\x1b[1m━━ " + name + " ━━\x1b[0m");
}

function assert(desc, condition) {
  _total++;
  if (condition) {
    _passed++;
    console.log("  \x1b[32m✓\x1b[0m " + desc);
  } else {
    _failed++;
    console.log("  \x1b[31m✗ FAIL:\x1b[0m " + desc);
  }
}

function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function approx(a, b, eps) { return Math.abs(a - b) < (eps || 0.005); }

// ══════════════════════════════════════
// 1. parseTags
// ══════════════════════════════════════
suite("parseTags");

(function() {
  // 기본 태그 파싱
  var r = parseTags("[route] /signup\n[auth] public\n[api] POST /users\n[warn] 5/min\n[memo] note\n[ux] rounded corners");
  assert("route 파싱", eq(r.route, ["/signup"]));
  assert("auth 파싱", eq(r.auth, ["public"]));
  assert("api 파싱", eq(r.api, ["POST /users"]));
  assert("warn 파싱", eq(r.warn, ["5/min"]));
  assert("memo 파싱", eq(r.memo, ["note"]));
  assert("ux 파싱", eq(r.ux, ["rounded corners"]));

  // [desc] 태그
  var r2 = parseTags("[desc] 회원가입 폼\n[api] POST /users");
  assert("[desc] 태그 파싱", eq(r2.desc, ["회원가입 폼"]));

  // 태그 없는 일반 텍스트 → desc로
  var r3 = parseTags("이것은 일반 텍스트입니다.");
  assert("태그 없는 텍스트 → desc", eq(r3.desc, ["이것은 일반 텍스트입니다."]));

  // 빈 줄 무시
  var r4 = parseTags("[route] /a\n\n\n[auth] admin");
  assert("빈 줄 무시", r4.route.length === 1 && r4.auth.length === 1);

  // null/undefined 입력
  var r5 = parseTags(null);
  assert("null 입력 → 빈 결과", r5.desc.length === 0 && r5.route.length === 0);
  var r6 = parseTags("");
  assert("빈 문자열 → 빈 결과", r6.desc.length === 0);

  // 같은 태그 여러 개
  var r7 = parseTags("[api] GET /users\n[api] POST /users\n[api] DELETE /users/:id");
  assert("같은 태그 여러 개", r7.api.length === 3);

  // 혼합
  var r8 = parseTags("일반 설명\n[route] /home\n다른 설명");
  assert("혼합: 일반 텍스트 + 태그", r8.desc.length === 2 && r8.route.length === 1);
})();

// ══════════════════════════════════════
// 2. makeSummary
// ══════════════════════════════════════
suite("makeSummary");

(function() {
  assert("desc + api 요약", makeSummary("[desc] 계약 목록 테이블\n[api] GET /contracts") === " | 계약 목록 테이블 · api");
  assert("api + ux 요약", makeSummary("[api] GET /users\n[ux] dark mode") === " | api · ux");
  assert("desc만", makeSummary("[desc] 회원가입 폼") === " | 회원가입 폼");
  assert("아무 태그 없으면 빈 문자열", makeSummary("일반 텍스트") === "");
  assert("null 입력", makeSummary(null) === "");
  assert("빈 문자열", makeSummary("") === "");
  assert("desc 20자 초과 → 잘림", makeSummary("[desc] 이것은 매우 긴 설명으로서 20자를 넘습니다").length <= " | ".length + 20 + 1);
})();

// ══════════════════════════════════════
// 3. hexToRgb
// ══════════════════════════════════════
suite("hexToRgb");

(function() {
  var r1 = hexToRgb("#FF0000");
  assert("#FF0000 → r=1", approx(r1.r, 1) && approx(r1.g, 0) && approx(r1.b, 0));

  var r2 = hexToRgb("#00FF00");
  assert("#00FF00 → g=1", approx(r2.r, 0) && approx(r2.g, 1) && approx(r2.b, 0));

  var r3 = hexToRgb("0000FF");
  assert("# 없이도 동작", approx(r3.r, 0) && approx(r3.g, 0) && approx(r3.b, 1));

  var r4 = hexToRgb("#F00");
  assert("3자리 단축형", approx(r4.r, 1) && approx(r4.g, 0) && approx(r4.b, 0));

  var r5 = hexToRgb("#F24E1E");
  assert("Figma 기본 빨강", approx(r5.r, 0.949, 0.01) && approx(r5.g, 0.306, 0.01) && approx(r5.b, 0.118, 0.01));
})();

// ══════════════════════════════════════
// 4. stripPrefix
// ══════════════════════════════════════
suite("stripPrefix");

(function() {
  assert("[AIR-1] 제거", stripPrefix("[AIR-1] Sign Up Button") === "Sign Up Button");
  assert("[AIR-99] + 요약 제거", stripPrefix("[AIR-99] Login | api · ux") === "Login");
  assert("접두사 없으면 그대로", stripPrefix("Normal Layer") === "Normal Layer");
  assert("빈 문자열", stripPrefix("") === "");
  assert("[AIR-123] 큰 번호", stripPrefix("[AIR-123] Frame") === "Frame");
})();

// ══════════════════════════════════════
// 5. 테마 시스템
// ══════════════════════════════════════
suite("테마 시스템");

(function() {
  currentTheme = "light";
  var lt = getTheme();
  assert("light 테마 배경 = 흰색", approx(lt.panelBg.r, 1));
  assert("light 테마 태그 7종 존재", Object.keys(lt.tags).length === 7);

  currentTheme = "dark";
  var dk = getTheme();
  assert("dark 테마 배경 = 어두운색", approx(dk.panelBg.r, 0.12));
  assert("dark 테마 태그 7종 존재", Object.keys(dk.tags).length === 7);

  currentTheme = "invalid";
  assert("잘못된 테마 → light fallback", approx(getTheme().panelBg.r, 1));

  // 모든 태그에 bg/text 존재
  currentTheme = "light";
  var tags = ["route", "auth", "desc", "api", "warn", "memo", "ux"];
  var allHaveColors = tags.every(function(t) {
    return lt.tags[t] && lt.tags[t].bg && lt.tags[t].text;
  });
  assert("모든 태그에 bg/text 컬러 존재", allHaveColors);

  currentTheme = "light"; // reset
})();

// ══════════════════════════════════════
// 6. getNextNum + 마이그레이션
// ══════════════════════════════════════
suite("getNextNum + 마이그레이션");

(function() {
  resetMock();
  assert("빈 페이지 → 1", getNextNum() === 1);

  resetMock();
  var n1 = mockNode({ name: "[AIR-3] Button" });
  _currentPage.children.push(n1);
  assert("[AIR-3] 있으면 → 4", getNextNum() === 4);

  resetMock();
  var n2 = mockNode({ name: "📋 Annotation: 5" });
  _currentPage.children.push(n2);
  assert("📋 Annotation: 5 → 6", getNextNum() === 6);

  // 마이그레이션: 옛 이름
  resetMock();
  var n3 = mockNode({ name: "📋 Spec: 10" });
  _currentPage.children.push(n3);
  assert("📋 Spec: 10 (옛 이름) → 11", getNextNum() === 11);

  // 혼합
  resetMock();
  _currentPage.children.push(mockNode({ name: "[AIR-2] Frame" }));
  _currentPage.children.push(mockNode({ name: "📋 Spec: 7" }));
  _currentPage.children.push(mockNode({ name: "📋 Annotation: 5" }));
  assert("혼합: max(2,7,5) → 8", getNextNum() === 8);

  // 중첩 children
  resetMock();
  var parent = mockNode({ name: "Container", type: "FRAME" });
  var child = mockNode({ name: "[AIR-15] Nested" });
  parent.children.push(child);
  _currentPage.children.push(parent);
  assert("중첩 [AIR-15] → 16", getNextNum() === 16);

  // INSTANCE는 children 탐색 안 함
  resetMock();
  var inst = mockNode({ name: "Instance", type: "INSTANCE" });
  inst.children.push(mockNode({ name: "[AIR-99] Deep" }));
  _currentPage.children.push(inst);
  assert("INSTANCE 내부 무시 → 1", getNextNum() === 1);
})();

// ══════════════════════════════════════
// 7. removeExistingArtifacts + 마이그레이션
// ══════════════════════════════════════
suite("removeExistingArtifacts + 마이그레이션");

(function() {
  // 새 이름 패널 제거
  resetMock();
  var panel = mockNode({ name: "📋 Annotation: 3" });
  var marker = mockNode({ name: "🏷️ 3" });
  var data = mockNode({ name: "__specData_3__" });
  var unrelated = mockNode({ name: "Normal Frame" });
  _currentPage.children.push(panel, marker, data, unrelated);
  assert("제거 전 4개", _currentPage.children.length === 4);
  removeExistingArtifacts("3");
  assert("제거 후 1개 (unrelated만)", _currentPage.children.length === 1);
  assert("남은 것은 Normal Frame", _currentPage.children[0].name === "Normal Frame");

  // 옛 이름 패널 제거 (마이그레이션)
  resetMock();
  var oldPanel = mockNode({ name: "📋 Spec: 5" });
  var marker5 = mockNode({ name: "🏷️ 5" });
  _currentPage.children.push(oldPanel, marker5);
  removeExistingArtifacts("5");
  assert("옛 이름 📋 Spec: 도 제거", _currentPage.children.length === 0);

  // 다른 번호 건드리지 않음
  resetMock();
  _currentPage.children.push(mockNode({ name: "📋 Annotation: 1" }));
  _currentPage.children.push(mockNode({ name: "📋 Annotation: 2" }));
  removeExistingArtifacts("1");
  assert("다른 번호 보존", _currentPage.children.length === 1 && _currentPage.children[0].name === "📋 Annotation: 2");
})();

// ══════════════════════════════════════
// 8. readHiddenData
// ══════════════════════════════════════
suite("readHiddenData");

(function() {
  resetMock();
  var data = mockNode({
    name: "__specData_7__",
    type: "TEXT",
    characters: "[AIRA:7]\ntitle: Login Button\ncolor: #F24E1E\ntarget: 123:456\n===\n[route] /login\n[auth] public"
  });
  _currentPage.children.push(data);

  var result = readHiddenData("7");
  assert("title 파싱", result.title === "Login Button");
  assert("color 파싱", result.color === "#F24E1E");
  assert("target 파싱", result.target === "123:456");
  assert("desc 파싱", result.desc === "[route] /login\n[auth] public");

  // 없는 번호
  assert("없는 번호 → null", readHiddenData("999") === null);

  // 빈 데이터
  resetMock();
  var empty = mockNode({
    name: "__specData_1__",
    type: "TEXT",
    characters: "[AIRA:1]\ntitle: \ncolor: \ntarget: \n===\n"
  });
  _currentPage.children.push(empty);
  var r2 = readHiddenData("1");
  assert("빈 값도 파싱 가능", r2 !== null && r2.title === "" && r2.color === "");

  // 회귀 테스트: 빈 값이 다음 줄 키를 먹지 않아야 함
  assert("빈 title이 'color:'를 먹지 않음", r2 !== null && r2.title.indexOf("color") === -1);
  assert("빈 color이 'target:'을 먹지 않음", r2 !== null && r2.color.indexOf("target") === -1);
  assert("빈 target이 '==='를 먹지 않음", r2 !== null && r2.target.indexOf("===") === -1);
})();

// ══════════════════════════════════════
// 9. scanLayers 필터링
// ══════════════════════════════════════
suite("scanLayers 필터링");

(function() {
  resetMock();
  var root = { children: [] };
  root.children.push(mockNode({ name: "📋 Annotation: 1", type: "FRAME" }));
  root.children.push(mockNode({ name: "📋 Spec: 2", type: "FRAME" }));
  root.children.push(mockNode({ name: "🏷️ 1", type: "FRAME" }));
  root.children.push(mockNode({ name: "__specData_1__", type: "TEXT" }));
  root.children.push(mockNode({ name: "Button", type: "FRAME" }));
  root.children.push(mockNode({ name: "Header", type: "FRAME" }));

  var result = scanLayers(root, 0);
  assert("AIR 산출물 필터링 → 2개만", result.length === 2);
  assert("Button 포함", result.some(function(r) { return r.name === "Button"; }));
  assert("Header 포함", result.some(function(r) { return r.name === "Header"; }));

  // 옛 이름도 필터링
  assert("📋 Spec: (옛 이름) 필터링", !result.some(function(r) { return r.name.indexOf("Spec:") >= 0; }));

  // 깊이 제한
  var d0 = { name: "d0", type: "FRAME", children: [] };
  var d1 = { name: "d1", type: "FRAME", children: [] };
  var d2 = { name: "d2", type: "FRAME", children: [] };
  var d3 = { name: "d3", type: "FRAME", children: [] };
  var d4 = { name: "d4", type: "FRAME", children: [] };
  var d5 = { name: "d5", type: "FRAME", children: [] };
  var d6 = { name: "TooDeep", type: "FRAME", children: [] };
  d5.children.push(d6);
  d4.children.push(d5);
  d3.children.push(d4);
  d2.children.push(d3);
  d1.children.push(d2);
  d0.children.push(d1);
  var deepRoot = { children: [d0] };
  var deepResult = scanLayers(deepRoot, 0);
  assert("depth > 5 제한", !deepResult.some(function(r) { return r.name === "TooDeep"; }));
})();

// ══════════════════════════════════════
// 10. UI 텍스트 일관성 검증
// ══════════════════════════════════════
suite("UI 텍스트 일관성");

(function() {
  var fs = require("fs");
  var ui = fs.readFileSync(__dirname + "/ui.html", "utf8");
  var code = fs.readFileSync(__dirname + "/code.js", "utf8");

  // "Spec Panel" 이 사용자 노출 텍스트에 없어야 함
  var specPanelInUI = ui.match(/[">].*Spec Panel.*[<"]/g);
  assert("UI에 'Spec Panel' 텍스트 없음", !specPanelInUI);

  // "스펙 패널" 이 사용자 노출 텍스트에 없어야 함
  assert("UI에 '스펙 패널' 텍스트 없음", ui.indexOf("스펙 패널") === -1);

  // 크레딧: "Made by 은결" (EN/KO 모두)
  var creditMatches = ui.match(/Made by <b>은결<\/b>/g);
  assert("크레딧 'Made by 은결' 3곳 (HTML+EN+KO)", creditMatches && creditMatches.length === 3);

  // "Loren" 없어야 함
  assert("'Loren' 텍스트 없음", ui.indexOf("Loren") === -1);

  // "AIR Annotation ·" 이 서브타이틀에 없어야 함
  assert("code.js에 'AIR Annotation ·' 서브타이틀 없음", code.indexOf('"AIR Annotation · "') === -1);

  // 패널 이름: "📋 Annotation:" 사용 (생성 부분)
  assert("패널 프레임 이름 = 📋 Annotation:", code.indexOf('alFrame("📋 Annotation: "') >= 0);

  // footer 텍스트
  assert("패널 footer 텍스트 존재", code.indexOf("AIR: AI-Readable Annotator · Do not edit directly") >= 0);

  // 테마 토글 버튼 존재
  assert("테마 토글 버튼 존재", ui.indexOf('id="themeBtn"') >= 0);
  assert("toggleTheme 함수 존재", ui.indexOf("function toggleTheme()") >= 0);

  // 플레이스홀더: 일반적 예시
  assert("Title placeholder 일반적 예시", ui.indexOf("Sign Up Button") >= 0);

  // 온보딩: 새 디자인 반영 (컬러 태그)
  assert("온보딩 SVG에 ROUTE 태그", ui.indexOf(">ROUTE<") >= 0);
  assert("온보딩 SVG에 AUTH 태그", ui.indexOf(">AUTH<") >= 0);
  assert("온보딩 SVG에 API 태그", ui.indexOf(">API<") >= 0);
  assert("온보딩 SVG에 WARN 태그", ui.indexOf(">WARN<") >= 0);
})();

// ══════════════════════════════════════
// 11. 마이그레이션 호환 통합 검증
// ══════════════════════════════════════
suite("마이그레이션 호환 통합");

(function() {
  var fs = require("fs");
  var code = fs.readFileSync(__dirname + "/code.js", "utf8");

  // 모든 "📋 Annotation:" 참조 위치에서 "📋 Spec:" 도 처리하는지
  var annotationOnly = [];
  var lines = code.split("\n");
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    // 패널 생성 (alFrame)은 새 이름만 사용 — 정상
    if (line.indexOf('alFrame("📋 Annotation:') >= 0) continue;
    // 문자열 비교/검색에서 Annotation만 있고 Spec 호환이 없는 경우 찾기
    if (line.indexOf('"📋 Annotation:') >= 0 || line.indexOf("'📋 Annotation:") >= 0) {
      // 같은 블록(±5줄)에 Spec: 참조가 있는지 확인
      var nearby = lines.slice(Math.max(0, i-5), Math.min(lines.length, i+6)).join("\n");
      if (nearby.indexOf("Spec:") === -1 && nearby.indexOf("oldPanelName") === -1) {
        annotationOnly.push(i + 1);
      }
    }
  }
  assert("모든 패널 참조에 마이그레이션 호환 있음 (누락: [" + annotationOnly.join(",") + "])", annotationOnly.length === 0);

  // rebuild-all-panels 에서 break 없이 모두 제거
  var rebuildSection = code.substring(
    code.indexOf("rebuild-all-panels"),
    code.indexOf("rebuild-done")
  );
  var removalLoop = rebuildSection.substring(
    rebuildSection.indexOf("Remove old panel"),
    rebuildSection.indexOf("Create new panel")
  );
  assert("rebuild 제거 루프에 break 없음 (여러 개 제거 가능)", removalLoop.indexOf("break") === -1);
})();

// ══════════════════════════════════════
// 12. code.js 문법 검증
// ══════════════════════════════════════
suite("code.js 문법 검증");

(function() {
  var fs = require("fs");
  var code = fs.readFileSync(__dirname + "/code.js", "utf8");

  // 기본 문법 체크: 괄호 균형
  var parens = 0, braces = 0, brackets = 0;
  var inString = false, stringChar = "";
  for (var i = 0; i < code.length; i++) {
    var c = code[i];
    if (inString) {
      if (c === stringChar && code[i-1] !== "\\") inString = false;
      continue;
    }
    if (c === '"' || c === "'") { inString = true; stringChar = c; continue; }
    if (c === '(') parens++;
    if (c === ')') parens--;
    if (c === '{') braces++;
    if (c === '}') braces--;
    if (c === '[') brackets++;
    if (c === ']') brackets--;
  }
  assert("괄호 () 균형", parens === 0);
  assert("중괄호 {} 균형", braces === 0);
  assert("대괄호 [] 균형", brackets === 0);

  // figma.showUI 호출 존재
  assert("figma.showUI 호출 존재", code.indexOf("figma.showUI") >= 0);

  // 메시지 핸들러 존재
  var requiredHandlers = ["init", "write-desc", "delete-spec", "list-specs", "rebuild-all-panels", "rebuild-index", "select-node", "apply-batch", "scan-layers"];
  requiredHandlers.forEach(function(h) {
    assert('메시지 핸들러 "' + h + '" 존재', code.indexOf('"' + h + '"') >= 0);
  });
})();

// ══════════════════════════════════════
// 13. 엣지 케이스
// ══════════════════════════════════════
suite("엣지 케이스");

(function() {
  // parseTags: 태그 뒤에 공백만
  var r = parseTags("[route]  ");
  assert("[route] 뒤 공백만 → 빈 값", r.route.length === 1 && r.route[0] === "");

  // parseTags: 대소문자
  var r2 = parseTags("[ROUTE] /test");
  assert("[ROUTE] 대문자 → desc로 (태그 인식 안 됨)", r2.desc.length === 1 && r2.route.length === 0);

  // hexToRgb: 경계값
  var r3 = hexToRgb("#000000");
  assert("#000000 → 모두 0", r3.r === 0 && r3.g === 0 && r3.b === 0);
  var r4 = hexToRgb("#FFFFFF");
  assert("#FFFFFF → 모두 1", r4.r === 1 && r4.g === 1 && r4.b === 1);

  // stripPrefix: 여러 | 가 있을 때
  assert("stripPrefix 여러 파이프", stripPrefix("[AIR-1] Name | a | b") === "Name");

  // getNextNum: 번호가 연속적이지 않을 때
  resetMock();
  _currentPage.children.push(mockNode({ name: "[AIR-1] A" }));
  _currentPage.children.push(mockNode({ name: "[AIR-100] B" }));
  assert("비연속 번호 max+1", getNextNum() === 101);
})();

// ══════════════════════════════════════
// 결과
// ══════════════════════════════════════
console.log("\n\x1b[1m══════════════════════════════════════\x1b[0m");
if (_failed === 0) {
  console.log("\x1b[32m\x1b[1m  ✓ ALL " + _passed + " TESTS PASSED\x1b[0m");
} else {
  console.log("\x1b[31m\x1b[1m  ✗ " + _failed + " FAILED\x1b[0m / " + _passed + " passed / " + _total + " total");
}
console.log("\x1b[1m══════════════════════════════════════\x1b[0m\n");

process.exit(_failed > 0 ? 1 : 0);
