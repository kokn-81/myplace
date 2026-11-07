# N.I.A · Estándar de Diseño y Arquitectura para Landings de Proyectos Inmobiliarios
**Versión:** 1.5

**Referencia Maestra:** la landing publicada de *ONA Residences* (`frontend/src/components/OnaLanding.tsx` y `onaInventory.ts`).  
**Propósito:** Especificación técnica, comercial y visual obligatoria. El formato, la orientación y la paleta se copian de ONA. El texto, los precios, los planes y las fotos son de cada proyecto.

---

## 0. Marca vigente (esto corrige al resto del manual si chocan)

La marca es el cascarón de ONA tal como está escrito en `OnaLanding.tsx`, no una variante verde, naranja o de 42/58.

1. **Fondo** `#f7f5f0`. **Acento único** `#9a7b45`, texto de acento `#816127`, tinta clara `#e8d5a8`. El verde esmeralda queda solo para “en vivo”, disponible y copiado. No se usa `#EA580C`, `#2d6a4f` ni el verde de WhatsApp en botones.
2. **Móvil:** una sola columna que scrollea entera. El hero mide como mínimo 480px y el texto va **abajo** de la foto. **Escritorio:** hero fijo `md:h-screen md:w-[44%]` y panel derecho `md:h-screen md:overflow-y-auto`. Prohibido partir la pantalla en `42vh / 58vh`.
3. **Hero fijo.** La foto de fachada no cambia con el scroll. La foto de ubicación vive dentro de `#lugar`.
4. **Contenido del panel derecho** centrado en `max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl`, con `pb-32 md:pb-44`. Cada sección después de `#intro` abre con `mt-20 border-t border-stone-200/80 pt-10`.
5. **Orden fijo:** `#intro`, `#lugar`, `#amenidades`, `#tipologias`, `#equipamiento`, `#constructora`, `#pago`, `#disponibilidad`, `#cierre`.
6. **Tres controles superiores** circulares blancos, a la derecha: brochure, compartir y cerrar.
7. **Barra inferior** `fixed inset-x-0 bottom-0 z-[110] md:left-[44%]` en crema: “Reserva con USD {monto del proyecto}” y botón Compartir. Se oculta en `#cierre`. El monto es el de ese proyecto.
8. **Menú de secciones** circular negro, icono `#e8d5a8`, en `bottom-20 right-4`. El ítem activo usa fondo `#9a7b45/15` y texto `#816127`.
9. **Sin Insights.** Ninguna landing incluye un botón ni un modal de Insights o modo asesor.
10. **El botón de reserva** es `bg-stone-900` y en hover `#9a7b45`.
11. **`#pago`:** la primera opción va en tarjeta negra con insignia dorada y “Ventaja comercial”. Las otras, en tarjeta blanca. El precio de esa sección es USD/m², no la cuota en dólares de una unidad todavía no elegida.
12. **`#disponibilidad`:** cuatro pasos (tipología, piso, opcional, plan). La tarjeta de cotización tiene **tres** columnas: inversión total, cuota inicial y saldo contra entrega. `USD` arriba y el número abajo. En contado, el saldo es `—` y “Sin saldo pendiente”. **Ningún proyecto publica plusvalía proyectada.** No hay cuarta columna, ni porcentaje, ni “valor a la entrega”, ni comparación del precio de preventa contra un precio terminado inventado. No se calcula `capitalGain`, `gainPercentage` ni `marketValueAtDelivery`.
13. **Lo que no se copia de ONA:** oraciones, nombres, metrajes, precios, cantidad de planes, monto de reserva, parqueos y fotos. Si el material oficial trae dos planes, se muestran dos, con el mismo dibujo de tarjeta.
14. **`#lugar`:** la imagen es el mapa o plano de ubicación del brochure oficial, a ancho completo (`block h-auto w-full`), dentro de un marco y sin estirarla. No se limita con `max-w-md`: un mapa vertical o apaisado tiene que ocupar la tarjeta. El texto va junto a la imagen, no encima.
15. **`#amenidades`:** el título y el texto van debajo de la foto. No tapan la imagen. Si el brochure trae el nombre del ambiente impreso en la foto, se recorta para que no quede doble rótulo.
16. **`#tipologias`:** la vista previa muestra solo el departamento, centrado (`object-contain`). El clic abre la ficha completa (plano, tabla y posición en el piso) en un modal con scroll. No se usa la hoja entera del brochure como miniatura.
17. **`#equipamiento`:** cada grupo es una tarjeta con foto del ambiente y la lista oficial debajo, igual que cocina, sala y el resto. No se deja una lista suelta. No se inventan acabados que el brochure no publica.
18. **`#constructora`:** se muestra el logo de la constructora, tomado del material oficial.
19. **Paso 2 (elegir piso):** hay un control para abrir la imagen oficial de distribución de pisos, para ver dónde queda la unidad en el edificio.
20. **Seña.** Si el material oficial no publica un monto de reserva, la barra inferior no inventa uno. Muestra el precio desde y la entrega, y dice que la seña la confirma el asesor.
21. **Sin Google Sheet.** Si no hay planilla en vivo, los precios salen de la lista oficial y la página muestra la fecha de esa lista. No se escribe “en vivo” ni se simula una sincronización.
22. **Colaboradores.** Si el brochure dice “colaboradores” y no nombra un solo desarrollador, se muestran esos logos con esa palabra. No se inventa un cargo. Si un logo trae impresa la palabra constructora, sí se puede repetir.
23. **Adicionales.** Parqueo, moto o baulera usan solo el precio publicado. Si el documento no pone precio, ese adicional no entra en la cotización.
24. **Unidad vendida.** Si la lista marca la unidad como vendida y no publica su precio, la ficha no calcula ni muestra un número.
25. **Código de unidad.** Si el código es piso + letra (1D, 2D, 3D), el botón de piso dice “Unidad 1D”. Suelto, 1D, 2D y 3D se leen como dormitorios.
26. **Texto de la página.** El visitante no lee instrucciones de armado (“el texto va debajo de la foto”, “no se inventan acabados”). Esas reglas viven en este manual. La página habla del proyecto.
27. **Paso 1 (tipología).** Si hay varias plantas, no se listan en una grilla que alarga la página. Van en un carrusel: flechas y deslizamiento. Debajo del modelo activo se ve la foto del departamento, y cambia al pasar al siguiente. El clic en esa foto abre la ficha. El filtro de dormitorios puede quedar arriba, en una sola fila.
28. **Títulos.** Cada sección habla al comprador: deseo, decisión o lugar. No describen el documento (“el brochure los presenta”, “los dos publicados”, “la lista dice qué queda”). Sin signos de exclamación y sin una oferta que el material no publica.

Los apartados 2 a 8 de este archivo describen el mismo sistema. Si una frase vieja pide hero que cambia de foto, paleta propia del proyecto, o panel de 58vh, manda este apartado.

---

## 1. Filosofía de Producto y Principios Rectores

Las landings de proyectos en N.I.A no son páginas informativas estáticas; son **experiencias editoriales de alta conversión orientadas al inversor y comprador final**, diseñadas con el rigor visual de una revista de arquitectura contemporánea y la interactividad de una tienda de comercio electrónico premium (estilo Apple Store).

### Principios no negociables:
1. **Transparencia radical de precios e inventario:** Nunca ocultar precios ni obligar al usuario a consultar por WhatsApp para saber cuánto cuesta un m² o una unidad. Los datos se muestran en vivo y sincronizados con Google Sheets.
2. **Claridad en la Cuota Inicial:** Mostrar siempre el monto exacto de la cuota inicial y el cronograma de desembolsos antes de solicitar la reserva.
3. **Flujo de selección en cascada (estilo Apple):**
   * *Paso 1:* Tipología / Ambiente.
   * *Paso 2:* Piso y orientación disponible.
   * *Paso 3:* Opcionales (ej. Parqueo simple/doble con baulera).
   * *Paso 4:* Plan de pago y cuota inicial.
   * *Paso 5:* Checkout / Reserva directa vía WhatsApp con mensaje precargado con todos los parámetros.
4. **Respeto absoluto de la experiencia multidispositivo:**
   * **Móvil:** Scroll vertical continuo fluido, botones accesibles al pulgar, tipografías legibles sin zoom.
   * **Computadora (Desktop):** Pantalla dividida (`split-screen` al 44% / 56%), panel izquierdo fijo con ambientación fotográfica dinámica y panel derecho editorial ancho (`max-w-3xl` a `max-w-5xl`) con respiro visual.

---

## 2. Sistema de Diseño e Identidad Visual N.I.A

### 2.1 Paleta Cromática Institucional

| Token / Nombre | Valor HEX / Tailwind | Uso Principal |
| :--- | :--- | :--- |
| **Surface Warm (Fondo)** | `#F8F3E7` / `#F7F5F0` | Fondo general de la landing, cálido, marfil, evita el blanco clínico. |
| **Surface Panel** | `#FFFDF6` / `white/95` | Tarjetas de contenido, modales y drawers flotantes con glassmorphism. |
| **NIA Gold (Acento Principal)** | `#9A7B45` / `#C19A6B` | Eyebrows, subtítulos destacados, iconos activos, bordes de selección. |
| **NIA Gold Dark** | `#816127` | Textos sobre fondos claros dorados para garantizar contraste y legibilidad. |
| **NIA Gold Light / Tint** | `#E8D5A8` / `#9A7B45/15` | Fondos de chips, píldoras de preventa y badges activos. |
| **Stone Dark (Texto Principal)** | `#1C1917` (Stone-900) | Títulos, precios fuertes, botones de acción primaria e iconos oscuros. |
| **Stone Muted (Cuerpo)** | `#57534E` / `#78716C` | Párrafos descriptivos, justificados con inter-word. |
| **Border Soft** | `#E7E5E4` (Stone-200) | Divisores sutiles de sección, bordes de tarjetas y botones blancos. |
| **Status Live (Verde Éxito)** | `#059669` (Emerald-600) | Indicador pulsante "En vivo", confirmación de copiado y badges disponibles. |
| **Status Sold (Gris Agotado)** | `#A8A29E` (Stone-400) | Unidades vendidas o no disponibles. |

### 2.2 Tipografía y Jerarquía

* **Títulos y Titulares Principales (`font-serif`):**  
  * Fuente: `Playfair Display`, serif.  
  * Pesos: `400` (normal/light) y `italic` para frases evocadoras (`Un proyecto pensado para...`).  
  * Jerarquía:  
    * `h1` / `h2` principales: `text-3xl md:text-5xl font-light leading-snug`.  
    * Precios destacados y métricas: `font-serif text-xl md:text-2xl font-bold`.
* **Cuerpo de Texto y Datos Técnicos (`font-sans`):**  
  * Fuente: `Inter` o `Montserrat`, sans-serif.  
  * Pesos: `300` (light para párrafos de lectura), `400` (regular), `500` / `600` (semibold para botones, chips y etiquetas).  
  * Estilo editorial: Textos descriptivos con alineación justificada `[text-align:justify] [text-justify:inter-word]` para look de revista.

---

## 3. Arquitectura Estructural de la Landing

Cada landing de proyecto debe implementar la siguiente estructura dividida en 9 secciones y elementos flotantes:

```
┌────────────────────────────────────────────────────────────────────────┐
│  HEADER FLOTANTE SUPERIOR DERECHO (Solo Iconos: PDF, Share, X)│
├───────────────────────────────────┬────────────────────────────────────┤
│ PANEL IZQUIERDO (44% Desktop)    │ PANEL DERECHO EDITORIAL (56%)      │
│ - Fotografía inmersiva dinámica   │ 1. #intro (Hero, tesis & nav bar)  │
│   (sincronizada con scroll)       │ 2. #lugar (Ubicación & drenaje)    │
│ - Badge Preventa · Fase 1         │ 3. #amenidades (Áreas sociales)    │
│ - Logo / Título del Proyecto      │ 4. #tipologias (1D, 2D, suites)    │
│ - Constructora y Entrega          │ 5. #equipamiento (Fotos + listas)  │
│ - Tarjeta de Precios "Desde"      │ 6. #constructora (Trayectoria)     │
│                                   │ 7. #pago (Planes 60/40, 40/60)     │
│                                   │ 8. #disponibilidad (Cotizador)     │
│                                   │ 9. #cierre (Garantía & WhatsApp)   │
├───────────────────────────────────┴────────────────────────────────────┤
│ ELEMENTOS FLOTANTES REACTIVOS:                                         │
│ • Barra inferior de conversión (Reserva USD 1.000 + Compartir)        │
│ • Burbuja flotante de menú de secciones [ ☰ Secciones ]                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Especificación Detallada Sección por Sección

### Controles Superiores Flotantes (`fixed right-4 top-4 md:right-7 md:top-7 z-[120]`)
* **Formato:** Conjunto de 3 botones circulares idénticos (`h-10 w-10`), fondo `bg-white/95 backdrop-blur`, borde `border-stone-200`, sombra `shadow-xl`.
* **Botones requeridos:**
  1. `Download` (color `#9A7B45`): Descarga directa del brochure oficial en PDF.
  2. `Share2` (color `stone-800`): Copia link con feedback visual `Check` en verde.
  3. `X` (color `stone-700`): Cierra la landing y regresa a la búsqueda del mapa.

---

### Panel Izquierdo: Escenografía Dinámica (Hero)
* **Comportamiento:** Fijo en pantalla en computadora (`h-screen md:w-[44%]`). En móvil ocupa un banner superior de altura mínima `min-h-[480px]`.
* **Sincronización:** Mediante `IntersectionObserver`, cambia suavemente la imagen de fondo según la sección que el usuario está leyendo:
  * `#intro` → Fachada diurna.
  * `#lugar` → Mapa / entorno urbano.
  * `#amenidades` → Piscina / áreas comunes.
  * `#tipologias` → Dormitorio / interior render.
  * `#equipamiento` → Cocina con acabados.
  * `#constructora` → Fachada al atardecer o edificio insignia.
  * `#pago` → Fachada atardecer.
  * `#disponibilidad` → Living / vista interior.
* **Overlays informativos en la imagen:**
  * Chip superior: `Preventa Exclusiva · 1.ª Fase · [Zona]`.
  * Nombre del proyecto en grande con tipografía serif.
  * 2 Tarjetas con fondo translúcido:
    * *Constructora:* Nombre + logo/ícono de verificación.
    * *Entrega de Obra:* Mes y Año proyectado.
  * Tarjeta inferior de precios dinámicos:
    * *1 Dormitorio:* `m²` y `Desde USD [precio mínimo real disponible]`.
    * *2 Dormitorios:* `m²` y `Desde USD [precio mínimo real disponible]`.
    * Indicador verde pulsante `en vivo`.

---

### Panel Derecho: Contenido Editorial por Secciones

#### 1. Sección Hero & Experiencia (`#intro`)
* **Eyebrow:** Ícono `Sparkles` + texto dorado en mayúsculas con tracking espaciado (`Experiencia Residencial & Preventa`).
* **Titular Serif:** Formato estándar `"Vive en [Nombre del Proyecto]."` + propuesta de valor emocional en cursiva dorada (ej. `Vive en Garden Zen.` / `Vive en ONA Residences.`).
* **Tesis del proyecto:** Párrafo de 3 a 5 líneas justificadas explicando la ubicación, constructora y el perfil del comprador/inversor.
* **Tarjeta de Tracción:** Muestra el número de unidades vendidas o reservadas en la fase actual para generar prueba social y urgencia legítima.
* **Accesos rápidos:** Botón de descarga de Brochure y botón para saltar a disponibilidad.
* **Barra de Secciones Inicial:** Menú horizontal con separador superior:
  * Botón `[ 🏠 Inicio ]` que hace scroll suave al inicio de la landing (no cierra la ventana).
  * Enlaces interactivos a las 7 secciones restantes (`Ubicación`, `Áreas Sociales`, `Tipologías`, `Equipamiento`, `Constructora`, `Formas de Pago`, `Disponibilidad en Vivo`).

#### 2. Sección Ubicación Privilegiada (`#lugar`)
* Distancias reales en minutos hacia puntos estratégicos (centros financieros, gastronómicos, colegios y avenidas).
* **Factor diferencial de ingeniería:** Destacar la cota topográfica de la zona y el sistema de drenaje pluvial para disipar el temor a inundaciones.
* **Botón de Google Maps:** Enlace estilizado inferior derecho (`VER UBICACIÓN EN GOOGLE MAPS`) con ícono `MapPin` y tracking uppercase dorado, apuntando a la ficha satelital verificada.

#### 3. Sección Áreas Sociales & Bienestar (`#amenidades`)
* **Carrusel visual de amenidades:** Fotos reales/renders con títulos, categorías y descripciones claras.
* **Navegación:** Flechas circulares anterior/siguiente y puntos indicadores inferiores.
* **Equipamiento de áreas comunes:** Lista detallada de lo que incluye cada espacio (mobiliario de diseño, climatización, parrillas de acero inoxidable, sonido ambiental).

#### 4. Sección Tipologías Residenciales (`#tipologias`)
* **Regla de Transparencia NIA (Estricta):** Queda **terminantemente prohibido prometer rendimientos exactos, rentas fijas o mostrar etiquetas de "Yield / Renta estimada"** en las tarjetas de tipología. Las tarjetas deben mantenerse limpias, arquitectónicas y enfocadas en la experiencia habitable.
* **Regla de Navegación Local (Estricta):** Los botones y tarjetas de `#tipologias` **NO deben mover al usuario de sección ni saltar a `#disponibilidad`**. La sección está concebida para la exploración arquitectónica pausada. Los clics y controles sirven exclusivamente para alternar entre planos 2D, cortes 3D y especificaciones de cada tipología sin interrumpir el flujo de lectura.
* **Datos expuestos en cada tarjeta:**
  * Nombre de la tipología (ej. *Monoambiente*, *1 Dormitorio*, *2 Dormitorios*, *Penthouse*).
  * Metraje útil y total (rango en m²).
  * Precio preventa oficial: `Desde USD [precio mínimo disponible]`.
  * Aspectos arquitectónicos clave (ej. balcón aterrazado, suite con vestidor, ventilación cruzada).
  * Indicador de estado visual: `Plano activo abajo ✓` (cuando está seleccionada) o `Ver plano arquitectónico →` (al hacer clic activa el plano en el visor inferior sin desplazarse).
* **Visualización interactiva de planos:**
  * Tarjeta visual con plano 2D acotado y renderizado correspondiente a la tipología seleccionada.
  * Controles de navegación local (`Anterior` / `Siguiente`, flechas superpuestas sobre la imagen y puntos indicadores) para pasar de una tipología a otra con total fluidez.
  * Botón de ampliación: `Ver HD` (abre modal de zoom para examinar medidas y distribución al detalle).
  * Etiquetas de especificaciones arquitectónicas aprobadas (ej. `PLANTA MP`, `PLANTA B1`, etc.) y pills de equipamiento incluido en la tipología.

#### 5. Sección Equipamiento 100% Incluido (`#equipamiento`)
* **Carrusel visual por ambiente:** Cocina, Dormitorio, Baños, Climatización, Iluminación.
* **Listado minucioso debajo de cada foto:**
  * Mesones (ej. granito chiquitano pulido).
  * Cajonería alta y baja en melamina con cantos de PVC.
  * Ropero empotrado con cajones y divisiones internas completas.
  * Box de baño con vidrio templado de piso a techo y grifería de alta gama.
  * Calefón instalado y equipos de aire acondicionado tipo inverter incluidos sin costos adicionales.

#### 6. Sección Respaldo y Constructora (`#constructora`)
* Identidad y trayectoria de la empresa constructora.
* 3 Tarjetas de soporte en cuadrícula de altura uniforme:
  * Años de trayectoria ininterrumpida.
  * Diversidad técnica y metros cuadrados construidos.
  * Dirección propia de obra (sin tercerización ciega).
* Cita textual del fundador o director de obra con su visión técnica.

#### 7. Sección Formas de Pago Transparentes (`#pago`) - Estándar Oficial ONA
* **Estructura visual estandarizada:**
  * **Banner superior en vivo:** Precio base preventa `Desde $X USD/m²` calculado automáticamente sobre el inventario disponible con badge de sincronización y botón para actualizar en tiempo real.
  * **3 Tarjetas apiladas horizontalmente a todo el ancho (`space-y-4`):**
    1. **Opción 1: Contado (100%)** - Tarjeta destacada oscura (`bg-stone-900 text-white shadow-lg`) con badge dorado `MAYOR DESCUENTO`, precio por m² resaltado en tipografía serif, y bloque editorial inferior `VENTAJA COMERCIAL:` explicando el ahorro del plan. No se promete plusvalía ni se compara contra un “valor terminado” que el material no publica.
    2. **Opción 2: Anticipo Alto (ej. 70% o 60%) + Saldo contra Entrega** - Tarjeta clara (`bg-white shadow-sm border border-stone-200`) con badge `EQUILIBRIO FINANCIERO`, precio por m² y bloque editorial `VENTAJA COMERCIAL:` con el balance entre liquidez y descuento.
    3. **Opción 3: Anticipo Mínimo (ej. 30% o 40%) + Saldo contra Entrega** - Tarjeta clara con badge `ENTRADA CÓMODA` / `ENTRADA ACCESIBLE`, precio por m² y bloque editorial `VENTAJA COMERCIAL:` detallando el menor desembolso de entrada y congelamiento de unidad.
* **Regla Estricta de Formas de Pago:** En la sección `#pago` **NO se deben mostrar montos monetarios en dólares para la cuota inicial**, ya que el usuario aún no ha seleccionado una unidad. Los planes se presentan conceptualmente en porcentajes claros de desembolso (ej. 100% contado, 70% firma / 30% entrega, 30% firma / 70% entrega) y precio referencial por m². Los montos exactos en dólares (cuota inicial, saldo y total) se calculan y muestran exclusivamente en la sección `#disponibilidad` (Paso 4) una vez que el usuario ha elegido su departamento y piso.
* **Caja de transición a Disponibilidad:** Banner con llamado a la acción para cotizar una unidad específica con el botón `Elegir departamento y cotizar →`.
* **Cronograma de hitos:**
  * Hito 1 (Paso 1 · Hoy): Reserva formal que congela precio y unidad (ej. USD 1.000 en ONA o USD 5.000 en Garden Zen).
  * Hito 2 (Paso 2 · A la firma): Integración de cuota inicial a la firma de contrato de preventa (descontando la reserva).
  * Hito 3 (Paso 3 · Entrega de Obra): Saldo contra entrega de llaves (apto crédito bancario).

#### 8. Sección Disponibilidad en Vivo & Cotizador Interactivo (`#disponibilidad`)
* **Sincronización en tiempo real con Google Sheets:**
  * Indicador de última actualización y botón para refrescar datos al instante.
* **Paso 1:** Selección de Ambiente (chips con metros y precios mínimos).
* **Paso 2:** Selección de Piso en cuadrícula interactiva con código de color:
  * Verde: *Disponible* (permite clic para seleccionar).
  * Gris: *Vendido / Reservado* (deshabilitado).
* **Paso 3 (Opcional - Estilo Apple Store):** Selección de Parqueo con Baulera:
  * Opción A: Sin parqueo.
  * Opción B: Parqueo Simple (+ USD 15.000) con baulera.
  * Opción C: Parqueo Doble (+ USD 22.000) con baulera.
  * Al seleccionar, se actualiza automáticamente la inversión total unificada.
* **Paso 4:** Selección de Plan de Pago con recálculo dinámico en Tarjeta de Resumen Financiero (`grid-cols-1 sm:grid-cols-3`):
  * **Regla Obligatoria de Alineación Vertical:** Para evitar desorden visual cuando los títulos se dividen en 1 o 2 líneas (ej. "SALDO CONTRA ENTREGA" vs "INVERSIÓN TOTAL"), los encabezados de las 3 columnas deben ubicarse dentro de un contenedor de altura mínima uniforme (`min-h-[28px] flex items-end`). Esto garantiza que todos los montos numéricos principales compartan exactamente la misma línea de base horizontal en cualquier pantalla.
  * **Regla Estricta de Formato de Montos (USD Arriba, Número Abajo):** En las 3 columnas de la tarjeta, el símbolo de moneda (`USD`) debe ubicarse obligatoriamente en su propia línea arriba, y el valor numérico formateado abajo (`<span className="block">USD</span><span className="block mt-0.5">{monto}</span>`). Esto previene desbordes en columnas móviles y garantiza una estética editorial simétrica en todos los proyectos.
  * **Regla Obligatoria para Pago al Contado (100%):** En la columna "Saldo contra Entrega", está **terminantemente prohibido mostrar "USD 0"** y la fecha de entrega de obra. Cuando la modalidad seleccionada sea "Contado (100%)" o el saldo pendiente sea cero:
    * Arriba se muestra `USD` y abajo un guion estilizado (`—`) en lugar de `USD 0`.
    * El subtítulo descriptivo inferior debe mostrar `Sin saldo pendiente` en lugar de la fecha de entrega de obra (evitando fechas absurdas como "En Junio 2028" cuando la unidad ya se pagó al 100%).
  * **Prohibido publicar plusvalía proyectada:** no existe columna de ganancia, ni porcentaje de reventa, ni valor de mercado estimado a la entrega. El parqueo suma al total, a la cuota y al saldo. No se le inventa un valor futuro.
  * **Columnas de la Tarjeta:**
    1. *Inversión Total:* `USD` arriba, monto total unificado (departamento + parqueo/baulera) abajo, y precio real por m² en el pie.
    2. *Cuota Inicial (%):* `USD` arriba, monto a la firma del contrato abajo, y "A la firma del contrato" en el pie.
    3. *Saldo contra Entrega:* `USD` arriba, monto pendiente abajo (o `—` si es contado), y fecha de entrega (o `Sin saldo pendiente`) en el pie.
* **Paso 5:** Botón de acción principal: `RESERVAR UNIDAD [X] EN PISO [Y] VÍA WHATSAPP`.
  * Genera automáticamente un mensaje estructurado con todos los datos seleccionados para el agente comercial.

#### 9. Sección de Cierre y Garantías (`#cierre`)
* Tarjeta de cierre con condiciones de reserva, links a documentos legales y disclaimer de renders referenciales.

---

## 5. Elementos Flotantes y Navegación Reactiva

### 5.1 Barra Inferior Flotante de Conversión Rápida
* **Ubicación:** `fixed inset-x-0 bottom-0 z-[110] md:left-[44%]`.
* **Comportamiento:** Se muestra durante el scroll editorial y se oculta automáticamente al llegar a `#cierre` para no competir con el botón final.
* **Contenido:**
  * Texto izquierdo: `Reserva con USD 1.000 · Congela el precio de preventa hoy`.
  * Botón derecho: `[ Compartir ]` con icono de Share y feedback de copiado.

### 5.2 Burbuja Flotante de Navegación de Secciones
* **Estado cerrado:** Botón circular negro elegante (`h-11 w-11 rounded-full`) con solo el icono dorado `Menu` (`☰`), sin texto visible.
* **Estado abierto:** Muestra icono `X` dorado de cierre y despliega el menú.
  * Backdrop semitransparente que intercepta clics externos para cerrar.
  * Tarjeta flotante con efecto glassmorphism (`w-72`) que lista las 8 secciones con sus iconos correspondientes.
  * **Indicador en vivo:** Resalta con fondo dorado la sección exacta donde el usuario se encuentra leyendo.
  * Al hacer clic en cualquier sección, se realiza scroll suave y el menú se repliega.
  * Al subir de nuevo a la parte superior de la página, la burbuja desaparece automáticamente.

### 5.3 Controles disponibles
Las landings ofrecen brochure, compartir y cerrar. No incluyen Insights ni un modo asesor.

---

## 6. Integraciones Técnicas, Enrutamiento y Tracking

1. **Enrutamiento y URLs Amigables por Proyecto:**
   * Cada desarrollo inmobiliario cuenta con un enlace personal directo y limpio:
     * *Bless Tower:* `nia-web.com/bless-tower` (o `/blesstower`)
     * *Bless Drei:* `nia-web.com/bless-drei` (o `/blessdrei`)
     * *Garden Zen:* `nia-web.com/gardenzen` (o `/garden-zen`)
     * *Tower Eurodesign:* `nia-web.com/eurodesign`
     * *ONA Residences:* `nia-web.com/ona`
     * *Línea DOMUS:* `nia-web.com/domus/[slug]` (ej. `/domus-black`, `/domus-lux`)
   * La entrada directa abre de inmediato la landing correspondiente con sus datos sintéticos cargados en 0 ms sin esperar la respuesta de red del catálogo general.
   * El botón `Compartir` genera y copia siempre este enlace limpio.
   * Al cerrar la landing, la URL vuelve suavemente a `/` sin recarga de página.
2. **Google Sheets Live Inventory:**
   * Archivo CSV público de Google Sheets con columnas: `UNIDAD`, `PISO`, `TIPO`, `M2_TOTAL`, `ESTADO`, `PRECIO_CONTADO`, `PRECIO_CUOTAS`.
   * Cache local y fallback automático a inventario estático baseline para garantizar 100% de disponibilidad aún si el sheet tiene celdas eliminadas temporalmente.
3. **Meta Pixel & Lead Tracking:**
   * Disparo de evento `PageView` al entrar.
   * Disparo de evento `Lead` inmediatamente al presionar el botón de reserva por WhatsApp.
   * Registro en el backend de N.I.A mediante `recordLeadEvent({ action: "contact_tap", ... })`.
4. **Web Share API:**
   * Utilizar `navigator.share` nativo para teléfonos móviles y `navigator.clipboard.writeText` con mensaje de confirmación para navegadores de escritorio.

---

## 7. Reglas de Presentación Financiera y Cotizador (Obligatorias)

1. **Formato "USD arriba, número abajo":**
   * En todas las tarjetas de resumen financiero (Inversión Total, Reserva Inicial, Cuota Inicial, Saldo contra Entrega), mantener siempre la etiqueta `USD` arriba en tamaño pequeño/mono y el número formateado en la línea siguiente:
     ```html
     <span className="block text-xs font-mono font-normal text-stone-400">USD</span>
     <span className="block mt-0.5">{formatUsd(totalPrice)}</span>
     ```
2. **Saldo contra Entrega en Pago al Contado:**
   * Cuando el plan seleccionado sea Al Contado, **nunca mostrar `$0` ni ceros confusos**.
   * Debe mostrarse `USD` arriba, un guión em-dash `—` abajo, y la leyenda descriptiva `Sin saldo pendiente`.
3. **Selector de Parqueo Directo:**
   * No usar menús desplegables (`<select>`) confusos. Implementar un checkbox / toggle directo: `[x] Añadir Parqueo Vehicular`. Si hay opciones (simple vs con baulera), desplegar tarjetas seleccionables directas ya marcadas.
4. **Planos y Modelos Reales:**
   * No añadir submenús artificiales que desglosen cocina, dormitorio o baño individualmente a menos que se cuente con un render 3D corte real por ambiente. Mostrar directamente el plano arquitectónico general del modelo de departamento extraído del material oficial.

---

## 8. Checklist de Calidad para Futuros Proyectos

Antes de publicar cualquier nueva landing basada en este estándar, verificar:

- [ ] ¿Los botones superiores son exactamente 3 iconos circulares (brochure, compartir y cerrar), sin etiquetas de texto?
- [ ] ¿El botón "Inicio" de la barra de navegación se desplaza al `#intro` sin recargar la página ni cerrar la landing?
- [ ] ¿El botón flotante de secciones es circular y solo muestra el icono (`Menu`/`X`), sin texto?
- [ ] ¿El panel derecho en escritorio utiliza anchos amplios (`md:max-w-3xl lg:max-w-4xl xl:max-w-5xl`) sin comprimir tarjetas a 3 columnas?
- [ ] ¿En celular la vista se mantiene compacta e intacta (`max-w-xl`) con botones fácilmente pulsables con el pulgar?
- [ ] ¿El formato financiero tiene "USD arriba, número abajo" en todas las columnas?
- [ ] ¿Al seleccionar pago al contado el saldo contra entrega muestra "—" y "Sin saldo pendiente"?
- [ ] ¿El selector de parqueo es directo con checkbox/toggle sin menús desplegables innecesarios?
- [ ] ¿Las pruebas unitarias y el build de Vite (`npm run build`) compilan sin errores?
