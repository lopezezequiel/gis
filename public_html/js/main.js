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

$gis2016.fn.getRoulette = function(array) {
	
	return new (function() {
		var index = 0;
		this.next = function() {
			if(array.length > 0) {
				var value = array[index];
				index++;
				if(index == array.length) {
					index = 0;
				}
				
				return value;
			}
		};
	})();
};

$gis2016.fn.createMultiButtonBarControl = function(controlClassName) {
	var args = Array.prototype.slice.call(arguments, 1);

	/**
	 * @constructor
	 * @extends {ol.control.Control}
	 * @param {Object=} options Control options.
	 */
	var CustomControl = function(options) {

		var options = options || {};

		var element = document.createElement('div');
		element.className = controlClassName + ' ol-unselectable ol-control';


		for(var i=0; i<args.length; i++) {
			var button = document.createElement('button');
			var arg = args[i];

			button.className = arg.className;
			$(button).click(arg.fn);
			element.appendChild(button);
		}

		ol.control.Control.call(this, {
			element: element,
			target: options.target
		});
	};

	ol.inherits(CustomControl, ol.control.Control);
	
	return new CustomControl();
}


$gis2016.fn.createMultiButtonControl = function(controlClassName) {
	var fns = Array.prototype.slice.call(arguments, 1);
	var roulette = $gis2016.fn.getRoulette(fns);

	/**
	 * @constructor
	 * @extends {ol.control.Control}
	 * @param {Object=} options Control options.
	 */
	var CustomControl = function(options) {

		var options = options || {};

		var button = document.createElement('button');

		var element = document.createElement('div');
		element.className = controlClassName + ' ol-unselectable ol-control';
		element.appendChild(button);

		ol.control.Control.call(this, {
			element: element,
			target: options.target
		});
		
		
		$(button).click(function(){
			var fn = roulette.next();
			button.className = fn.call(fn);
		});
		$(button).click();
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


$gis2016.fn.formatCoordinates = function(coordinates) {
	return $gis2016.config.map.projection + ' ' + 
		ol.coordinate.createStringXY(3)(coordinates);
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
 * TOOLS
 **********************************************************************/
$gis2016.tools.draw = new (function(map){

	//PRIVATE
	var active = false;
	var tool = this;
	var interaction;
	var layer;
	var sketch;
	var mode;
	var source;

	//PUBLIC
	this.deactivate = function() {
		if(active) {
			map.removeInteraction(interaction);
			map.removeLayer(layer);
			active = false;
			mode = undefined;
		}
	};

	this.clean = function() {
		if(active) {
			var m = mode;
			tool.deactivate();
			tool.activate(m);
		}
	}

	this.activate = function(m) {
		if(!active) {
			source = new ol.source.Vector();
			layer = $gis2016.fn.createVectorLayer(source);
			map.addLayer(layer);
			
			
			mode = m;
			interaction = new ol.interaction.Draw({
				source: source,
				type: mode
			});
		
			map.addInteraction(interaction);

			active = true;
		}
	}

	this.setMode = function(m) {
		if(!active) {
			tool.activate();
		}
		
		mode = m;
		map.removeInteraction(interaction);
		interaction = new ol.interaction.Draw({
			source: source,
			type: mode
		});
		map.addInteraction(interaction);
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
	
	this.getMode = function() {
		return mode;
	}

})($gis2016.map);


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
				' - Area parcial: ' + $gis2016.fn.formatArea(partialArea);
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
				' - Longitud parcial: ' + $gis2016.fn.formatLength(partialLength);
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
	coordinateFormat: $gis2016.fn.formatCoordinates,
	projection: $gis2016.config.map.projection,
	className: 'no-class',
	target: $gis2016.dom.coordinatesBox,
	undefinedHTML: '&nbsp;'
});

$gis2016.controls.layersControl = $gis2016.fn.createMultiButtonControl(
	'layers-box-control',
	function(){
		$($gis2016.dom.layersBox).toggle();
		return 'control-button layers-icon';
	}
);

$gis2016.controls.measure = $gis2016.fn.createMultiButtonControl(
	'measure-tool-control',
	function(){
		$gis2016.tools.measurePolygon.deactivate();
		$gis2016.tools.measureLineString.deactivate();
		$gis2016.tools.draw.deactivate();

		return 'control-button ruler-icon';
	},
	function(){
		$gis2016.tools.measureLineString.deactivate();
		$gis2016.tools.draw.deactivate();
		$gis2016.tools.measurePolygon.activate();
		
		return 'control-button polygon-icon';
	},
	function(){
		$gis2016.tools.measurePolygon.deactivate();
		$gis2016.tools.draw.deactivate();
		$gis2016.tools.measureLineString.activate();

		return 'control-button linestring-icon';
	}
);

$gis2016.controls.draw = $gis2016.fn.createMultiButtonBarControl(
	'draw-tool-control', {
		fn: function(){
			$('.draw-tool-button').toggle();
		},
		className: 'control-button pencil-icon'
	}, {
		fn: function(){
			$gis2016.tools.measurePolygon.deactivate();
			$gis2016.tools.measureLineString.deactivate();
			$gis2016.tools.draw.setMode('LineString');
		},
		className: 'control-button draw-tool-button linestring-icon'
	}, {
		fn: function(){
			$gis2016.tools.measurePolygon.deactivate();
			$gis2016.tools.measureLineString.deactivate();
			$gis2016.tools.draw.setMode('Polygon');
		}, 
		className: 'control-button draw-tool-button polygon-icon'
	}, {
		fn: function(){
			$gis2016.tools.measurePolygon.deactivate();
			$gis2016.tools.measureLineString.deactivate();
			$gis2016.tools.draw.setMode('Point');
		},
		className: 'control-button draw-tool-button point-icon'
	}, {
		fn: function(){
			$gis2016.tools.draw.clean();
		},
		className: 'control-button draw-tool-button broom-icon'
	}
);


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

//add measure  control
$gis2016.map.addControl($gis2016.controls.measure);

//add draw  control
$gis2016.map.addControl($gis2016.controls.draw);

//add scaleline control
$gis2016.map.addControl(new ol.control.ScaleLine());

$('.draw-tool-button').hide();
