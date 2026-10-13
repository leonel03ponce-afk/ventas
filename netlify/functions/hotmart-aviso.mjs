/* Hotmart avisa acá cada compra (Webhook / Postback 2.0).
   Configuralo en Hotmart → Herramientas → Webhook, con esta URL:
   https://TU-SITIO/api/hotmart-aviso, y poné el "hottok" que te da Hotmart
   en Netlify como variable HOTMART_HOTTOK. */
import { origenDe, leerConfig, registrarVenta, darDeBaja, json, limpiarRef, slug } from "../lib/sistema.mjs";

function planDe(cfg, d) {
  const I = cfg.internacional || {};
  const lista = I.planes || [];
  const oferta = ((d.purchase || {}).offer || {}).code || "";
  const porOferta = ((I.hotmart || {}).ofertas || {})[oferta];
  if (porOferta) return lista.find((p) => p.id === porOferta);
  const nom = String((d.product || {}).name || "").toLowerCase();
  if (/siempre|vida|lifetime/.test(nom)) return lista.find((p) => p.meses === 0);
  if (/anual|año|12/.test(nom)) return lista.find((p) => p.meses === 12);
  const precio = ((d.purchase || {}).full_price || (d.purchase || {}).price || {});
  if (precio.currency_value === "USD" && lista.length) {
    return lista.slice().sort((a, b) => Math.abs(a.precio - precio.value) - Math.abs(b.precio - precio.value))[0];
  }
  return lista.find((p) => p.meses === 3) || lista[0];
}

export default async (req) => {
  let body = {};
  try { body = await req.json(); } catch (e) { return json({ error: "json" }, 400); }
  const hottok = req.headers.get("x-hotmart-hottok") || body.hottok || "";
  if (!process.env.HOTMART_HOTTOK || hottok !== process.env.HOTMART_HOTTOK) return json({ error: "hottok" }, 401);

  const ev = String(body.event || "");
  const d = body.data || {};
  const p = d.purchase || {};
  const tx = String(p.transaction || "").toUpperCase();
  if (!tx) return json({ ok: true });

  if (/REFUNDED|CHARGEBACK/.test(ev)) {
    await darDeBaja("hotmart", tx, /CHARGEBACK/.test(ev) ? "contracargo" : "reembolsada");
    return json({ ok: true });
  }
  if (!/PURCHASE_APPROVED|PURCHASE_COMPLETE/.test(ev)) return json({ ok: true });

  const origen = origenDe(req);
  const cfg = await leerConfig(origen);
  const plan = planDe(cfg, d);
  if (!plan) return json({ error: "sin planes internacionales" }, 500);
  const afil = (d.affiliates || [])[0] || {};
  const precio = p.price || p.full_price || {};
  await registrarVenta(origen, {
    origen: "hotmart", id: tx, plan: plan.nombre, meses: plan.meses,
    monto: precio.value || plan.precio, moneda: precio.currency_value || "USD",
    nombre: (d.buyer || {}).name || "", email: (d.buyer || {}).email || "",
    tel: (d.buyer || {}).checkout_phone || "", medio: "Hotmart",
    ref: (p.origin || {}).sck ? limpiarRef(p.origin.sck) : slug(afil.name),
    pagaHotmart: !!afil.name /* si vino por un afiliado, Hotmart ya le paga la comisión */
  });
  return json({ ok: true });
};
export const config = { path: "/api/hotmart-aviso" };
