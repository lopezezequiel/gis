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
var statusBar = document.getElementById('statusBar');

$.each($data.layers, function(index, layerData) {
	var layer = createLayer(layerData);
	map.addLayer(layer);

	var checkbox = createLayerCheckBox(layerData);
	layersBox.appendChild(checkbox);

	var label = createCheckBoxLabel(layerData);
	layersBox.appendChild(label);
	
	$(checkbox).change(function() {
		layer.setVisible($(this).is(":checked"));        
    });
})


var selectInteraction = new ol.interaction.DragBox(
                    {
                        condition: ol.events.condition.shiftKeyOnly,
                        style: new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: [0, 0, 255, 1]
                            })
                        })
                    }
            );
            
map.addInteraction(selectInteraction);

selectInteraction.on('boxend', function (evt) {
	statusBar.innerHTML = selectInteraction.getGeometry().getCoordinates();
});


var mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: 'EPSG:4326',
        // comment the following two lines to have the mouse position
        // be placed within the map.
        className: 'custom-mouse-position',
        target: document.getElementById('mousePosition'),
        undefinedHTML: '&nbsp;'
      });

map.addControl(mousePositionControl);
