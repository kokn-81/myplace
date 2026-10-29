# N.I.A · Estándar de Diseño y Arquitectura para Landings de Proyectos Inmobiliarios
**Versión:** 1.0  
**Referencia Maestra:** *ONA Residences* (`OnaLanding.tsx` & `onaInventory.ts`)  
**Propósito:** Especificación técnica, comercial y visual obligatoria para estandarizar el desarrollo de futuras landings inmersivas de proyectos inmobiliarios en N.I.A.

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
| **Alert / Private (Ámbar)** | `#B45309` / `#FFFBEB` | Módulo de Insights privados de asesor y objeciones comerciales. |

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
│  HEADER FLOTANTE SUPERIOR DERECHO (Solo Iconos: Insights, PDF, Share, X)│
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
│ • Drawer modal privado de Insights de Asesor                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Especificación Detallada Sección por Sección

### Controles Superiores Flotantes (`fixed right-4 top-4 md:right-7 md:top-7 z-[120]`)
* **Formato:** Conjunto de 4 botones circulares idénticos (`h-10 w-10`), fondo `bg-white/95 backdrop-blur`, borde `border-stone-200`, sombra `shadow-xl`.
* **Botones requeridos:**
  1. `TrendingUp` (color `#9A7B45`): Abre el modal privado de *Insights Asesor*.
  2. `Download` (color `#9A7B45`): Descarga directa del brochure oficial en PDF.
  3. `Share2` (color `stone-800`): Copia link con feedback visual `Check` en verde.
  4. `X` (color `stone-700`): Cierra la landing y regresa a la búsqueda del mapa.

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

#### 3. Sección Áreas Sociales & Bienestar (`#amenidades`)
* **Carrusel visual de amenidades:** Fotos reales/renders con títulos, categorías y descripciones claras.
* **Navegación:** Flechas circulares anterior/siguiente y puntos indicadores inferiores.
* **Equipamiento de áreas comunes:** Lista detallada de lo que incluye cada espacio (mobiliario de diseño, climatización, parrillas de acero inoxidable, sonido ambiental).

#### 4. Sección Tipologías Residenciales (`#tipologias`)
* Tarjetas para cada tipología (ej. 1 Dormitorio 32 m², 2 Dormitorios 54 m², 2 Dormitorios Suite 92 m²).
* Datos expuestos:
  * Superficie construida y metraje de balcón.
  * Orientación y tipo de vista.
  * Precio base contado y precio por m².
  * Estimación conservadora de alquiler mensual en USD y rentabilidad anual proyectada (%).

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

#### 7. Sección Formas de Pago Transparentes (`#pago`)
* 3 Tarjetas de planes financieros:
  1. **Contado (100%):** Máximo descuento por m².
  2. **Plan 60/40:** 60% durante la obra en cuotas y 40% a la entrega en Junio 2028.
  3. **Plan 40/60:** 40% durante la obra y 60% contra entrega (apto crédito bancario).
* **Muestra destacada de la Cuota Inicial:** Exponer con tipografía clara el valor monetario en USD y el porcentaje de cuota inicial requerido.
* **Cronograma de hitos:**
  * Hito 1: Reserva con USD 1.000 (congela precio y unidad).
  * Hito 2: Cuota inicial a la firma de contrato de preventa.
  * Hito 3: Saldo contra entrega de llaves.

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
* **Paso 4:** Selección de Plan de Pago con recálculo dinámico de:
  * Inversión Total (Unidad + Parqueo).
  * Cuota Inicial requerida.
  * Saldo contra entrega.
  * Valor estimado del m² a la entrega y plusvalía neta en USD.
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
* **Condición de activación:** Cuando la barra de opciones inicial de `#intro` se desplaza fuera de la pantalla (scroll hacia abajo), emerge una burbuja flotante en `bottom-20 right-4 sm:right-6 md:right-8 z-[125]`.
* **Estado cerrado:** Píldora negra elegante con acento dorado: `[ ☰ Secciones ]`.
* **Estado abierto:**
  * Backdrop semitransparente que intercepta clics externos para cerrar.
  * Tarjeta flotante con efecto glassmorphism (`w-72`) que lista las 8 secciones con sus iconos correspondientes.
  * **Indicador en vivo:** Resalta con fondo dorado la sección exacta donde el usuario se encuentra leyendo.
  * Al hacer clic en cualquier sección, se realiza scroll suave y el menú se repliega.
  * Al subir de nuevo a la parte superior de la página, la burbuja desaparece automáticamente.

### 5.3 Módulo Privado "Insights Asesor"
* Modal protegido accesible desde el botón superior `TrendingUp`.
* **Objetivo:** Equipar al asesor de ventas de N.I.A con información comercial estratégica que no debe saturar la landing del cliente:
  * Argumentario de venta clave (por qué comprar en este proyecto).
  * Manejo de objeciones transparente (ej. fecha de entrega, competencia de la zona).
  * Tabla de plusvalía y rendimientos brutos proyectados por m² al momento de la entrega.

---

## 6. Integraciones Técnicas y Tracking

1. **Google Sheets Live Inventory:**
   * Archivo CSV público de Google Sheets con columnas: `UNIDAD`, `PISO`, `TIPO`, `M2_TOTAL`, `ESTADO`, `PRECIO_CONTADO`, `PRECIO_PLAN60`, `PRECIO_PLAN40`.
   * Cache local en `localStorage` con timestamp para optimizar velocidad y evitar rate-limits.
2. **Meta Pixel & Lead Tracking:**
   * Disparo de evento `PageView` al entrar.
   * Disparo de evento `Lead` (`trackOnaLead` / `fbq('track', 'Lead')`) inmediatamente al presionar el botón de reserva por WhatsApp.
   * Registro en el backend de N.I.A mediante `recordLeadEvent({ action: "contact_tap", ... })`.
3. **Web Share API:**
   * Utilizar `navigator.share` nativo para teléfonos móviles y `navigator.clipboard.writeText` con mensaje de confirmación para navegadores de escritorio.

---

## 7. Checklist de Calidad para Futuros Proyectos

Antes de publicar cualquier nueva landing basada en este estándar, verificar:

- [ ] ¿Los botones superiores son exactamente 4 iconos circulares limpios sin etiquetas de texto?
- [ ] ¿El botón "Inicio" de la barra de navegación se desplaza al `#intro` sin recargar la página ni cerrar la landing?
- [ ] ¿La burbuja flotante `[ ☰ Secciones ]` aparece únicamente cuando la barra de navegación principal se pierde de vista?
- [ ] ¿El panel derecho en escritorio utiliza anchos amplios (`md:max-w-3xl lg:max-w-4xl xl:max-w-5xl`) sin comprimir tarjetas a 3 columnas?
- [ ] ¿En celular la vista se mantiene compacta e intacta (`max-w-xl`) con botones fácilmente pulsables con el pulgar?
- [ ] ¿Las cuotas iniciales del Plan 60/40 y Plan 40/60 se muestran de manera explícita en dólares?
- [ ] ¿El selector de parqueo está ubicado después de elegir departamento y piso (flujo Apple Store)?
- [ ] ¿La tipografía de títulos es `Playfair Display` y los textos de cuerpo están justificados?
- [ ] ¿Se eliminó cualquier botón redundante o descarga PDF no indispensable en las secciones interiores?
- [ ] ¿Las pruebas unitarias y el build de Vite (`npm run build`) compilan sin errores?
