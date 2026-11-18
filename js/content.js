/*
 * ─────────────────────────────────────────────────────────────
 *  AGOLD · Contenido editable
 *  Aquí están los datos que cambian: contacto, horario, lookbook,
 *  la sección «El detalle» y las reseñas. No hace falta tocar
 *  nada más del código para actualizarlos.
 *
 *  Fotos: añade el original a assets/trabajos/ (o maquillaje/…),
 *  ejecuta  python3 scripts/optimize-images.py  y copia aquí los
 *  anchos que aparecen en assets/img/manifest.json.
 * ─────────────────────────────────────────────────────────────
 */
window.AGOLD = {
  site: {
    booksy: 'https://agolddesigns1.booksy.com',
    instagram: 'https://www.instagram.com/agoldbyalba',
    // PENDIENTE: teléfono de Alba en formato internacional sin espacios ni +
    // (ej.: '34600111222'). Mientras esté vacío, los botones de WhatsApp
    // llevan a Instagram.
    whatsapp: '',
    phoneLabel: '[TELÉFONO]',
    address: 'C/ Joan Parras, 2, bajo izq. · 46470 Catarroja, Valencia',
    // Coordenadas aproximadas (inicio de C/ Joan Parras, junto a C/ Sant Pere).
    // PENDIENTE: confirmar el punto exacto del local.
    coords: [-0.40056, 39.39948], // [lng, lat]
    mapsUrl:
      'https://www.google.com/maps/dir/?api=1&destination=C%2F%20Joan%20Parras%202%2C%2046470%20Catarroja%2C%20Valencia',
    messages: {
      general: 'Hola Alba, te escribo desde tu web. Me gustaría pedir información.',
      formacion:
        'Hola Alba, me interesa la formación de AGOLD. ¿Me cuentas cuándo son las próximas fechas y qué incluye?',
    },
  },

  /*
   * Horario semanal. PENDIENTE: confirmar con Alba.
   * Solo sabemos que un día laborable abre 10:00–14:00 y 15:00–18:00;
   * se aplica a lunes–viernes de forma provisional.
   * Formato: [['10:00','14:00'], ['15:00','18:00']]  ·  [] = cerrado
   */
  hours: {
    provisional: true,
    week: {
      1: [['10:00', '14:00'], ['15:00', '18:00']],
      2: [['10:00', '14:00'], ['15:00', '18:00']],
      3: [['10:00', '14:00'], ['15:00', '18:00']],
      4: [['10:00', '14:00'], ['15:00', '18:00']],
      5: [['10:00', '14:00'], ['15:00', '18:00']],
      6: null, // null = pendiente de confirmar
      0: [],
    },
  },

  /*
   * Lookbook. cat: francesa · animal · flores · dorado · color · maquillaje
   * shape: proporción del recorte en el lookbook (tall · square · wide · portrait)
   * pos: object-position del recorte
   */
  lookbook: [
    { src: 'trabajos/01-francesa-leopardo-fantasmas', w: [480, 800, 880], title: 'Francesa leopardo y fantasmas', shape: 'almendrada', cat: ['francesa', 'animal'], alt: 'Uñas almendradas nude con francesa de leopardo y fantasmitas blancos pintados a mano', crop: 'tall', pos: '50% 40%' },
    { src: 'trabajos/08-tendencia-marron-flores', w: [480, 800, 1200, 1440], title: 'Carey, flores y perlas', shape: 'stiletto', cat: ['animal', 'flores', 'dorado'], alt: 'Uñas stiletto con carey, francesa negra con flor blanca y perlitas doradas', crop: 'portrait', pos: '50% 45%' },
    { src: 'trabajos/07-azul', w: [480, 800, 1200, 1440], title: 'Azul cobalto', shape: 'stiletto', cat: ['color'], alt: 'Uñas stiletto largas en azul cobalto brillante', crop: 'square', pos: '50% 50%' },
    { src: 'trabajos/03-marron-animal-print-2', w: [480, 800, 1200, 1440], title: 'Francesa animal print', shape: 'almendrada', cat: ['francesa', 'animal'], alt: 'Uñas almendradas con francesa en animal print marrón y crema', crop: 'tall', pos: '50% 50%' },
    { src: 'trabajos/06-disenos-una-natural-2', w: [480, 800, 1200, 1440], title: 'Salvia y estrella dorada', shape: 'uña natural', cat: ['dorado', 'color'], alt: 'Uñas naturales en verde salvia y nude con estrella dorada y lunares', crop: 'wide', pos: '50% 55%' },
    { src: 'trabajos/04-polka-dot-1', w: [480, 800, 1200, 1440], title: 'Polka dot', shape: 'almendrada', cat: ['francesa'], alt: 'Uñas almendradas con francesa negra de lunares blancos', crop: 'portrait', pos: '50% 50%' },
    { src: 'trabajos/05-disenos-veraniegos-2', w: [480, 800, 1200, 1440], title: 'Rosa aura con flor', shape: 'almendrada', cat: ['flores', 'color'], alt: 'Uñas almendradas en rosa aura con una flor pintada a mano', crop: 'square', pos: '50% 50%' },
    { src: 'trabajos/06-disenos-una-natural-3', w: [480, 800, 1200, 1440], title: 'Estrellas y perlas', shape: 'uña natural', cat: ['dorado', 'francesa'], alt: 'Uñas naturales nude con estrellas blancas, francesa de vaca y perlitas doradas', crop: 'tall', pos: '50% 50%' },
    { src: 'maquillaje/01-invitadas-naturales-1', w: [480, 800, 1026], title: 'Invitada · natural que se nota', shape: 'maquillaje social', cat: ['maquillaje'], alt: 'Maquillaje de invitada natural con piel luminosa y ojos ahumados suaves', crop: 'portrait', pos: '50% 30%' },
    { src: 'trabajos/02-mantequilla-tachuelas-metalizadas', w: [480, 800, 1200, 1600], title: 'Mantequilla y tachuelas', shape: 'almendrada', cat: ['color'], alt: 'Uñas almendradas color mantequilla con detalle metalizado efecto tachuelas', crop: 'wide', pos: '50% 50%' },
    { src: 'trabajos/05-disenos-veraniegos-1', w: [480, 800, 1200, 1440], title: 'Verano en flor', shape: 'almendrada', cat: ['flores', 'color'], alt: 'Uñas almendradas rosas y amarillas con flores pintadas a mano', crop: 'portrait', pos: '50% 50%' },
    { src: 'trabajos/03-marron-animal-print-1', w: [480, 800, 1200, 1440], title: 'Carey marrón', shape: 'almendrada', cat: ['animal', 'color'], alt: 'Uñas almendradas en marrón con efecto carey y animal print', crop: 'square', pos: '50% 50%' },
    { src: 'maquillaje/01-invitadas-naturales-2', w: [480, 800, 1086], title: 'Invitada · ojo ahumado', shape: 'maquillaje social', cat: ['maquillaje'], alt: 'Maquillaje social con ojo ahumado en marrones y labios nude', crop: 'tall', pos: '50% 30%' },
    { src: 'trabajos/06-disenos-una-natural-1', w: [480, 800, 1200, 1440], title: 'Rojo intenso y francesa', shape: 'uña natural', cat: ['color', 'francesa'], alt: 'Uñas naturales en rojo intenso combinadas con francesa nude y detalles rosas', crop: 'wide', pos: '50% 55%' },
    { src: 'trabajos/04-polka-dot-2', w: [480, 800, 1200, 1440], title: 'Lunares chocolate', shape: 'almendrada', cat: ['color', 'francesa'], alt: 'Uñas almendradas con lunares blancos sobre marrón chocolate y nude', crop: 'portrait', pos: '50% 50%' },
    { src: 'trabajos/05-disenos-veraniegos-3', w: [480, 800, 1200, 1440], title: 'Naranja y rosa', shape: 'almendrada', cat: ['flores', 'color'], alt: 'Uñas almendradas en naranja y rosa con flores naranjas pintadas a mano', crop: 'square', pos: '50% 50%' },
    { src: 'trabajos/06-disenos-una-natural-7', w: [480, 800, 1200, 1440], title: 'Francesa mantequilla', shape: 'uña natural', cat: ['francesa'], alt: 'Uñas naturales con francesa amarilla y una punta de lunares azules', crop: 'tall', pos: '50% 50%' },
    { src: 'maquillaje/01-invitadas-naturales-3', w: [480, 800, 1086], title: 'Invitada · piel jugosa', shape: 'maquillaje social', cat: ['maquillaje'], alt: 'Maquillaje natural de invitada con piel jugosa y mirada definida', crop: 'portrait', pos: '50% 30%' },
    { src: 'trabajos/06-disenos-una-natural-4', w: [480, 800, 1200, 1440], title: 'Detalles mínimos', shape: 'uña natural', cat: ['flores'], alt: 'Uñas naturales nude con pequeñas flores amarillas y conejitos pintados a mano', crop: 'square', pos: '50% 50%' },
    { src: 'trabajos/06-disenos-una-natural-6', w: [480, 800, 1200, 1440], title: 'Brillo sobre nude', shape: 'uña natural', cat: ['color'], alt: 'Uñas naturales nude con pequeños brillantes', crop: 'wide', pos: '50% 50%' },
  ],

  /*
   * «El detalle»: foto + notas. x/y en % sobre la foto.
   */
  detail: {
    src: 'trabajos/08-tendencia-marron-flores',
    w: [480, 800, 1200, 1440],
    ratio: 0.9017,
    alt: 'Primer plano de uñas stiletto con carey, flores blancas, rayas marrones y perlitas doradas',
    notes: [
      { x: 31, y: 18, title: 'Carey en gel', text: 'Capas translúcidas de ámbar y chocolate, construidas una sobre otra para que el carey tenga profundidad.' },
      { x: 27, y: 41, title: 'Flor a mano alzada', text: 'Pétalos blancos pintados con pincel fino sobre una francesa negra en punta stiletto.' },
      { x: 53, y: 46, title: 'Perlitas doradas', text: 'Detalles metálicos colocados uno a uno y sellados para que no se muevan.' },
      { x: 29, y: 70, title: 'Rayas pintadas', text: 'Animal print de rayas en marrón y crema, trazo a trazo, sobre base nude nivelada.' },
    ],
  },

  /* Reseñas reales de Booksy (sin nombre: se sustituirán por las capturas de Alba) */
  reviews: [
    { text: 'Es perfecta en sus trabajos, siempre va al detalle; es con diferencia uno de los mejores centros de uñas que conozco.', service: 'Relleno' },
    { text: 'Alba es una chica muy profesional y encantadora; se nota que le apasiona su trabajo.', service: 'Semipermanente' },
    { text: 'Hace su trabajo a la perfección, con mucho cariño y delicadeza. Me encanta lo bien que deja las uñas.', service: 'Semipermanente' },
    { text: 'Muy profesional y buen precio.', service: '' },
    { text: '¡Me encanta!', service: 'Pedicura completa' },
  ],
};
