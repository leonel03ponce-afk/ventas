/* Crea el pago en Mercado Pago (Checkout Pro) con el vendedor adentro.
   GET  /api/pagar        → { ok: true } si el cobro automático está listo
   POST /api/pagar {plan, ref, nombre} → { url } para mandar al cliente a pagar */
import { leerConfig, origenDe, json, limpiarRef, planPorId } from "../lib/sistema.mjs";

export default async (req) => {
  const token = process.env.MP_ACCESS_TOKEN;
  if (req.method === "GET") return json({ ok: !!token });
  if (!token) return json({ error: "Falta MP_ACCESS_TOKEN" }, 503);

  let body = {};
  try { body = await req.json(); } catch (e) {}
  const origen = origenDe(req);
  const cfg = await leerConfig(origen);
  const plan = planPorId(cfg, String(body.plan || ""), false);
  if (!plan) return json({ error: "Plan desconocido" }, 400);

  const ref = limpiarRef(body.ref);
  const nombre = String(body.nombre || "").slice(0, 40);
  /* clave de esta compra: con ella gracias.html encuentra el pago aunque
     Mercado Pago no devuelva al cliente a la página (pasa en el celu con la app de MP) */
  const k = /^[a-z0-9]{8,16}$/.test(body.k || "") ? body.k : Math.random().toString(36).slice(2, 12);
  const gracias = origen + "/gracias.html?k=" + k;
  const pref = {
    items: [{ id: plan.id, title: (cfg.producto || "SISTEMA") + " · " + plan.nombre, description: "Tu código de acceso: " + gracias, quantity: 1, unit_price: plan.precio, currency_id: "ARS" }],
    external_reference: "sis-" + k,
    metadata: { plan: plan.id, ref, nombre, k },
    back_urls: { success: gracias, pending: gracias, failure: origen + "/planes.html#planes" },
    auto_return: "approved",
    notification_url: origen + "/api/mp-aviso",
    statement_descriptor: String(cfg.producto || "SISTEMA").slice(0, 13)
  };
  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { authorization: "Bearer " + token, "content-type": "application/json" },
    body: JSON.stringify(pref)
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out.init_point) return json({ error: "Mercado Pago no respondió", detalle: out.message || res.status }, 502);
  return json({ url: out.init_point, k });
};

export const config = { path: "/api/pagar" };
