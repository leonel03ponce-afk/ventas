/* Cada 15 minutos: a quién le toca un hábito ahora (y todavía no lo hizo)
   y a quién hay que avisarle a la noche que le faltan misiones.
   Solo hábitos diarios: nada de rutina ni de plata. */
import { pushTienda, enviar, ahoraEn, minutos } from "../lib/push.mjs";

const PASO = 15;
const lista = (l) => (l.length === 1 ? l[0] : l.slice(0, -1).join(", ") + " y " + l[l.length - 1]);

export default async () => {
  const st = pushTienda();
  const { blobs } = await st.list({ prefix: "sub:" });
  const ahora = new Date();
  let enviados = 0;
  for (const b of blobs) {
    const s = await st.get(b.key, { type: "json" });
    if (!s || !s.sub) continue;
    /* 60 días sin abrir la app: se da de baja sola */
    if (s.visto && ahora - new Date(s.visto) > 60 * 86400000) { await st.delete(b.key); continue; }
    const t = ahoraEn(s.zona, ahora);
    const desde = t.min - (t.min % PASO), hasta = desde + PASO;
    const hechos = s.hoy && s.hoy.f === t.fecha ? s.hoy.ok || [] : [];
    const deHoy = (s.habitos || []).filter((h) => !h.dep && h.d.indexOf(t.dow) > -1);
    const faltan = deHoy.filter((h) => hechos.indexOf(h.id) < 0);
    s.env = s.env && s.env.f === t.fecha ? s.env : { f: t.fecha, k: [] };
    const avisos = [];
    /* ventana de 30 minutos: si una corrida se atrasa, el aviso igual sale */
    const toca = (m) => m >= 0 && m < hasta && t.min - m < 30;

    if (s.porHabito !== false) {
      const ya = faltan.filter((h) => toca(minutos(h.t)) && s.env.k.indexOf("h:" + h.id) < 0);
      if (ya.length) {
        const resto = faltan.length - ya.length;
        avisos.push({ marcas: ya.map((h) => "h:" + h.id), title: "⚡ Hora de: " + lista(ya.map((h) => h.n)),
          body: resto ? "Después te " + (resto === 1 ? "queda 1 misión más" : "quedan " + resto + " misiones más") + " hoy." : "Es la última misión de hoy. Cerrá el día.", tag: "habito-" + desde });
      }
    }
    if (toca(minutos(s.cierre)) && faltan.length && s.env.k.indexOf("cierre") < 0) {
      const hechas = deHoy.length - faltan.length;
      avisos.push({ marcas: ["cierre"],
        title: hechas ? "Te " + (faltan.length === 1 ? "falta 1" : "faltan " + faltan.length) + " de " + deHoy.length + " misiones" : "Tus misiones de hoy te esperan",
        body: "Falta: " + lista(faltan.slice(0, 4).map((h) => h.n)) + (faltan.length > 4 ? "…" : "") + ". Todavía estás a tiempo de salvar la racha 🔥",
        tag: "cierre" });
    }
    /* uno solo por corrida: si coinciden, el repaso (que ya nombra todo) gana */
    const aviso = avisos.length > 1 ? avisos[1] : avisos[0];
    if (aviso && avisos.length > 1) aviso.marcas = aviso.marcas.concat(avisos[0].marcas);
    if (!aviso) continue;
    const r = await enviar(s.sub, { title: aviso.title, body: aviso.body, tag: aviso.tag, url: "./#sistema" });
    if (r === "baja") { await st.delete(b.key); continue; }
    if (r !== "ok") continue;
    s.env.k = s.env.k.concat(aviso.marcas);
    await st.setJSON(b.key, s);
    enviados++;
  }
  console.log("avisos de hábitos enviados:", enviados, "de", blobs.length);
};
export const config = { schedule: "*/15 * * * *" };
