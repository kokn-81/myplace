# Tareas Pendientes

- [x] Agregar campo de banos por inmueble:
  - Crear migracion Alembic para la columna en `inmuebles`.
  - Actualizar modelos y endpoints del backend.
  - Agregar campo en formularios de admin y asesor.
  - Mostrar banos en tarjetas, detalle y ficha tecnica.
  - Incluir banos en el contexto de IA para filtros semanticos.

## Mejoras recomendadas

- [X] Optimizar rendimiento del mapa y carga inicial:
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

## Embudo de leads

Tratar N.I.A. como filtro de gente que realmente quiere comprar, alquilar o vender.

### P0 — conversion

- [x] Identificar cada busqueda con `user_id` (visitante anonimo estable; Firebase uid si hay login).
- [x] Marcar `contacted_agent` cuando el usuario toca WhatsApp (inmueble o venta).
- [x] El mensaje de WhatsApp incluye operacion, zona, presupuesto y link `/c/{slug}`.
- [x] Enrutado: todos los Contactar a 59157015854. Compartir no abre WhatsApp.
- [x] contact_tap y share persisten lead_events; plazo opcional (esta semana / 30 dias / 3 meses / sin apuro) antes de WhatsApp.

### P1 — calificacion

- [ ] Guardar sesion anonima (intencion + filtros) aunque no contacten.
- [ ] Una pregunta mas en alquilar/comprar: plazo o dormitorios.
- [ ] Parsear presupuesto "entre X y Y".
- [ ] No dejar que el texto libre salte el onboarding sin marcar que vino sin calificar.
- [ ] Corregir pines fuera de Santa Cruz (ej. Norte con coordenadas de Cochabamba).

### P2 — seguimiento

- [ ] Score hot/warm/cold: presupuesto + zona + abrio ficha + toco WhatsApp.
- [ ] CTA "Agendar visita" ademas de WhatsApp.
- [ ] "Avisame si entra algo" para quien no encontro y igual es lead.

### P3 — mas adelante

- [ ] Pasar leads a planilla o CRM con fuente N.I.A.
- [ ] Multi-pais: ancla de mapa y moneda por config, no fijas en codigo.
