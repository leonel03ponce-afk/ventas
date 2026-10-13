"""Arma las rutinas base y sus links para mandar por WhatsApp.
Correlo después de cambiar algo acá:  python3 rutinas/generar.py
Genera app/rutinas-base.js (lo usa Mi negocio) y rutinas/RUTINAS-BASE.md."""
import base64, json, pathlib, re, zlib

AQUI = pathlib.Path(__file__).parent
APP = AQUI.parent / "app"
cfg = (APP / "config.js").read_text(encoding="utf-8")
SITIO = re.search(r'sitio:\s*"([^"]+)"', cfg).group(1).split("?")[0].split("#")[0]
MARCA = re.search(r'marca:\s*"([^"]+)"', cfg).group(1)

def e(n, se=None, re_=None, r=None, sq=None, note=None):
    o = {"n": n}
    if se: o["se"] = se
    if re_: o["re"] = re_
    if r: o["r"] = r
    if sq: o["sq"] = sq
    if note: o["note"] = note
    return o
def ss(*items, r=None):
    o = {"type": "ss", "items": list(items)}
    if r: o["r"] = r
    return o

COLORES = ["#7C9CFF", "#4BD489", "#FF6F4E", "#A98BFF", "#E9B75B"]
DIAS = {"lun": ("Lun", "Lunes"), "mar": ("Mar", "Martes"), "mie": ("Mié", "Miércoles"), "jue": ("Jue", "Jueves"), "vie": ("Vie", "Viernes")}

def dia(i, id_, title, focus, blocks, activation=None, cardio=None):
    tab, day = DIAS[id_]
    d = {"id": id_, "kind": "train", "tab": tab, "day": day, "title": title, "focus": focus, "c": COLORES[i % 5], "on": "#0B0715"}
    if activation: d["activation"] = activation
    d["blocks"] = blocks
    if cardio: d["cardio"] = cardio
    return d

def descanso(texto_sab="35-40 min", t_sab="de caminata o bici suave"):
    return {"id": "finde", "kind": "rest", "tab": "Finde", "day": "Sábado y domingo", "title": "Descanso activo", "lines": 2, "c": "#F3EDE4", "on": "#0B0715",
            "plan": [{"h": "", "big": "8.000", "t": "pasos diarios"}, {"h": "Sábado", "big": texto_sab, "t": t_sab}, {"h": "Domingo", "big": "", "t": "Movilidad + descanso total"}]}

MOVILIDAD = {"id": "am", "kind": "mob", "tab": "AM", "day": "Movilidad AM", "title": "Todos los días", "lines": 2, "c": "#5FD6E0", "on": "#0B0715",
             "items": [e("Respiración 90/90", re_="5", sq="respiraciones", note="soltá todo el aire, costillas abajo"), e("Gato-vaca", re_="10", sq="lentas"),
                       e("Bird dog", se="2", re_="8", sq="por lado"), e("Estocada con rotación", re_="6", sq="por lado"), e("Puente de glúteo", se="2", re_="15")]}

ACT_UP = [e("Rotaciones externas con banda", "2", "15"), e("Flexiones contra banco", "1", "10")]
ACT_LOW = [e("Puente de glúteo", "2", "15"), e("Sentadilla con pausa sin peso", "1", "10")]

RUTINAS = [
  {"id": "principiante-3", "nombre": "Principiante · 3 días", "para": "Nunca entrenó o vuelve después de mucho. Gimnasio, 3 días (lun, mié, vie), 45-50 min.",
   "dias": [
     dia(0, "lun", "Cuerpo completo A", "Aprender los básicos", [
       e("Prensa 45°", "3", "10-12", "2'"), e("Press de pecho en máquina", "3", "10-12", "90\""), e("Jalón al pecho", "3", "10-12", "90\""),
       e("Curl femoral sentado", "2", "12-15", "75\""), e("Elevaciones laterales con mancuernas", "2", "12-15", "60\""), e("Plancha", "3", "20-30s", "45\"")],
       ACT_LOW, "15 min caminata inclinada"),
     dia(1, "mie", "Cuerpo completo B", "Bisagra y empujes", [
       e("Sentadilla goblet", "3", "10-12", "2'"), e("Remo en máquina o polea baja", "3", "10-12", "90\""), e("Press de hombros en máquina", "3", "10-12", "90\""),
       e("Hip thrust en máquina o con barra", "3", "12", "90\""), ss(e("Curl de bíceps con mancuernas", "2", "12"), e("Tríceps en polea", "2", "12"), r="75\""),
       e("Dead bug", "2", "8", sq="por lado")], ACT_UP, "15 min bici"),
     dia(2, "vie", "Cuerpo completo C", "Repetir y progresar", [
       e("Prensa 45°", "3", "10-12", "2'", note="sumá peso si llegaste a 12"), e("Press inclinado con mancuernas", "3", "10-12", "90\""), e("Jalón agarre neutro", "3", "10-12", "90\""),
       e("Peso muerto rumano con mancuernas", "3", "10-12", "2'"), e("Gemelos en máquina", "2", "15", "60\""), e("Abdominales en máquina o crunch", "2", "15", "45\"")],
       ACT_LOW, "15 min caminata inclinada"),
     descanso(), MOVILIDAD]},

  {"id": "musculo-4", "nombre": "Ganar músculo · 4 días", "para": "Ya entrena hace unos meses y quiere crecer. Gimnasio, torso/piernas (lun, mar, jue, vie), 60 min.",
   "dias": [
     dia(0, "lun", "Torso A", "Pecho + espalda", [
       e("Press banca con barra", "4", "6-8", "2-3'"), e("Remo con barra o T-bar", "4", "8-10", "2'"), e("Press inclinado con mancuernas", "3", "8-12", "2'"),
       e("Jalón al pecho", "3", "10-12", "90\""), ss(e("Elevaciones laterales", "3", "12-15"), e("Face pull", "3", "15"), r="60\""),
       ss(e("Curl con barra Z", "3", "10-12"), e("Tríceps en polea sobre la cabeza", "3", "10-12"), r="75\"")], ACT_UP, "10 min cinta"),
     dia(1, "mar", "Piernas A", "Cuádriceps", [
       e("Sentadilla con barra o hack", "4", "6-10", "2-3'"), e("Prensa 45°", "3", "10-12", "2'"), e("Búlgara con mancuernas", "3", "10", "90\"", sq="por pierna"),
       e("Extensión de cuádriceps", "3", "12-15", "75\""), e("Curl femoral sentado", "3", "10-12", "75\""), e("Gemelos de pie", "4", "10-15", "60\"")], ACT_LOW),
     dia(2, "jue", "Torso B", "Espalda + hombros", [
       e("Dominadas o jalón supino", "4", "6-10", "2'"), e("Press militar con mancuernas", "3", "8-10", "2'"), e("Remo en polea baja", "3", "10-12", "90\""),
       e("Aperturas en polea o pec deck", "3", "12-15", "75\""), e("Posterior en máquina", "3", "15", "60\""),
       ss(e("Curl martillo", "3", "10-12"), e("Fondos en máquina o banco", "3", "10-12"), r="75\"")], ACT_UP, "10 min cinta"),
     dia(3, "vie", "Piernas B", "Isquios + glúteos", [
       e("Peso muerto rumano", "4", "8-10", "2-3'"), e("Hip thrust con barra", "4", "8-12", "2'"), e("Curl femoral acostado", "3", "10-12", "90\""),
       e("Zancadas caminando", "3", "12", "90\"", sq="por pierna"), e("Gemelo sentado", "3", "12-20", "60\""), e("Elevación de piernas colgado", "3", "10-15", "60\"")], ACT_LOW),
     descanso(), MOVILIDAD]},

  {"id": "grasa-4", "nombre": "Bajar grasa · 4 días", "para": "Quiere bajar de peso sin perder músculo. Gimnasio, fuerza + circuitos + cardio (lun, mar, jue, vie), 50-60 min.",
   "dias": [
     dia(0, "lun", "Fuerza cuerpo completo", "Mantener la fuerza", [
       e("Sentadilla goblet o hack", "4", "8-10", "2'"), e("Press banca con mancuernas", "3", "8-10", "90\""), e("Remo con mancuerna", "3", "10", "90\"", sq="por brazo"),
       e("Peso muerto rumano", "3", "10", "2'"), e("Plancha", "3", "30-40s", "45\"")], ACT_LOW, "20 min caminata inclinada 10%"),
     dia(1, "mar", "Circuito metabólico", "Quemar y sudar", [
       ss(e("Sentadilla con salto o prensa liviana", "4", "15"), e("Flexiones", "4", "10-15"), e("Remo en polea", "4", "15"), e("Mountain climbers", "4", "30s"), r="90\" al terminar la vuelta"),
       ss(e("Zancadas caminando", "3", "12", sq="por pierna"), e("Press de hombros con mancuernas", "3", "12"), e("Burpees", "3", "8"), r="90\"")],
       None, "10 min bici a ritmo fuerte"),
     dia(2, "jue", "Fuerza cuerpo completo B", "Bisagra y espalda", [
       e("Prensa 45°", "4", "10-12", "2'"), e("Jalón al pecho", "3", "10-12", "90\""), e("Hip thrust", "3", "10-12", "90\""),
       e("Press inclinado en máquina", "3", "10-12", "90\""), ss(e("Curl de bíceps", "2", "12"), e("Tríceps en polea", "2", "12"), r="60\"")],
       ACT_UP, "20 min caminata inclinada 10%"),
     dia(3, "vie", "Intervalos + core", "Cardio intenso", [
       e("Intervalos en bici o remo: 30s fuerte / 60s suave", "10", "rondas"), ss(e("Rueda abdominal o plancha con toques", "3", "10"), e("Plancha lateral", "3", "30s", sq="por lado"), r="45\""),
       e("Paseo del granjero con mancuernas", "4", "30-40m", "60\"")], None, "15 min caminata suave para bajar"),
     descanso("45-60 min", "de caminata a paso ligero"), MOVILIDAD]},

  {"id": "casa-3", "nombre": "En casa · 3 días", "para": "Entrena en casa con mancuernas, banda elástica o solo el cuerpo (lun, mié, vie), 40 min.",
   "dias": [
     dia(0, "lun", "Casa A", "Piernas + empuje", [
       e("Sentadilla con mancuerna (goblet)", "4", "12-15", "90\""), e("Flexiones (de rodillas si cuesta)", "4", "8-15", "90\""), e("Zancada atrás", "3", "10", "75\"", sq="por pierna"),
       e("Press de hombros con mancuernas o banda", "3", "12", "75\""), e("Puente de glúteo a una pierna", "3", "12", "60\"", sq="por pierna"), e("Plancha", "3", "30-45s", "45\"")]),
     dia(1, "mie", "Casa B", "Espalda + bisagra", [
       e("Remo con mancuerna apoyado en silla", "4", "10-12", "90\"", sq="por brazo"), e("Peso muerto rumano con mancuernas", "4", "12", "90\""),
       e("Remo con banda o toalla en la puerta", "3", "15", "60\""), e("Sentadilla búlgara en silla", "3", "10", "90\"", sq="por pierna"),
       ss(e("Curl con mancuernas o banda", "3", "12-15"), e("Fondos en silla", "3", "10-15"), r="60\""), e("Dead bug", "3", "8", sq="por lado")]),
     dia(2, "vie", "Casa C", "Circuito", [
       ss(e("Sentadilla", "4", "20"), e("Flexiones", "4", "10"), e("Zancadas alternadas", "4", "20"), e("Remo con banda", "4", "15"), e("Mountain climbers", "4", "30s"), r="2' al terminar la vuelta"),
       e("Plancha lateral", "3", "30s", "45\"", sq="por lado")], None, "20 min caminata afuera"),
     descanso(), MOVILIDAD]},

  {"id": "gluteos-4", "nombre": "Glúteos y piernas · 4 días", "para": "Prioriza glúteos y piernas sin descuidar el torso. Gimnasio (lun, mar, jue, vie), 55 min.",
   "dias": [
     dia(0, "lun", "Glúteos pesado", "Fuerza de cadera", [
       e("Hip thrust con barra", "4", "8-10", "2-3'"), e("Peso muerto rumano", "3", "8-10", "2'"), e("Búlgara con foco glúteo", "3", "10", "90\"", sq="por pierna"),
       e("Abductores en máquina", "3", "15-20", "60\""), e("Patada de glúteo en polea", "3", "12-15", "60\"", sq="por pierna")], ACT_LOW),
     dia(1, "mar", "Torso", "Espalda, hombros y brazos", [
       e("Jalón al pecho", "3", "10-12", "90\""), e("Press de hombros con mancuernas", "3", "10-12", "90\""), e("Remo en polea baja", "3", "10-12", "90\""),
       e("Elevaciones laterales", "3", "12-15", "60\""), ss(e("Curl de bíceps", "2", "12"), e("Tríceps en polea", "2", "12"), r="60\""), e("Plancha", "3", "30-40s", "45\"")],
       ACT_UP, "15 min caminata inclinada"),
     dia(2, "jue", "Piernas completas", "Cuádriceps + glúteos", [
       e("Sentadilla hack o goblet", "4", "8-12", "2'"), e("Prensa 45° pies altos", "3", "10-12", "2'"), e("Zancadas caminando", "3", "12", "90\"", sq="por pierna"),
       e("Curl femoral sentado", "3", "10-12", "75\""), e("Gemelos", "3", "15", "60\"")], ACT_LOW),
     dia(3, "vie", "Glúteos bombeo", "Volumen y conexión", [
       e("Hip thrust a una pierna o en máquina", "3", "12-15", "90\""), e("Peso muerto sumo con mancuerna", "3", "12", "90\""), e("Step-up a banco", "3", "10", "75\"", sq="por pierna"),
       ss(e("Abducción con banda sentada", "3", "20"), e("Puente de glúteo con pausa", "3", "15"), r="60\""), e("Hiperextensiones 45° foco glúteo", "3", "15", "60\"")],
       None, "20 min caminata inclinada"),
     descanso(), MOVILIDAD]},
]

# La rutina de 5 días que ya trae la app (avanzado)
html = (APP / "index.html").read_text(encoding="utf-8")
base = json.loads(re.search(r'<script type="application/json" id="rt-data">(.*?)</script>', html, re.S).group(1))
def sin_hist(o):
    if isinstance(o, dict): return {k: sin_hist(v) for k, v in o.items() if k != "hist"}
    if isinstance(o, list): return [sin_hist(x) for x in o]
    return o
RUTINAS.append({"id": "avanzado-5", "nombre": "Avanzado · 5 días", "para": "Entrena hace más de un año y quiere el máximo. Gimnasio, torso/piernas + día extra (lun a vie), 70 min.", "dias": sin_hist(base["days"])})

def link(r):
    datos = json.dumps({"de": MARCA, "para": "", "dias": r["dias"]}, ensure_ascii=False, separators=(",", ":")).encode()
    comp = zlib.compressobj(9, zlib.DEFLATED, -15)
    cod = "z" + base64.urlsafe_b64encode(comp.compress(datos) + comp.flush()).decode().rstrip("=")
    return SITIO + "#rutina=" + cod

salida = [{"id": r["id"], "nombre": r["nombre"], "para": r["para"], "dias": [d["title"] for d in r["dias"] if d["kind"] == "train"], "link": link(r)} for r in RUTINAS]
(APP / "rutinas-base.js").write_text("/* Generado por rutinas/generar.py: no lo edites a mano */\nwindow.RUTINAS_BASE = " + json.dumps(salida, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")

md = ["# Rutinas base", "", "Seis rutinas listas para mandar. Cada link carga la rutina en la app del cliente (abre el link y toca **Cargar mi rutina**).",
      "", "Lo más cómodo: **Mi negocio → Clientes → Mandar rutina**. Elegís la rutina y se abre el WhatsApp del cliente con el link.", "",
      "**Para ajustarla a una persona:** abrí el link en tu celu, cargala en tu app (entrando como admin), cambiá lo que quieras (Entreno → tocá un ejercicio → Editar) y mandala desde Entreno → Respaldo y ajustes → *Mandar esta rutina por WhatsApp*.", "",
      "**Para cambiar una rutina base:** editá `rutinas/generar.py` y corré `python3 rutinas/generar.py`.", ""]
for r, s in zip(RUTINAS, salida):
    md += ["## " + r["nombre"], "", r["para"], ""]
    for d in r["dias"]:
        if d["kind"] != "train": continue
        md.append("**" + d["day"] + " · " + d["title"] + "** (" + d["focus"] + ")")
        for b in d["blocks"]:
            its = b["items"] if b.get("items") else [b]
            pre = "- Superserie: " if b.get("items") else "- "
            md.append(pre + " + ".join(x["n"] + (" " + x.get("se", "") + "×" + x.get("re", "") if x.get("se") else (" " + x.get("re", "") if x.get("re") else "")) + (" " + x["sq"] if x.get("sq") else "") for x in its))
        if d.get("cardio"): md.append("- Cardio: " + d["cardio"])
        md.append("")
    md += ["[Link de la rutina](" + s["link"] + ")", ""]
(AQUI / "RUTINAS-BASE.md").write_text("\n".join(md), encoding="utf-8")
for s in salida: print(s["id"], len(s["link"]))
