/***********************************************************************
 * DOM ELEMENTS
 **********************************************************************/
$gis2016.dom.mapBox = document.getElementById('map');
$gis2016.dom.layersBox = document.getElementById('layersBox');
$gis2016.dom.infoBox = document.getElementById('infoBox');
$gis2016.dom.coordinatesBox = document.getElementById('coordinatesBox');


/***********************************************************************
 * FUNCTIONS
 **********************************************************************/
$gis2016.fn.createLayer = function(layerData) {
	return new ol.layer.Tile({
		title: layerData.title,
		visible: layerData.visibility,
		source: new ol.source.TileWMS({
			url: layerData.url,
			params: {
				LAYERS: layerData.name
			}
		})
    });
}

$gis2016.fn.createLayerCheckBox = function(layerData) {
	var checkbox = document.createElement('input');
	checkbox.type = "checkbox";
	checkbox.id = layerData.name;
	checkbox.checked = layerData.visibility;
	return checkbox;
}

$gis2016.fn.createCheckBoxLabel = function(layerData) {
	var label = document.createElement('label');
	label.htmlFor = layerData.name;
	label.appendChild(document.createTextNode(layerData.title));
	return label;
}

$gis2016.fn.loadLayer = function(layerData) {
	var layer = $gis2016.fn.createLayer(layerData);
	$gis2016.map.addLayer(layer);

	var checkbox = $gis2016.fn.createLayerCheckBox(layerData);
	$gis2016.dom.layersBox.appendChild(checkbox);

	var label = $gis2016.fn.createCheckBoxLabel(layerData);
	$gis2016.dom.layersBox.appendChild(label);
	
	$gis2016.dom.layersBox.appendChild(document.createElement('br'));
	
	$(checkbox).change(function() {
		layer.setVisible($(this).is(":checked"));        
    });
}


/***********************************************************************
 * INTERACTIONS
 **********************************************************************/
$gis2016.interactions.dragBox = new ol.interaction.DragBox({
	condition: ol.events.condition.shiftKeyOnly,
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: [0, 0, 255, 1]
		})
	})
});


/***********************************************************************
 * CONTROLS
 **********************************************************************/
$gis2016.controls.mousePosition = new ol.control.MousePosition({
	coordinateFormat: ol.coordinate.createStringXY(4),
	projection: $gis2016.config.map.projection,
	className: 'no-class',
	target: $gis2016.dom.coordinatesBox,
	undefinedHTML: '&nbsp;'
});

$gis2016.controls.layersControl = (function() {

	/**
	 * @constructor
	 * @extends {ol.control.Control}
	 * @param {Object=} options Control options.
	 */
	var LayersControl = function(options) {

		var options = options || {};

		var button = document.createElement('button');
		button.id = 'layers-button';

		$(button).click(function(){
			$($gis2016.dom.layersBox).toggle();
		});

		var element = document.createElement('div');
		element.className = 'layers-control ol-unselectable ol-control';
		element.appendChild(button);

		ol.control.Control.call(this, {
			element: element,
			target: options.target
		});

	};

	ol.inherits(LayersControl, ol.control.Control);

	return new LayersControl();
})();


/***********************************************************************
 * MAP
 **********************************************************************/

//create map
$gis2016.map = new ol.Map({
	target: $gis2016.dom.mapBox.id,
	layers: [],
	view: new ol.View({
		projection: $gis2016.config.map.projection,
		center: $gis2016.config.map.center,
		zoom: $gis2016.config.map.zoom
	})
});

//add layers
$.each($gis2016.config.layers, function(index, layerData) {
	$gis2016.fn.loadLayer(layerData);
})

//add dragBox interaction          
$gis2016.map.addInteraction($gis2016.interactions.dragBox);
$gis2016.interactions.dragBox.on('boxend', function(e) {
	$gis2016.dom.infoBox.innerHTML = $gis2016.interactions
		.dragBox.getGeometry().getCoordinates();
});

//add mouse control
$gis2016.map.addControl($gis2016.controls.mousePosition);

//add layers control
$gis2016.map.addControl($gis2016.controls.layersControl);
