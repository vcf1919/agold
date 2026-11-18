# AGOLD · Nails & Beauty

Web one-page de **AGOLD by Alba Ramón**: nail art a mano alzada, uñas de gel, mirada, maquillaje y formación en Catarroja (Valencia).
Diseño y desarrollo: [rgdev.studio](https://www.instagram.com/rgdev.studio).

Proyecto estático: HTML, CSS y JS sin framework y **sin paso de build**.

## Despliegue en Cloudflare Pages

1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** y elige este repositorio.
2. Configuración de build:
   - **Framework preset:** None
   - **Build command:** *(vacío)*
   - **Build output directory:** `/`
3. **Save and Deploy**. Cada push a la rama de producción se publica solo.
4. Dominio propio: **Custom domains** → *Set up a custom domain*. Todas las rutas son relativas, así que funciona igual en `*.pages.dev` y en el dominio.

`_headers` define la caché de los assets y las cabeceras de seguridad (CSP incluida). Si añades una librería o un servicio externo nuevo, añade su dominio a la `Content-Security-Policy`.

Al cambiar CSS o JS, sube el número de versión (`?v=4`) en las etiquetas de `index.html` para que nadie vea la versión anterior.

Para probar en local: `python3 -m http.server` desde la raíz y abre `http://localhost:8000`.
Parámetros útiles: `?hero=svg` o `?hero=3d` fuerzan la versión de la mariposa.

## Estructura

```
index.html            la one-page
aviso-legal.html      placeholder legal
privacidad.html       placeholder legal
_headers              caché y seguridad (Cloudflare Pages)
css/styles.css        sistema de diseño y estilos
js/boot.js            detecta movimiento reducido, puntero y potencia del dispositivo
js/content.js         ← CONTENIDO EDITABLE: contacto, horario, lookbook, «El detalle», reseñas
js/main.js            scroll suave, animaciones, lookbook, visor, carta, horario…
js/hero3d.js          mariposa 3D (Three.js), se carga después del primer pintado
js/butterfly-geometry.js  geometría de la mariposa (fuente única para SVG y 3D)
js/map.js             mapa 3D (MapLibre + OpenFreeMap), se carga al acercarse
assets/trabajos|maquillaje|alba|estudio/   fotos originales
assets/img/           fotos optimizadas (WebP + AVIF) y manifest.json
assets/logo/          sello, isotipo, icono y referencia del logo original
assets/fonts/         tipografías autoalojadas
scripts/              utilidades (no se usan en el despliegue)
```

## Cómo actualizar

- **Fotos:** copia el original a `assets/trabajos/` (o `maquillaje/`, `alba/`, `estudio/`) con nombre descriptivo (`09-francesa-carey.jpg`) y ejecuta
  `python3 scripts/optimize-images.py` (necesita `pip install "Pillow>=11"`). Genera WebP y AVIF en varios anchos en `assets/img/` y anota los anchos en `assets/img/manifest.json`.
  Después añade la entrada en `js/content.js` → `lookbook` copiando los anchos (`w`).
- **«El detalle»:** cambia `detail` en `js/content.js` (foto y notas con su posición `x`/`y` en %).
- **Horario, WhatsApp y coordenadas:** en `js/content.js` → `site` y `hours`. El estado «Abierto ahora / Cerrado» se calcula solo (hora de Madrid). Si cambias el horario, actualiza también `openingHoursSpecification` en el JSON-LD de `index.html`.
- **Logo:** si cambias la geometría de la mariposa (`js/butterfly-geometry.js`), ejecuta `node scripts/build-logo.mjs` para regenerar los SVG y el isotipo incrustado en `index.html`.

## La mariposa («Metamorfosis»)

- **3D (WebGL):** facetas independientes de pan de oro (`MeshPhysicalMaterial`, metalness 1) con reflejos de un estudio generado en tiempo real. Intro de ensamblado (solo la primera visita de la sesión, se puede saltar), aleteo de ~4 s, sigue al cursor o al giroscopio (en iOS pide permiso al tocar el hero), y se desarma con el scroll hasta posarse como marco de las primeras fotos.
- **Rendimiento:** Three.js se carga tras el evento `load` en un momento libre, DPR limitado a 1,5, el render se pausa fuera de pantalla y en móviles modestos baja a 30 fps. Un vigilante mide los fps: si el dispositivo no llega, cambia a la versión SVG.
- **Versión SVG** (sin WebGL, con `prefers-reduced-motion`, con `deviceMemory` ≤ 4, con `hardwareConcurrency` ≤ 4 o con renderizado por software sin GPU): el logo se dibuja línea a línea con un brillo dorado.
  En iPhone/iPad no se usa `hardwareConcurrency`, porque Safari limita ese valor por privacidad y no refleja la potencia real.

## Tipografía

Titulares en **Sedan** (romana renacentista, con su cursiva para las palabras de acento) y texto, interfaz y etiquetas en **Instrument Sans**. Ambas tienen licencia SIL Open Font License y están autoalojadas en `assets/fonts/`.

## Pendiente de Alba (placeholders visibles en la web)

- [ ] **Teléfono / WhatsApp** (`js/content.js` → `site.whatsapp` y `phoneLabel`). Mientras falte, los botones de WhatsApp llevan a Instagram.
- [ ] **Horario semanal completo** (ahora es provisional: L–V 10:00–14:00 y 15:00–18:00; el sábado figura «por confirmar»). Revisa también el JSON-LD.
- [ ] **Ubicación exacta** del local en el mapa: las coordenadas actuales son aproximadas (inicio de C/ Joan Parras, junto a C/ Sant Pere).
- [ ] **Foto de Alba** para la sección «Alba» (formato vertical 4:5).
- [ ] **Fotos de pedicura, lifting/cejas y láser** para la carta de servicios.
- [ ] **Fotos del estudio** (`assets/estudio/`).
- [ ] **Láser:** zonas, duración y precio (ahora «Consultar»).
- [ ] **Duración y cuidado:** los tres datos de la destacada «Duración» de Instagram.
- [ ] **Formación:** nombre del curso, nivel, duración, plazas y qué incluye (si no hay cursos, se mantiene la tarjeta «Próximas formaciones»).
- [ ] **Años de experiencia** (tercer dato de la sección «Alba»).
- [ ] **Capturas de reseñas de Booksy** con nombre de la clienta (ahora son extractos reales sin nombre).
- [ ] **Logo original en alta resolución** (PNG/SVG) para afinar el sello, que está redibujado a partir de la foto de perfil.
- [ ] **Aviso legal y privacidad:** NIF, email y revisión del texto.
- [ ] **Dominio definitivo:** cuando exista, cambia `og:image` (y la `image`/`logo` del JSON-LD) a URLs absolutas (`https://dominio/assets/og/agold-og.jpg`) y añade `<link rel="canonical">`.

## Créditos técnicos

GSAP 3.12.5 + ScrollTrigger y Lenis 1.1.13 (animación y scroll), Three.js 0.160.0 (mariposa), MapLibre GL 4.7.1 y OpenFreeMap / OpenStreetMap (mapa), todos cargados por CDN.
