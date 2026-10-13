/* gracias.html pide acá el código del cliente.
   ?pago=ID                     → pago de Mercado Pago (lo verifica con MP)
   ?k=CLAVE                     → el mismo pago, buscado por la clave de la compra
   ?hotmart=HP123&email=x@y.com → compra de Hotmart (la registró hotmart-aviso) */
import { origenDe, pagoMP, pagoPorClave, tienda, json, lindo } from "../lib/sistema.mjs";

const publico = (v) => ({ codigo: lindo(v.codigo), vence: v.vence, plan: v.plan, nombre: v.nombre, ref: v.ref });

export default async (req) => {
  const u = new URL(req.url);
  const pago = u.searchParams.get("pago");
  const hot = String(u.searchParams.get("hotmart") || "").trim().toUpperCase();

  const k = u.searchParams.get("k");
  if (pago || k) {
    const r = pago ? await pagoMP(origenDe(req), pago) : await pagoPorClave(origenDe(req), k);
    if (r.estado === "aprobado") return json({ estado: "aprobado", ...publico(r.venta) });
    return json({ estado: r.estado });
  }
  if (hot) {
    const email = String(u.searchParams.get("email") || "").trim().toLowerCase();
    if (!/^HP\w{4,30}$/.test(hot) || !email) return json({ estado: "invalido" });
    const v = await tienda().get("venta:hotmart:" + hot, { type: "json" });
    if (!v || v.email !== email) return json({ estado: "no-existe" });
    if (v.estado !== "aprobada") return json({ estado: "anulado" });
    return json({ estado: "aprobado", ...publico(v) });
  }
  return json({ estado: "invalido" }, 400);
};
export const config = { path: "/api/codigo" };
