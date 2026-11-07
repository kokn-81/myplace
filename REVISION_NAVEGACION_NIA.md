# Revisión de navegación y precios de NIA

Revisión del código y de las hojas oficiales, 7 de noviembre de 2026.

| Observación | Verificación y corrección |
| --- | --- |
| Buscar no cambia las fichas | Confirmado en código: la función de destacados agregaba nuevamente el catálogo completo después de filtrar. Los resultados ahora conservan únicamente las coincidencias, incluido el caso vacío. La respuesta remota ya no sobrescribe la búsqueda local. |
| No hay filtros visibles ni orden | Se incorporaron mínimo y máximo, dormitorios, zona, año de entrega, orden por precio y entrega. Cada criterio aplicado se puede quitar. Los contadores se calculan sobre las coincidencias. |
| Departamentos muestra proyectos | Confirmado: la misma función reinsertaba ONA, Eurodesign y los demás proyectos. La categoría usa ahora exclusivamente sus coincidencias. |
| Portada sin precios | Confirmado en el componente común. Las 14 tarjetas de proyectos muestran el mínimo de las unidades disponibles al contado. Con filtros, muestran el mínimo de las unidades que cumplen esos criterios. Los textos se centraron sin ampliar las tarjetas. |
| Marcador agrupado abre Garden Zen | Confirmado: el manejador abría la primera propiedad del grupo antes de acercar el mapa. Se eliminó esa apertura y se permite alcanzar el zoom de expansión del grupo. |
| Garden Zen: 1.351 frente a 1.742 USD/m² | No implica por sí solo un cálculo incorrecto. La hoja oficial publica USD 91.600 para la unidad 205, de 52,58 m²: aproximadamente USD 1.742/m². El mínimo disponible de USD 1.351/m² corresponde a otra unidad. Se eliminaron del texto y de los botones las tarifas fijas de 1.400/1.450/1.500. También se corrigió un error adicional del lector que aceptaba un encabezado como departamento y se eliminó una unidad duplicada del respaldo. |
| Bless Tower: 102.978 frente a 110.000 | Confirmado: las tipologías contenían precios escritos por separado. Ahora consultan el mismo inventario que la portada y el cotizador. La hoja oficial confirma el mínimo de USD 102.978 para dos dormitorios. Una tipología agotada ya no recupera el precio antiguo. |
| ONA: 40.375 frente a 41.990 | Confirmado: el respaldo estaba desactualizado. Se actualizó con la hoja oficial: 22 disponibles, 25 vendidos y 7 reservados. El 1 dormitorio disponible más económico cuesta USD 41.990. |
| ONA: 1.275 frente a 1.300 USD/m² | Ambas tarifas aparecen en la hoja oficial para distintas unidades. El cotizador ya tomaba la tarifa de cada unidad. Se aclaró la variación por unidad y vista y se unificó el inventario compartido. |
| Cerrar Bless deja su dirección | Confirmado: el cierre omitía las rutas de Bless. El cierre centralizado vuelve a la portada; Atrás/Adelante también lee la ruta. Una respuesta de detalle tardía ya no reabre una ficha cerrada. |
| Departamentos sin enlace y mapa | Se agregaron `/departamento/3` y `/departamento/4`, enlaces para compartir sin depender de que responda el servicio de registros, mapa y acceso a Google Maps. Los importes en dólares se identifican como USD. |
| Errores de texto | Se corrigieron Descripción, Ficha Técnica, el espacio tras Constructora y el singular/plural de dormitorios. |
| Pantallas pequeñas y zoom | El carrusel usa una tarjeta por pantalla por debajo de 1.024 px. Las landings se apilan, ocupan la pantalla completa y permiten desplazamiento vertical; los controles y las columnas se adaptan al espacio disponible. |

Los filtros de dormitorio y presupuesto se evalúan sobre una misma unidad disponible: un departamento barato de un dormitorio no hace pasar un proyecto cuando se buscan dos dormitorios dentro de ese presupuesto.

Fuentes: [ONA](https://docs.google.com/spreadsheets/d/14-g7f0tzOYfTX9KejkPa4enDf7pi1Kl2ytZaxB-qH6U/edit), [Garden Zen](https://docs.google.com/spreadsheets/d/131d0GDjOhvHerSya1izI1CS6qIBkBV6a/edit#gid=1727984128), [Bless Tower](https://docs.google.com/spreadsheets/d/1WcpH2mpmyoIjcK2pslIhazFH8741bHstNJk10Eg2qdE/edit#gid=0).

Validación automatizada: búsqueda natural, criterios removibles, cero resultados, pertenencia a categorías, precios de unidades disponibles, lectura del CSV oficial, enlaces, orden, inventarios y compilación. La inspección visual interactiva del sitio a zoom 200% y en un dispositivo físico queda pendiente porque el acceso automático al navegador no estuvo disponible. No se presenta esa inspección como realizada.
