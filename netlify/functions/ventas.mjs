/* Datos del panel ventas.html. Pide la clave CLAVE_VENTAS
   (variable de Netlify; no es la del panel de la app, porque esa está en config.js).
   GET  /api/ventas → { ventas, bloqueados, pagos, vendedores }
   POST /api/ventas { accion, ... }:
     "bloquear" | "desbloquear"  { codigo }
     "manual"     { nombre, email, tel, plan, internacional, monto, moneda, ref, medio, nota } → venta con código
     "pagar"      { ref, moneda, monto, nota }  → registra que le pagaste la comisión
     "vendedor"   { ref, nombre, pais, cobro, tel } → datos del vendedor */
import { tienda, json, origenDe, leerConfig, planPorId, registrarVenta, limpiarRef } from "../lib/sistema.mjs";

const texto = (s, n = 80) => String(s == null ? "" : s).trim().slice(0, n);

export default async (req) => {
  const clave = process.env.CLAVE_VENTAS;
  const dada = req.headers.get("x-clave") || "";
  if (!clave) return json({ error: "Falta configurar CLAVE_VENTAS en Netlify" }, 503);
  if (dada !== clave) return json({ error: "Clave incorrecta" }, 401);
  const st = tienda();

  if (req.method === "POST") {
    let b = {};
    try { b = await req.json(); } catch (e) {}

    if (b.accion === "bloquear" || b.accion === "desbloquear") {
      const cod = String(b.codigo || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (cod.length !== 8) return json({ error: "Código inválido" }, 400);
      if (b.accion === "bloquear") await st.setJSON("bloq:" + cod, { motivo: "a mano", fecha: new Date().toISOString() });
      else await st.delete("bloq:" + cod);
      return json({ ok: true });
    }

    if (b.accion === "manual") {
      const origen = origenDe(req);
      const cfg = await leerConfig(origen);
      const plan = planPorId(cfg, String(b.plan || ""), !!b.internacional);
      if (!plan) return json({ error: "Elegí un plan" }, 400);
      if (!texto(b.nombre)) return json({ error: "Falta el nombre del cliente" }, 400);
      const monto = Number(b.monto) > 0 ? Number(b.monto) : plan.precio;
      const venta = await registrarVenta(origen, {
        origen: "manual", id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        plan: plan.nombre, meses: plan.meses, monto, moneda: b.internacional ? "USD" : "ARS",
        nombre: texto(b.nombre), email: texto(b.email), tel: texto(b.tel, 30),
        ref: limpiarRef(b.ref), medio: texto(b.medio, 40), nota: texto(b.nota, 200)
      });
      return json({ ok: true, venta });
    }

    if (b.accion === "pagar") {
      const ref = limpiarRef(b.ref), monto = Number(b.monto);
      if (!ref || !(monto > 0)) return json({ error: "Faltan datos del pago" }, 400);
      const id = Date.now().toString(36);
      await st.setJSON("pago:" + id, { id, ref, moneda: texto(b.moneda, 5) || "ARS", monto, nota: texto(b.nota, 200), fecha: new Date().toISOString() });
      return json({ ok: true });
    }
    if (b.accion === "borrar-pago") {
      await st.delete("pago:" + texto(b.id, 20));
      return json({ ok: true });
    }

    if (b.accion === "vendedor") {
      const ref = limpiarRef(b.ref);
      if (!ref) return json({ error: "Falta el vendedor" }, 400);
      await st.setJSON("vend:" + ref, { ref, nombre: texto(b.nombre), pais: texto(b.pais, 40), cobro: texto(b.cobro, 120), tel: texto(b.tel, 30) });
      return json({ ok: true });
    }
    return json({ error: "Acción desconocida" }, 400);
  }

  const todos = async (prefijo) => {
    const { blobs } = await st.list({ prefix: prefijo });
    return (await Promise.all(blobs.map((x) => st.get(x.key, { type: "json" })))).filter(Boolean);
  };
  const [ventas, pagos, vendedores, bloq] = await Promise.all([todos("venta:"), todos("pago:"), todos("vend:"), st.list({ prefix: "bloq:" })]);
  ventas.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  pagos.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  return json({ ventas, pagos, vendedores, bloqueados: bloq.blobs.map((x) => x.key.slice(5)) });
};
export const config = { path: "/api/ventas" };
