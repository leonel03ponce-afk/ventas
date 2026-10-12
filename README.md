# SISTEMA · app de rutina y hábitos

La app está en la carpeta `app/`. Es una página web instalable en el celular (PWA): no necesita servidor ni base de datos, y cada cliente guarda sus datos en su propio teléfono.

| Archivo | Para qué es |
|---|---|
| `app/index.html` | La app: Hoy, Armar, Entreno y Sistema |
| `app/planes.html` | Página de venta, para el link de la bio |
| `app/config.js` | **Lo único que hace falta tocar**: marca, precios, links de pago, comisión |
| `app/img/` | Capturas que usa la página de venta |

## Publicar en Netlify

Subí la carpeta `app/` entera: en app.netlify.com → tu sitio → *Deploys* → arrastrás la carpeta.
Si conectás este repo a Netlify, poné `app` como *Publish directory* y cada cambio se publica solo.

- App: `https://brian-ponce.netlify.app/`
- Página de venta: `https://brian-ponce.netlify.app/planes.html`

## Cobrar

Los links de Mercado Pago ya están cargados en `config.js`:

| Plan | Precio en la app | Link |
|---|---|---|
| 3 meses | $24.900 | https://mpago.la/2SDK5Ty |
| Anual | $69.900 | https://mpago.la/2cdoPet |
| Para siempre | $119.900 | https://mpago.la/28ED6Ht |

**Revisá que el precio de cada plan en `config.js` sea el mismo que cobra su link.**

Cuando alguien paga, te escribe por WhatsApp. Generás el código en el panel y se lo mandás.

## Panel de códigos

En la pantalla de acceso escribí la clave de admin (`admin` en `config.js`), o entrá a `/?panel`.

- **Acceso**: 3 meses, 1 año o para siempre (también 1 y 6 meses).
- **Lo trajo**: quién recomendó al cliente. La comisión es **20% de cada pago, mientras el cliente siga renovando**: cuando renueva, poné el mismo nombre de cliente y el panel ya sabe quién lo trajo.
- **Comisiones a pagar**: cuánto le debés a cada recomendador. "Ya las pagué" las pone en cero.

Los códigos y los recomendadores quedan guardados en el teléfono donde los generás. Usá siempre el mismo.

## Rutina personalizada por link

1. Entrá a la app como admin y armá o editá la rutina del cliente (pestaña Entreno → tocá un ejercicio → Editar, o "+ Agregar ejercicio").
2. Entreno → **Respaldo y ajustes** → poné el nombre del cliente → **Mandar esta rutina por WhatsApp**.
3. El cliente abre el link y toca **Cargar mi rutina**. Lo que ya tenía anotado de los ejercicios que se repiten se mantiene.

## Prueba gratis y recomendados

- `acceso.prueba`: días de prueba sin código (0 la apaga). Cuando termina, la app muestra los planes.
- `recomendados.comision` y `recomendados.recurrente`: porcentaje y si se paga en cada renovación o solo la primera vez.
- Cada cliente tiene su link en Hoy → *Recomendá y ganá* (`?ref=nombre`). Quien entra por ese link y compra te escribe con "Me recomendó: nombre" en el mensaje.

## Qué tiene la app

- **Hoy**: entrenamiento del día, misiones, nutrición (calorías, proteína y agua según su cuerpo, con contador de proteína), semana, peso, medidas, logros e historial.
- **Entreno**: rutina por día, registro serie por serie, cronómetro de descanso (sigue aunque se cierre la app y mantiene la pantalla prendida), calculadora de discos y récords.
- **Sistema**: hábitos con experiencia, niveles, rachas con multiplicador y análisis de fugas.
- **Avisos**: fin del descanso, hora de entrenar, racha en peligro (21 h) y control del domingo. Llegan mientras la app está abierta o en segundo plano reciente: el navegador no deja mandar avisos con la app cerrada del todo sin un servidor.

## Usarla con otra marca (para otros entrenadores)

1. Copiá la carpeta `app/`.
2. En `config.js` cambiá `producto`, `marca`, `tel`, `whatsapp`, `acento`, `sitio`, y **sobre todo `secreto` y `admin`**, para que los códigos de una marca no sirvan en la otra.
3. Reemplazá los íconos (`icono-*.png`, `apple-touch-icon.png`) y el nombre en `manifest.webmanifest`.
4. La rutina base está en `index.html`, en el bloque `<script type="application/json" id="rt-data">`.
5. Publicala en otro sitio de Netlify.
