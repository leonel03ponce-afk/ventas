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
    prueba: 7,                                      /* días de prueba gratis (0 = sin prueba) */
    pruebaPorWhatsApp: true,                        /* true = para activarla te escriben y les pasás la palabra */
    palabraPrueba: "ARRANCO"                        /* la palabra que mandás por WhatsApp para activar la prueba */
  },

  /* Precios en pesos. Tienen que coincidir con lo que cobra cada link de
     Mercado Pago. "incluye" es la lista que se ve en la tarjeta del plan. */
  planes: [
    { id: "trimestral", nombre: "3 meses",      precio: 24900,  meses: 3,  detalle: "sale $8.300 por mes · se renueva cada 3 meses", pago: "https://mpago.la/2SDK5Ty",
      incluye: ["Rutina personalizada armada por Brian", "Registro serie por serie y cronómetro", "Hábitos, niveles y rachas", "Plan de calorías y proteína", "Consultas por WhatsApp"] },
    { id: "anual",      nombre: "Anual",        precio: 69900,  meses: 12, detalle: "sale $5.825 por mes · ahorrás 30%",              pago: "https://mpago.la/2cdoPet", destacado: "Más elegido",
      incluye: ["Todo lo del plan de 3 meses", "Rutina nueva cada 3 meses", "Revisión de tu progreso cada mes", "Prioridad en WhatsApp"] },
    { id: "vida",       nombre: "Para siempre", precio: 119900, meses: 0,  detalle: "un solo pago · acceso de por vida",              pago: "https://mpago.la/28ED6Ht",
      incluye: ["Todo lo del plan anual", "Sin cuotas, nunca más", "Todas las funciones nuevas que salgan"] }
  ],

  /* Recomendados: quien trae un cliente se lleva este % de cada pago
     que haga ese cliente mientras siga renovando (recurrente: true),
     o solo del primero (recurrente: false). */
  recomendados: {
    activo: true,
    comision: 20,
    recurrente: true,
    cuandoPago: "a fin de cada mes, por Mercado Pago o transferencia"   /* se lo muestra a los vendedores */
  }
};
