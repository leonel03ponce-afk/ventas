/* ══════════════════════════════════════════════════════════════
   Personalizá el producto acá. Es el único archivo que hace falta
   tocar para cambiar marca, precios, links de pago o comisiones.
   ══════════════════════════════════════════════════════════════ */
window.CONFIG = {
  producto: "SISTEMA",                              /* nombre que ve el cliente */
  marca: "Brian Ponce",                             /* quién lo entrena */
  tel: "11 7115-8427",                              /* teléfono visible */
  whatsapp: "https://wa.me/5491171158427",          /* link de WhatsApp */
  acento: "#E9B75B",                                /* color de la marca */
  sitio: "https://brian-ponce.netlify.app/",        /* dirección de la app, para los links de recomendación */
  sistema: "#sistema",
  lanzamiento: true,                                /* muestra "Precio de lanzamiento" en la venta. Cuando subas los precios, ponelo en false */

  acceso: {
    libre: false,                                   /* true = sin código, entra cualquiera */
    secreto: "ponce-2026-xK7m",                     /* firma de los códigos: cambialo y los viejos dejan de servir */
    admin: "PONCE-2026",                            /* escribilo en la pantalla de acceso para abrir el panel */
    bloqueados: [],                                 /* seriales dados de baja, ej: ["AB", "AC"] */
    prueba: 0,                                      /* días de prueba gratis (0 = sin prueba) */
    pruebaPorWhatsApp: true,                        /* true = para activarla te escriben y les pasás la palabra */
    palabraPrueba: "ARRANCO"                        /* la palabra que mandás por WhatsApp para activar la prueba */
  },

  /* Precios en pesos. Tienen que coincidir con lo que cobra cada link de
     Mercado Pago. "incluye" es la lista que se ve en la tarjeta del plan. */
  planes: [
    { id: "trimestral", nombre: "3 meses",      precio: 26700,  meses: 3,  detalle: "sale $8.900 por mes · 3 meses de acceso", pago: "https://mpago.la/2SDK5Ty",
      incluye: ["Rutina personalizada armada por Brian", "Tu día en una lista: entreno, comida, hábitos y plata", "Resumen semanal con puntaje y rango", "Récords, rangos y rachas para compartir", "Finanzas: cuentas a pagar, gastos y ahorro", "Plan de calorías y proteína", "Consultas por WhatsApp"] },
    { id: "anual",      nombre: "Anual",        precio: 69900,  meses: 12, detalle: "sale $5.825 por mes · ahorrás 30%",              pago: "https://mpago.la/2cdoPet", destacado: "Más elegido",
      incluye: ["Todo lo del plan de 3 meses", "Rutina nueva cada 3 meses", "Revisión de tu progreso cada mes", "Prioridad en WhatsApp"] },
    { id: "vida",       nombre: "Para siempre", precio: 119900, meses: 0,  detalle: "un solo pago · acceso de por vida",              pago: "https://mpago.la/28ED6Ht",
      incluye: ["Todo lo del plan anual", "Sin cuotas, nunca más", "Todas las funciones nuevas que salgan"] }
  ],

  /* Clientes de afuera de Argentina: ven estos precios en dólares.
     "pago" es un link de cobro internacional (Hotmart, PayPal, etc.);
     vacío = el botón abre WhatsApp para coordinar el pago. */
  internacional: {
    activo: true,
    moneda: "US$",
    metodos: "PayPal, USDT (Binance) o Zinli",
    /* Hotmart (cobro automático afuera): código de cada oferta → plan.
       Ej: { "a1b2c3d4": "trimestral", "e5f6g7h8": "anual", "i9j0k1l2": "vida" }.
       Vacío = se reconoce el plan por el precio. Los links de pago van en "pago". */
    hotmart: { ofertas: {} },
    planes: [
      { id: "trimestral", nombre: "3 meses",      precio: 19, meses: 3,  detalle: "sale US$6,33 por mes", pago: "" },
      { id: "anual",      nombre: "Anual",        precio: 49, meses: 12, detalle: "sale US$4,08 por mes · ahorrás 35%", pago: "", destacado: "Más elegido" },
      { id: "vida",       nombre: "Para siempre", precio: 89, meses: 0,  detalle: "un solo pago · acceso de por vida", pago: "" }
    ]
  },

  /* Vendedores: se llevan "comision" % del primer pago de cada cliente
     que traen, y "renovacion" % de cada renovación de ese cliente
     (0 = las renovaciones no pagan comisión). */
  recomendados: {
    activo: true,
    comision: 43,
    renovacion: 15,
    cuandoPago: "a fin de cada mes",
    premio: "",                                                        /* premio del mes para el n.º 1 del ranking, ej: "$50.000 extra". Vacío = no se muestra */                                   /* se lo muestra a los vendedores */
    comoPago: "En Argentina por Mercado Pago o transferencia. Afuera, por USDT (Binance), PayPal o Zinli."
  }
};
