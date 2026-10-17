# Contexto del proyecto (para retomar en un chat nuevo)

**Quién:** Brian Ponce, entrenador (Argentina). Vende SISTEMA: rutina personalizada + app de entreno y hábitos.
**Sitio:** https://brian-ponce.netlify.app · **Repo:** leonel03ponce-afk/ventas, rama `claude/upbeat-archimedes-pab9s2`.

## Qué hay
- `app/`: la app (`index.html`: Hoy con "Tu día" y botón +, Entreno (Armar adentro), Hábitos, **Finanzas** (cuentas a pagar, gastos, ahorro) y **Resumen** semana/mes/año con rangos, récords, "lo que dicen tus datos", historias y "Retar a un amigo"; detalle en README), venta (`planes.html`), vendedores (`vendedores.html`, `guia-vendedores.html`), después del pago (`gracias.html`), ventas automáticas (`ventas.html`). Todo se configura en `app/config.js` (después correr `python3 app/sincronizar-config.py`).
- `netlify/`: funciones de cobro automático (Mercado Pago Checkout Pro + Hotmart webhook, códigos, bajas por reembolso). Guía: `COBRO-AUTOMATICO.md`.
- `app/ventas.html` (**Mi negocio**): clientes, vencimientos, ventas, vendedores, comisiones, ventas a mano y rutinas. Clave: variable `CLAVE_VENTAS` de Netlify.
- `app/ranking.html`: ranking público de vendedores. `rutinas/`: 6 rutinas base (`python3 rutinas/generar.py` regenera los links).
- `campanas/`: textos para reclutar vendedores (closers de Tino Mossu, Venezuela/LatAm), estrategia de marketing, plan para escalar, copia del tablero (ya no se usa).
- `video/`: videos promo y plantilla para meter clips propios.
- Tablero privado de vendedores y comisiones: https://claude.ai/artifact/Lq4khHvoPukjcEGxbhPzah

## Datos clave
- Planes AR: 3 meses $24.900 (https://mpago.la/2SDK5Ty) · Anual $69.900 (https://mpago.la/2cdoPet) · Para siempre $119.900 (https://mpago.la/28ED6Ht). Afuera: US$19 / 49 / 89.
- Comisión vendedores: 43% primer pago, 15% renovaciones. Pago a fin de mes. No se dan leads.
- Clave del panel de códigos: PONCE-2026 (entrar en brian-ponce.netlify.app/panel). Sin prueba gratis.
- MP en dólares: alias solida.comun.amplias (solo recibe desde cuentas argentinas).
- Nunca poner tokens ni claves privadas en el repo: van como variables de entorno en Netlify (`MP_ACCESS_TOKEN`, `CLAVE_VENTAS`, `HOTMART_HOTTOK`).

## Pendiente
0. Avisos push de hábitos: hechos (`netlify/functions/push*.mjs`). Probar en un celular real: activar desde Hoy y tocar Probar.
1. Ya hecho: Netlify conectado a GitHub (rama claude/upbeat-archimedes-pab9s2), MP_ACCESS_TOKEN y CLAVE_VENTAS cargados. Falta confirmar una compra real de punta a punta.
2. Armar SISTEMA en Hotmart (producto + 3 ofertas + webhook + afiliados al 43%).
3. Salir a reclutar vendedores con `campanas/TEXTOS-CLOSERS-Y-LATAM.md`.
