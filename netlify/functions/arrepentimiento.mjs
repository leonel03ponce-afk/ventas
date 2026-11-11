/* BOTÓN DE ARREPENTIMIENTO (Disposición 954/2025 y Disp. 3/2026). Sirve para TODO lo que vende Brian:
   programas (Closer en 30/90, Cancha Abierta, análisis), Ritmo y Sistema.
   POST /api/arrepentimiento (público, sin registro) → guarda el pedido en Blobs (store "arrepentimientos")
        y devuelve AL INSTANTE el código de trámite (la norma pide darlo dentro de las 24 h, por el mismo medio).
        Acepta JSON (lo manda la página) o formulario común (sin JavaScript: responde una página simple con el código).
   GET  /api/arrepentimiento (header x-clave = CLAVE_VENTAS) → los últimos 100, más nuevos arriba (pestaña de Mi negocio).
   Para no gastar créditos: un pedido = una escritura; la lista solo se lee cuando Brian abre la pestaña.
   La devolución la hace Brian a mano desde Mercado Pago (devolución TOTAL). */
import { getStore } from "@netlify/blobs";

const MAX_CUERPO = 6000;
const MAX_LISTA = 100;
const PRODUCTOS = ["Closer en 30", "Closer en 90", "Cancha Abierta", "Análisis de llamada", "Ritmo", "Sistema", "Otro"];

const tienda = () => getStore({ name: "arrepentimientos", consistency: "strong" });
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const texto = (s, n) => String(s == null ? "" : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, n);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* Clave que ordena sola (más nuevos primero) */
const claveNueva = () => "a:" + String(9999999999999 - Date.now()).padStart(13, "0") + "-" + Math.random().toString(36).slice(2, 7);

/* Código de trámite legible: ARR-AAMMDD-XXXX (hora de Argentina) */
function codigoTramite() {
  const f = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(2, 10).replace(/-/g, "");
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let r = "";
  for (let i = 0; i < 4; i++) r += abc[Math.floor(Math.random() * abc.length)];
  return "ARR-" + f + "-" + r;
}

export function validar(b) {
  const nombre = texto(b.nombre, 80);
  const contacto = texto(b.contacto, 120); // mail o WhatsApp con el que compró (validación de identidad razonable, Disp. 3/2026)
  const producto = texto(b.producto, 40);
  const fecha_compra = texto(b.fecha_compra, 10);
  const operacion = texto(b.operacion, 40); // n.º de operación de Mercado Pago (opcional)
  const motivo = texto(b.motivo, 500); // opcional: no se puede exigir motivo
  if (!nombre) return { error: "Falta tu nombre" };
  const esMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto);
  const digitos = contacto.replace(/\D/g, "");
  if (!esMail && (digitos.length < 8 || digitos.length > 15)) return { error: "Pon el mail o el WhatsApp con el que compraste" };
  if (PRODUCTOS.indexOf(producto) < 0) return { error: "Elige el producto" };
  if (fecha_compra && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_compra)) return { error: "Revisa la fecha de compra" };
  return { ok: { nombre, contacto, producto, fecha_compra, operacion, motivo } };
}

function paginaCodigo(codigo) {
  return new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pedido recibido</title>' +
      '<body style="margin:0;background:#0C0C0D;color:#fff;font-family:system-ui,sans-serif;line-height:1.5"><div style="max-width:560px;margin:0 auto;padding:32px 16px">' +
      "<h1>Recibimos tu pedido de arrepentimiento</h1><p>Tu código de trámite es:</p>" +
      '<p style="font:700 24px monospace;border:1px dashed #00E07C;padding:14px;text-align:center">' + esc(codigo) + "</p>" +
      "<p>Guárdalo. Te devolvemos el 100 % por el mismo medio de pago y te escribimos al contacto que dejaste.</p></div>",
    { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } }
  );
}

export default async (req) => {
  if (req.method === "POST") {
    const largo = Number(req.headers.get("content-length") || 0);
    if (largo > MAX_CUERPO) return json({ error: "Demasiado largo" }, 413);
    const crudo = await req.text();
    if (crudo.length > MAX_CUERPO) return json({ error: "Demasiado largo" }, 413);
    const esForm = (req.headers.get("content-type") || "").indexOf("application/x-www-form-urlencoded") > -1;
    let b = {};
    try { b = esForm ? Object.fromEntries(new URLSearchParams(crudo)) : JSON.parse(crudo || "{}"); } catch (e) { b = {}; }
    if (!b || typeof b !== "object") b = {};
    /* Trampa para robots: campo oculto. Se responde con un código falso sin guardar. */
    if (b["no-llenar"]) { const c = codigoTramite(); return esForm ? paginaCodigo(c) : json({ ok: true, codigo: c }); }
    const v = validar(b);
    if (v.error) return json({ error: v.error }, 400);
    const id = claveNueva();
    const codigo = codigoTramite();
    await tienda().setJSON(id, { id, codigo, fecha: new Date().toISOString(), estado: "pendiente", ...v.ok });
    return esForm ? paginaCodigo(codigo) : json({ ok: true, codigo });
  }

  if (req.method === "GET") {
    const clave = process.env.CLAVE_VENTAS;
    if (!clave) return json({ error: "Falta configurar CLAVE_VENTAS en Netlify" }, 503);
    if ((req.headers.get("x-clave") || "") !== clave) return json({ error: "Clave incorrecta" }, 401);
    const st = tienda();
    const { blobs } = await st.list({ prefix: "a:" });
    const claves = blobs.map((x) => x.key).sort().slice(0, MAX_LISTA);
    const lista = (await Promise.all(claves.map((k) => st.get(k, { type: "json" })))).filter(Boolean);
    return json({ pedidos: lista, total: blobs.length });
  }

  return json({ error: "Método no permitido" }, 405);
};

export const config = { path: "/api/arrepentimiento" };
