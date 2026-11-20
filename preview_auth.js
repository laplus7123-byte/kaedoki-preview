/* Kaedoki GitHub Pages preview gate. Hash is injected at build time. */
(function () {
  var HASH = "80072dab24228c1339702efed6c4e72075c2f984a71cba7fb2a28877da4a0d1e";
  var STORAGE = "kaedoki_preview_ok";
  var PARAM = "key";

  function hex(buf) {
    return Array.from(new Uint8Array(buf))
      .map(function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function sha256(text) {
    return crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(text))
      .then(hex);
  }

  function unlock() {
    try {
      sessionStorage.setItem(STORAGE, HASH);
    } catch (e) {}
    document.documentElement.classList.remove("kaedoki-preview-locked");
    var gate = document.getElementById("kaedoki-preview-gate");
    if (gate) gate.remove();
  }

  function locked() {
    try {
      return sessionStorage.getItem(STORAGE) !== HASH;
    } catch (e) {
      return true;
    }
  }

  function showGate() {
    document.documentElement.classList.add("kaedoki-preview-locked");
    if (document.getElementById("kaedoki-preview-gate")) return;

    var style = document.createElement("style");
    style.textContent =
      "html.kaedoki-preview-locked body>*:not(#kaedoki-preview-gate){visibility:hidden!important}" +
      "#kaedoki-preview-gate{visibility:visible!important;position:fixed;inset:0;z-index:99999;" +
      "display:flex;align-items:center;justify-content:center;background:#fff4df;" +
      "font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN',Meiryo,sans-serif;color:#3b241a}" +
      "#kaedoki-preview-gate .box{width:min(92vw,360px);padding:28px 24px;background:#fff;" +
      "border:1px solid #e6d3b8}" +
      "#kaedoki-preview-gate h1{margin:0 0 8px;font-size:1.05rem}" +
      "#kaedoki-preview-gate p{margin:0 0 16px;font-size:.85rem;color:#7a5a45}" +
      "#kaedoki-preview-gate input{width:100%;box-sizing:border-box;padding:10px 12px;" +
      "border:1px solid #c9a57a;font-size:1rem}" +
      "#kaedoki-preview-gate button{margin-top:12px;width:100%;padding:11px 12px;border:0;" +
      "background:#c2500a;color:#fff;font-size:.95rem;font-weight:700;cursor:pointer}" +
      "#kaedoki-preview-gate .err{margin-top:10px;min-height:1.2em;font-size:.8rem;color:#c2500a}";
    document.head.appendChild(style);

    var gate = document.createElement("div");
    gate.id = "kaedoki-preview-gate";
    gate.innerHTML =
      '<div class="box">' +
      "<h1>カエドキッ プレビュー</h1>" +
      "<p>閲覧にはパスワードが必要です。</p>" +
      '<form id="kaedoki-preview-form">' +
      '<input type="password" name="pw" autocomplete="current-password" placeholder="パスワード" required>' +
      "<button type=\"submit\">開く</button>" +
      '<div class="err" id="kaedoki-preview-err" aria-live="polite"></div>' +
      "</form></div>";
    document.body.appendChild(gate);

    document.getElementById("kaedoki-preview-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var pw = ev.target.pw.value || "";
      var err = document.getElementById("kaedoki-preview-err");
      sha256(pw).then(function (h) {
        if (h === HASH) {
          unlock();
          if (location.search.indexOf(PARAM + "=") !== -1) {
            history.replaceState(null, "", location.pathname + location.hash);
          }
        } else {
          err.textContent = "パスワードが違います";
        }
      });
    });
  }

  function boot() {
    var q = new URLSearchParams(location.search).get(PARAM);
    if (q) {
      sha256(q).then(function (h) {
        if (h === HASH) unlock();
        else showGate();
      });
      return;
    }
    if (locked()) showGate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
