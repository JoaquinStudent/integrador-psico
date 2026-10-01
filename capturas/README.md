# Capturas de Pantalla de Vistas y Módulos — Sistema Psicograma

> **Proyecto Integrador I** · Centro Psicológico Ser Integral E.I.R.L.  
> **Directorio:** `capturas/` (a la altura de `entregas/`)  
> **Resolución Desktop:** 1440 × 900 px  
> **Resolución Tablet (Vistas Paciente):** 1024 × 768 px  
> **Fecha de Generación:** 01/10/2026

---

## Índice de Capturas Generadas

| Archivo | Ruta URL | Módulo / Vista | Dispositivo / Rol | Descripción de la Vista |
|---|---|---|---|---|
| [`01-login.png`](01-login.png) | `/login` | Autenticación Profesional | Desktop / Psicólogo | Formulario de acceso y registro para psicólogos colegiados con validación asimétrica ES256 contra Supabase Auth. |
| [`02-dashboard.png`](02-dashboard.png) | `/` | Panel de Control (Dashboard) | Desktop / Psicólogo | Indicadores de gestión clínica (sesiones de la semana, informes pendientes, pacientes activos) y accesos directos. |
| [`03-pacientes-listado.png`](03-pacientes-listado.png) | `/pacientes` | Gestión de Pacientes | Desktop / Psicólogo | Tabla paginada de historias clínicas con buscador dinámico por nombre/DNI y filtros de estado. |
| [`04-paciente-detalle.png`](04-paciente-detalle.png) | `/pacientes/:id` | Ficha Integral del Paciente | Desktop / Psicólogo | Detalle filiatorio del paciente en 3 pestañas: Datos Generales, Historial de Evaluaciones e Informes Emitidos, con botones de baja lógica y anonimización legal. |
| [`05-catalogo-tests.png`](05-catalogo-tests.png) | `/tests` | Catálogo de Tests Proyectivos | Desktop / Psicólogo | Catálogo interactivo de pruebas proyectivas: PBLL disponible (149 indicadores modelados), HTP, DF y DFH en estado modular. |
| [`06-sesiones-listado.png`](06-sesiones-listado.png) | `/sesiones` | Historial de Sesiones | Desktop / Psicólogo | Listado cronológico de evaluaciones con estado de sesión (`setup`, `active`, `completed`) y accesos a análisis e informe. |
| [`07-nueva-sesion-wizard.png`](07-nueva-sesion-wizard.png) | `/sesiones/nueva` | Asistente de Nueva Sesión | Desktop / Psicólogo | Wizard interactivo de 3 pasos: (1) Selección de paciente y motivo, (2) Selección de test, (3) Consentimiento informado y autorización de audio. |
| [`08-paciente-bienvenida.png`](08-paciente-bienvenida.png) | `/sesion/:id/paciente/bienvenida` | Bienvenida del Paciente | Tablet / Paciente | Interfaz minimalista a pantalla completa para tablet con la consigna estandarizada oficial del manual PBLL. |
| [`09-paciente-lienzo-dibujo.png`](09-paciente-lienzo-dibujo.png) | `/sesion/:id/paciente/dibujo` | Lienzo Digital Táctil | Tablet / Paciente | Lienzo táctil reactivo a 60 fps con Pointer Events API, lápiz digital sensible a presión, borrador, deshacer y botón "Terminé". |
| [`10-paciente-cierre.png`](10-paciente-cierre.png) | `/sesion/:id/paciente/cierre` | Pantalla de Cierre | Tablet / Paciente | Confirmación de prueba finalizada y agradecimiento al evaluado, con bloqueo del lienzo para preservar la integridad del trazo. |
| [`11-examinador-sesion-en-vivo.png`](11-examinador-sesion-en-vivo.png) | `/sesion/:id` | Sala de Monitoreo en Vivo | Desktop / Psicólogo | Consola en tiempo real con proyección del dibujo vía WebSocket (< 200 ms), panel de 6 marcas conductuales de un clic y grabación de audio. |
| [`12-analisis-metricas-pbll.png`](12-analisis-metricas-pbll.png) | `/sesion/:id/analisis` | Análisis Objetivo y Métricas | Desktop / Psicólogo | Panel analítico cuantitativo con cálculo de 7 métricas estructurales (área %, cuadrícula 3x3, presión, pausas, latencia) y cruce con el manual. |
| [`13-verificacion-indicadores-checklist.png`](13-verificacion-indicadores-checklist.png) | `/sesion/:id/observaciones` | Observaciones y Checklist | Desktop / Psicólogo | Línea de tiempo de la sesión con eventos conductuales registrados, notas de campo del examinador y checklist en 18 secciones. |
| [`14-informes-listado.png`](14-informes-listado.png) | `/informes` | Listado de Informes | Desktop / Psicólogo | Repositorio de informes psicológicos generados con filtro por estado (`borrador`, `validado`) y descarga de PDF. |
| [`15-editor-informe-clinico.png`](15-editor-informe-clinico.png) | `/informes/:id` | Editor de Informe Psicológico | Desktop / Psicólogo | Editor clínico estructurado en las 9 secciones canónicas, redacción asistida con OpenRouter LLM, registro de colegiatura y firma profesional. |
| [`16-tablet-atajo-sesion-activa.png`](16-tablet-atajo-sesion-activa.png) | `/sesion/activa` | Atajo de Tablet Consultorio | Tablet / Paciente | Ruta estática persistente para la tablet física del consultorio que resuelve automáticamente la sesión que se encuentra en espera. |
