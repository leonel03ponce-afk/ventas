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

/* Quién manda los avisos. Apple y algunos navegadores rechazan un mail de
   ejemplo: va la dirección real del sitio (o AVISOS_CONTACTO si existe). */
const CONTACTO = process.env.AVISOS_CONTACTO || (process.env.URL ? process.env.URL.replace(/\/$/, "") : "https://brian-ponce.netlify.app");

/* Manda un aviso. Devuelve "ok", "baja" (la suscripción ya no existe) o "error" */
export async function enviar(sub, datos) {
  return (await enviarDetalle(sub, datos)).estado;
}
export async function enviarDetalle(sub, datos) {
  const k = await clavesVapid();
  try {
    await webpush.sendNotification(sub, JSON.stringify(datos), {
      TTL: 3600,
      urgency: "high",
      vapidDetails: { subject: CONTACTO, publicKey: k.publicKey, privateKey: k.privateKey },
    });
    return { estado: "ok" };
  } catch (e) {
    const codigo = e && e.statusCode;
    console.log("push falló", codigo, e && (e.body || e.message));
    return { estado: codigo === 404 || codigo === 410 ? "baja" : "error", codigo: codigo || 0, detalle: String((e && (e.body || e.message)) || "").slice(0, 200) };
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

/* ───── Índice por horario ─────
   Para que cada corrida lea solo a quienes tienen un aviso en ese cuarto
   de hora (y no a todos), cada horario se guarda también como una clave
   "t:<minuto UTC>:<suscripción>". Así el costo crece con los avisos que
   salen, no con la cantidad de clientes. */
export const PASO = 15;
export function desfase(zona, d = new Date()) {
  const t = ahoraEn(zona, d);
  const utc = d.getUTCHours() * 60 + d.getUTCMinutes();
  let dif = t.min - utc;                      /* minutos que la zona va adelante de UTC */
  if (dif > 720) dif -= 1440;
  if (dif < -720) dif += 1440;
  return dif;
}
export const ranura = (minUtc) => { const m = ((minUtc % 1440) + 1440) % 1440; return String(m - (m % PASO)).padStart(4, "0"); };
export function ranurasDe(doc) {
  const dif = desfase(doc.zona);
  const horas = [];
  if (doc.porHabito !== false) (doc.habitos || []).forEach((h) => { if (!h.dep && minutos(h.t) >= 0) horas.push(minutos(h.t)); });
  if (minutos(doc.cierre) >= 0) horas.push(minutos(doc.cierre));
  if (doc.pruebaProg && minutos(doc.pruebaProg.t) >= 0) horas.push(minutos(doc.pruebaProg.t));
  return [...new Set(horas.map((m) => ranura(m - dif)))];
}
export async function reindexar(st, clave, doc) {
  const id = clave.slice(4);
  const nuevas = doc.sub ? ranurasDe(doc) : [];
  const viejas = doc.idx || [];
  await Promise.all(viejas.filter((r) => nuevas.indexOf(r) < 0).map((r) => st.delete("t:" + r + ":" + id)));
  await Promise.all(nuevas.filter((r) => viejas.indexOf(r) < 0).map((r) => st.set("t:" + r + ":" + id, "1")));
  doc.idx = nuevas;
}
