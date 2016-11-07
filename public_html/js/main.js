var createLayer = function(layerData) {
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

var createLayerCheckBox = function(layerData) {
	var checkbox = document.createElement('input');
	checkbox.type = "checkbox";
	checkbox.id = layerData.name;
	checkbox.checked = layerData.visibility;
	return checkbox;
}

var createCheckBoxLabel = function(layerData) {
	var label = document.createElement('label');
	label.htmlFor = layerData.name;
	label.appendChild(document.createTextNode(layerData.title));
	return label;
}

var map = new ol.Map({
	target: 'map',
	layers: [],
	view: new ol.View({
		projection: 'EPSG:4326',
		center: [-59, -27.5],
		zoom: 4
	})
});

var layersBox = document.getElementById('layersBox');
var infoBox = document.getElementById('infoBox');
var coordinatesBox = document.getElementById('coordinatesBox');

$.each($data.layers, function(index, layerData) {
	var layer = createLayer(layerData);
	map.addLayer(layer);

	var checkbox = createLayerCheckBox(layerData);
	layersBox.appendChild(checkbox);

	var label = createCheckBoxLabel(layerData);
	layersBox.appendChild(label);
	
	layersBox.appendChild(document.createElement('br'));
	
	$(checkbox).change(function() {
		layer.setVisible($(this).is(":checked"));        
    });
})


var selectInteraction = new ol.interaction.DragBox({
	condition: ol.events.condition.shiftKeyOnly,
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: [0, 0, 255, 1]
		})
	})
});           
map.addInteraction(selectInteraction);
selectInteraction.on('boxend', function (evt) {
	infoBox.innerHTML = selectInteraction.getGeometry().getCoordinates();
});


var mousePositionControl = new ol.control.MousePosition({
	coordinateFormat: ol.coordinate.createStringXY(4),
	projection: 'EPSG:4326',
	className: 'custom-mouse-position',
	target: coordinatesBox,
	undefinedHTML: '&nbsp;'
});
map.addControl(mousePositionControl);


/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
LayersControl = function(options) {

	var options = options || {};

	var button = document.createElement('button');
	button.id = 'layers-button';

	$(button).click(function(){
		$("#layersBox").toggle();
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



map.addControl(new LayersControl());
