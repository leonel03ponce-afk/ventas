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

1. En Mercado Pago creá dos **Suscripciones** (mensual y anual) y un **Link de pago** (para siempre).
2. Pegá cada link en `pago: ""` del plan que corresponda en `config.js`.
3. Cuando alguien paga, te escribe por WhatsApp. Generás el código en el panel y se lo mandás.

Si dejás `pago` vacío, el botón abre WhatsApp con el plan elegido y coordinás el pago por ahí.

## Panel de códigos

En la pantalla de acceso escribí la clave de admin (`admin` en `config.js`), o entrá a `/?panel`.

- **Acceso**: 1, 3, 6 o 12 meses, o para siempre.
- **Lo trajo**: si el cliente vino recomendado, poné quién fue. El panel suma lo que le debés a cada recomendador.
- **Ya las pagué**: pone las comisiones en cero cuando les pagaste.

Los códigos emitidos quedan guardados en el teléfono donde los generaste. Usá siempre el mismo teléfono.

## Prueba gratis y recomendados

- `acceso.prueba`: días de prueba sin código (0 la apaga). Cuando termina, la app muestra los planes.
- `recomendados.comision`: porcentaje del primer pago para quien trae al cliente.
- Cada cliente tiene su link en Hoy → *Recomendá y ganá* (`?ref=nombre`). Quien entra por ese link y compra te escribe con "Me recomendó: nombre" en el mensaje.

## Usarla con otra marca (para otros entrenadores)

1. Copiá la carpeta `app/`.
2. En `config.js` cambiá `producto`, `marca`, `tel`, `whatsapp`, `acento`, `sitio`, y **sobre todo `secreto` y `admin`**, para que los códigos de una marca no sirvan en la otra.
3. Reemplazá los íconos (`icono-*.png`, `apple-touch-icon.png`) y el nombre en `manifest.webmanifest`.
4. La rutina base está en `index.html`, en el bloque `<script type="application/json" id="rt-data">`.
5. Publicala en otro sitio de Netlify.
