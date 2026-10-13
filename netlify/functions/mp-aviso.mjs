/* Mercado Pago avisa acá cada pago (notification_url de pagar.mjs).
   No hace falta confiar en el aviso: el pago se vuelve a pedir a MP. */
import { origenDe, pagoMP } from "../lib/sistema.mjs";

export default async (req) => {
  const u = new URL(req.url);
  let body = {};
  try { body = await req.json(); } catch (e) {}
  const tipo = u.searchParams.get("type") || u.searchParams.get("topic") || body.type || body.topic || "";
  const id = u.searchParams.get("data.id") || (body.data || {}).id || u.searchParams.get("id") || "";
  if (/payment/.test(tipo) && id) {
    try { await pagoMP(origenDe(req), id); } catch (e) { console.error("mp-aviso", e); }
  }
  return new Response("ok");
};
export const config = { path: "/api/mp-aviso" };
