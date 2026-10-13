"""Copia config.js como respaldo dentro de las páginas, por si config.js no carga.
Correlo después de cambiar config.js:  python3 app/sincronizar-config.py"""
import pathlib
aqui = pathlib.Path(__file__).parent
cfg = (aqui / "config.js").read_text(encoding="utf-8")
cuerpo = cfg[cfg.index("window.CONFIG = ") + len("window.CONFIG = "):].rstrip().rstrip(";")
for nombre in ["index.html", "planes.html", "vendedores.html", "guia-vendedores.html", "gracias.html"]:
    f = aqui / nombre
    html = f.read_text(encoding="utf-8")
    i, j = html.index("/*CFG*/") + len("/*CFG*/"), html.index("/*FIN-CFG*/")
    f.write_text(html[:i] + cuerpo + html[j:], encoding="utf-8")
    print(nombre, "actualizado")
