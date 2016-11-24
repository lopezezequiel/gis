# gis
trabajo integrador de gis 2016

## Acerca del proyecto
Este es un trabajo integrador de para la materia GIS de la UTN FRRe por lo que solo tiene fines academicos. No esta pensado para un entorno de producción ya que no tiene las validaciones necesarias, el código no es limpio, hay cosas harcodeadas, no hay mecanismos de seguridad(por ejemplo puede ser suceptible  a sql injection) entre otras cosas. De todas maneras puede ser útil para ver el uso básico de openlayers, ver como trabajar con postgis, manipular capas, trabajar con servicios wms/wfs, etc.

## Instalación

Para instalar las dependencias necesarias, crear y cargar la base de datos, configurar apache y otras cosas respectivas al proyecto ejecutar:

```bash
./install/install.sh
```
Este script construye el proyecto y lo deja listo para abrir la aplicación en http://localhost

## Tareas
- [X] Implementar un servidor de BDs Espaciales y cargar en el las capas vectoriales mencionadas.
- [X] Implementar un servidor de mapas que permita servir las capas mencionadas.
- [X] Implementar servicios OGC (WMS y WFS) en el servidor de mapas para todas las capas mencionadas, en al menos 2 (dos) formatos de imagen (para WMS), y en EPSG:22175 además del original de las capas.
- [X] Navegación del mapa (paneo, zoom, etc.)
- [X] Activar/Desactivar capas
- [X] Mostrar la leyenda de las capas (Clases de la simbología).
- [X] Mostrar escala de visualización.
- [ ] Consulta gráfica (punto y rectangulo) para cada capa.
- [X] Medición de distancias
- [X] Ingresar nuevos elementos en una capa vectorial creada por el usuario, o de las mencionadas anteriormente (geometría y atributos)
- [X] Simbología Espejos de Agua
- [X] Simbología Red Víal
- [X] Simbología Vegetación Cultivos
- [X] Simbología Vegetación Arborea
- [X] Simbología Vegetación Hidrófila
- [X] Ordenar Capas en Qgis
- [ ] Ordenar Capas en cliente web

## Opcional
- [ ] Mejorar interfaz
- [ ] Permitir ordenar capas
- [ ] Favicons
- [ ] Simbología Restante
- [ ] Agregar volver a escala original
- [ ] Agregar escala
- [ ] Mostrar una capa base
- [ ] Corregir simbología red vial
