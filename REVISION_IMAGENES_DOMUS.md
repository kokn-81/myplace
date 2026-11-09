# Revisión comercial e imágenes de DOMUS

Revisión del 8 de noviembre de 2026. Incluye las siete landings del grupo Alborada: Black, Gold, Onix, Insignia, Luxury, Tower e Infinity.

## Textos corregidos

Se reescribieron la presentación, los títulos y subtítulos de las secciones, los párrafos comerciales, las descripciones de áreas sociales, las explicaciones de pago y los llamados a contactar. Cada edificio tiene textos propios. Se conservaron la estructura, las imágenes, el inventario y los cálculos del cotizador.

El enfoque es mostrar qué aporta cada espacio a la vida del comprador. Se evitaron promesas de rentabilidad o plusvalía, y no se presentó el amoblamiento opcional como incluido. Las características de equipamiento se contrastaron con los brochures; el alcance que depende de la superficie o del modelo se aclara en el texto.

También se corrigieron etiquetas que describían otra cosa: la sala de billar de Black dejó de llamarse piscina y la sala de reuniones de Insignia dejó de llamarse cine. Esto corrige el texto; aún hay que incorporar las imágenes de piscina y cine que faltan.

## Prioridades

1. **Black y Gold — resuelto en código:** se asociaron las imágenes oficiales con cada familia de modelos y se completaron ubicación, equipamiento, áreas sociales y portafolio.
2. **Insignia, Luxury, Tower e Infinity:** incorporar planos por modelo; actualmente el visor muestra una indicación de consulta en lugar del departamento.
3. **Onix:** sustituir los recortes de interiores por vistas completas de cada departamento y completar los modelos sin imagen.
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

**Lo incorrecto o poco útil**

- Las cinco imágenes conectadas a modelos son recortes estrechos del interior; no dejan entender el departamento completo. Sus fichas completas tienen textos y precios impresos, que pueden quedar desactualizados respecto del cotizador.
- El carrusel social muestra **planos arquitectónicos** de planta baja, piso 3 y piscina del piso 21. Sirven para explicar distribución, pero faltan renders que permitan imaginar esos ambientes. Los textos ahora identifican que son planos.
- La fachada es una composición horizontal con márgenes; conviene una fachada vertical limpia para la portada.
- El botón de planta baja no sustituye la planta del piso donde está el departamento elegido.

**Qué falta**

- Vista completa y plano de los modelos ya conectados: **A2, B1, C1, D1 y E1**.
- Imagen para los otros **12 modelos**: F, E2, D2, A1, A3, A4, C2, B2, A5, PH-G1, PH-H y PH-G2.
- Renders oficiales de piscina, área social, gimnasio y lobby; mapa de ubicación y material de acabados/equipamiento.

**Qué se puede aprovechar:** las láminas locales 05–12 contienen plantas de las familias A–H y pueden servir para las distribuciones. El [PDF conectado](https://drive.google.com/file/d/1Xk8zJaFDr-z4VZLd9C-7UX7XWpIeGW-0/view) es un juego de láminas, no un brochure completo de acabados. **Aquí sí sería especialmente útil un brochure comercial o renders originales adicionales.**

### [DOMUS Insignia](https://nia-web.com/domus-insignia)

**Lo incorrecto o mejorable**

- `social_cine.jpg` muestra una mesa y puestos de trabajo: es un ambiente de cowork/reuniones, no una sala de cine. Ya se corrigió su descripción. Para mostrar el cine se necesita su imagen real.
- La fachada utilizada es una composición horizontal de brochure con franja lateral y logotipo. Conviene una fachada vertical sin la diagramación.
- Algunas imágenes de lobby y piscina conservan títulos o márgenes del brochure; es preferible extraer el render para aprovechar todo el marco.

**Qué falta**

- Planos e imágenes para las **21 combinaciones de modelo y dormitorios**.
- Render de cine y material visual de equipamiento y acabados.

**Qué está bien:** la ubicación ya tiene una imagen de mapa conectada. El [brochure oficial](https://drive.google.com/file/d/1-iHC0tJkWY7guIcr-PwgXGwi3KC-jloa/view) incluye tipologías y referencias al cine, de modo que se debe buscar primero allí la pieza correcta.

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

- **Ubicación:** Black, Gold e Insignia tienen imagen de ubicación conectada. Luxury, Tower e Infinity tienen el mapa entre sus archivos locales. Onix requiere revisar material adicional.
- **Equipamiento:** Black y Gold tienen tarjetas separadas para departamento y condominio, con las láminas oficiales y sus prestaciones. Onix todavía reutiliza imágenes de modelos; las otras cuatro muestran texto y enlace al brochure.
- **Constructora — actualizado:** Black y Gold utilizan el portafolio de Alborada de la página 2 de sus respectivos brochures. Los otros cinco DOMUS conservan el afiche original aportado por el usuario con Alborada Group, RE/MAX Black y las fechas de entrega. Las imágenes se muestran completas y se pueden ampliar.
- Para integrar piezas nuevas: identificar edificio, ambiente o código de modelo; enviar el render completo, sin precios impresos. Preferir fachada vertical de al menos 1.600 px de alto, escenas sociales de al menos 1.600 px de ancho y planos legibles con el departamento entero. Conservar el PDF original para extraer sin perder calidad.

## Datos que necesitan confirmación

Estos datos no se cambiaron durante la revisión de textos:

- **Infinity:** la fecha mostrada es febrero de 2026, ya pasada. Confirmar si está entregado y cuál es el estado comercial actual.
- **Insignia:** la entrega figura como «Febrero 2026 / Febrero 2027». Confirmar qué fecha corresponde a cada unidad o etapa. El brochure menciona Calle 7 Oeste en su mapa, mientras la configuración del sitio dice Calle 7 Este: verificar dirección y pin.
- **Luxury:** la entrega publicada es noviembre de 2026. Confirmar su estado actual. El brochure indica **Calle Río Madera, a 20 m del Mall Las Brisas**, mientras la dirección configurada menciona **Av. Radial 27 entre 3er y 4to Anillo**: precisar el acceso y comprobar el pin antes de incorporar el mapa.

## Alcance de la verificación

Se revisaron el código servido por nia-web.com, los archivos visuales utilizados y el texto de los siete brochures oficiales de Drive. Se comprobaron las siete rutas y 56 imágenes vinculadas: todas respondieron y coincidieron con los archivos locales inspeccionados. Las cifras de modelos corresponden a combinaciones de código de modelo y dormitorios en el inventario disponible; no son cantidades de departamentos en venta.

La comparación de código verificó que las nueve secciones, sus clases y controles, las imágenes, los datos de inventario y las funciones de precio permanecen iguales. Se renderizaron las siete landings con inventario para comprobar el contenido generado. No se realizó una prueba interactiva de navegador: la conexión visual del navegador no estuvo disponible.

Validación de la actualización Gold/furnished: 43 imágenes nuevas decodificadas y revisadas; 105 pruebas aprobadas, revisión de tipos sin errores y compilación de producción correcta sobre una copia aislada de los cambios preparados. Se comprobaron 318 escenarios financieros con y sin furnished. Las nueve secciones se conservan en los siete edificios; los otros seis mantienen sus imágenes, modelos y cantidades de unidades. Los datos de unidades y las funciones de precio del departamento permanecen idénticos a la versión anterior. La comprobación de HTML generado no sustituye una prueba interactiva de navegador.
