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
    /* La firma de los códigos y la clave del panel ya NO van acá (este archivo es público):
       viven en Netlify → Environment variables: SECRETO_CODIGOS (y SECRETO_VIEJO mientras migran
       los códigos dados antes del 04/11). El panel de la app se abre con la clave de Mi negocio (CLAVE_VENTAS). */
    bloqueados: [],                                 /* seriales dados de baja, ej: ["AB", "AC"] */
    prueba: 0,                                      /* días de prueba gratis (0 = sin prueba) */
    pruebaPorWhatsApp: true,                        /* true = para activarla te escriben y les pasás la palabra */
    palabraPrueba: "ARRANCO"                        /* la palabra que mandás por WhatsApp para activar la prueba */
  },

  /* Precio en pesos. Desde el 08/11: un solo plan, PAGO ÚNICO, igual que Ritmo
     (ARS 70.000, con las mismas cuotas: las que ofrece Mercado Pago en el checkout).
     El cobro lo arma /api/pagar con este precio. "pago" es un link fijo de Mercado Pago
     de respaldo (si el cobro automático falla); vacío = el botón abre WhatsApp.
     "incluye" es la lista que se ve en la tarjeta del plan. */
  planes: [
    { id: "vida", nombre: "Para siempre", precio: 70000, meses: 0, detalle: "pago único · es tuyo para siempre · en cuotas con tarjeta", pago: "", destacado: "Pago único",
      incluye: ["Rutina personalizada armada por Brian", "Tu día en una lista: entreno, comida, hábitos y plata", "Resumen semanal con puntaje y rango", "Récords, rangos y rachas para compartir", "Finanzas: cuentas a pagar, gastos y ahorro", "Plan de calorías y proteína", "Consultas por WhatsApp", "Todas las funciones nuevas que salgan"] }
  ],

  /* Accesos por tiempo: ya NO se venden sueltos ni se muestran en la venta.
     Quedan para el Sistema que viene incluido en un programa (Ritmo / la Caja piden
     "trimestral" para Closer en 30 y "anual" para el pase) y para reconocer pagos viejos.
     Los códigos que ya se dieron siguen valiendo hasta su vencimiento (la fecha va adentro del código). */
  planesIncluidos: [
    { id: "trimestral", nombre: "3 meses", precio: 0, meses: 3 },
    { id: "anual",      nombre: "Anual",   precio: 0, meses: 12 }
  ],

  /* Clientes de afuera de Argentina: ven estos precios en dólares.
     "pago" es un link de cobro internacional (Hotmart, PayPal, etc.);
     vacío = el botón abre WhatsApp para coordinar el pago. */
  internacional: {
    activo: true,
    moneda: "US$",
    metodos: "PayPal, USDT (Binance) o Zinli",
    /* Hotmart (cobro automático afuera): código de cada oferta → plan.
       Ej: { "a1b2c3d4": "vida" }.
       Vacío = se reconoce el plan por el precio. Los links de pago van en "pago". */
    hotmart: { ofertas: {} },
    /* Pago único, como en Argentina: US$49 ≈ ARS 70.000 al dólar que usan los links de Mercado Pago de los programas. */
    planes: [
      { id: "vida", nombre: "Para siempre", precio: 49, meses: 0, detalle: "un solo pago · es tuyo para siempre", pago: "", destacado: "Pago único" }
    ]
  },

  /* Vendedores: se llevan "comision" % de cada venta que traen (pago único).
     Ya no hay renovaciones: si un cliente con un plan viejo (3 meses o anual) compra
     el acceso para siempre, el vendedor que lo trajo primero cobra el mismo "comision" %. */
  recomendados: {
    activo: true,
    comision: 43,
    cuandoPago: "a fin de cada mes",
    premio: "",                                                        /* premio del mes para el n.º 1 del ranking, ej: "$50.000 extra". Vacío = no se muestra */                                   /* se lo muestra a los vendedores */
    comoPago: "En Argentina por Mercado Pago o transferencia. Afuera, por USDT (Binance), PayPal o Zinli."
  }
};
