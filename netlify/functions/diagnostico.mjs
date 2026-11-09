/* Página de diagnóstico de closer (app/diagnostico/). No es de SISTEMA: es de Brian Ponce / El Que Cierra Gana.
   POST /api/diagnostico (público)  → guarda un envío en Blobs (store "diagnosticos").
        Acepta JSON (lo manda la página) o formulario común (si el navegador no corre JavaScript:
        en ese caso responde con un redirect a /diagnostico/gracias.html).
   GET  /api/diagnostico (header x-clave = CLAVE_VENTAS) → los últimos 100, más nuevos arriba (lo usa Mi negocio).
   Para no gastar créditos: un envío = una escritura; la lista solo se lee cuando Brian abre la pestaña. */
import { getStore } from "@netlify/blobs";

const MAX_CUERPO = 8000; // bytes; las respuestas largas tienen 600 caracteres cada una
const MAX_LISTA = 100;
const HORAS = ["Menos de 5", "Entre 5 y 10", "Entre 10 y 20", "Más de 20"];

const tienda = () => getStore({ name: "diagnosticos", consistency: "strong" });
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const texto = (s, n) => String(s == null ? "" : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, n);

/* Clave que ordena solo: los más nuevos primero al listar (orden alfabético) */
const claveNueva = () => "d:" + String(9999999999999 - Date.now()).padStart(13, "0") + "-" + Math.random().toString(36).slice(2, 7);

export function validar(b) {
  const nombre = texto(b.nombre, 60);
  const whatsapp = texto(b.whatsapp, 25);
  const digitos = whatsapp.replace(/\D/g, "");
  const horas = texto(b.horas, 20);
  const hasta = texto(b.hasta_ahora, 600);
  const meta = texto(b.meta_30_dias, 600);
  const origen = texto(b.origen, 30).replace(/[^a-z0-9-]/gi, "").toLowerCase() || "directo";
  const acepta = b.acepta_whatsapp === true || b.acepta_whatsapp === "si";
  if (!nombre) return { error: "Falta tu nombre" };
  if (digitos.length < 8 || digitos.length > 15) return { error: "Revisa tu WhatsApp (con código de país)" };
  if (HORAS.indexOf(horas) < 0) return { error: "Elige cuántas horas por semana" };
  if (!hasta) return { error: "Cuéntame qué hiciste hasta ahora" };
  if (!meta) return { error: "Cuéntame qué quieres lograr en 30 días" };
  if (!acepta) return { error: "Falta aceptar que te escriba por WhatsApp" };
  return { ok: { nombre, whatsapp, horas, hasta_ahora: hasta, meta_30_dias: meta, origen } };
}

export default async (req) => {
  if (req.method === "POST") {
    const largo = Number(req.headers.get("content-length") || 0);
    if (largo > MAX_CUERPO) return json({ error: "Demasiado largo" }, 413);
    const crudo = await req.text();
    if (crudo.length > MAX_CUERPO) return json({ error: "Demasiado largo" }, 413);
    const tipo = req.headers.get("content-type") || "";
    const esForm = tipo.indexOf("application/x-www-form-urlencoded") > -1;
    let b = {};
    try { b = esForm ? Object.fromEntries(new URLSearchParams(crudo)) : JSON.parse(crudo || "{}"); } catch (e) { b = {}; }
    if (!b || typeof b !== "object") b = {};
    /* Trampa para robots: un campo oculto que una persona nunca llena. Se le responde "ok" sin guardar. */
    if (b["no-llenar"]) return esForm ? Response.redirect(new URL("/diagnostico/gracias.html", req.url), 303) : json({ ok: true });
    const v = validar(b);
    if (v.error) return json({ error: v.error }, 400);
    const id = claveNueva();
    await tienda().setJSON(id, { id, fecha: new Date().toISOString(), ...v.ok });
    if (esForm) return Response.redirect(new URL("/diagnostico/gracias.html", req.url), 303);
    return json({ ok: true });
  }

  if (req.method === "GET") {
    const clave = process.env.CLAVE_VENTAS;
    if (!clave) return json({ error: "Falta configurar CLAVE_VENTAS en Netlify" }, 503);
    if ((req.headers.get("x-clave") || "") !== clave) return json({ error: "Clave incorrecta" }, 401);
    const st = tienda();
    const { blobs } = await st.list({ prefix: "d:" });
    const claves = blobs.map((x) => x.key).sort().slice(0, MAX_LISTA);
    const lista = (await Promise.all(claves.map((k) => st.get(k, { type: "json" })))).filter(Boolean);
    return json({ diagnosticos: lista, total: blobs.length });
  }

  return json({ error: "Método no permitido" }, 405);
};

export const config = { path: "/api/diagnostico" };
