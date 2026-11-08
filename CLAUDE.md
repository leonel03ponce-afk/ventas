# SISTEMA · Brian Ponce — Leé esto antes de hacer cualquier cosa

Este archivo es el traspaso completo de una conversación larga con Claude (octubre y noviembre de 2026) en la que se armó casi toda la app. Tiene el contexto del negocio, las decisiones que ya tomó el dueño (y que no hay que volver a discutir), cómo está hecho el código, cómo trabajar y qué quedó pendiente. Detalle de funciones: `README.md`. Resumen corto: `CONTEXTO.md`.

---

## 1. Con quién hablás

- **El dueño es Brian Ponce**, entrenador en Argentina. Escribe rápido, en rioplatense, a veces en mayúsculas y sin tildes. **No es programador**: explicale en castellano simple, sin jerga, con pasos concretos ("tocá tal cosa → tal otra").
- Respondé **en español rioplatense** (vos, tenés, tocá). Todos los textos de la app y de las páginas van igual: voseo, cercano, directo, cortos.
- Quiere cosas **prácticas, que se usen todos los días, que den ganas de compartir y que vendan**. Cuando pide "mejoralo", espera que propongas y hagas, no que preguntes de más.
- **No gastar plata de más**: cuida los créditos de Netlify (ver 4.6). No puede seguir pagando Claude Pro; ahora usa la cuenta de su pareja.
- Antes de cambios grandes, decile en 2 o 3 líneas qué vas a hacer; después hacelo, probalo y contale qué quedó y qué tiene que probar él en el celular.

## 2. El negocio

**Producto:** SISTEMA = rutina personalizada armada por Brian + una app (PWA, se instala desde el navegador) que ordena el día en cuatro pilares: **Entreno, Hábitos, Nutrición y Finanzas**.

**Sitio:** https://brian-ponce.netlify.app (Netlify, publicado desde GitHub).
**Repo:** `leonel03ponce-afk/ventas`, rama de trabajo y producción: **`claude/upbeat-archimedes-pab9s2`**. Cada push a esa rama se publica solo.

**Precios (los manda `app/config.js`):**
| Plan | Argentina | Link de pago | Afuera |
|---|---|---|---|
| Para siempre (**pago único**, desde el 08/11) | $70.000, mismas cuotas que Ritmo | automático (`/api/pagar`); sin link fijo de respaldo | US$49 |

- **Decisión de Brian (08/11):** Sistema es pago único, al mismo precio que Ritmo y con las mismas cuotas (la preferencia de MP va sin `payment_methods`, igual que `crearCobro_` del servidor de Ritmo). Los planes de 3 meses / anual / de por vida se sacaron de la venta; los links `mpago.la` viejos cobraban esos montos y se sacaron de `config.js`.
- `planesIncluidos` (trimestral y anual, precio 0) NO se venden: quedan para el Sistema incluido en un programa (la Caja / Ritmo piden `trimestral` para Closer en 30 y `anual` para el pase) y para reconocer pagos viejos. Los códigos ya dados siguen valiendo hasta su vencimiento (la fecha va adentro del código).

- Afuera de Argentina: PayPal, USDT (Binance) o Zinli coordinando por WhatsApp (Hotmart pendiente). MP en dólares: alias `solida.comun.amplias` (solo desde cuentas argentinas).
- **Sin prueba gratis.** Precio de lanzamiento activado (`lanzamiento: true`).
- WhatsApp de Brian: 11 7115-8427 (`https://wa.me/5491171158427`).

**Quién compra:** gente de 20 a 40 años que arrancó el gym varias veces y lo dejó. Llega por las redes de Brian o por un vendedor.
**Recorrido del cliente:** video o mensaje → `planes.html` (si viene de un vendedor, `?ref=nombre`) → paga con Mercado Pago → vuelve a `gracias.html` y ve su **código de acceso** (cobro automático) → abre la app, pone el código → **arranque** de 4 preguntas → Brian le manda la rutina (Mi negocio → Clientes → Mandar rutina) → usa la app todos los días (pago único: no renueva).

**Quién vende:** vendedores (closers de la comunidad de Tino Mossu, gente de Venezuela y LatAm, alumnos). Sacan su link en `vendedores.html`, aprenden con `guia-vendedores.html`, compiten en `ranking.html`. **Comisión: 43% de cada venta (pago único; si ya era cliente con un plan viejo, igual 43% para quien lo trajo), a fin de mes. No se dan leads.**

**Páginas y paneles:**
- Públicas: `/` (app), `/planes.html` (venta), `/gracias.html`, `/vendedores.html`, `/guia-vendedores.html`, `/ranking.html`.
- Privadas: `/ventas.html` = **Mi negocio** (clientes, vencimientos, ventas, vendedores, comisiones, ventas a mano, mandar rutinas, bajar CSV; clave = variable `CLAVE_VENTAS` de Netlify) y `/panel` = panel de códigos (clave `PONCE-2026`, que también está en `config.js`, o sea que es pública).
- Tablero viejo de vendedores (ya no se usa): https://claude.ai/artifact/Lq4khHvoPukjcEGxbhPzah

**Secretos:** `MP_ACCESS_TOKEN`, `CLAVE_VENTAS`, `HOTMART_HOTTOK` (y opcionales `VAPID_PUBLIC`, `VAPID_PRIVATE`, `AVISOS_CONTACTO`) viven **solo** en Netlify → Environment variables. **Nunca** en el repo, en un archivo ni en el chat. El repo puede ser público.

## 3. Decisiones ya tomadas (respetalas)

1. **El resumen semanal es para el alumno, no se le manda a Brian.** Se sacó "Mandárselo a Brian" y "¿Cómo te sentiste?". Queda: puntaje, rango, lo que dicen tus datos, objetivo, récords, imagen para historias (sin montos de plata) y "Retar a un amigo" con el link de recomendación del alumno.
2. **Notificaciones push solo de hábitos diarios.** Nada de rutina ni de finanzas. A la hora de cada hábito si no está hecho, y un repaso a la noche (21:30 por defecto).
3. **Finanzas es opcional:** el arranque pregunta "¿Ordenamos también tu plata?" aclarando que **viene gratis con el plan**. Si dice que no, no aparece nada de plata (se activa desde el pie de Hoy). Quien ya la usaba la sigue viendo.
4. **Barra de 4 pestañas:** Hoy · Entreno · Hábitos · Finanzas. **Armar** (armar una rutina) vive dentro de Entreno, no en la barra. "Sistema" se muestra como **Hábitos**.
5. **Hoy corto:** arriba "Tu día" (lista para tachar, incluye cada hábito con su hora), el progreso va plegado.
6. Brian **dijo que no** a: respaldo en la nube de los datos del alumno, videos de cómo hacer cada ejercicio ("no creo"), garantía de devolución en la página. **Testimonios: "a futuro, muy a futuro".** No se los vuelvas a proponer salvo que él los pida.
7. Las notificaciones las dejó "como están" (ver pendientes): no insistas, pero si él vuelve a preguntar, seguí la guía del punto 6.
8. Cuidar los créditos de Netlify: nada que corra seguido o lea muchos datos sin necesidad.

## 4. Cómo está hecho

### 4.1 Archivos
- `app/index.html` (~7.000 líneas, todo en un archivo): la app. Ver 4.2.
- `app/config.js`: marca, precios, links de pago, comisiones, acceso. **Después de cambiarlo, correr `python3 app/sincronizar-config.py`** (copia el config como respaldo adentro de las 7 páginas) **y subir la versión del caché en `app/sw.js`** (`var CACHE = "sistema-vN"`) para que la app instalada tome el cambio.
- `app/planes.html` (venta), `app/vendedores.html`, `app/guia-vendedores.html`, `app/gracias.html`, `app/ventas.html` (Mi negocio), `app/ranking.html`, `app/panel.html`.
- `app/sw.js`: service worker (caché, red primero para la página y config.js, y los eventos `push` / `notificationclick`).
- `app/rutinas-base.js`: las 6 rutinas base con sus links (lo genera `rutinas/generar.py`; no editar a mano).
- `app/img/`: imágenes; `app-*.jpg` son capturas reales de la app que usa `planes.html` ("Así se ve por dentro").
- `netlify/functions/`: `pagar.mjs`, `mp-aviso.mjs` (webhook Mercado Pago), `hotmart-aviso.mjs`, `codigo.mjs`, `bloqueados.mjs`, `ventas.mjs`, `ranking.mjs`, **`push.mjs`** (`/api/push`: alta/baja/estado/prueba/prueba-auto/info de avisos) y **`push-habitos.mjs`** (programada cada 15 min). `netlify/lib/sistema.mjs` (config, códigos, ventas; Blobs store `ventas`) y `netlify/lib/push.mjs` (VAPID, envío, índice por horario; Blobs store `push`).
- `netlify.toml`: publica `app/`, funciones en `netlify/functions`, y una regla `ignore` para **no publicar si no cambió nada de app/netlify/config** (ahorra créditos).
- `campanas/`: textos para conseguir vendedores, campaña y kit del vendedor, estrategia de marketing, plan para escalar.
- `video/`: videos promocionales (dark, phonk, v1, v2), plantilla para meter clips y fuentes (música).
- `COBRO-AUTOMATICO.md`: cómo está conectado el cobro (MP Checkout Pro, Hotmart, variables).

### 4.2 Adentro de `app/index.html`
Tiene varios `<script>`. Los importantes:
- **El bundle de Sistema (pestaña Hábitos):** React minificado en una sola línea gigante. **No se puede editar en serio.** Guarda en `localStorage["sistema:v1"]` = `{ habits: [{id, name, cat, time:"HH:MM", days:[0-6, domingo=0], w, type?:"count", target?, paused?, dependsOn?}], log: {"YYYY-MM-DD": {idHabito: true | número}}, metas, marca, cta, onboarded }`. Lee ese dato **solo al cargar** y lo reescribe 400 ms después de cada cambio interno. Por eso, si otra parte de la app tacha un hábito (Tu día), se marca `sisSucio` y al entrar a la pestaña Hábitos **se recarga la página** para que no pise el cambio.
- **El script principal (IIFE)**: Hoy, Entreno, Armar, Finanzas, Resumen, arranque, avisos. Módulos (buscá estos comentarios):
  - `Avisos del celular`, `Recordatorio a tu hora`, `Sonidos de la app`, cronómetro de descanso (`tmStart`, `tmStop`, variable `tm`).
  - Entreno: `mount()` arma las pestañas y los días; `renderBody(id)`; editor de ejercicio (`openEdit`, `commit`, `persist`); `objetivoHoy(x)` = **cuánto levantar hoy** (doble progresión con el rango de repes); `objetivoHtml`.
  - `Nutrición`, `Medidas`, `Logros`, `Rutina personalizada por link` (`#rutina=...`).
  - `Fechas para resúmenes`, `Plata: el cuarto pilar` (store `plata:v1`), `Cuentas a pagar`, `Resumen: semana, mes y año` (`statsRes`, `rango`, `datosDicen`, `objetivo`), `Imagen para historias`.
  - `Tu día` (`diaItems`, `cardTuDia`, `marcarHabito`, racha de días completos), `Récords personales`, `Anotar rápido` (botón Anotar + hoja).
  - `Avisos push de los hábitos diarios` (`activarPush`, `sincronizarPush`, `probarAvisos` = prueba paso a paso, `avisoLocal` = respaldo que avisa desde el teléfono si la app está abierta o en segundo plano).
  - `Arranque` (primera vez: nombre → cómo se usa → objetivo y datos → hábitos con horario → ¿Finanzas? → instalar y avisos).
  - `Modo entrenamiento` (`abrirGo`, `renderGo`, `listaGo`): un ejercicio por pantalla, series con +/− y ✓, descanso automático, superseries, resumen final.
- **Script de acceso** (al final): pantalla de código, panel de admin, códigos, "Recomendá y ganá" (`window.__linkRef`).
- El shell de pestañas: `window.__irA("hoy"|"entreno"|"sistema"|"plata"|"resumen"|"armar")` y evento `shell-tab`.

### 4.3 Datos del alumno (todo en su teléfono, `localStorage`)
`rutina-cliente` (rutina + historial de series), `rutina-cliente-nombre`, `-peso`, `-medidas`, `-nutri`, `-proteina`, `-agua`, `-dias` (% del día para la racha), `-descanso`, `-logros`, `-bienvenida` (ya hizo el arranque), `sistema:v1` (hábitos), `plata:v1` (finanzas: mov, pres, metas, hab, habLog, cuentas), `finanzas:on`, `push:cfg`, `push:ult`, `push:local`, `acceso:*` (código, referido). **No hay cuentas ni base de datos de alumnos**: si cambia de celular, pierde los datos (decisión del dueño, ver 3.6).

### 4.4 Avisos push (cómo funciona)
- La app se suscribe (`/api/push`, acción `alta`) y cada vez que cambia algo manda qué hábitos tiene hoy, a qué hora y cuáles hizo (`estado`).
- `push-habitos.mjs` corre cada 15 min y lee **solo** a quienes tienen algo en ese cuarto de hora (índice `t:<minuto UTC>:<id>` en el store `push`). Manda a la hora del hábito si no está hecho y el repaso de la noche. Anota la última corrida en la clave `cron`.
- Claves VAPID: se crean solas la primera vez y quedan en Blobs (o variables `VAPID_PUBLIC`/`VAPID_PRIVATE`). Remitente: la URL del sitio (o `AVISOS_CONTACTO`).
- En iPhone solo anda con la app agregada a la pantalla de inicio (iOS 16.4+).

### 4.5 Estilo
- Comentarios del código en castellano, cortos, explicando el porqué. Textos de la interfaz en rioplatense.
- Diseño: fondo oscuro `#0B0715`, dorado `#E9B75B`, coral `#FF6F4E`, verde `#4BD489`, violeta `#A98BFF`, celeste `#5FD6E0`. Tipos: Chakra Petch (títulos) y Archivo (texto). Bordes biselados (`clip-path: var(--bevel)`). Cada pilar tiene su color.
- La app tiene que andar bien en 320 px de ancho.

### 4.6 Créditos de Netlify
- La regla `ignore` de `netlify.toml` evita publicar si no cambió el sitio.
- La función programada corre 96 veces por día siempre igual; cada corrida lee solo lo necesario.
- No agregues funciones que corran seguido ni lecturas masivas.

## 5. Cómo trabajar

1. Trabajá en la rama **`claude/upbeat-archimedes-pab9s2`** (es la que publica Netlify). Commits en castellano, descriptivos. `git push origin claude/upbeat-archimedes-pab9s2`.
2. Antes de subir, verificá que no haya errores de sintaxis en los scripts:
   ```
   node -e "const fs=require('fs');for(const f of ['app/index.html','app/planes.html']){const h=fs.readFileSync(f,'utf8');const re=/<script>([\s\S]*?)<\/script>/g;let m;while((m=re.exec(h))){try{new Function(m[1])}catch(e){console.log(f,e.message)}}}"
   node --check netlify/functions/push.mjs
   ```
3. Para probar la app: `cd app && python3 -m http.server 8765` y abrirla con Playwright. Para saltear la pantalla de código, interceptar `config.js` y reemplazar `libre: false` por `libre: true`; bloquear el service worker en la prueba (`serviceWorkers: 'block'`) y poner `localStorage['rutina-cliente-bienvenida']='1'` para saltear el arranque. Probar también a 320 px.
4. Si cambiás `config.js`: `python3 app/sincronizar-config.py` y subir `CACHE` en `app/sw.js`.
5. Si cambiás una rutina base: editar `rutinas/generar.py` y correr `python3 rutinas/generar.py`.
6. Mantené al día `README.md` y `CONTEXTO.md` cuando agregues algo importante.

## 6. Pendientes

1. **Link fijo de respaldo de $70.000 (opcional):** si el cobro automático falla, el botón cae a WhatsApp. Si Brian crea en Mercado Pago un link de pago de $70.000, va en `config.js` → `planes[0].pago` (y después `sincronizar-config.py` + subir `CACHE`).
2. **Avisos automáticos a la hora de cada hábito:** el aviso de prueba (botón Probar) llega, pero los automáticos no se confirmaron. Brian lo dejó así por ahora. Si vuelve a salir el tema: en la app, Hoy → **Probar** → **Probar aviso automático** (llega en menos de 15 min si la función programada corre). Si no llega: Netlify → Logs → Functions → `push-habitos` tiene que correr cada 15 min; si no aparece, revisar que la **Production branch** sea `claude/upbeat-archimedes-pab9s2` (las funciones programadas solo corren en producción). Si necesitás ver Netlify, pedile a Brian capturas.
3. Confirmar una compra real de punta a punta (pagar, ver el código en `gracias.html`, activar la app).
4. Armar SISTEMA en Hotmart para vender afuera (producto, 3 ofertas, webhook a `/api/hotmart-aviso` y variable `HOTMART_HOTTOK`, afiliados al 43%; pasos en `COBRO-AUTOMATICO.md`).
5. Salir a reclutar vendedores con `campanas/TEXTOS-CLOSERS-Y-LATAM.md`.
6. A futuro (solo si Brian lo pide): testimonios reales en la página de venta, panel para Brian con todos sus alumnos, comunidad o ranking entre alumnos, app de tienda (Play Store / App Store) si algún día los avisos web no alcanzan.

## 7. Lo que se hizo en la conversación (en orden)

1. Plata como cuarto pilar, resumen semanal/mensual/anual compartible, pasada de diseño (fondo con luz, tarjetas teñidas).
2. "Tu día" con acciones de un toque, botón Anotar (gasto, proteína con alimentos comunes, agua, peso), rangos semanales (Hierro → Leyenda), récords automáticos con imagen, "lo que dicen tus datos", objetivo para la semana, retar a un amigo con link de referido, cierre de semana domingo/lunes.
3. Avisos push de hábitos (servidor + función programada), después escalados con índice por horario para no gastar créditos.
4. Arranque para gente nueva (4–5 pantallas) y Hoy más corto.
5. Resumen sin envío al entrenador; Armar adentro de Entreno; día como tarjeta (no cartel gigante); arreglo de la tira de días fija; Plata → **Finanzas** con cuentas a pagar (fijas, cuotas, únicas), cuánto queda libre y presupuesto del día a día.
6. Hábitos tachables desde Tu día; Finanzas con secciones plegadas; hoja de anotar con ingresos.
7. Páginas de vendedores, guía, gracias y textos de closers al día.
8. "Cuánto levantar hoy" (doble progresión) y Finanzas opcional.
9. Carpeta del negocio para pendrive (ZIP con links, cómo funciona, planillas, material de vendedores, videos, rutinas, respaldo).
10. Avisos: remitente real, errores visibles, prueba paso a paso, respaldo local en el teléfono, registro de la revisión automática y botón "Probar aviso automático".
11. **Modo entrenamiento guiado** y lista de ejercicios más limpia.
12. Página de venta con la app por dentro (capturas reales), "Por qué esta vez sí", lo que incluye con referencia de apps sueltas, precio por día y "Cómo arrancás".
13. (Brian) Plan de 3 meses a $26.700.
14. (Brian, 08/11) Pago único de $70.000 como Ritmo (US$49 afuera), comisión 43% de cada venta, sin renovaciones.
