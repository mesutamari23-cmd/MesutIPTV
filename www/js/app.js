const APP_VERSION = "1.0.0";
const $ = s => document.querySelector(s);
const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let lang = Store.get("lang", "ar"), theme = Store.get("theme", "navy"), tab = "home", editing = null, formType = "xtream";
const t = k => (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k;

const ICONS = {
  home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>', live: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 21h8"/>',
  movies: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5M16 4v5"/>',
  series: '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'
};

function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 2400); }

function applyLang() {
  document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.theme = theme === "black" ? "black" : "navy";
  $("#q").placeholder = t("search");
  $("#tabs").innerHTML = ["home", "live", "movies", "series", "settings"].map(k =>
    `<button class="tab" data-tab="${k}" ${k === tab ? 'aria-current="page"' : ""}><svg viewBox="0 0 24 24">${ICONS[k]}</svg>${t(k)}</button>`).join("");
}

function emptyState() {
  return `<section class="card empty"><h2>${t("noSource")}</h2><p>${t("noSourceHint")}</p>
  <button class="btn pri" data-go="sources">${t("addSource")}</button></section>`;
}

function contentView() {
  const list = Sources.all().filter(s => s.type !== "epg");
  if (!list.length) return emptyState();
  const n = list.reduce((a, s) => a + (s.count || 0), 0);
  return `<section class="card"><h2>${t(tab)}</h2><p class="mut">${list.length} ${t("sources")}${n ? " · " + n + " " + t("channels") : ""}</p>
  <p class="mut">${t("soon")}</p><button class="btn" data-go="sources">${t("manage")}</button></section>`;
}

function sourcesView() {
  const list = Sources.all();
  const rows = list.map(s => `<div class="card"><div class="row sp"><b>${esc(s.name)}</b><span class="tag">${t(s.type)}</span></div>
    <p class="mut">${esc(s.type === "xtream" ? s.server : (s.url || "M3U file"))}${s.count ? " · " + s.count : ""}</p>
    <div class="row"><button class="btn" data-act="refresh" data-id="${s.id}">${t("refresh")}</button>
    <button class="btn" data-act="edit" data-id="${s.id}">${t("edit")}</button>
    <button class="btn del" data-act="del" data-id="${s.id}">${t("del")}</button></div></div>`).join("");
  return `<h2>${t("sources")}</h2>${rows}<div class="row"><button class="btn pri" data-act="new">${t("addSource")}</button>
  <button class="btn" data-go="settings">${t("cancel")}</button></div>`;
}

function formView() {
  const s = editing || {};
  const f = formType;
  const fields = f === "xtream"
    ? `<label>${t("server")}</label><input id="f-server" type="url" inputmode="url" dir="ltr" value="${esc(s.server)}" placeholder="http://host:port">
       <label>${t("user")}</label><input id="f-user" type="text" dir="ltr" autocomplete="off" value="${esc(s.user)}">
       <label>${t("pass")}</label><input id="f-pass" type="password" dir="ltr" autocomplete="off" value="${esc(s.pass)}">`
    : f === "m3u"
    ? `<label>${t("m3uUrl")}</label><input id="f-url" type="url" inputmode="url" dir="ltr" value="${esc(s.url)}">
       <label>${t("m3uFile")}</label><input id="f-file" type="file" accept=".m3u,.m3u8,.txt,audio/x-mpegurl,application/vnd.apple.mpegurl,*/*">`
    : `<label>${t("xmltv")}</label><input id="f-url" type="url" inputmode="url" dir="ltr" value="${esc(s.url)}">`;
  return `<h2>${editing ? t("edit") : t("addSource")}</h2><div class="card">
    <label>${t("type")}</label><select id="f-type" ${editing ? "disabled" : ""}>
    ${["xtream", "m3u", "epg"].map(k => `<option value="${k}" ${k === f ? "selected" : ""}>${t(k)}</option>`).join("")}</select>
    <label>${t("name")}</label><input id="f-name" type="text" value="${esc(s.name)}">${fields}
    <div class="row" style="margin-top:16px"><button class="btn pri" data-act="save">${t("save")}</button>
    <button class="btn" data-go="sources">${t("cancel")}</button></div></div>`;
}

function settingsView() {
  return `<h2>${t("settings")}</h2><div class="card">
    <label>${t("language")}</label><select id="s-lang">${[["ar", "العربية"], ["fr", "Français"], ["en", "English"]].map(([k, n]) => `<option value="${k}" ${k === lang ? "selected" : ""}>${n}</option>`).join("")}</select>
    <label>${t("theme")}</label><select id="s-theme"><option value="navy" ${theme !== "black" ? "selected" : ""}>${t("themeNavy")}</option><option value="black" ${theme === "black" ? "selected" : ""}>${t("themeBlack")}</option></select></div>
    <div class="card row"><button class="btn" data-go="sources">${t("manage")}</button><button class="btn" data-act="cache">${t("cache")}</button></div>
    <div class="card"><b>${t("about")}</b><p class="mut">${t("aboutTxt")}</p><p class="mut">${t("version")}: ${APP_VERSION}</p></div>`;
}

function render() {
  applyLang();
  const v = { home: contentView, live: contentView, movies: contentView, series: contentView, settings: settingsView, sources: sourcesView, form: formView }[tab];
  $("#view").innerHTML = v();
}

function go(name) { tab = name; if (name !== "form") editing = null; render(); $("#view").focus({ preventScroll: true }); window.scrollTo(0, 0); }

async function saveForm() {
  const g = id => ($(id) ? $(id).value.trim() : "");
  const s = editing ? { ...editing } : { id: "s" + Date.now().toString(36), type: formType };
  s.name = g("#f-name") || t(s.type);
  if (s.type === "xtream") { s.server = g("#f-server"); s.user = g("#f-user"); s.pass = $("#f-pass").value; if (!s.server || !s.user || !s.pass) return toast(t("invalid")); if (!validUrl(s.server)) return toast(t("badUrl")); }
  else {
    s.url = g("#f-url"); const file = $("#f-file") && $("#f-file").files[0];
    if (s.type === "epg" && !s.url) return toast(t("invalid"));
    if (s.url && !validUrl(s.url)) return toast(t("badUrl"));
    if (s.type === "m3u") {
      if (file) { try { const txt = await file.text(); const n = parseM3U(txt).length; if (!n || !Store.set("m3u:" + s.id, txt)) throw 0; s.url = ""; s.count = n; s.updated = Date.now(); toast(t("fileLoaded")); } catch (e) { return toast(t("fileRead")); } }
      else if (!s.url && !editing) return toast(t("invalid"));
    }
  }
  if (!Sources.upsert(s)) return toast(t("fileRead"));
  toast(t("saved")); go("sources");
}

document.addEventListener("click", async e => {
  const el = e.target.closest("[data-tab],[data-go],[data-act]"); if (!el) return;
  if (el.dataset.tab) return go(el.dataset.tab);
  if (el.dataset.go) return go(el.dataset.go);
  const act = el.dataset.act, id = el.dataset.id, src = Sources.all().find(s => s.id === id);
  if (act === "new") { editing = null; formType = "xtream"; go("form"); }
  else if (act === "edit" && src) { editing = src; formType = src.type; go("form"); }
  else if (act === "save") saveForm();
  else if (act === "del" && src && confirm(t("confirmDel"))) { Sources.remove(id); toast(t("deleted")); render(); }
  else if (act === "refresh" && src) {
    el.disabled = true;
    try { Sources.upsert({ ...src, ...(await refreshSource(src)) }); toast(t("refreshed")); }
    catch (err) { toast(t("invalid") + " (" + (err.message || "error") + ")"); }
    render();
  }
  else if (act === "cache") { Sources.all().forEach(s => { if (s.type === "m3u" && s.url) Store.del("m3u:" + s.id); }); toast(t("cacheDone")); }
});

document.addEventListener("change", e => {
  if (e.target.id === "s-lang") { lang = e.target.value; Store.set("lang", lang); render(); }
  if (e.target.id === "s-theme") { theme = e.target.value; Store.set("theme", theme); render(); }
  if (e.target.id === "f-type") { formType = e.target.value; const keep = $("#f-name").value; render(); $("#f-name").value = keep; }
});

render();
