/* Ranking público de vendedores para ranking.html: solo nombre y cantidad
   de ventas (nada de plata ni datos de clientes). */
import { tienda, json } from "../lib/sistema.mjs";

const lindo = (ref) => String(ref).split("-").filter(Boolean).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

export default async () => {
  const st = tienda();
  const todos = async (prefijo) => {
    const { blobs } = await st.list({ prefix: prefijo });
    return (await Promise.all(blobs.map((x) => st.get(x.key, { type: "json" })))).filter(Boolean);
  };
  const [ventas, vend, bloq] = await Promise.all([todos("venta:"), todos("vend:"), st.list({ prefix: "bloq:" })]);
  const bajas = new Set(bloq.blobs.map((b) => b.key.slice(5)));
  const nombres = {};
  vend.forEach((v) => { if (v.nombre) nombres[v.ref] = v.nombre.split(" ").slice(0, 2).join(" "); });
  const mes = new Date().toISOString().slice(0, 7);
  const cuenta = (lista) => {
    const m = {};
    lista.forEach((v) => { m[v.ref] = (m[v.ref] || 0) + 1; });
    return Object.keys(m).map((ref) => ({ ref, nombre: nombres[ref] || lindo(ref), ventas: m[ref] }))
      .sort((a, b) => b.ventas - a.ventas || a.nombre.localeCompare(b.nombre));
  };
  const validas = ventas.filter((v) => v.ref && v.estado === "aprobada" && !bajas.has(v.codigo));
  return json({
    mes,
    esteMes: cuenta(validas.filter((v) => String(v.fecha).slice(0, 7) === mes)),
    historico: cuenta(validas).slice(0, 20)
  }, 200, { "cache-control": "public, max-age=300", "netlify-cdn-cache-control": "public, s-maxage=600" });
};
export const config = { path: "/api/ranking" };
