/* La app pregunta acá si un código sirve (antes lo revisaba sola, con el secreto a la vista en config.js).
   POST /api/acceso { codigo }  → { ok, vence }  o  { ok: false, error, vencido? }
   POST /api/acceso { panel }   → { ok } si es la clave de Mi negocio (CLAVE_VENTAS): abre el panel en la app */
import { timingSafeEqual } from "node:crypto";
import { tienda, json, firma, secretos, origenDe, leerConfig } from "../lib/sistema.mjs";

const AB = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const leerDos = (s) => AB.indexOf(s.charAt(0)) + AB.indexOf(s.charAt(1)) * 32;
const limpio = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

function igual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Usá POST" }, 405);
  let b = {};
  try { b = await req.json(); } catch (e) {}

  if (b.panel != null) {
    const clave = process.env.CLAVE_VENTAS;
    if (!clave) return json({ ok: false, error: "Falta configurar CLAVE_VENTAS en Netlify" }, 503);
    return json({ ok: igual(String(b.panel).trim(), clave) });
  }

  const c = limpio(b.codigo);
  if (c.length !== 8) return json({ ok: false, error: "Ese código no tiene el formato correcto." });
  const pay = c.slice(0, 4), chk = c.slice(4);
  const lista = secretos();
  if (!lista.length) return json({ ok: false, error: "El sistema de códigos no está configurado. Escribime." }, 503);
  if (!lista.some((s) => firma(s + pay) === chk)) return json({ ok: false, error: "Ese código no es válido." });

  const serial = pay.slice(0, 2);
  let bloqueadosCfg = [];
  try { bloqueadosCfg = ((await leerConfig(origenDe(req))).acceso || {}).bloqueados || []; } catch (e) {}
  if (bloqueadosCfg.includes(serial) || (await tienda().get("bloq:" + c))) {
    return json({ ok: false, error: "Ese código fue dado de baja. Si es un error, escribime." });
  }
  const meses = leerDos(pay.slice(2));
  const vence = meses >= 1000 ? null : new Date(2026, meses + 1, 0, 23, 59, 59);
  if (vence && vence < new Date()) {
    return json({ ok: false, vencido: true, error: "Tu acceso venció el " + vence.getDate() + "/" + (vence.getMonth() + 1) + "/" + vence.getFullYear() + ". Escribime y lo renovamos." });
  }
  return json({ ok: true, vence: vence ? iso(vence) : null });
};
export const config = { path: "/api/acceso" };
