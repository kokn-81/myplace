# Revisión comercial e imágenes de DOMUS

Revisión del 8 de noviembre de 2026. Incluye las siete landings del grupo Alborada: Black, Gold, Onix, Insignia, Luxury, Tower e Infinity.

## Textos corregidos

Se reescribieron la presentación, los títulos y subtítulos de las secciones, los párrafos comerciales, las descripciones de áreas sociales, las explicaciones de pago y los llamados a contactar. Cada edificio tiene textos propios. Se conservaron la estructura, las imágenes, el inventario y los cálculos del cotizador.

El enfoque es mostrar qué aporta cada espacio a la vida del comprador. Se evitaron promesas de rentabilidad o plusvalía, y no se presentó el amoblamiento opcional como incluido. Las características de equipamiento se contrastaron con los brochures; el alcance que depende de la superficie o del modelo se aclara en el texto.

También se corrigieron etiquetas que describían otra cosa: la sala de billar de Black dejó de llamarse piscina y la sala de reuniones de Insignia dejó de llamarse cine. Esto corrige el texto; aún hay que incorporar las imágenes de piscina y cine que faltan.

## Prioridades

1. **Black, Gold, Onix e Insignia — resuelto en código:** se asociaron las imágenes oficiales con cada familia de modelos y se completaron ubicación, equipamiento, áreas sociales y portafolio.
2. **Luxury, Tower e Infinity:** incorporar planos por modelo; actualmente el visor muestra una indicación de consulta en lugar del departamento.
3. **Onix — actualizado el 12 de noviembre:** vistas completas, 17 modelos cubiertos y disponibilidad conectada a la pestaña exacta aportada por el usuario.
4. Incorporar ubicación y equipamiento, y mejorar las fachadas de menor resolución.

## Estado por proyecto

### [DOMUS Black](https://nia-web.com/domus-black)

**Actualización con el material aportado por el usuario:** se resolvieron los pendientes visuales de esta sección. Las 31 variantes del inventario se relacionan con 13 familias oficiales A–M. Cada familia tiene departamento completo, planta con su ubicación y ficha individual con plano 2D. Se incorporaron la ubicación de la página 5, el corte del edificio de la página 7, diez imágenes de áreas sociales, el equipamiento de las páginas 27 y 29 y el portafolio de Alborada de la página 2. La siguiente lista conserva los hallazgos de la revisión inicial como antecedente.

La ubicación se corrigió con [el pin confirmado por el usuario](https://maps.app.goo.gl/YT5FEU6qL7Z43ohC8): latitud −17,7592768 y longitud −63,1938648. Se retiró la dirección anterior de Enrique Finot y se conserva «Equipetrol Norte» como referencia de zona, sin inventar una dirección postal. La entrega de noviembre de 2028 procede del afiche aportado por el usuario.

Validación de esta actualización de Black: 54 imágenes verificadas, 99 pruebas aprobadas, tipos y compilación correctos. Las nueve secciones se conservan y el HTML generado de los otros seis DOMUS coincide con la versión anterior. Los datos de unidades, precios y funciones de cotización no cambiaron.

**Criterio ante las erratas del brochure:** E aparece como un dormitorio en la página 33, pero su plano individual y el inventario lo identifican como monoambiente; F figura con 55,20 m² en el brochure y con 52,20 m² en los planos y en el inventario; la fila I de la página 34 repite por error el código A. Se mantienen los dormitorios y metrajes de la lista vigente, se usan las fichas individuales correctas y no se altera ningún precio. Del corte de la página 7 se extrajo el edificio, omitiendo el recuadro antiguo de 137 unidades y los rótulos inconsistentes. El cotizador sigue leyendo las 141 unidades del inventario.

**Lo incorrecto**

- El código elige imágenes por cantidad de dormitorios, sin distinguir el modelo. Reutiliza cuatro láminas para 31 combinaciones de modelo y dormitorios.
- Para **un dormitorio** usa `brochure_p03.jpg`: la lámina dice **MONOAMBIENTES C 1-4**, de 30–31 m².
- Para **dos dormitorios** usa `brochure_p04.jpg`: la lámina D 1-2 tiene **un dormitorio**, 44 m².
- Para **tres dormitorios** usa `brochure_p05.jpg`: la lámina dice **MONOAMBIENTE E 1-2**, 33,6 m².
- Incluso entre monoambientes, la imagen de B no representa automáticamente todos los modelos del mismo grupo.
- La sección de equipamiento vuelve a mostrar el recorte del modelo seleccionado, sin mostrar acabados o equipos.

**Qué falta**

- Imagen y plano completos, asociados a cada modelo; planta del piso con la posición de esa unidad cuando corresponda.
- Imagen de la piscina: el carrusel actual tiene billar, gimnasio, parrilla/comedor y lounge. Las etiquetas ya corresponden a lo que muestran.
- Imagen de ubicación y fotos o renders de cocina, baño y dormitorio.

**Qué se puede aprovechar:** la fachada principal es adecuada. Las láminas locales A, B, C, D, E y F son útiles para sus modelos correctos. El [brochure oficial](https://drive.google.com/file/d/16OM2mFA5QhqxfxOrFTMIVRWMVLrxWLPt/view) contiene más tipologías, ubicación y áreas sociales; no hace falta volver a pedir esas mismas páginas.

### [DOMUS Gold](https://nia-web.com/domus-gold)

**Actualización con el material aportado por el usuario:** las 38 variantes del inventario están asociadas a nueve familias oficiales A–I. Cada familia dispone de vista completa del departamento, plano con su posición en el piso y ficha con ambas vistas. Se incorporaron el portafolio de la página 2, el mapa de la página 5, el esquema del edificio de la página 7, diez renders sociales y las láminas de equipamiento de las páginas 23 y 25. La fachada vertical se conserva. Se reescribieron los textos comerciales a partir del brochure, sin promesas de rentabilidad.

La ubicación usa [el pin aportado por el usuario](https://maps.app.goo.gl/PW67vhEjAJqrMzPb8): latitud −17,7702451 y longitud −63,1970063. Se conserva «Equipetrol» como zona, sin inventar una dirección postal. La entrega de noviembre de 2028 procede del afiche del usuario.

**Erratas del brochure:** B, C y E se rotulan como un dormitorio, pero las imágenes y el inventario los identifican como monoambientes. La descripción de I repite un metraje de 153 m² que no corresponde a sus unidades de 73,20–74,70 m². Las páginas de concepto, distribución y acabados tampoco coinciden en los números de los pisos sociales. Los textos no repiten estos datos contradictorios; el cotizador mantiene los dormitorios, superficies y precios del inventario. Los renders son referencias de la familia; la orientación concreta se confirma para cada unidad.

**Furnished — solo Gold y Black, por indicación expresa del usuario:** opción desactivada inicialmente, a USD 150/m² según la página 8 de ambos brochures. Se calcula con la superficie de la unidad seleccionada y se suma al total. La inicial y el saldo del departamento no cambian: la forma de pago del amoblamiento se acuerda por separado con Alborada porque no está publicada. La opción no aparece en los otros cinco DOMUS ni en unidades sin cotización disponible. El contacto de WhatsApp preparado conserva el desglose, sin enviar mensajes automáticamente.

**Servicios especiales de Alborada:** se incorporó un bloque desplegable en los siete DOMUS con cafetería/room service, limpieza, vending, lockers, asistencia y equipaje, carga eléctrica, inflado y lavado. Se indica que disponibilidad, condiciones y cargos deben confirmarse para cada proyecto; no se presentan como servicios gratuitos incluidos.

**Material pendiente opcional:** originales de mayor resolución de los departamentos, si existen. Las imágenes extraídas del PDF comprimido se muestran completas y pueden ampliarse; las variantes de una misma familia comparten el render referencial del brochure.

### [DOMUS Onix](https://nia-web.com/domus-onix)

**Actualización del 12 de noviembre de 2026:** se incorporó el [brochure completo aportado por el usuario](https://drive.google.com/file/d/1x7DKcHymwGKUx9dVC4T-72a1HjKVuFm3/view), de 34 páginas. Los 17 modelos de la lista están asociados a ocho familias oficiales A–H, incluidos los penthouses G1/G2 y H. Cada familia muestra el departamento entero con margen blanco, su posición en la planta y una ficha visual con render, planta e interior. Se conservaron las máscaras de transparencia del PDF; no se usaron los antiguos recortes estrechos. Las variantes comparten el render referencial de su familia.

La fachada vertical limpia se usa en la landing, la tarjeta del mapa y la imagen para compartir. Se añadieron el mapa de la página 4, doce renders sociales, el equipamiento de las páginas 22–23 y el portafolio de Alborada de la página 2. Los textos comerciales describen beneficios y ambientes concretos sin prometer rendimientos. Se conservan las nueve secciones y el mismo visor/carrusel de los demás DOMUS.

La ubicación usa [el pin confirmado por el usuario](https://maps.app.goo.gl/UzmjCM2J1xXhhKS39): latitud −17,7666139 y longitud −63,2044674. Se retiró la dirección postal no verificada y se mantiene «Equipetrol / Sirari». La entrega de agosto de 2028 procede del afiche aportado previamente por el usuario.

**Disponibilidad:** la conexión apunta a la pestaña `875386348` de la [planilla publicada](https://docs.google.com/spreadsheets/d/e/2PACX-1vSp7JjKeLRMUqpFbApzC2JYUPHH0u7Zb0A7k3pzWljtA3kLfU6CZuk0oY8KiFnFDKOId9_iu3CzsovJ/pubhtml#gid=875386348), consultada el 12 de noviembre de 2026. Sus filas contienen **156 unidades y 14 disponibles**; la cabecera dice 158, pero no se inventaron las dos filas faltantes. El mínimo disponible al contado es USD 68.255. Las otras 142 se muestran como «no disponibles», porque la hoja no permite distinguir vendidas de reservadas. Los estados internos conservan el esquema existente y las unidades no disponibles no se cotizan.

**Precios y superficies:** se actualizaron el inventario inicial y la copia de respaldo de Onix con las filas oficiales. Se conservaron los centavos de los totales y de los anticipos, sin cambiar el redondeo de los otros seis DOMUS. Las unidades 404 y 405 incluyen losas exteriores de 59 y 72 m² en la hoja; se muestran por separado dentro de su superficie total y se aclara que el render estándar no las representa. No se calcula una superficie interior por diferencia ni se inventa un precio para una unidad sin importe publicado. Furnished sigue limitado a Gold y Black.

**Diferencias de las fuentes:** el brochure rotula el penthouse G con 151,6 m² y la lista vigente con 155,85 m²; el cotizador usa la lista. Las fichas visuales reúnen las imágenes oficiales sin repetir el metraje impreso antiguo. El brochure describe 22 niveles y áreas sociales en los niveles 3 y 21, mientras la planilla lista departamentos hasta el piso 23 e incluye unidades en el 21. Por ello los nuevos textos comerciales no afirman números de pisos sociales ni un total de niveles. La distribución definitiva debe confirmarse con Alborada; el brochure original sigue accesible.

**Material opcional que mejoraría aún más la ficha:** originales de mayor resolución, planos específicos de las losas de 404/405 y confirmación de la numeración definitiva de niveles. La presentación ya tiene imágenes para todos los modelos y ambientes principales.

**Validación de Onix:** 42 imágenes nuevas verificadas; 111 pruebas aprobadas, revisión de tipos y compilación de producción correctas en una copia aislada de los archivos preparados. Se comprobaron los 42 casos de cotización de las 14 unidades disponibles en los tres planes, incluidos los centavos, los saldos y las losas exteriores. También se verificó que las unidades no disponibles no generan cotización, que el enlace para compartir usa la fachada y el precio inicial correctos, y que los otros seis DOMUS conservan su HTML generado, inventarios, configuración y textos. Las funciones de cotización compartidas permanecen iguales. La validación de HTML generado no equivale a una prueba interactiva de navegador.

### [DOMUS Insignia](https://nia-web.com/domus-insignia)

**Actualización del 12 de noviembre de 2026:** se revisaron las 35 páginas del [brochure aportado por el usuario](https://drive.google.com/file/d/1-iHC0tJkWY7guIcr-PwgXGwi3KC-jloa/view). Los 17 modelos identificados en el catálogo oficial se relacionan con 11 familias A–K, con departamento completo, planta con códigos y ficha visual. Se retiraron los antiguos modelos sin correspondencia con las filas oficiales, incluidos G1/G2 y la asociación incorrecta de I a dos dormitorios. I corresponde a un dormitorio.

Se incorporaron una fachada vertical limpia para landing/tarjeta/imagen compartida, nueve renders sociales, la ubicación de la página 4, las dos plantas de las páginas 22–23, el equipamiento y la domótica de las páginas 9–10 y el portafolio de la página 2. El portafolio muestra los proyectos completos y omite el párrafo antiguo de promesas de plusvalía. Los textos comerciales se reescribieron y se conservaron las nueve secciones, el carrusel y el visor. El brochure identifica **sala de TV**, no un cine; cowork y reuniones tienen ahora sus propias imágenes correctas.

**Disponibilidad vigente:** el enlace publicado abre la pestaña `GLOBAL` (`419071271`), que mezcla varios edificios. El bloque de Insignia contiene solo seis unidades disponibles: **102, 104, 105, 210, 402 y 706**, desde **USD 66.304,10**. La integración limita la lectura a ese bloque; no importa unidades de Luxury o Tower. Se corrigió también el umbral antiguo que descartaba una respuesta de menos de diez unidades. Una sección válida sin unidades disponibles desactiva el stock anterior, sin reponer disponibilidad antigua.

El catálogo detallado de la pestaña histórica `1272616038` aporta **66 unidades únicas y 17 modelos**. Se conserva como referencia de distribuciones; el bloque GLOBAL vigente determina la disponibilidad y todos los precios activos. Los importes históricos de las demás unidades se retiran de la cotización. La cabecera dice 68, pero no se inventaron las dos unidades que no están identificadas. Los 76 registros del inventario anterior no coincidían con las filas oficiales.

**Pago y parqueos:** GLOBAL publica los importes al contado con centavos y deja a cero las columnas del 40% y 60%. El cotizador muestra contado; el texto permite consultar financiación con inicial del 40%, sin inventar un precio para ese plan. Se conservan las dos opciones de parqueo del cotizador con precios publicados: 1–3 y 5–7 a USD 9.000 al contado, y 4 a USD 9.500. Se informa de las opciones 8, 9 y 11 a USD 11.000 y se enlaza la pestaña PARQUEOS (`849054095`). No se ofrece el parqueo 10, marcado vendido, ni se interpreta un estado vacío como stock confirmado. La disponibilidad del parqueo se confirma con Alborada. Furnished sigue limitado a Gold y Black.

**Ubicación y entrega:** la celda UBICACIÓN del bloque Insignia enlaza a [este pin](https://goo.gl/maps/Br2fewKCiKuXeqZ39), que resuelve a −17,768904, −63,197911. Se corrigieron las coordenadas y Calle 7 Este por **Calle 7 Oeste**, zona Plaza Italia. La entrega vigente del bloque es **febrero de 2027**, en lugar de la combinación anterior de 2026/2027. Se omiten el avance porcentual y la seña que estas fuentes no publican.

**Equipamiento y metrajes:** el horno y los roperos están sujetos a la condición de más de 50 m² del brochure; el tipo de cocina también depende de la superficie. Los totales se toman de las filas del catálogo y de GLOBAL, no de rótulos inconsistentes del brochure: B presenta 39,28 m² como total, mientras B1/B2 tienen 45,30/47,34 m²; E1/E2, H1/H2 y J1/J2 tienen variantes de superficie. Las fichas visuales reúnen imágenes oficiales sin copiar esos metrajes impresos. La superficie y orientación se confirman por unidad.

**Material que aún ayudaría:** [la carpeta de renders](https://drive.google.com/drive/folders/13Epge1qYQYpzR9ufCpu2setNTEmJBGHo) solo mostró la subcarpeta «Planos de plantas», sin archivos accesibles dentro. Se utilizaron las imágenes del brochure. Serían útiles los originales de mayor resolución y los planos individuales de cada variante; no quedan modelos sin imagen en la ficha preparada.

**Validación de Insignia:** 39 imágenes nuevas verificadas; 118 pruebas aprobadas, revisión de tipos y compilación de producción correctas sobre una copia aislada de los cambios preparados. Se comprobaron 18 escenarios de cotización al contado con y sin los dos adicionales ofrecidos, las unidades no disponibles y el bloqueo de los planes sin precio. Las nueve secciones se conservan y el HTML generado, la configuración, los textos y los inventarios de los otros seis DOMUS permanecen iguales. Se probaron también respuestas con menos de diez unidades y con una sección válida vacía. Las funciones compartidas de cotización no cambiaron. No se realizó una prueba interactiva de navegador.

### [DOMUS Luxury](https://nia-web.com/domus-lux)

**Lo observado:** piscina, lobby, gimnasio y cine coinciden con los ambientes descritos. La fachada es horizontal, y varias piezas incluyen diagramación del brochure; convendrían versiones limpias para mejorar el encuadre.

**Qué falta**

- Planos e imágenes para las **23 combinaciones de modelo y dormitorios**.
- Conectar la imagen de ubicación, que ya existe como `brochure_p04.jpg`.
- Fotografías o renders de cocina, baño y equipamiento; fachada vertical si está disponible.

**Qué se puede aprovechar:** el [brochure oficial](https://drive.google.com/file/d/1GHxQsjFFDVGW35z-AvQdEOjBgFCHG8nd/view) contiene ubicación, equipamiento y tipologías. Antes de publicar el mapa hay que confirmar la dirección indicada al final de este informe.

### [DOMUS Tower](https://nia-web.com/domus-tower)

**Lo incorrecto o mejorable**

- La fachada activa tiene **660 × 993 px**: conviene un original de mayor resolución para escritorio.
- `social_cowork_pool.jpg` es una página de presentación con texto y piscina, no una fotografía específica del cowork. Su descripción ahora corresponde al conjunto de áreas comunes.
- Hay imágenes de terraza repetidas; no suman ambientes distintos.
- Atención al archivo `fachada_perspectiva_clean.jpg`: muestra un **lobby**, pese al nombre. No está usándose como fachada principal, pero no debería elegirse para ese propósito.

**Qué falta**

- Planos e imágenes para los **14 modelos** A, A-1, B, C, D, E, F, G, H, I, J, K, L y M.
- Conectar el mapa local `brochure_p05.jpg` y conseguir un render específico del cowork.
- Imágenes de cocina, baño y equipamiento, y una fachada de mayor resolución.

**Qué se puede aprovechar:** el gimnasio ya tiene un render local que no está en el carrusel. El [brochure oficial](https://drive.google.com/file/d/1Bg6B774mAmV-zBkKSkJZ-X-QwLuuGeC1/view) contiene las tipologías, ubicación y equipamiento; conviene extraer esos recursos antes de solicitar material nuevo.

### [DOMUS Infinity](https://nia-web.com/domus-infinity)

**Lo observado:** lobby, churrasquera, gimnasio y salón multiuso corresponden a los textos. La fachada principal tiene **678 × 879 px**; la otra pieza de fachada disponible es una composición de brochure, no un original vertical limpio.

**Qué falta**

- Planos e imágenes para los **14 modelos** A, B1, B2, C, D, E1, E2, F, G1, G2, H, I1, I2 y J.
- Conectar el mapa local `brochure_p04.jpg`.
- Imágenes de piscina y cowork para completar las áreas sociales.
- Fotografías o renders de equipamiento, y fachada vertical en mejor calidad.

**Qué se puede aprovechar:** el [brochure oficial](https://drive.google.com/file/d/1x0nw_BXjqEYiyQzY5kwQKbjJDoeuIRk1/view) contiene piscina, cowork, ubicación y tipologías. Hay un lounge local que también puede aportar variedad al carrusel.

## Pendientes comunes y material útil

- **Ubicación:** Black, Gold, Onix e Insignia tienen imagen de ubicación conectada. Luxury, Tower e Infinity tienen el mapa entre sus archivos locales.
- **Equipamiento:** Black, Gold, Onix e Insignia tienen tarjetas separadas para departamento y condominio, con las láminas oficiales y sus prestaciones. Los otros tres muestran texto y enlace al brochure.
- **Constructora — actualizado:** Black, Gold, Onix e Insignia utilizan el portafolio de Alborada de la página 2 de sus respectivos brochures. Los otros tres DOMUS conservan el afiche original aportado por el usuario con Alborada Group, RE/MAX Black y las fechas de entrega. Las imágenes se muestran completas y se pueden ampliar.
- Para integrar piezas nuevas: identificar edificio, ambiente o código de modelo; enviar el render completo, sin precios impresos. Preferir fachada vertical de al menos 1.600 px de alto, escenas sociales de al menos 1.600 px de ancho y planos legibles con el departamento entero. Conservar el PDF original para extraer sin perder calidad.

## Datos que necesitan confirmación

Estos datos no se cambiaron durante la revisión de textos:

- **Infinity:** la fecha mostrada es febrero de 2026, ya pasada. Confirmar si está entregado y cuál es el estado comercial actual.
- **Insignia — resuelto:** GLOBAL publica febrero de 2027 y su enlace de ubicación coincide con Calle 7 Oeste. Falta identificar las dos unidades que explican la diferencia entre la cabecera de 68 y las 66 filas únicas del catálogo detallado.
- **Luxury:** la entrega publicada es noviembre de 2026. Confirmar su estado actual. El brochure indica **Calle Río Madera, a 20 m del Mall Las Brisas**, mientras la dirección configurada menciona **Av. Radial 27 entre 3er y 4to Anillo**: precisar el acceso y comprobar el pin antes de incorporar el mapa.

## Alcance de la verificación

Se revisaron el código servido por nia-web.com, los archivos visuales utilizados y el texto de los siete brochures oficiales de Drive. Se comprobaron las siete rutas y 56 imágenes vinculadas: todas respondieron y coincidieron con los archivos locales inspeccionados. Las cifras de modelos corresponden a combinaciones de código de modelo y dormitorios en el inventario disponible; no son cantidades de departamentos en venta.

La comparación de código verificó que las nueve secciones, sus clases y controles, las imágenes, los datos de inventario y las funciones de precio permanecen iguales. Se renderizaron las siete landings con inventario para comprobar el contenido generado. No se realizó una prueba interactiva de navegador: la conexión visual del navegador no estuvo disponible.

Validación de la actualización Gold/furnished: 43 imágenes nuevas decodificadas y revisadas; 105 pruebas aprobadas, revisión de tipos sin errores y compilación de producción correcta sobre una copia aislada de los cambios preparados. Se comprobaron 318 escenarios financieros con y sin furnished. Las nueve secciones se conservan en los siete edificios; los otros seis mantienen sus imágenes, modelos y cantidades de unidades. Los datos de unidades y las funciones de precio del departamento permanecen idénticos a la versión anterior. La comprobación de HTML generado no sustituye una prueba interactiva de navegador.
