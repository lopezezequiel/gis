/***********************************************************************
 * DOM ELEMENTS
 **********************************************************************/
$gis2016.dom.mapBox = document.getElementById('map');
$gis2016.dom.layersBox = document.getElementById('layersBox');
$gis2016.dom.infoBox = document.getElementById('infoBox');
$gis2016.dom.coordinatesBox = document.getElementById('coordinatesBox');


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

$gis2016.fn.createSimpleButtonControl = function(fn, imageURL, xy) {

	/**
	 * @constructor
	 * @extends {ol.control.Control}
	 * @param {Object=} options Control options.
	 */
	var CustomControl = function(options) {

		var options = options || {};

		var button = document.createElement('button');
		button.className = 'custom-control-button';
		button.style.backgroundImage = 'url(\'' + imageURL + '\')';

		$(button).click(function(){
			fn.call(fn);
		});

		var element = document.createElement('div');
		element.style.top = xy[0];
		element.style.left = xy[1];
		element.className = 'ol-unselectable ol-control';
		element.appendChild(button);

		ol.control.Control.call(this, {
			element: element,
			target: options.target
		});
	};

	ol.inherits(CustomControl, ol.control.Control);
	
	return new CustomControl();
}


$gis2016.fn.createVectorLayer = function(source) {
	return new ol.layer.Vector({
		source: source,
		style: new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(255, 255, 255, 0.2)'
			}),
			stroke: new ol.style.Stroke({
				color: '#ffcc33',
				width: 2
			}),
			image: new ol.style.Circle({
				radius: 7,
				fill: new ol.style.Fill({
					color: '#ffcc33'
				})
			})
		})
	});
};

/**
 * format area output
 * @param {ol.geom.Polygon} polygon
 * @return {string}
 */
$gis2016.fn.formatArea = function(area) {

	var areakm2 = Math.round(area * 10000);

	return areakm2 < 1
		? Math.round(areakm2 * 1000000) + ' ' + 'm<sup>2</sup>'
		: areakm2 + ' ' + 'km<sup>2</sup>';
};

/**
 * format length output
 * @param {ol.geom.LineString} line
 * @return {string}
 */
$gis2016.fn.formatLength = function(length) {
	
	lengthk = length * 100;
	
	return lengthk > 1
		? Math.round(lengthk) + ' km'
		: Math.round(lengthk * 1000) + ' m';
};


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
 * TOOLS
 **********************************************************************/
$gis2016.tools.measurePolygon = new (function(map){
	
	//PRIVATE
	var active = false;
	var tool = this;
	var interaction;
	var layer;
	var sketch;
	var totalArea;
	var partialArea;

	/**
	 * handle pointer move
	 * @param {Event} evt
	 */
	var mouseMoveHandler = function(e) {
		if (sketch) {
			partialArea = sketch.getGeometry().getArea();
			$gis2016.dom.infoBox.innerHTML =  
				'Area Total: ' + $gis2016.fn.formatArea(totalArea) +
				'; Area parcial: ' + $gis2016.fn.formatArea(partialArea);
		}
	};

	//PUBLIC
	this.deactivate = function() {
		if(active) {
			map.removeInteraction(interaction);
			map.removeLayer(layer);
			active = false;
		}
	};

	this.activate = function() {
		 if(!active) {
			var source = new ol.source.Vector();

			layer = $gis2016.fn.createVectorLayer(source);
			map.addLayer(layer);

			interaction = new ol.interaction.Draw({
				source: source,
				type: 'Polygon'
			});
			interaction.on('drawstart', function(e) {
				sketch = e.feature;
			}, this);
			interaction.on('drawend', function(e) {
				totalArea += sketch.getGeometry().getArea();
				mouseMoveHandler();
				sketch = null;
			}, this);			
			map.addInteraction(interaction);
			
			active = true;
			totalArea = 0;
		}
	}
	
	this.toggle = function() {
		if(active) {
			tool.deactivate();
		} else {
			tool.activate();
		}
	}
	
	this.isActivated = function() {
		return active;
	}
	
	//CONSTRUCT
	$($gis2016.map.getViewport()).on('mousemove', mouseMoveHandler);
	
})($gis2016.map);


$gis2016.tools.measureLineString = new (function(map){
	
	//PRIVATE
	var active = false;
	var tool = this;
	var interaction;
	var layer;
	var sketch;
	var partialLength;
	var totalLength;

	/**
	 * handle pointer move
	 * @param {Event} evt
	 */
	var mouseMoveHandler = function(e) {
		if (sketch) {
			partialLength = sketch.getGeometry().getLength();
			$gis2016.dom.infoBox.innerHTML =  
				'Longitud Total: ' + $gis2016.fn.formatLength(totalLength) +
				'; Longitud parcial: ' + $gis2016.fn.formatLength(partialLength);
		}
	};

	//PUBLIC
	this.deactivate = function() {
		if(active) {
			map.removeInteraction(interaction);
			map.removeLayer(layer);
			active = false;
		}
	};

	this.activate = function() {
		 if(!active) {
			var source = new ol.source.Vector();

			layer = $gis2016.fn.createVectorLayer(source);
			map.addLayer(layer);

			interaction = new ol.interaction.Draw({
				source: source,
				type: 'LineString'
			});
			interaction.on('drawstart', function(e) {
				sketch = e.feature;
			}, this);
			interaction.on('drawend', function(e) {
				totalLength += sketch.getGeometry().getLength();
				mouseMoveHandler();
				sketch = null;
			}, this);			
			map.addInteraction(interaction);
			
			active = true;
			totalLength = 0;
		}
	}
	
	this.toggle = function() {
		if(active) {
			tool.deactivate();
		} else {
			tool.activate();
		}
	}
	
	this.isActivated = function() {
		return active;
	}
	
	//CONSTRUCT
	$($gis2016.map.getViewport()).on('mousemove', mouseMoveHandler);
	
})($gis2016.map);

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

$gis2016.controls.layersControl = 
	$gis2016.fn.createSimpleButtonControl(function(){
		$($gis2016.dom.layersBox).toggle();
	}, '/img/icon/layers.png', ['65px', '.5em']);
	
$gis2016.controls.measurePolygon = 
	$gis2016.fn.createSimpleButtonControl(function(){
		var tool = $gis2016.tools.measurePolygon;
		if(tool.isActivated()) {
			tool.deactivate();
		} else {
			$gis2016.tools.measureLineString.deactivate();
			tool.activate();
		}
	}, '/img/icon/polygon.png', ['96px', '.5em']);
	
$gis2016.controls.measureLineString = 
	$gis2016.fn.createSimpleButtonControl(function(){
		var tool = $gis2016.tools.measureLineString;
		if(tool.isActivated()) {
			tool.deactivate();
		} else {
			$gis2016.tools.measurePolygon.deactivate();
			tool.activate();
		}
	}, '/img/icon/linestring.png', ['127px', '.5em']);


/***********************************************************************
 * CONSTRUCT
 **********************************************************************/

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

//add measurePolygon  control
$gis2016.map.addControl($gis2016.controls.measurePolygon);

//add measureLineString  control
$gis2016.map.addControl($gis2016.controls.measureLineString);
