var cachedSpecs = [];
var figmaFileKey = "";

function exportSpecs(format) {
  if (!cachedSpecs || cachedSpecs.length === 0) return;
  if (format !== "json" && format !== "md") return;
  var output = "", filename = "air-annotations", mime = "text/plain";
  var figmaLink = figmaFileKey ? "https://www.figma.com/design/" + figmaFileKey : "";

  if (format === "json") {
    var jsonData = {
      figmaLink: figmaLink,
      exportedAt: new Date().toISOString(),
      annotations: cachedSpecs.map(function(s) { return { num: parseInt(s.num), title: s.title || "", color: s.color || "", targetNodeId: s.targetNodeId || "", tags: s.desc || "" }; })
    };
    output = JSON.stringify(jsonData, null, 2); filename += ".json"; mime = "application/json";
  }
  if (format === "md") {
    output = "# AI-Readable Annotation List\n\n";
    if (figmaLink) output += "> Figma: " + figmaLink + "\n\n";
    for (var i = 0; i < cachedSpecs.length; i++) {
      var s = cachedSpecs[i];
      output += "## [AIR-" + s.num + "] " + (s.title || "(untitled)") + "\n\n";
      if (s.desc) { s.desc.split("\n").forEach(function(l) { l = l.trim(); if (l) output += "- " + l + "\n"; }); }
      output += "\n---\n\n";
    }
    filename += ".md"; mime = "text/markdown";
  }
  var blob = new Blob([output], { type: mime + ";charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  var toast = document.getElementById("exportToast");
  toast.textContent = filename + " downloaded"; toast.style.display = "block";
  setTimeout(function() { toast.style.display = "none"; }, 2000);
}
