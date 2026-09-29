# SPEC-S6-04: Exportacion del Informe a PDF

> Estado: SPEC_READY | Sprint: 6 | Epica: Export | Realiza: RF-38

---

## Descripcion

Generar el documento final que el psicologo entrega al paciente o archiva en la historia clinica.

Solo se exporta un informe **validado**: un PDF de un borrador circularia como si fuera definitivo, y
el borrador por definicion no tiene respaldo profesional.

La decision tecnica que ahorra trabajo: se renderiza HTML a PDF con WeasyPrint en vez de maquetar con
una libreria de dibujo. El design system ya define tipografia, colores y jerarquia en CSS;
reaprovecharlo da un documento consistente con la aplicacion sin volver a decidir nada de formato.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Exportar un informe validado
```
GIVEN un informe en estado validated
WHEN el examinador hace GET /api/v1/reports/{id}/pdf
THEN recibe un archivo PDF valido
AND el Content-Type es application/pdf
AND pdf_url queda registrado en la tabla reports
```

### Escenario 2: No se exporta un borrador
```
GIVEN un informe en estado draft
WHEN se solicita el PDF
THEN la respuesta es 409
AND el detalle indica que solo se exportan informes validados
```

### Escenario 3: Las 9 secciones aparecen en orden
```
GIVEN un informe validado
WHEN se abre el PDF generado
THEN contiene las 9 secciones numeradas del 1 al 9, en orden
AND cada una con su titulo
```

### Escenario 4: Encabezado con identificacion
```
GIVEN un informe validado de un paciente
WHEN se abre el PDF
THEN el encabezado incluye el nombre del paciente, el test aplicado y la fecha de la sesion
AND el pie incluye el nombre del profesional, su matricula y la fecha de validacion
```

### Escenario 5: Formato consistente con la aplicacion
```
GIVEN el PDF generado
WHEN se compara con la aplicacion
THEN usa la tipografia Inter y la paleta del design system
AND los titulos de seccion mantienen la jerarquia visual
```

### Escenario 6: Paginacion correcta
```
GIVEN un informe cuyo contenido excede una pagina
WHEN se abre el PDF
THEN las paginas estan numeradas
AND ningun titulo de seccion queda huerfano al final de una pagina
```

### Escenario 7: Informe de otro examinador
```
GIVEN un informe de una sesion del examinador B
WHEN el examinador A solicita su PDF
THEN la respuesta es 403
```

### Escenario 8: El PDF no expone sugerencias sin validar
```
GIVEN una sesion con indicadores en suggestion y en rejected
WHEN se genera el PDF
THEN no aparece ninguno de ellos
AND solo aparece el contenido de las secciones del informe
```

### Escenario 9: WeasyPrint no disponible
```
GIVEN el entorno no tiene instaladas las librerias del sistema que WeasyPrint requiere
WHEN se solicita el PDF
THEN la respuesta es 502 con un detalle claro
AND el resto de la aplicacion sigue operativa
```

---

## Scope

**IN:**
- `GET /reports/{id}/pdf`
- Plantilla HTML del informe con el CSS del design system
- Adaptador `PdfRenderer` sobre WeasyPrint
- Encabezado con identificacion y pie con firma del profesional
- Persistencia del archivo en Storage y de su ruta en `reports.pdf_url`
- Boton de descarga en el editor, habilitado solo para informes validados

**OUT:**
- Firma digital con certificado
- Envio del PDF por correo
- Plantillas alternativas o membrete configurable por el centro
- Exportacion a Word o a otros formatos
- Anexar el dibujo como imagen: se evalua tras validar el formato base con el centro
- Marca de agua de borrador: no aplica, porque un borrador no se exporta

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| SPEC-S6-03 (informe validado) | Feature | BLOQUEANTE |
| `weasyprint` como extra del proyecto | Codigo | Declarado en `pyproject.toml`, sin instalar |
| Librerias del sistema de WeasyPrint (pango, cairo) | Infra | Por instalar en el entorno de despliegue |
| Adaptador `FileStore` | Codigo | Se crea en SPEC-S5-05 |
| `frontend/src/index.css` como fuente del CSS | Diseno | DONE |

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---|---|
| `backend/src/psicograma/adapter/outbound/pdf/renderer.py` | Crear |
| `backend/src/psicograma/adapter/outbound/pdf/templates/informe.html` | Crear |
| `backend/src/psicograma/adapter/outbound/pdf/templates/informe.css` | Crear |
| `backend/src/psicograma/application/export_report.py` | Crear |
| `backend/src/psicograma/adapter/inbound/http/routers/reports.py` | Modificar |
| `frontend/src/pages/ReportEditorPage.tsx` | Modificar (descarga) |
| `backend/tests/adapter/test_pdf_export.py` | Crear |
| `backend/README.md` | Modificar (dependencias del sistema para PDF) |

---

## Validacion de Dominio

- Solo el **Informe Validado** es exportable, segun el glosario de `domain.md`
- `reports.pdf_url` guarda la ruta en Storage, no el binario
- Tipografia Inter y paleta Clinical Precision, como el resto del producto
- Documento en espanol (RNF-21)
- El PDF no contiene indicadores en `suggestion` ni en `rejected`: solo lo que el profesional firmo
  (RNF-18)
