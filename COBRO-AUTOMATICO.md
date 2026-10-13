# Cobro automático: Mercado Pago y Hotmart

Con esto el cliente paga y **recibe su código al instante**, sin que vos veas comprobantes ni generes códigos. La venta queda registrada con el vendedor que lo trajo, y si alguien pide reembolso, su código se da de baja solo.

Ya está todo programado. Faltan 4 cosas que solo podés hacer vos (unos 20 minutos).

> **Nunca me pases el token por el chat** ni lo pegues en ningún archivo: el repositorio es público y con ese token se puede manejar tu cuenta de Mercado Pago. Va solamente en Netlify, como variable de entorno.

---

## 1. Conectar Netlify con GitHub (una sola vez)

Arrastrar la carpeta ("Deploy manually") publica las páginas, pero **no arma las funciones** de cobro. Hay que conectar el repositorio:

1. Entrá a app.netlify.com → tu sitio **brian-ponce** → *Site configuration* → *Build & deploy* → **Link repository**.
2. Elegí GitHub → `leonel03ponce-afk/ventas`.
3. Rama: `claude/upbeat-archimedes-pab9s2`.
4. Dejá vacío el *Base directory*. El resto (carpeta `app`, funciones) lo lee solo del archivo `netlify.toml`.
5. *Deploy*. Desde ahora, cada cambio que suba al repositorio se publica solo.

## 2. Sacar el token de Mercado Pago

1. Entrá a **mercadopago.com.ar/developers** con tu cuenta → **Tus integraciones** → **Crear aplicación**.
2. Nombre: `SISTEMA`. Tipo: **Pagos online** → **Checkout Pro**. Aceptá y creá.
3. En la aplicación: **Credenciales de producción** → completá los datos que pida (rubro, sitio: `https://brian-ponce.netlify.app`).
4. Copiá el **Access Token** (empieza con `APP_USR-`).

## 3. Cargar las variables en Netlify

En Netlify → tu sitio → *Site configuration* → **Environment variables** → *Add a variable*:

| Variable | Qué poner |
|---|---|
| `MP_ACCESS_TOKEN` | El Access Token del paso 2 |
| `CLAVE_VENTAS` | Una clave que inventes, larga (ej: `toro-azul-9182-montaña`). Es para entrar a `ventas.html`. **No uses PONCE-2026**: esa está en `config.js` y la puede ver cualquiera |
| `HOTMART_HOTTOK` | (Cuando armes Hotmart, paso 5) |

Después: *Deploys* → **Trigger deploy** → *Deploy site*.

## 4. Probarlo

1. Abrí `brian-ponce.netlify.app/planes.html`. Debajo de los planes tiene que decir **"Te llega tu código al instante"**. Si dice "Me mandás el comprobante", el token no está cargado o el sitio no está conectado a GitHub.
2. Hacé una compra real del plan de 3 meses (después te la reembolsás desde Mercado Pago).
3. Al pagar, Mercado Pago te devuelve a la página con **tu código**. Tocá *Activar mi acceso*: entra a la app solo.
4. Entrá a `brian-ponce.netlify.app/ventas.html` con tu `CLAVE_VENTAS`: ahí está la venta.
5. Reembolsala desde Mercado Pago: en `ventas.html` pasa a "reembolsada" y el código deja de andar.

---

## Cómo funciona

| Paso | Qué pasa |
|---|---|
| El cliente toca "Pagar" | La página crea el pago en Mercado Pago con el **vendedor adentro** (no depende de que mande el comprobante) |
| Paga | Mercado Pago lo devuelve a `gracias.html`, que muestra su **código**, un botón para activar la app y otro para escribirte por la rutina |
| Mercado Pago avisa | Aunque el cliente cierre la página, el aviso registra la venta igual. Si vuelve a abrir el link de gracias, ve su código |
| Pago en efectivo | Queda "en camino". Cuando se acredita, el mismo link muestra el código |
| Compra de nuevo con el mismo mail | Se marca como **renovación** (15%) y la comisión va al vendedor que lo trajo la primera vez |
| Reembolso o contracargo | El código se da de baja: la app lo bloquea la próxima vez que se abre con internet |

**Qué cambia para el cliente:** los planes se cobran en un solo pago y **no se renuevan solos**. Cuando vence, vuelve a comprar (la app ya le avisa). Es más claro para el cliente y no hay débitos que después te reclamen.

**Plan B:** si algo falla (Mercado Pago no responde, el token vence), la página vuelve sola a los links fijos de siempre y al botón verde del comprobante. Nunca queda sin poder cobrar.

**`ventas.html` (Mi negocio):** todo en un lugar, desde el celular.
- **Resumen:** ventas y cobros del mes, comisiones, clientes activos, quién vence en los próximos 15 días (con botón para mandarle el aviso de renovación) y a qué vendedor le debés.
- **Clientes:** uno por persona, con su plan, vencimiento, cuánto pagó, quién lo trajo y su código. Buscador y filtro (activos, vencen pronto, vencidos).
- **Vendedores:** cuánto vendió cada uno, cuánto le pagaste y cuánto le debés. "Registrar pago" lo descuenta y te arma el WhatsApp de aviso. En "Datos" guardás cómo cobra.
- **Ventas:** todas, por mes, con medio de pago y comisión. Excel (CSV) y dar de baja un código.
- **+ Cargar venta:** para las que no entran solas (transferencia, USDT, PayPal, comprobantes). Registra la venta con su vendedor, te da el código y el WhatsApp listo para mandárselo al cliente.

Con esto ya no hace falta el tablero de Claude ni el panel de códigos de la app (siguen andando, pero lo que cargues ahí no aparece en Mi negocio).

---

## 5. Hotmart (para vender afuera)

### Qué ganás
- Cobra en casi todos los países, con tarjeta y medios locales, en la moneda de cada cliente.
- **Afiliados:** cada vendedor de afuera se afilia y tiene su link. **Hotmart le paga la comisión directo.** Vos no transferís nada a Venezuela, Colombia ni México.
- Ojo: **Hotmart sí cobra** una comisión por venta (alrededor del 10% más un monto fijo por venta; fijate el número exacto en su página de precios, porque cambia según el país y el medio de pago). No cobra por publicar ni tiene cuota mensual.

### Cómo se entrega el servicio
El cliente paga en Hotmart y obtiene su código así:

1. Hotmart avisa la compra a tu sitio (`/api/hotmart-aviso`). Ahí se registra y se genera el código.
2. Al cliente le llega el mail de Hotmart con su **código de compra** (empieza con HP).
3. Entra a `brian-ponce.netlify.app/gracias.html?hotmart`, pone su mail y ese código, y ve su **código de acceso** con el botón para activar la app.

Para que no tenga que buscar el link, configurá en Hotmart la **página de agradecimiento** (o el contenido del producto) apuntando a `https://brian-ponce.netlify.app/gracias.html?hotmart`.

### Pasos para armarlo
1. Creá tu cuenta en **hotmart.com** como productor y completá tus datos para cobrar.
2. **Crear producto** → tipo *Servicio* (o *Suscripción/membresía* si te lo ofrece). Nombre: SISTEMA. Precio en dólares.
3. Creá **3 ofertas** (planes): 3 meses US$19, Anual US$49, Para siempre US$89. Todas **pago único**.
4. **Garantía:** poné la mínima, **7 días**.
5. **Afiliados:** activá el programa. Comisión: **43%**. Aprobación manual (así elegís a quién aceptás).
6. **Webhook:** Herramientas → *Webhook (API y notificaciones)* → Nueva configuración:
   - URL: `https://brian-ponce.netlify.app/api/hotmart-aviso`
   - Eventos: compra aprobada, completa, reembolsada y contracargo.
   - Copiá el **hottok** que te muestra y cargalo en Netlify como `HOTMART_HOTTOK` (paso 3), después *Trigger deploy*.
7. Copiá el **link de pago de cada oferta** y pegalo en `app/config.js`, en `internacional.planes`, campo `pago`. Si querés que el plan se reconozca por la oferta (y no por el precio), pegá los códigos de oferta en `internacional.hotmart.ofertas`.
8. Corré `python3 app/sincronizar-config.py` y subí los cambios.

Los vendedores de afuera que **no** se afilien igual pueden usar su link de siempre (`planes.html?ref=…`): la página le agrega el vendedor al link de Hotmart y la venta aparece a su nombre en `ventas.html` (esa comisión se la pagás vos).

### Reembolsos
Hotmart **obliga** a ofrecer garantía (mínimo 7 días): en ese plazo el cliente pide la plata y se la devuelven sin preguntas. Es cierto que va a haber más pedidos que con Mercado Pago. Cómo bajarlos:

- **Entrega inmediata.** El código sale al instante: el que lo activa y ve la app funcionando, se queda.
- **La rutina en las primeras 24 horas.** El reembolso viene del que paga y no recibe nada. Respondé rápido el WhatsApp de la página de gracias.
- **Mensaje de bienvenida** el día 1 y un "¿cómo te fue en el primer entrenamiento?" el día 3.
- **Garantía de 7 días, no 30.**
- Cuando hay un reembolso, el código **se da de baja solo** (y la comisión del afiliado la descuenta Hotmart). No hay forma de quedarse con el acceso gratis.

---

## Tu cuenta de Mercado Pago en dólares

Alias **solida.comun.amplias** · CVU **3220001888019947590011**

Sirve para recibir **dólares desde cuentas de Argentina**: un cliente argentino que prefiere pagar en dólares, o vos mismo cuando pasás a dólares lo que juntás por USDT o PayPal desde una cuenta argentina.

**No sirve para cobrarle a alguien de otro país:** un CVU es argentino y no recibe transferencias del exterior. Para los clientes de afuera usá Hotmart, o mientras tanto PayPal, USDT o Zinli.
