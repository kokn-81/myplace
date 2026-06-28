# Tareas Pendientes

- [x] Agregar campo de banos por inmueble:
  - Crear migracion Alembic para la columna en `inmuebles`.
  - Actualizar modelos y endpoints del backend.
  - Agregar campo en formularios de admin y asesor.
  - Mostrar banos en tarjetas, detalle y ficha tecnica.
  - Incluir banos en el contexto de IA para filtros semanticos.

## Mejoras recomendadas

- [ ] Optimizar rendimiento del mapa y carga inicial:
  - Dividir bundles pesados como Mapbox con carga diferida.
  - Reducir datos enviados en `/api/inmuebles` a lo necesario para la vista inicial.
  - Medir tiempos reales de carga en movil.

- [ ] Mejorar busqueda e IA con filtros persistentes:
  - Mostrar filtros activos de forma mas clara.
  - Permitir editar o quitar filtros individuales.
  - Guardar contexto de consulta para refinamientos sucesivos.

- [ ] Fortalecer operacion y control de contenido:
  - Agregar estados de publicacion como borrador, publicado y pausado.
  - Registrar quien creo o edito cada inmueble.
  - Preparar un historial basico de cambios para admins.
