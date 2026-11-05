const Store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

const Sources = {
  all() { return Store.get("sources", []); },
  save(list) { return Store.set("sources", list); },
  upsert(src) {
    const list = this.all(), i = list.findIndex(s => s.id === src.id);
    if (i >= 0) list[i] = src; else list.push(src);
    return this.save(list);
  },
  remove(id) { this.save(this.all().filter(s => s.id !== id)); Store.del("m3u:" + id); }
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
    } else if (!line.startsWith("#") && cur) { cur.url = line; out.push(cur); cur = null; }
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
    const text = s.url ? await fetchText(s.url) : Store.get("m3u:" + s.id, "");
    const n = parseM3U(text).length;
    if (!n) throw new Error("empty");
    if (s.url) Store.set("m3u:" + s.id, text.length < 3e6 ? text : "");
    return { updated: Date.now(), count: n };
  }
  if (s.type === "epg") {
    const text = await fetchText(s.url);
    if (!/<tv[\s>]/i.test(text)) throw new Error("xmltv");
    return { updated: Date.now(), count: (text.match(/<channel[\s>]/gi) || []).length };
  }
  return {};
}
