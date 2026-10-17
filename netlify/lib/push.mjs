/* Avisos push de los hábitos diarios: claves, suscripciones y envío.
   Las claves VAPID se crean solas la primera vez y quedan guardadas en
   Netlify Blobs (o se toman de VAPID_PUBLIC / VAPID_PRIVATE si existen). */
import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import webpush from "web-push";

export const pushTienda = () => getStore({ name: "push", consistency: "strong" });
export const claveDe = (endpoint) => "sub:" + createHash("sha256").update(String(endpoint)).digest("hex").slice(0, 32);

let vapid = null;
export async function clavesVapid() {
  if (vapid) return vapid;
  if (process.env.VAPID_PUBLIC && process.env.VAPID_PRIVATE) {
    vapid = { publicKey: process.env.VAPID_PUBLIC, privateKey: process.env.VAPID_PRIVATE };
    return vapid;
  }
  const st = pushTienda();
  vapid = await st.get("vapid", { type: "json" });
  if (!vapid) {
    vapid = webpush.generateVAPIDKeys();
    await st.setJSON("vapid", vapid);
  }
  return vapid;
}

/* Manda un aviso. Devuelve "baja" si la suscripción ya no existe */
export async function enviar(sub, datos, contacto) {
  const k = await clavesVapid();
  try {
    await webpush.sendNotification(sub, JSON.stringify(datos), {
      TTL: 3600,
      urgency: "normal",
      vapidDetails: { subject: contacto || "mailto:avisos@example.com", publicKey: k.publicKey, privateKey: k.privateKey },
    });
    return "ok";
  } catch (e) {
    return e && (e.statusCode === 404 || e.statusCode === 410) ? "baja" : "error";
  }
}

/* Fecha, hora y día de la semana en la zona horaria del cliente */
export function ahoraEn(zona, d = new Date()) {
  let partes;
  try {
    partes = new Intl.DateTimeFormat("en-CA", { timeZone: zona || "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" }).formatToParts(d);
  } catch (e) {
    return ahoraEn("America/Argentina/Buenos_Aires", d);
  }
  const p = Object.fromEntries(partes.map((x) => [x.type, x.value]));
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return { fecha: p.year + "-" + p.month + "-" + p.day, min: Number(p.hour) * 60 + Number(p.minute), dow };
}
export const minutos = (hhmm) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || ""));
  return m ? Number(m[1]) * 60 + Number(m[2]) : -1;
};
