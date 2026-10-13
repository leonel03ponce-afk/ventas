/* Lista de ventas automáticas para ventas.html. Pide la clave CLAVE_VENTAS
   (variable de Netlify; no es la del panel, porque esa está en config.js).
   GET  /api/ventas            → { ventas: [...] }
   POST /api/ventas {accion: "bloquear" | "desbloquear", codigo} */
import { tienda, json } from "../lib/sistema.mjs";

export default async (req) => {
  const clave = process.env.CLAVE_VENTAS;
  const dada = req.headers.get("x-clave") || "";
  if (!clave) return json({ error: "Falta configurar CLAVE_VENTAS en Netlify" }, 503);
  if (dada !== clave) return json({ error: "Clave incorrecta" }, 401);
  const st = tienda();

  if (req.method === "POST") {
    let b = {};
    try { b = await req.json(); } catch (e) {}
    const cod = String(b.codigo || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cod.length !== 8) return json({ error: "Código inválido" }, 400);
    if (b.accion === "bloquear") await st.setJSON("bloq:" + cod, { motivo: "a mano", fecha: new Date().toISOString() });
    else if (b.accion === "desbloquear") await st.delete("bloq:" + cod);
    return json({ ok: true });
  }

  const { blobs } = await st.list({ prefix: "venta:" });
  const ventas = (await Promise.all(blobs.map((b) => st.get(b.key, { type: "json" })))).filter(Boolean);
  ventas.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const bloq = (await st.list({ prefix: "bloq:" })).blobs.map((b) => b.key.slice(5));
  return json({ ventas, bloqueados: bloq });
};
export const config = { path: "/api/ventas" };
