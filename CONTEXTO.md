# Contexto del proyecto (para retomar en un chat nuevo)

**Quién:** Brian Ponce, entrenador (Argentina). Vende SISTEMA: rutina personalizada + app de entreno y hábitos.
**Sitio:** https://brian-ponce.netlify.app · **Repo:** leonel03ponce-afk/ventas, rama `claude/upbeat-archimedes-pab9s2`.

## Qué hay
- `app/`: la app (`index.html`), venta (`planes.html`), vendedores (`vendedores.html`, `guia-vendedores.html`), después del pago (`gracias.html`), ventas automáticas (`ventas.html`). Todo se configura en `app/config.js` (después correr `python3 app/sincronizar-config.py`).
- `netlify/`: funciones de cobro automático (Mercado Pago Checkout Pro + Hotmart webhook, códigos, bajas por reembolso). Guía: `COBRO-AUTOMATICO.md`.
- `campanas/`: textos para reclutar vendedores (closers de Tino Mossu, Venezuela/LatAm), plan para escalar, copia del tablero.
- `video/`: videos promo y plantilla para meter clips propios.
- Tablero privado de vendedores y comisiones: https://claude.ai/artifact/Lq4khHvoPukjcEGxbhPzah

## Datos clave
- Planes AR: 3 meses $24.900 (https://mpago.la/2SDK5Ty) · Anual $69.900 (https://mpago.la/2cdoPet) · Para siempre $119.900 (https://mpago.la/28ED6Ht). Afuera: US$19 / 49 / 89.
- Comisión vendedores: 43% primer pago, 15% renovaciones. Pago a fin de mes. No se dan leads.
- Clave del panel de códigos: PONCE-2026 (entrar en brian-ponce.netlify.app/panel). Sin prueba gratis.
- MP en dólares: alias solida.comun.amplias (solo recibe desde cuentas argentinas).
- Nunca poner tokens ni claves privadas en el repo: van como variables de entorno en Netlify (`MP_ACCESS_TOKEN`, `CLAVE_VENTAS`, `HOTMART_HOTTOK`).

## Pendiente
1. Conectar Netlify con GitHub, cargar el token de MP y probar una compra (`COBRO-AUTOMATICO.md`).
2. Armar SISTEMA en Hotmart (producto + 3 ofertas + webhook + afiliados al 43%).
3. Salir a reclutar vendedores con `campanas/TEXTOS-CLOSERS-Y-LATAM.md`.
