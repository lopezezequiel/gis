var $gis2016 = {
	config: {},
	dom: {},
	fn: {},
	interactions: {},
	controls: {},
	tools: {},
};

//wms url
$gis2016.config.wmsURL = $wmsURL;

//layers
$gis2016.config.layers = [
	{url: $gis2016.config.wmsURL, name: "actividades_economicas", title: "Actividades Económicas", visibility: false},
	{url: $gis2016.config.wmsURL, name: "actividades_agropecuarias", title: "Actividades Agropecuarias", visibility: false},
	{url: $gis2016.config.wmsURL, name: "complejo_de_energia_ene", title: "Complejos de Energía", visibility: false},
	{url: $gis2016.config.wmsURL, name: "curso_de_agua_hid", title: "Cursos de Agua", visibility: false},
	{url: $gis2016.config.wmsURL, name: "curvas_de_nivel", title: "Curvas de Nivel", visibility: false},
	{url: $gis2016.config.wmsURL, name: "edif_construcciones_turisticas", title: "Construcciones Turísticas", visibility: false},
	{url: $gis2016.config.wmsURL, name: "edif_depor_y_esparcimiento", title: "Edificios Deportivos y de Esparcimiento", visibility: true},
];

//map
$gis2016.config.map = {
	projection: 'EPSG:4326',
	center: [-59, -27.5],
	zoom: 4
}

/*
edif_educacion
edif_religiosos
edificio_de_salud_ips
edificio_de_seguridad_ips
edificio_publico_ips
edificios_ferroviarios
ejido
espejo_de_agua_hid
estructuras_portuarias
infraestructura_aeroportuaria_punto
infraestructura_hidro
isla
limite_politico_administrativo_lim
localidades
líneas_de_conducción_ene
marcas_y_señales
muro_embalse
obra_de_comunicación
obra_portuaria
otras_edificaciones
pais_lim
provincias
puente_red_vial_puntos
puntos_de_alturas_topograficas
puntos_del_terreno
red_ferroviaria
red_vial
salvado_de_obstaculo
señalizaciones
sue_congelado
sue_consolidado
sue_costero
sue_hidromorfologico
sue_no_consolidado
veg_arborea
veg_arbustiva
veg_cultivos
veg_hidrofila
veg_suelo_desnudo
vias_secundarias
*/
