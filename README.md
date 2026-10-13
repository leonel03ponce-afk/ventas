# SISTEMA · app de rutina y hábitos

La app está en la carpeta `app/`. Es una página web instalable en el celular (PWA): no necesita servidor ni base de datos, y cada cliente guarda sus datos en su propio teléfono.

| Archivo | Para qué es |
|---|---|
| `app/index.html` | La app: Hoy, Armar, Entreno y Sistema |
| `app/planes.html` | Página de venta corta, para el link de la bio y para los vendedores |
| `app/vendedores.html` | Página para vendedores: sacan su link, copian textos listos, bajan el video y calculan cuánto ganan |
| `app/guia-vendedores.html` | Guía para vendedores: perfil, dónde buscar clientes, mensajes en frío, cierre, objeciones y seguimiento, listos para copiar |
| `app/gracias.html` | Adonde vuelve el cliente después de pagar: le muestra su código (cobro automático) |
| `app/ventas.html` | **Mi negocio**: clientes con su vencimiento, ventas, vendedores con lo que les debés, y para cargar ventas a mano (pide la clave `CLAVE_VENTAS`) |
| `netlify/` | Las funciones del cobro automático (Mercado Pago y Hotmart) |
| `app/promo.mp4` | El video promocional en versión liviana (lo usan la página de venta y los vendedores) |
| `app/config.js` | **Lo único que hace falta tocar**: marca, precios, links de pago, comisión, prueba gratis. Después de cambiarlo, corré `python3 app/sincronizar-config.py` (deja una copia de respaldo adentro de la app, por si `config.js` no se sube) |
| `app/img/` | Capturas que usa la página de venta |

## Publicar en Netlify

Lo mejor es **conectar este repositorio a Netlify** (pasos en `COBRO-AUTOMATICO.md`): cada cambio se publica solo y funcionan el cobro automático y Hotmart.
También podés subir la carpeta `app/` a mano (*Deploys* → arrastrás la carpeta), pero así el cobro automático no anda.

- App: `https://brian-ponce.netlify.app/`
- Página de venta: `https://brian-ponce.netlify.app/planes.html`
- Vendedores: `https://brian-ponce.netlify.app/vendedores.html`

**Importante:** subí siempre la carpeta `app` completa. Si falta algún archivo (por ejemplo `config.js`), algo deja de andar.

## Clientes y vendedores de otros países

Si la persona está fuera de Argentina (según la zona horaria de su celular), la página de venta y la de vendedores muestran los precios en dólares (`internacional` en `config.js`: US$19 / US$49 / US$89). Como todavía no hay link de cobro internacional, el botón abre WhatsApp para coordinar el pago por PayPal, USDT o Zinli. Cuando tengas un link (PayPal, Hotmart, etc.), pegalo en `pago` de cada plan internacional. Con `?pais=ar` o `?pais=int` en el link se fuerza una u otra versión.

## Cobro automático

Con el token de Mercado Pago cargado en Netlify, el cliente paga y **recibe su código al instante**, la venta queda con su vendedor y los reembolsos dan de baja el código solos. También funciona con Hotmart para vender afuera. Cómo activarlo: **[COBRO-AUTOMATICO.md](COBRO-AUTOMATICO.md)**. Hasta que lo actives, todo sigue funcionando como abajo.

## Cobrar (sin cobro automático)

Los links de Mercado Pago ya están cargados en `config.js`:

| Plan | Precio en la app | Link |
|---|---|---|
| 3 meses | $24.900 | https://mpago.la/2SDK5Ty |
| Anual | $69.900 | https://mpago.la/2cdoPet |
| Para siempre | $119.900 | https://mpago.la/28ED6Ht |

Los precios coinciden con lo que cobra cada link. Si cambiás un precio en Mercado Pago, cambialo también en `config.js`.

Cuando alguien paga, te escribe por WhatsApp. Generás el código en el panel y se lo mandás.

## Vender con vendedores

1. El vendedor entra a `vendedores.html`, pone su nombre y saca su link (`planes.html?ref=su-nombre`), con textos listos para WhatsApp e Instagram y el video para bajar.
2. Su cliente entra por ese link, paga con Mercado Pago y te manda el comprobante con el botón de la página. El mensaje ya dice **"Me recomendó: su-nombre"**.
3. Vos generás el código en el panel, con ese nombre en **Lo trajo**, y se lo mandás al cliente.
4. Comisión: **43% del primer pago y 15% de cada renovación** (`recomendados.comision` y `recomendados.renovacion`).
5. Para controlar todo (ventas, comprobantes, códigos, a quién pagar y cuánto) usá el tablero privado **Vendedores SISTEMA**: https://claude.ai/artifact/Lq4khHvoPukjcEGxbhPzah. Genera los mismos códigos que el panel de la app.

## Panel de códigos

Entrá a **https://brian-ponce.netlify.app/panel**, escribí `PONCE-2026` donde dice XXXX-XXXX y tocá **Entrar**.
También sirve escribir la clave en la pantalla "Tu acceso" de la app. Si ya estás adentro como admin: Entreno → Respaldo y ajustes → **Generar código de cliente**.

- **Acceso**: 3 meses, 1 año o para siempre (también 1 y 6 meses).
- **Lo trajo**: quién recomendó al cliente. Primer pago: 43%. Si renueva, poné el mismo nombre de cliente: el panel ya sabe quién lo trajo y le suma el 15%.
- **Comisiones a pagar**: cuánto le debés a cada recomendador. "Ya las pagué" las pone en cero.

Los códigos y los recomendadores quedan guardados en el teléfono donde los generás. Usá siempre el mismo.

## Rutina personalizada por link

1. Entrá a la app como admin y armá o editá la rutina del cliente (pestaña Entreno → tocá un ejercicio → Editar, o "+ Agregar ejercicio").
2. Entreno → **Respaldo y ajustes** → poné el nombre del cliente → **Mandar esta rutina por WhatsApp**.
3. El cliente abre el link y toca **Cargar mi rutina**. Lo que ya tenía anotado de los ejercicios que se repiten se mantiene.

## Prueba gratis y recomendados

- `acceso.prueba`: **hoy está en 0 (sin prueba gratis)**. Si algún día la querés, poné los días; con `pruebaPorWhatsApp: true` la activan con la palabra `palabraPrueba` que les pasás por WhatsApp.
- `recomendados.comision` (primer pago) y `recomendados.renovacion` (cada renovación, 0 = nada).
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
