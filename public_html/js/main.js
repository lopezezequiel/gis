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

var layersControl = document.getElementById('layers');

$.each($data.layers, function(index, layerData) {
	var layer = createLayer(layerData);
	map.addLayer(layer);

	var checkbox = createLayerCheckBox(layerData);
	layersControl.appendChild(checkbox);

	var label = createCheckBoxLabel(layerData);
	layersControl.appendChild(label);
	
	$(checkbox).change(function() {
		layer.setVisible($(this).is(":checked"));        
    });
})




