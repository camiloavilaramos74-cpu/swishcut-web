(function () {
  "use strict";
  var B = window.__BRAND__ || { whop: { rookie: {} }, rookieBase: 25, calLink: "" };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[swishcut] " + name, e); } }
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* barra de progreso + nav + CTA flotante */
  function initScroll() {
    var bar = $("#bar"), nav = $("#navw"), sticky = $("#sticky"), hero = $("#top"), agenda = $("#agenda");
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.pageYOffset, h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
      var hh = hero ? hero.offsetHeight : 600;
      if (nav) { nav.classList.toggle("solid", y > 24); nav.classList.toggle("onhero", y < hh - 80); }
      if (sticky) {
        var show = y > hh * 0.7, hide = false;
        [agenda, $("#calculadora")].forEach(function (t) { if (!t) return; var r = t.getBoundingClientRect(); if (r.top < window.innerHeight * 0.7 && r.bottom > 80) hide = true; });
        sticky.classList.toggle("show", show && !hide); sticky.classList.toggle("hide", hide);
      }
      stepsUpdate();
    }
    function req() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    update();
  }

  /* menú móvil */
  function initMenu() {
    var b = $("#burger"), w = $("#navw");
    if (!b) return;
    function set(o) { document.body.classList.toggle("menu-open", o); b.setAttribute("aria-expanded", o ? "true" : "false"); b.setAttribute("aria-label", o ? "Cerrar menú" : "Abrir menú"); }
    b.addEventListener("click", function () { set(!document.body.classList.contains("menu-open")); });
    $$("#mmenu a").forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  }

  /* hero: gradiente que sigue al mouse, tilt 3D y tiro a la canasta */
  function initHero() {
    var hero = $("#top"), card = $("#heroCard"), art = $("#heroArt"), btn = $("#shoot");
    if (hero && fine) {
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        hero.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
    }
    if (card && art && fine) {
      art.addEventListener("mousemove", function (e) {
        var r = art.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "rotateY(" + (px * 9).toFixed(2) + "deg) rotateX(" + (-py * 9).toFixed(2) + "deg)";
      });
      art.addEventListener("mouseleave", function () { card.style.transform = ""; });
    }
    var shots = 0;
    if (btn && art) btn.addEventListener("click", function () {
      shots++;
      art.classList.remove("shotA", "shotB", "fired");
      void art.offsetWidth;
      art.classList.add(shots % 2 ? "shotA" : "shotB", "fired");
    });
  }

  /* reveals con IntersectionObserver (umbral bajo + red de seguridad) */
  function initReveal() {
    var els = $$(".rv");
    function showAll() { els.forEach(function (e) { e.classList.add("in"); }); }
    if (!("IntersectionObserver" in window)) { showAll(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.04, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (r.top < window.innerHeight) e.classList.add("in"); else io.observe(e);
      if (e.style.getPropertyValue("--rd")) e.style.setProperty("--rd", e.style.getPropertyValue("--rd"));
    });
    window.setTimeout(showAll, 6000);
  }

  /* contadores */
  function initCount() {
    var els = $$("[data-count]");
    if (!els.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, to = parseFloat(el.getAttribute("data-count")), pre = el.getAttribute("data-prefix") || "", suf = el.getAttribute("data-suffix") || "", t0 = null, dur = 1400;
        function tick(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + Math.round(to * e) + suf;
          if (p < 1) window.requestAnimationFrame(tick);
        }
        window.requestAnimationFrame(tick);
      });
    }, { threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* videos del portafolio: un solo video a la vez */
  function initVideos() {
    var vids = $$(".screen video");
    $$(".screen .play").forEach(function (b) {
      b.addEventListener("click", function () {
        var s = b.closest(".screen"), v = $("video", s);
        vids.forEach(function (o) { if (o !== v) o.pause(); });
        v.controls = true;
        s.classList.add("on");
        var p = v.play(); if (p && p.catch) p.catch(function () { s.classList.remove("on"); });
      });
    });
    vids.forEach(function (v) {
      v.addEventListener("pause", function () { if (v.ended) { v.closest(".screen").classList.remove("on"); v.controls = false; v.load(); } });
    });
  }

  /* proceso: la línea se llena con el scroll */
  var stepsEl, fill, stepNodes = [];
  function initSteps() { stepsEl = $("#steps"); fill = $("#trackFill"); stepNodes = $$(".step", stepsEl || document); }
  function stepsUpdate() {
    if (!stepsEl || !fill) return;
    var r = stepsEl.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.25)));
    var vertical = window.matchMedia("(max-width: 980px)").matches;
    fill.style.transform = vertical ? "scaleY(" + p + ")" : "scaleX(" + p + ")";
    stepNodes.forEach(function (s, i) { s.classList.toggle("on", p > (i + 0.4) / stepNodes.length * 0.98); });
  }

  /* calculadora Rookie */
  function initCalc() {
    var nEl = $("#n"); if (!nEl) return;
    var n = 10, base = B.rookieBase || 25;
    var presets = [5, 10, 15, 20, 30];
    var quick = $("#quick");
    presets.forEach(function (q) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = q; b.setAttribute("data-q", q);
      b.addEventListener("click", function () { n = q; render(); }); quick.appendChild(b);
    });
    function fmt(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
    function render() {
      var off = n >= 20 ? 0.2 : n >= 10 ? 0.1 : 0;
      var per = Math.round(base * (1 - off) * 100) / 100, total = Math.round(per * n);
      nEl.textContent = n; $("#total").textContent = fmt(total); $("#per").textContent = String(per).replace(".", ",");
      var sv = $("#save"); sv.hidden = off === 0; sv.textContent = Math.round(off * 100) + "% menos";
      $("#meter").style.width = Math.min(100, Math.round(n / 20 * 100)) + "%";
      $("#hint").textContent = n >= 20 ? "Con 20 videos o más tienes el mejor precio por video: 20% menos." : n >= 10 ? "Ya tienes 10% menos por video. Con 20 baja al 20%." : "Con 10 videos o más tu precio por video baja 10% cada mes.";
      $$("#quick button").forEach(function (b) { b.classList.toggle("on", Number(b.getAttribute("data-q")) === n); });
      var go = $("#calcgo"), link = B.whop && B.whop.rookie && B.whop.rookie[String(n)];
      if (link) { go.href = link; go.target = "_blank"; go.rel = "noopener"; go.firstChild.nodeValue = "Pagar mis " + n + " videos "; $("#calcnote").textContent = "Pago mensual seguro con Whop. Cancelas antes del siguiente mes."; }
      else { go.href = "#agenda"; go.removeAttribute("target"); go.firstChild.nodeValue = "Pedir mis " + n + " videos al mes "; $("#calcnote").textContent = "Estimado mensual orientativo. Lo confirmamos en una llamada corta."; }
    }
    $("#dec").addEventListener("click", function () { n = Math.max(1, n - 1); render(); });
    $("#inc").addEventListener("click", function () { n = Math.min(40, n + 1); render(); });
    render();
  }

  /* enlaces de pago de Whop (si están configurados) */
  function initWhop() {
    $$("[data-whop]").forEach(function (a) {
      var l = B.whop && B.whop[a.getAttribute("data-whop")];
      if (l) { a.href = l; a.target = "_blank"; a.rel = "noopener"; }
    });
  }

  /* formulario -> Cal.com con datos prellenados */
  function initForm() {
    var f = $("#form"), err = $("#err"); if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = {}, bad = [];
      $$("input, textarea, select", f).forEach(function (el) {
        el.classList.remove("bad"); d[el.name] = (el.value || "").trim();
        if (!d[el.name]) { bad.push(el); el.classList.add("bad"); }
      });
      if (bad.length) { err.textContent = "Faltan respuestas: todas las preguntas son obligatorias."; bad[0].focus(); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) { err.textContent = "Revisa tu email: no parece válido."; f.email.classList.add("bad"); f.email.focus(); return; }
      err.textContent = "";
      var notes = ["WhatsApp: " + d.whats, "Instagram: " + d.ig, "Contenido: " + d.topic, "Videos al mes: " + d.videos, "Plan: " + d.plan, "Inversión mensual: " + d.budget, "Meta 3 meses: " + d.goal].join("\n");
      var url = B.calLink + "?name=" + encodeURIComponent(d.name) + "&email=" + encodeURIComponent(d.email) + "&notes=" + encodeURIComponent(notes);
      var w = window.open(url, "_blank", "noopener");
      if (!w) window.location.href = url;
    });
    $$("input, textarea, select", f).forEach(function (el) { el.addEventListener("input", function () { el.classList.remove("bad"); }); });
  }

  function boot() {
    safe(initScroll, "scroll"); safe(initMenu, "menu"); safe(initHero, "hero"); safe(initReveal, "reveal");
    safe(initCount, "count"); safe(initVideos, "videos"); safe(initSteps, "steps"); safe(initCalc, "calc");
    safe(initWhop, "whop"); safe(initForm, "form"); safe(stepsUpdate, "stepsUpdate");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
