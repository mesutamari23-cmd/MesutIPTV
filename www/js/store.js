const Store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

const DB = {
  _db: null,
  open() {
    if (this._db) return this._db;
    this._db = new Promise((res, rej) => {
      const r = indexedDB.open("mesut", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("kv");
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return this._db;
  },
  async tx(mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const t = db.transaction("kv", mode), rq = fn(t.objectStore("kv"));
      t.oncomplete = () => res(rq && rq.result); t.onerror = () => rej(t.error);
    });
  },
  get(k) { return this.tx("readonly", st => st.get(k)); },
  put(k, v) { return this.tx("readwrite", st => st.put(v, k)); },
  del(k) { return this.tx("readwrite", st => st.delete(k)); }
};

const Sources = {
  all() { return Store.get("sources", []); },
  save(list) { return Store.set("sources", list); },
  upsert(src) {
    const list = this.all(), i = list.findIndex(s => s.id === src.id);
    if (i >= 0) list[i] = src; else list.push(src);
    return this.save(list);
  },
  remove(id) { this.save(this.all().filter(s => s.id !== id)); DB.del("ch:" + id).catch(() => {}); }
};

function validUrl(u) { try { const x = new URL(u); return x.protocol === "http:" || x.protocol === "https:"; } catch (e) { return false; } }

function parseM3U(text) {
  const out = []; let cur = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXTINF")) {
      const attr = k => { const m = line.match(new RegExp(k + '="([^"]*)"', "i")); return m ? m[1] : ""; };
      cur = { name: line.includes(",") ? line.slice(line.lastIndexOf(",") + 1).trim() : "", logo: attr("tvg-logo"),
              group: attr("group-title"), tvgId: attr("tvg-id") };
    } else if (!line.startsWith("#") && cur) { cur.url = line; cur.t = /\/movie\//i.test(line) ? "movie" : /\/series\//i.test(line) ? "series" : "live"; out.push(cur); cur = null; }
  }
  return out;
}

async function fetchText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.text();
}

/* Vérifie / actualise une source. Retourne un objet partiel à fusionner dans la source. */
async function refreshSource(s) {
  if (s.type === "xtream") {
    const base = s.server.replace(/\/+$/, "");
    const r = await fetch(`${base}/player_api.php?username=${encodeURIComponent(s.user)}&password=${encodeURIComponent(s.pass)}`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    if (!j.user_info || Number(j.user_info.auth) !== 1) throw new Error("auth");
    return { updated: Date.now(), expires: j.user_info.exp_date || null };
  }
  if (s.type === "m3u") {
    const items = s.url ? parseM3U(await fetchText(s.url)) : ((await DB.get("ch:" + s.id)) || []);
    if (!items.length) throw new Error("empty");
    await DB.put("ch:" + s.id, items);
    return { updated: Date.now(), count: items.length };
  }
  if (s.type === "epg") {
    const text = await fetchText(s.url);
    if (!/<tv[\s>]/i.test(text)) throw new Error("xmltv");
    return { updated: Date.now(), count: (text.match(/<channel[\s>]/gi) || []).length };
  }
  return {};
}
