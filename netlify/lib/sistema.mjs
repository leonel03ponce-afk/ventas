/* Lo que comparten las funciones: config, códigos de acceso y registro de ventas.
   Los códigos se arman igual que en el panel de la app (index.html). */
import vm from "node:vm";
import { getStore } from "@netlify/blobs";

const AB = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SERIE_BASE = 700; /* el panel de la app arranca en 1 y el tablero en 500 */

let cfgCache = null;
export async function leerConfig(origen) {
  if (cfgCache) return cfgCache;
  const res = await fetch(origen + "/config.js");
  if (!res.ok) throw new Error("No se pudo leer config.js");
  const ctx = { window: {} };
  vm.runInNewContext(await res.text(), ctx, { timeout: 500 });
  cfgCache = ctx.window.CONFIG || {};
  return cfgCache;
}

export function origenDe(req) {
  const u = new URL(req.url);
  return process.env.URL && !/localhost/.test(u.host) ? process.env.URL.replace(/\/$/, "") : u.origin;
}

function firma(txt) {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 13; h = Math.imul(h, 1274126177); h ^= h >>> 16;
  let n = h >>> 0, out = "";
  for (let k = 0; k < 4; k++) { out += AB.charAt(n % 32); n = Math.floor(n / 32); }
  return out;
}
const dos = (n) => AB.charAt(n % 32) + AB.charAt(Math.floor(n / 32) % 32);
export const lindo = (c) => c.slice(0, 4) + "-" + c.slice(4);

export function armarCodigo(secreto, serial, meses, hoy = new Date()) {
  const idx = meses === 0 ? 1023 : (hoy.getFullYear() - 2026) * 12 + hoy.getMonth() + meses;
  const pay = dos(serial) + dos(idx);
  const d = meses === 0 ? null : new Date(2026, idx + 1, 0);
  const vence = d ? d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") : "";
  return { code: pay + firma(secreto + pay), idx, vence };
}

export const tienda = () => getStore({ name: "ventas", consistency: "strong" });

export function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });
}

export const limpiarRef = (s) => String(s || "").replace(/[^\w\-áéíóúñÁÉÍÓÚÑ]/g, "").slice(0, 30);
/* igual que el link de vendedores.html: "Juan Pérez" → "juan-perez" */
export const slug = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);

/* Registra una venta aprobada y le da su código. Si ya existe, devuelve
   la misma (MP y Hotmart pueden avisar varias veces el mismo pago). */
export async function registrarVenta(origen, v) {
  const st = tienda();
  const clave = "venta:" + v.origen + ":" + v.id;
  const previa = await st.get(clave, { type: "json" });
  if (previa) return previa;

  const cfg = await leerConfig(origen);
  const secreto = (cfg.acceso || {}).secreto || "cambiame";
  const rec = cfg.recomendados || {};

  /* ¿Ya compró antes con ese mail? Entonces es renovación y la comisión
     (más chica) es para quien lo trajo la primera vez. */
  const email = String(v.email || "").trim().toLowerCase();
  let tipo = "primera", ref = limpiarRef(v.ref);
  if (email) {
    const cli = await st.get("cliente:" + email, { type: "json" });
    if (cli) { tipo = "renovacion"; ref = cli.ref || ref; }
    else await st.setJSON("cliente:" + email, { ref, desde: new Date().toISOString() });
  }
  const pct = ref ? (tipo === "primera" ? rec.comision || 0 : rec.renovacion || 0) : 0;

  const hoy = new Date();
  const cont = (await st.get("serie:" + hoy.getFullYear() + "-" + hoy.getMonth() + ":" + v.meses, { type: "json" })) || { n: 0 };
  const serial = (SERIE_BASE + cont.n) % 1024;
  await st.setJSON("serie:" + hoy.getFullYear() + "-" + hoy.getMonth() + ":" + v.meses, { n: cont.n + 1 });
  const c = armarCodigo(secreto, serial, v.meses, hoy);

  const venta = {
    id: v.id, origen: v.origen, fecha: hoy.toISOString(), plan: v.plan, meses: v.meses,
    monto: v.monto, moneda: v.moneda, nombre: v.nombre || "", email, ref, tipo, pct,
    comision: Math.round((v.monto || 0) * pct) / 100, codigo: c.code, vence: c.vence, estado: "aprobada", pagaHotmart: !!v.pagaHotmart
  };
  await st.setJSON(clave, venta);
  return venta;
}

/* Reembolso o contracargo: el código deja de servir en la app */
export async function darDeBaja(origenPago, id, motivo) {
  const st = tienda();
  const clave = "venta:" + origenPago + ":" + id;
  const v = await st.get(clave, { type: "json" });
  if (!v) return null;
  v.estado = motivo; v.comision = 0;
  await st.setJSON(clave, v);
  await st.setJSON("bloq:" + v.codigo, { motivo, fecha: new Date().toISOString() });
  return v;
}

export function planPorId(cfg, id, internacional) {
  const lista = internacional ? ((cfg.internacional || {}).planes || []) : (cfg.planes || []);
  return lista.find((p) => p.id === id) || null;
}

/* Busca un pago en Mercado Pago y, si está aprobado, lo registra y le da código.
   Devuelve { estado, venta? }. Se usa desde el aviso de MP y desde gracias.html. */
export async function pagoMP(origen, id) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return { estado: "sin-config" };
  if (!/^\d{4,20}$/.test(String(id))) return { estado: "invalido" };
  const res = await fetch("https://api.mercadopago.com/v1/payments/" + id, { headers: { authorization: "Bearer " + token } });
  if (res.status === 404) return { estado: "no-existe" };
  if (!res.ok) return { estado: "error" };
  const p = await res.json();

  if (p.status === "refunded" || p.status === "charged_back") {
    const v = await darDeBaja("mp", p.id, p.status === "refunded" ? "reembolsada" : "contracargo");
    return { estado: "anulado", venta: v };
  }
  if (p.status !== "approved") return { estado: p.status === "rejected" || p.status === "cancelled" ? "rechazado" : "pendiente" };

  let ext = {};
  try { ext = JSON.parse(p.external_reference || "{}"); } catch (e) {}
  const meta = p.metadata || {};
  if (!ext.p) ext = { p: meta.plan, r: meta.ref, n: meta.nombre };
  const cfg = await leerConfig(origen);
  const plan = planPorId(cfg, ext.p, false);
  if (!plan) return { estado: "otro" }; /* un cobro que no salió de la página de planes */

  const venta = await registrarVenta(origen, {
    origen: "mp", id: p.id, plan: plan.nombre, meses: plan.meses,
    monto: p.transaction_amount, moneda: p.currency_id || "ARS",
    nombre: ext.n || [((p.payer || {}).first_name || ""), ((p.payer || {}).last_name || "")].join(" ").trim(),
    email: (p.payer || {}).email || "", ref: ext.r || ""
  });
  return { estado: "aprobado", venta };
}

/* Busca el pago por la clave de la compra (la guarda planes.html antes de ir a MP) */
export async function pagoPorClave(origen, k) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return { estado: "sin-config" };
  if (!/^[a-z0-9]{8,16}$/.test(String(k))) return { estado: "invalido" };
  const res = await fetch("https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=10&external_reference=sis-" + k, { headers: { authorization: "Bearer " + token } });
  if (!res.ok) return { estado: "error" };
  const lista = ((await res.json()).results || []);
  if (!lista.length) return { estado: "no-existe" };
  const orden = ["approved", "refunded", "charged_back", "in_process", "pending", "authorized"];
  const pos = (st) => { const i = orden.indexOf(st); return i < 0 ? 99 : i; };
  lista.sort((a, b) => pos(a.status) - pos(b.status));
  return pagoMP(origen, lista[0].id);
}
