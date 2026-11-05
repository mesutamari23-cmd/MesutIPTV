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

let LIB = null, favs = new Set(Store.get("favs", [])), V = { group: "", q: "", n: 100, rows: [] };
const KIND = { live: "live", movies: "movie", series: "series" };

async function loadLib() {
  if (LIB) return LIB;
  LIB = { live: [], movie: [], series: [] };
  for (const s of Sources.all()) {
