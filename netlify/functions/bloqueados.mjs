/* La app pregunta acá qué códigos se dieron de baja (reembolsos, contracargos
   o los que bajes a mano desde ventas.html). */
import { tienda, json } from "../lib/sistema.mjs";

export default async () => {
  const { blobs } = await tienda().list({ prefix: "bloq:" });
  return json({ codigos: blobs.map((b) => b.key.slice(5)) }, 200, { "cache-control": "public, max-age=60" });
};
export const config = { path: "/api/bloqueados" };
