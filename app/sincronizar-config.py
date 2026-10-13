"""Copia config.js como respaldo dentro de index.html.
Correlo después de cambiar config.js:  python3 app/sincronizar-config.py"""
import pathlib
aqui = pathlib.Path(__file__).parent
cfg = (aqui / "config.js").read_text(encoding="utf-8")
cuerpo = cfg[cfg.index("window.CONFIG = ") + len("window.CONFIG = "):].rstrip().rstrip(";")
html = (aqui / "index.html").read_text(encoding="utf-8")
i, j = html.index("/*CFG*/") + len("/*CFG*/"), html.index("/*FIN-CFG*/")
(aqui / "index.html").write_text(html[:i] + cuerpo + html[j:], encoding="utf-8")
print("index.html actualizado")
