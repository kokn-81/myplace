# N.I.A · Estructura de landing

**Versión:** 2.1

**Referencia que se copia:** `frontend/src/components/BetonBrutLanding.tsx` (Béton Brut II).  
**Este archivo manda.** Si una versión anterior de esta guía, o una landing vieja, pide otra cosa, se ignora.

**Qué copia la IA de estructura.** El cascarón, el orden, los botones, los marcos y el flujo.  
**Qué no copia.** Las oraciones. Los textos comerciales los escribe otra persona. No reescribir títulos, párrafos ni el cierre. No inventar precios, seña, acabados, cargos ni metrajes.

Los datos del proyecto (nombre, dirección, fecha de entrega, precios, unidades, fotos, logos, PDF) entran en los huecos marcados con `{así}`. Si un dato no está en el material oficial, el hueco se omite. No se rellena con un número inventado.

---

## 0. Regla de una pantalla

1. **Fondo** `#f7f5f0`. **Acento** `#9a7b45`. **Acento oscuro** `#816127`. **Tinta clara** `#e8d5a8`. **Título** `#1C1917`. **Texto** `#57534E`.
2. **Esmeralda** solo para disponible, copiado y el número de cuota inicial. No se usa `#EA580C`, `#2d6a4f` ni verde de WhatsApp en botones.
3. **Móvil:** una columna, scroll único. **Escritorio:** foto fija a la izquierda `md:h-screen md:w-[44%]` y panel derecho `md:h-screen md:overflow-y-auto`. Prohibido `42vh / 58vh`.
4. **Raíz:** `fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-[#f7f5f0] font-sans text-stone-900 md:flex-row md:overflow-hidden`.
5. **Panel derecho, contenedor interior:** `mx-auto max-w-xl px-5 py-8 pb-32 md:max-w-3xl md:px-10 md:py-14 md:pb-44 lg:max-w-4xl lg:px-14 xl:max-w-5xl`.
6. **Orden fijo de secciones**, con estos `id` y estas etiquetas de menú:

| id | Etiqueta del menú |
| :--- | :--- |
| `intro` | Inicio |
| `lugar` | Ubicación |
| `amenidades` | Áreas sociales |
| `tipologias` | Tipologías |
| `equipamiento` | Equipamiento |
| `constructora` | Colaboradores |
| `pago` | Formas de pago |
| `disponibilidad` | Disponibilidad |
| `cierre` | Cierre |

7. Toda sección después de `#intro` abre con `mt-20 border-t border-stone-200/80`. `#intro` no lleva borde superior. El `pt` es `pt-10`, salvo `#tipologias` y `#disponibilidad`, que usan `pt-6` porque su bloque cabe sobre la barra.
8. Cada sección, menos el visor, tiene ceja, título y cuerpo en este orden. La ceja es `text-xs font-semibold uppercase tracking-wider text-[#9a7b45]`. El título de sección es `font-serif text-2xl font-light text-[#1C1917] md:text-3xl`, salvo el `h2` de `#intro` y los títulos de `#tipologias` y `#disponibilidad`, que van en `text-2xl` sin subir a `md:text-3xl`.
9. **No hay Insights.** No hay botón, modal ni modo asesor.
10. **No hay plusvalía.** La cotización tiene tres columnas. No hay cuarta columna, ni porcentaje de ganancia, ni “valor a la entrega”.

---

## 1. Capas fijas (de atrás hacia adelante)

| Capa | z | Dónde | Cuándo se ve |
| :--- | :--- | :--- | :--- |
| Cascarón | `z-[100]` | pantalla completa | siempre |
| Barra inferior | `z-[110]` | `fixed inset-x-0 bottom-0 md:left-[44%]` | se oculta solo cuando la sección activa es `cierre` |
| Compartir y cerrar | `z-[120]` | `fixed right-4 top-4 md:right-7 md:top-7` | siempre. Cerrar solo si la landing se abrió encima del mapa |
| Menú de secciones | botón `z-[125]` / `z-[128]`, lista `z-[115]` | `fixed bottom-20 right-4 sm:right-6 md:right-8` | el botón aparece cuando la navegación de `#intro` ya pasó (`bottom < 80`). Al volver arriba, el botón y la lista se esconden |
| Visor | `z-[140]` | `fixed inset-0` | al tocar un departamento, su planta, la ficha o la distribución de pisos |

Nada de la barra tapa el departamento. `#tipologias` y el paso 1 de `#disponibilidad` miden `h-[calc(100svh-7.25rem)]` para terminar arriba de la barra.

---

## 2. Botones que existen

No se agregan otros controles flotantes. No se mueve un botón de esta lista a otra esquina.

| Botón | Lugar | Acción |
| :--- | :--- | :--- |
| Compartir | círculo blanco `h-10 w-10` arriba a la derecha | comparte la URL limpia `/{slug}`. Si no hay share nativo, copia el texto y la URL. El ícono pasa a check esmeralda 2,2 s. No va en la barra |
| Cerrar (X) | círculo blanco al lado de Compartir | cierra la ficha y vuelve al mapa, sin recargar. Si la landing es la página entera, este botón no se renderiza |
| Brochure | enlace con borde, en `#intro` y en la barra | abre el PDF oficial en pestaña nueva. No va arriba |
| Ver disponibilidad y cotizar | botón negro `bg-[#1C1917]` en `#intro` | scroll a `#disponibilidad` |
| Pastillas de `#intro` | fila bajo “Navegación del proyecto” | Inicio va negro. Las otras siete (Ubicación a Disponibilidad) van blancas con borde. Cierre no está en esta fila |
| Elegir unidad | botón negro de la barra | scroll a `#disponibilidad` |
| Elegir mi departamento | botón negro al final de `#pago` | scroll a `#disponibilidad` |
| Menú circular | negro, ícono `#e8d5a8`, `h-11 w-11`, `bottom-20` | abre las nueve secciones. La activa usa `bg-[#9a7b45]/15` y texto `#816127` |
| Flechas del modelo | círculos blancos sobre la foto del departamento | modelo anterior / siguiente. También deslizar: más de 40 px |
| Foto del departamento | toda el área de la imagen | abre el visor en Departamento |
| Franja “En el piso” | pie de la tarjeta del modelo, `h-[4.75rem]`, `pr-16` para no chocar con el menú | abre el visor en Planta |
| Filtro de dormitorios | una fila de tres | cambia el carrusel y selecciona la primera planta libre de ese grupo |
| Piso | grilla `grid-cols-3 sm:grid-cols-5` | elige la unidad. Vendida: deshabilitada y gris |
| Ver distribución de pisos | texto `#816127` a la derecha de “Paso 2 · Piso” | abre el visor en modo solo, con el esquema del edificio |
| Adicional | tres tarjetas | ninguna / parqueo / moto, solo si el material publica precio |
| Plan de pago | dos tarjetas en el paso 4 | contado o plan en cuotas. La elegida es negra |
| Quiero la unidad {código} | botón claro de ancho completo, dentro de la cotización negra | WhatsApp con la unidad, el adicional, el plan y los tres montos |
| Hablar con un asesor | enlace `#816127` en `#cierre` | el mismo WhatsApp |
| Cerrar vista | círculo blanco del visor | cierra el visor |
| Departamento / Planta / Ficha | tres pastillas del visor | cambian la imagen. No aparecen cuando el visor muestra solo el esquema del edificio |

El botón primario es `rounded-xl bg-[#1C1917]` con texto blanco en mayúsculas chicas. No lleva hover verde de WhatsApp.

---

## 3. Columna izquierda (hero)

La foto no cambia con el scroll. Ocupa toda la columna, de borde a borde, en `object-cover`. No hay bloque de color debajo ni al lado. No hay fondo `#e8e6e3` ni panel negro, naranja, chocolate o verde en esa columna.

El oscurecido es solo un degradado sobre la zona del texto, pegado al pie: `pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/75 via-black/35 to-transparent`. Arriba la fachada queda clara.

La columna es `relative flex shrink-0 flex-col justify-end overflow-hidden md:h-screen md:w-[44%]`, con `style={{ minHeight: "100svh" }}`. En el teléfono la foto llena la primera pantalla. El texto va al pie, con `pb-24 lg:pb-7`, para quedar encima de la barra.

Sobre la foto, en este orden:

1. Pastilla `bg-black/55` con la fase o la preventa, y otra con el pin y la zona. La tinta de la pastilla es `#e8d5a8`.
2. `h1` con el nombre del edificio. La primera palabra va blanca. El resto va `#e8d5a8`. No es “Vive en…”. Ese título vive en el `h2` del panel derecho.
3. Una línea corta que ya exista en el proyecto. No se inventa otra.
4. Dos fichas de vidrio en fila (`flex`, no `grid`): Entrega y Constructora. Si el proyecto ya dice Colaborador, esa ficha conserva esa palabra. Fondo `bg-black/40 backdrop-blur`, borde `border-white/15`.
5. Tarjeta `bg-black/55`: “Departamentos disponibles”. Cada tipo muestra el rango de m² calculado con las unidades y “Desde USD” del contado. Si no hay libres, “Agotado”. Se ve en teléfono y en escritorio. No dice “en vivo”.

No hay logo sobre un rectángulo de color. Compartir y Cerrar siguen arriba a la derecha de la pantalla. Brochure no va en esta columna.

---

## 4. Panel derecho, sección por sección

El texto de cada hueco lo trae el redactor. La estructura no se mueve para hacerle sitio.

### `#intro`

1. Ceja.
2. `h2` `font-serif text-3xl md:text-5xl`: siempre `Vive en {nombre del edificio}.` En la línea de abajo, una frase en itálica `#9a7b45`. Esa segunda línea no reemplaza a “Vive en”.
3. Un párrafo.
4. Tarjeta blanca: fecha de la lista, unidades vendidas, pastilla esmeralda con las que quedan.
5. Botón negro “Ver disponibilidad y cotizar” y botón blanco “Brochure”.
6. “Navegación del proyecto” y las pastillas del apartado 2.

### `#lugar`

1. Ceja, título, párrafo.
2. Mapa o plano oficial dentro de `overflow-hidden rounded-2xl border bg-white`. La imagen es `block h-auto w-full`. No `object-cover`. No `max-w-md`. El texto no va encima de la imagen.
3. Enlace `#816127` al mapa externo.

### `#amenidades`

1. Ceja, título, párrafo. Van arriba de la foto. No tapan la foto.
2. Una tarjeta. Arriba, foto `aspect-[16/10] object-cover`. Flechas blancas `h-9 w-9` a los lados. Si el brochure trae el nombre del ambiente impreso en la foto, se recorta para no repetir el rótulo.
3. Debajo de la foto: categoría, título, una línea.
4. Puntos: el activo es `w-6 bg-[#9a7b45]`; el resto, `w-1.5 bg-stone-300`.

### `#tipologias`

El bloque entero es `flex h-[calc(100svh-7.25rem)] flex-col gap-3`.

1. Ceja y título, `shrink-0`.
2. Filtro de dormitorios en una sola fila de tres. El activo lleva `border-[#9a7b45] ring-1 ring-[#9a7b45]`.
3. `ModelFrame` con `min-h-0 flex-1`. Ocupa el resto y termina arriba de la barra.

No se listan las plantas en una grilla larga. Un carrusel. Flechas y deslizamiento. Al cambiar de modelo cambia la foto y, si está en disponibilidad, el precio desde.

### `#equipamiento`

1. Ceja, título, párrafo.
2. Grilla `grid-cols-1 sm:grid-cols-2 gap-4`.
3. Cada grupo es una tarjeta: foto arriba, lista oficial abajo. La foto normal es `h-[210px] object-cover`. Si la pieza es vertical y el recorte la parte, esa tarjeta usa `max-h-[320px] object-contain`.
4. No se deja una lista suelta, sin foto.

### `#constructora`

1. Ceja con la palabra que usa el brochure (`Colaboradores` o `Constructora`). No se inventa un cargo.
2. Logo del proyecto en negro, `h-14`.
3. Título y un párrafo.
4. Grilla `sm:grid-cols-3`. Cada logo va centrado en una tarjeta blanca `min-h-36`.
5. Enlace externo al sitio del proyecto, si existe.

### `#pago`

1. Ceja, título, párrafo.
2. Una tarjeta por plan publicado. La primera es negra `bg-stone-900`, con pastilla `bg-[#C19A6B]` y el precio en `#E8D5A8`, en USD/m². Las siguientes son blancas, con el precio en `#1C1917`.
3. El título de un plan en cuotas nombra las tres partes que publique el material: inicial, cuotas, saldo contra entrega. Si el material tiene dos planes, hay dos tarjetas. No se inventa un tercero.
4. Una nota blanca para adicionales con precio publicado. Si un adicional no tiene precio, no entra en la cotización. Puede nombrarse como consulta, sin número.
5. Botón negro hacia `#disponibilidad`.
6. Aquí no se muestra la cuota en dólares de una unidad todavía no elegida.

### `#disponibilidad`

Arriba, un bloque `h-[calc(100svh-7.25rem)]` con título, una línea de la fecha de la lista, el filtro de dormitorios y el mismo `ModelFrame`. En este frame sí se muestra el precio “Desde USD” o “Vendido”.

Debajo, fuera de ese alto, los pasos 2, 3 y 4, con `space-y-6` entre bloques.

**Paso 2 · Piso.** A la derecha, “Ver distribución de pisos”. Grilla de unidades. Libre: `border-emerald-200 bg-emerald-50 text-emerald-800`. Elegida: `bg-stone-900 text-white`. Vendida: `bg-stone-100 text-stone-400`, sin click. El rótulo es `Piso {n}` y `Unidad {código}`. Si el código es piso + letra, no se muestra la letra sola: 1D, 2D y 3D se leen como dormitorios.

**Paso 3 · Adicional.** Tres opciones como máximo: sin adicional, parqueo, moto. Solo las que tengan precio. La elegida es negra.

**Paso 4 · Plan.** Una tarjeta por plan. La elegida es negra.

**Unidad vendida.** Aviso gris. No se calcula precio. No se muestra un número que la lista no publicó.

**Cotización**, solo si la unidad está libre. Tarjeta negra. Tres columnas, en este orden:

1. Inversión total. `USD` arriba, número abajo.
2. Cuota inicial. Número en esmeralda. `USD` arriba.
3. Saldo contra entrega. En contado, el número es `—` y la línea dice “Sin saldo pendiente”. Nunca `USD 0`.

Debajo, el botón “Quiero la unidad {código}”.

La fuente de estos números es una sola. Hoy es la lista oficial con fecha. No se escribe “en vivo” ni se simula una sincronización. Cuando exista un Excel, los mismos cuatro pasos y la misma tarjeta leen esa hoja. No se dibuja una segunda disponibilidad.

### `#cierre`

Centrada. Título, un párrafo, enlace “Hablar con un asesor”. `pb-16`. Al entrar aquí la barra inferior desaparece.

---

## 5. Tarjeta del departamento (`ModelFrame`)

Una sola tarjeta, usada en `#tipologias` y en el paso 1.

1. Cabecera: nombre del modelo en mayúsculas `#9a7b45`, metros y ubicación, una línea de detalle, y en disponibilidad el precio desde. A la derecha, `{n}/{total}` resaltado como indica la actualización de Codex de abajo.
2. Foto del departamento completo, `object-contain`, centrada, con margen blanco dentro del archivo. El balcón y el ala de servicio no tocan el borde del JPEG ni quedan debajo de la barra. No se usa la hoja entera del brochure como miniatura.
3. Flechas solo si hay más de un modelo en el filtro.
4. Franja “En el piso”: miniatura de la planta (`h-14 w-16`) y el texto de esa franja. `pr-16` para dejar libre el menú circular.

> **Comentario de Codex · Actualización del 8 de noviembre de 2026: contador de modelos.**
>
> Por indicación del usuario, el contador `1/10` debe destacar para que se entienda que hay varios modelos para recorrer. Se aplica tanto en **Tipologías** como en **Disponibilidad**, usando el mismo `ModelFrame` en las dos secciones.
>
> Presentarlo como una pastilla informativa: número en dorado oscuro `#816127`, fondo claro `#f7f5f0` y borde dorado `#9a7b45` al 40%. Tamaño de **16 px en móvil y 18 px desde `sm`**, negrita y cifras tabulares. Mantenerlo arriba a la derecha, sin comprimir la foto del departamento. Referencia: `min-w-[4.25rem] rounded-full border border-[#9a7b45]/40 bg-[#f7f5f0] px-3 py-1.5 text-center text-base font-bold leading-none tabular-nums text-[#816127] shadow-sm sm:text-lg`.
>
> Es un indicador, no un botón. Conserva el índice y el total reales del filtro elegido y se actualiza al cambiar de modelo. Está en ONA, Béton Brut II, Vertical Güemes, Tower Eurodesign, Bless Tower, Bless Drei, Trivento IV y las siete landings Domus. Garden Zen usa la misma pastilla con su chocolate: texto `#5c2414`, fondo `#f8f1e7`, borde `#7a3218` al 40%.

Archivos: vista del departamento en `/…/modelos/{id}.jpg`. Planta, con la unidad marcada, en `/…/planos/{id}.jpg`. Ficha completa del brochure en `/…/fichas/{id}.jpg`.

---

## 6. Visor

`fixed inset-0 z-[140] flex flex-col bg-[#f7f5f0]`. Tapa la barra.

1. Título, una o dos líneas de detalle, botón cerrar.
2. Si es un departamento: pastillas Departamento, Planta, Ficha. La activa es negra.
3. La imagen en `max-h-full max-w-full object-contain`, centrada en el alto que queda.
4. El esquema del edificio usa el mismo visor sin pastillas (`view: solo`).

---

## 7. Barra inferior

`fixed inset-x-0 bottom-0 z-[110] border-t bg-[#f7f5f0]/95 backdrop-blur-md md:left-[44%]`.

Izquierda: `Desde USD {precio más bajo} · {entrega}`. Debajo, en `sm` o más, una línea corta sobre la reserva. Si el material no publica el monto de la seña, esa línea no inventa un número.

Derecha: Brochure y Elegir unidad.

Se oculta cuando `activeSection === "cierre"`.

---

## 8. Datos que la estructura puede mostrar

1. Precios, metrajes, estados y adicionales salen del material oficial. Una unidad vendida sin precio publicado no muestra un número.
2. Parqueo y moto van fuera del precio por metro.
3. El mensaje de WhatsApp lleva unidad, piso, modelo, metros, adicional, plan y los tres montos de la cotización. Se registra el lead al tocar.
4. Compartir usa `https://{origen}/{slug}`, no una URL de otro proyecto.
5. La portada del mapa y la imagen OG usan la misma fachada completa.

---

## 9. Prohibido, aunque otra landing vieja lo tenga

- Insights o modo asesor.
- Tres círculos arriba (descarga, compartir y cerrar). Arriba solo van Compartir y, si aplica, Cerrar.
- Compartir dentro de la barra inferior.
- Brochure arriba a la derecha.
- Hero que cambia de foto al hacer scroll.
- Paleta naranja, verde de marca o botones verde WhatsApp.
- Partir el escritorio en 42 / 58.
- Caja de “lista de precios” al lado de Entrega. Ahí va la constructora, o el colaborador si el proyecto ya usa esa palabra.
- Bloque de color debajo o al lado de la fachada. La portada es la foto, con degradado solo donde va el texto.
- Plusvalía proyectada o cuarta columna en la cotización.
- Escribir “en vivo” si no hay Excel conectado.
- Inventar seña, precio de baulera, acabado o cargo.
- Recortar el departamento para que quepa. Se encoge con `object-contain` dentro del marco, con margen.
- Usar la hoja completa del brochure como miniatura de tipología.
- Poner el texto de una sección encima de su foto.
- Saltar de `#tipologias` a `#disponibilidad` al tocar la foto. Esa foto abre el visor.

---

## 10. Lista de control antes de dar por copiada la estructura

1. Escritorio 44 / 56. Móvil, una columna. La fachada llena la columna. El texto va sobre un degradado al pie. No hay bloque de color.
2. Arriba a la derecha: Compartir y, si aplica, Cerrar. Nada más.
3. Barra inferior: desde, entrega, Brochure, Elegir unidad. Oculta en `#cierre`. Sin compartir.
4. Menú circular negro escondido hasta pasar la navegación de `#intro`.
5. Nueve secciones, en el orden de la tabla del apartado 0.
6. `h2` de `#intro` empieza con “Vive en {nombre}.”
7. `#tipologias` y el paso 1 muestran el departamento entero y la franja de planta, arriba de la barra.
8. El visor tapa la pantalla y tiene Departamento, Planta y Ficha.
9. `#disponibilidad` tiene cuatro pasos y una cotización de tres columnas. Contado muestra `—` en el saldo.
10. No hay Insights, no hay plusvalía, no hay “en vivo” si no hay Excel.
