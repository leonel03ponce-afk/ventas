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

  acceso: {
    libre: false,                                   /* true = sin código, entra cualquiera */
    secreto: "ponce-2026-xK7m",                     /* firma de los códigos: cambialo y los viejos dejan de servir */
    admin: "PONCE-2026",                            /* escribilo en la pantalla de acceso para abrir el panel */
    bloqueados: [],                                 /* seriales dados de baja, ej: ["AB", "AC"] */
    prueba: 7                                       /* días de prueba gratis sin código (0 = sin prueba) */
  },

  /* Precios en pesos. "pago" es el link de cobro de Mercado Pago
     (Suscripciones para mensual y anual, Link de pago para el pago único).
     Si lo dejás vacío, el botón abre WhatsApp para coordinar el pago. */
  planes: [
    { id: "mensual", nombre: "Mensual",      precio: 8900,   meses: 1,  detalle: "por mes · cancelás cuando quieras", pago: "" },
    { id: "anual",   nombre: "Anual",        precio: 69900,  meses: 12, detalle: "un año · sale $5.825 por mes",       pago: "", destacado: "Más elegido" },
    { id: "vida",    nombre: "Para siempre", precio: 119900, meses: 0,  detalle: "un solo pago · acceso de por vida",   pago: "" }
  ],

  /* Recomendados: quien trae un cliente se lleva este % del primer pago */
  recomendados: {
    activo: true,
    comision: 50
  }
};
