# SISTEMA · app de rutina y hábitos

La app está en la carpeta `app/`. Es una página web instalable en el celular (PWA): no necesita servidor ni base de datos, y cada cliente guarda sus datos en su propio teléfono.

| Archivo | Para qué es |
|---|---|
| `app/index.html` | La app: Hoy, Entreno (con Armar adentro), Hábitos (el Sistema) y Finanzas, más el Resumen (semana, mes y año) |
| `app/planes.html` | Página de venta corta, para el link de la bio y para los vendedores |
| `app/vendedores.html` | Página para vendedores: sacan su link, copian textos listos, bajan el video y calculan cuánto ganan |
| `app/guia-vendedores.html` | Guía para vendedores: perfil, dónde buscar clientes, mensajes en frío, cierre, objeciones y seguimiento, listos para copiar |
| `app/ranking.html` | Ranking público de vendedores (este mes e histórico), para motivarlos |
| `app/rutinas-base.js` | Las 6 rutinas base con sus links (las arma `rutinas/generar.py`) |
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

## Rutinas base

Hay 6 rutinas listas (principiante, ganar músculo, bajar grasa, en casa, glúteos y avanzado): **Mi negocio → Clientes → Mandar rutina**, elegís una y se abre el WhatsApp del cliente con el link. Detalle de cada una en `rutinas/RUTINAS-BASE.md`. Para cambiarlas, editá `rutinas/generar.py` y corré `python3 rutinas/generar.py`.

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

## Los cuatro pilares y el resumen

La app trabaja cuatro pilares: **Entreno**, **Hábitos**, **Nutrición** y **Finanzas**.

- **Tu día** (arriba de todo en Hoy): una lista con lo de hoy (entreno o descanso, proteína, agua, cuentas que vencen, gastos y, si toca, pesarse) y abajo **cada hábito del día con su hora, que se tacha con un toque** (la pestaña Hábitos se recarga sola para mostrarlo). Con el 80% del día cumplido suma a la racha 🔥. Al pie, una línea para activar los avisos de hábitos.
- **Hoy corto**: el progreso (peso, medidas, logros, historial) va plegado en "Tu progreso". **Finanzas** igual: arriba cuánto te queda libre, los botones − Gasto / + Ingreso y las cuentas del mes; ahorro, movimientos, hábitos de plata y el año van plegados con un resumen de una línea.
- **Botón Anotar** (abajo a la derecha en Hoy y Finanzas): anotar un gasto o ingreso, proteína (con alimentos comunes), agua o peso en dos segundos.
- **Finanzas** es opcional: en el arranque se pregunta "¿Ordenamos también tu plata?" (viene gratis con el plan). Si dice que no, la pestaña y todo lo de plata no aparecen; se activa después desde el pie de Hoy, y se oculta desde el pie de Finanzas. Quien ya usaba la app la sigue viendo.
- **Finanzas** (pestaña propia): cuánto te queda libre en el mes (lo que entró, menos lo gastado, menos lo que falta pagar). **Cuentas del mes**: fijas (alquiler, luz, internet), en cuotas (cuota 4 de 12) o de una vez, con su vencimiento; se pagan con un toque y quedan como gasto. Si algo vence hoy o ya venció, aparece en Tu día. Además: gastos por categoría, presupuesto para el día a día, metas de ahorro, hábitos de plata y el año mes por mes.
- **Rangos**: el puntaje semanal (0 a 100, promedio de los pilares) da un rango: Hierro, Bronce, Acero, Oro, Diamante y Leyenda.
- **Récords**: la app detecta sola cuando un ejercicio supera su mejor marca y arma una imagen para compartir.
- **Resumen** (Hoy → *Ver mi resumen semanal*, por semana, mes o año): puntaje y rango, gráficos por pilar, comparación con el período anterior, *lo que dicen tus datos* (patrones como "la proteína se te cae el finde") y un objetivo para lo que viene.
  - **Para historias**: imagen 1080×1920 con rango y la marca. No muestra montos de plata.
  - **Retar a un amigo**: manda el puntaje con el link de recomendación del cliente (`planes.html?ref=...`), así cada reto puede ser una venta.
  - El resumen es para el alumno: no se le manda al entrenador.
- **Cierre de semana**: domingos y lunes aparece arriba una tarjeta para ver cómo cerró la semana.

Todo queda guardado en el teléfono del cliente, como el resto.

## Avisos de hábitos (notificaciones push)

Solo para los hábitos diarios del Sistema: nada de rutina ni de plata. El cliente los activa desde Hoy (tarjeta **Avisos de hábitos**).

- **A la hora de cada misión**: usa el horario que cada hábito tiene en Sistema. Si a esa hora todavía no está hecho, llega "⚡ Hora de: Leer".
- **Repaso de la noche** (por defecto 21:30, se puede cambiar o apagar): si falta alguna misión, llega "Te faltan 2 de 5 misiones · Falta: Leer y Meditar".
- Si ya cumplió, no llega nada. Tocar el aviso abre la app en Sistema.
- En iPhone funciona solo con la app agregada a la pantalla de inicio (iOS 16.4 o más nuevo). En Android anda siempre.

Costo en Netlify: la función corre cada 15 minutos (96 veces por día, siempre igual), y en cada corrida lee solo a quienes tienen un aviso en ese cuarto de hora (cada horario queda indexado como `t:<minuto UTC>:<cliente>`). O sea, el gasto crece con los avisos que salen, no con la cantidad de clientes. La app solo le escribe al servidor cuando cambia algo de sus hábitos.

Cómo funciona: la app le cuenta al servidor qué misiones tiene hoy y cuáles hizo (`netlify/functions/push.mjs`, en `/api/push`), y cada 15 minutos `netlify/functions/push-habitos.mjs` revisa a quién le toca un aviso. No hace falta configurar nada: las claves de los avisos se crean solas la primera vez y quedan en Netlify Blobs. Si alguien deja de abrir la app 60 días, se da de baja solo.

**Si no llegan:** en Hoy (línea de avisos o tarjeta Avisos de hábitos) tocá **Probar**. La app prueba paso a paso y dice dónde falla: permiso del navegador, si el teléfono muestra avisos, si el servidor responde (si dice 404, las funciones de Netlify no están publicadas) y si el envío salió. El remitente de los avisos es la dirección del sitio (se puede cambiar con la variable `AVISOS_CONTACTO` en Netlify, por ejemplo `mailto:tu@mail.com`).

## Modo entrenamiento

Cada día de la rutina tiene arriba **▶ Empezar entrenamiento** (también desde Tu día, botón Entrenar). Abre una pantalla por ejercicio: nombre grande, series y descanso, cuánto levantar hoy, la última vez, y cada serie con +/− de repes y kilos y un ✓. Al tocar ✓ se guarda la serie, arranca el descanso (con aviso y sonido) y cuando se completan las series pasa solo al siguiente ejercicio. En las superseries pasa de la A a la B sin descanso y después vuelve a la A. Al final: series, kilos, minutos y récords para compartir.

## Cuánto levantar hoy

Cada ejercicio muestra en la lista lo que conviene hacer hoy según la última vez ("▲ Hoy: 47,5 kg × 6 repes · subí de peso"). Usa doble progresión con el rango de repes de la rutina: primero se suma una repe con el mismo peso; cuando todas las series llegan al tope del rango, se sube el peso (1 kg si es menos de 10, 2 kg hasta 30, 2,5 kg hasta 80 y 5 kg arriba de eso) y se vuelve al piso del rango. Al anotar, los campos vienen con ese peso y esas repes, y "Usar lo sugerido" los completa.

## Primera vez: el arranque

Alguien nuevo no ve la app llena de tarjetas: entra a un arranque de pantalla completa, una pregunta por pantalla (nombre → cómo se usa en 3 líneas → objetivo, sexo, edad, altura y peso → elegir hábitos con su horario → instalar la app y activar los avisos). Al terminar, Tu día ya tiene proteína y agua calculadas y la pestaña Hábitos ya tiene sus hábitos. En Hoy, las tarjetas de progreso (semana, peso, medidas, logros, historial, plata) aparecen recién cuando tienen algo para mostrar.
