/* La app se suscribe acá a los avisos de hábitos y cuenta cómo va el día:
   qué misiones tiene, a qué hora y cuáles ya hizo. Así el aviso llega
   solo si falta algo. */
import { json } from "../lib/sistema.mjs";
import { pushTienda, claveDe, clavesVapid, enviar, minutos } from "../lib/push.mjs";

const texto = (s, n) => String(s == null ? "" : s).slice(0, n);
function limpiarHabitos(l) {
  return (Array.isArray(l) ? l : []).slice(0, 40).map((h) => ({
    id: texto(h.id, 40),
    n: texto(h.n, 60),
    t: minutos(h.t) >= 0 ? texto(h.t, 5) : "",
    d: Array.isArray(h.d) ? h.d.filter((x) => Number.isInteger(x) && x >= 0 && x < 7) : [0, 1, 2, 3, 4, 5, 6],
    dep: !!h.dep,
  })).filter((h) => h.id && h.n);
}

export default async (req) => {
  if (req.method === "GET") return json({ clave: (await clavesVapid()).publicKey });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  let b;
  try { b = await req.json(); } catch (e) { return json({ error: "Datos inválidos" }, 400); }
  const endpoint = b && (b.sub ? b.sub.endpoint : b.endpoint);
  if (!endpoint || !/^https:\/\//.test(endpoint) || String(endpoint).length > 1000) return json({ error: "Falta la suscripción" }, 400);
  const st = pushTienda();
  const clave = claveDe(endpoint);

  if (b.accion === "baja") { await st.delete(clave); return json({ ok: true }); }

  const previo = (await st.get(clave, { type: "json" })) || {};
  if (b.accion === "alta") {
    const s = b.sub || {};
    if (!s.keys || !s.keys.p256dh || !s.keys.auth) return json({ error: "Suscripción incompleta" }, 400);
    previo.sub = { endpoint: s.endpoint, keys: { p256dh: texto(s.keys.p256dh, 200), auth: texto(s.keys.auth, 100) } };
    previo.alta = previo.alta || new Date().toISOString();
  } else if (!previo.sub) {
    return json({ error: "No estás suscripto" }, 404);
  }
  if ("zona" in b) previo.zona = texto(b.zona, 60);
  if ("cierre" in b) previo.cierre = minutos(b.cierre) >= 0 ? texto(b.cierre, 5) : "";
  if ("porHabito" in b) previo.porHabito = !!b.porHabito;
  if ("habitos" in b) previo.habitos = limpiarHabitos(b.habitos);
  if (b.hoy && /^\d{4}-\d{2}-\d{2}$/.test(b.hoy.f || "")) {
    previo.hoy = { f: b.hoy.f, ok: (Array.isArray(b.hoy.ok) ? b.hoy.ok : []).slice(0, 40).map((x) => texto(x, 40)) };
  }
  previo.visto = new Date().toISOString();
  await st.setJSON(clave, previo);

  if (b.accion === "prueba") {
    const r = await enviar(previo.sub, { title: "Así te van a llegar", body: "⚡ Hora de tus misiones. Un toque y las tachás.", tag: "prueba", url: "./#sistema" });
    if (r === "baja") { await st.delete(clave); return json({ error: "La suscripción venció. Activá los avisos de nuevo." }, 410); }
    return json({ ok: r === "ok" });
  }
  return json({ ok: true });
};
export const config = { path: "/api/push" };
