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
	{url: $gis2016.config.wmsURL, name: "edif_depor_y_esparcimiento", title: "Edificaciones Deportivas y de Esparcimiento", visibility: true},
	{url: $gis2016.config.wmsURL, name: "edif_educacion", title: "Edificios Educativos", visibility: false},
	{url: $gis2016.config.wmsURL, name: "edif_religiosos", title: "Edificios Religiosao", visibility: false},
	{url: $gis2016.config.wmsURL, name: "edificio_de_salud_ips", title: "Edificios de Salud IPS", visibility: false},
	{url: $gis2016.config.wmsURL, name: "edificio_de_seguridad_ips", title: "Edificios de Seguridad IPS", visibility: false},
	{url: $gis2016.config.wmsURL, name: "edificio_publico_ips", title: "Edificios Públicos IPS", visibility: false},
	{url: $gis2016.config.wmsURL, name: "edificios_ferroviarios", title: "Edificios Ferroviarios", visibility: false},
	{url: $gis2016.config.wmsURL, name: "ejido", title: "Ejido", visibility: false},
	{url: $gis2016.config.wmsURL, name: "espejo_de_agua_hid", title: "Espejos de Agua", visibility: false},
	{url: $gis2016.config.wmsURL, name: "estructuras_portuarias", title: "Estructuras Portuarias", visibility: false},
	{url: $gis2016.config.wmsURL, name: "infraestructura_aeroportuaria_punto", title: "Infraestructura Aeroportuaria", visibility: false},
	{url: $gis2016.config.wmsURL, name: "infraestructura_hidro", title: "Infraestructura Hídrica", visibility: false},
	{url: $gis2016.config.wmsURL, name: "isla", title: "Islas", visibility: false},
	{url: $gis2016.config.wmsURL, name: "limite_politico_administrativo_lim", title: "Límites Político-Administrativos", visibility: false},
	{url: $gis2016.config.wmsURL, name: "localidades", title: "Localidades", visibility: false},
	{url: $gis2016.config.wmsURL, name: "líneas_de_conducción_ene", title: "Líneas de Energía", visibility: false},
	{url: $gis2016.config.wmsURL, name: "marcas_y_señales", title: "Marcas y Señales", visibility: false},
	{url: $gis2016.config.wmsURL, name: "muro_embalse", title: "Muro Embalse", visibility: false},
	{url: $gis2016.config.wmsURL, name: "obra_de_comunicación", title: "Obras de Comunicación", visibility: false},
	{url: $gis2016.config.wmsURL, name: "obra_portuaria", title: "Obras Portuarias", visibility: false},
	{url: $gis2016.config.wmsURL, name: "otras_edificaciones", title: "Otras Edificaciones", visibility: false},
	{url: $gis2016.config.wmsURL, name: "pais_lim", title: "???pais_lim", visibility: false},
	{url: $gis2016.config.wmsURL, name: "provincias", title: "Provincias", visibility: false},
	{url: $gis2016.config.wmsURL, name: "puente_red_vial_puntos", title: "Puentes Red Víal", visibility: false},
	{url: $gis2016.config.wmsURL, name: "puntos_de_alturas_topograficas", title: "Altura Topográfica", visibility: false},
	{url: $gis2016.config.wmsURL, name: "puntos_del_terreno", title: "Terreno", visibility: false},
	{url: $gis2016.config.wmsURL, name: "red_ferroviaria", title: "Red Ferroviaria", visibility: false},
	{url: $gis2016.config.wmsURL, name: "red_vial", title: "Red Víal", visibility: false},
	{url: $gis2016.config.wmsURL, name: "salvado_de_obstaculo", title: "Salvado de Obstaculo", visibility: false},
	{url: $gis2016.config.wmsURL, name: "señalizaciones", title: "Señalizaciones", visibility: false},
	{url: $gis2016.config.wmsURL, name: "sue_congelado", title: "Suelo Congelado", visibility: false},
	{url: $gis2016.config.wmsURL, name: "sue_consolidado", title: "Suelo Consolidado", visibility: false},
	{url: $gis2016.config.wmsURL, name: "sue_costero", title: "Suelo Costero", visibility: false},
	{url: $gis2016.config.wmsURL, name: "sue_hidromorfologico", title: "Suelo Hidromorfológico", visibility: false},
	{url: $gis2016.config.wmsURL, name: "sue_no_consolidado", title: "Suelo no Consolidado", visibility: false},
	{url: $gis2016.config.wmsURL, name: "veg_arborea", title: "Vegetación Arborea", visibility: false},
	{url: $gis2016.config.wmsURL, name: "veg_arbustiva", title: "Vegetación Arbustiva", visibility: false},
	{url: $gis2016.config.wmsURL, name: "veg_cultivos", title: "Cultivos", visibility: false},
	{url: $gis2016.config.wmsURL, name: "veg_hidrofila", title: "Vegetación Hidrófila", visibility: false},
	{url: $gis2016.config.wmsURL, name: "veg_suelo_desnudo", title: "Suelo Desnudo", visibility: false},
	{url: $gis2016.config.wmsURL, name: "vias_secundarias", title: "Vías Secundarias", visibility: false},
];

//map
$gis2016.config.map = {
	projection: 'EPSG:4326',
	center: [-59, -27.5],
	zoom: 4
}
