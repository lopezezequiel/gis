/***********************************************************************
 * DOM ELEMENTS
 **********************************************************************/
$gis2016.layers = [];

$gis2016.dom.mapBox = document.getElementById('map');
$gis2016.dom.layersBox = document.getElementById('layersBox');
$gis2016.dom.infoBox = document.getElementById('infoBox');
$gis2016.dom.coordinatesBox = document.getElementById('coordinatesBox');
$gis2016.dom.geometryFormBox = document.getElementById('geometryFormBox');


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


$gis2016.SyncLayer = (function(map) {
	var fn = {};
	var layers = {};
	
	var Layer = function(schema) {
		
		var data;
		var source = new ol.source.Vector({
		  format: new ol.format.GeoJSON()
		});
		var layer = $gis2016.fn.createVectorLayer(source);

		var $this = this;
		
		
		var render = function() {

			if(data) {
				source.clear();
				var features = [];
				
				$.each(data, function(i, v) {
					if(v.geom) {
						features.push({
							type: 'Feature',
							geometry: v.geom
						});
					}
				});
			
				var featureCollection = {
					type: 'FeatureCollection', 
					features: features
				}
				
				var format = new ol.format.GeoJSON();
				source.addFeatures(format.readFeatures(
					featureCollection,
					{
						featureProjection: 'EPSG:4326'
					} 
				));
			}
		}

		this.getName = function() {
			return schema.name;
		}

		this.getSchema = function(){
			return schema;
		}
		
		this.getData = function(fnDone, fnFail) {
			//if data was loaded
			if(data) {
				fnDone.call(fnDone, data);
				return;
			}

			//if it was not loaded
			$.post( "services/Layer_getData.php", {name: schema.name})
				.done(function(d) {
					data = d;
					render();
					fnDone.call(fnDone, data);
				})
				.fail(fnFail);
		}
		
		this.add = function(row, fnDone, fnFail) {
			console.log({
				name: schema.name,
				fields: row
			});
			$.post( "services/Layer_add.php", {
				name: schema.name,
				fields: JSON.stringify(row)
			})
				.done(function(d) {
					console.log(d);
					row.gid = d.gid;
					if(data) {
						data[row.gid] = row;
					}
					render();
					fnDone.call(fnDone, d.gid);
				})
				.fail(function(e) { console.log(e);});
		}
		
		this.remove = function(gid, fnDone, fnFail) {
			$.post( "services/Layer_remove.php", {name: schema.name})
				.done(function() {
					if(data) {
						delete data[gid];
					}
					render();
					fnDone.call(fnDone);
				})
				.fail(fnFail);
		}
		
		this.show = function() {
			$this.getData(function() {
				map.addLayer(layer);
			});
		}
		
		this.hide = function() {
			map.removeLayer(layer);
		}
	}
	

	fn.loadLayer = function(name, fnDone, fnFail) {
		
		//if layer was loaded
		if(layers[name]) {
			fnDone.call(fnDone, layers[name]);
			return;
		}

		//if it was not loaded
		$.post( "services/Layer_loadLayer.php", {name: name})
			.done(function(schema) {
				layers[name] = new Layer(schema);
				fnDone.call(fnDone, layers[name]);
			})
			.fail(fnFail);
	}
	
	fn.createLayer = function(schema, fnDone, fnFail) {
		$.post( "services/Layer_createLayer.php", {schema: schema})
			.done(function() {
				layers[schema.name] = new Layer(schema);
				fnDone.call(fnDone, layers[schema.name]);
			})
			.fail(fnFail);		
	}
	
	fn.removeLayer = function(name, fnDone, fnFail) {
		$.post( "services/Layer_removeLayer.php", {name: name})
			.done(function() {
				delete layers[schema.name];
				fnDone.call(fnDone);
			})
			.fail(fnFail);		
	}
	
	fn.getLayerNames = function(fnDone, fnFail) {
		$.post( "services/Layer_getLayerNames.php")
			.done(function(names) {
				fnDone.call(fnDone, names);
			})
			.fail(fnFail);		
	}
	
	return fn;
})($gis2016.map);


$gis2016.LayerBox = (function() {
	var fn = {};
	var layerList = document.getElementById('layer-list');

	
	var createLi = function() {
		var li = document.createElement('li');
		li.className = 'layer-list-element';
		return li;
	}

	var createCheckBox = function() {
		var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
		checkbox.checked = false;
		return checkbox;
	}

	var createLabel = function(name) {
		var label = document.createElement('label');
		label.appendChild(document.createTextNode(name));
		return label;
	}

	fn.addLayer = function(layer) {
		
		var li = createLi();

		var checkbox = createCheckBox();
		li.appendChild(checkbox);

		var label = createLabel(layer.getName());
		li.appendChild(label);

		layerList.appendChild(li);
		
		$(li).click(function() {
			$('.layer-list-element').removeClass('selected-layer-list-element');
			$(this).addClass('selected-layer-list-element');
			$gis2016.tools.measurePolygon.deactivate();
			$gis2016.tools.measureLineString.deactivate();
			$gis2016.tools.draw.setMode(layer.getSchema().fields.geom, layer);
		});

		$(checkbox).change(function() {
			if(this.checked) {
				layer.show();
			} else {
				layer.hide();
			}
		});

	}
	
	return fn; 
})();

$gis2016.GeometryForm = function(layer, geom) {
	
	$gis2016.tools.draw.deactivate();
	$gis2016.tools.draw.setMode(layer.getSchema().fields.geom, layer);

	var form = document.createElement('form');
	form.onsubmit = function() {
		return false;
	}

	$.each(layer.getSchema().fields, function(fName, fType) {
		
		if(fName == 'geom') {
			return;
		}
		
		var label = document.createElement('label');
		label.appendChild(document.createTextNode(fName));
		
		var input = document.createElement('input');
		input.type = 'text';
		input.name = fName;
		
		form.appendChild(label);
		form.appendChild(input);
		form.appendChild(document.createElement('br'));
		
		
	});
		
	var cancel = document.createElement('button');
	cancel.appendChild(document.createTextNode('Cancelar'));
	form.appendChild(cancel);
	$(cancel).click(function() {
		$($gis2016.dom.geometryFormBox).hide();
	});

	var accept = document.createElement('button');
	accept.appendChild(document.createTextNode('Aceptar'));
	form.appendChild(accept);
	$(accept).click(function() {
		var format = new ol.format.GeoJSON();
		var data = $gis2016.fn.getFormData(form);
		data.geom = format.writeFeature(geom, {
			featureProjection: $gis2016.map.getView().getProjection()
		});
		data['geom'] = JSON.parse(data.geom).geometry;
		

		layer.add(data, function() {
			$($gis2016.dom.geometryFormBox).hide();
		}, function() {
			alert('No se pudo agregar la geometría');
		});
	});
	
	$($gis2016.dom.geometryFormBox)
	.empty()
	.append(form)
	.show();
	
};



/***********************************************************************
 * FUNCTIONS
 **********************************************************************/



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

$gis2016.fn.toArray = function(object) {

	var map = [], i = 0;

	$.each(object, function(key, value) {
		map.push(value);
	});
	
	return map;
}

$gis2016.fn.getFormData = function(form) {
	var control, name, data = {}, i = 0;

	for (; i<form.elements.length; i++) {
		control = form.elements[i];
		name = control.getAttribute('name');
		if(name != null) {
			
			if(control.tagName.toLowerCase() == 'select' && control.hasAttribute('multiple')) {
				data[name] = $.toArray($.map(control.options, function(_, option) {
					return option.selected ? option.value : null;
				}));
			} else {
				data[name] = control.value;
			}
		}
	}
	
	return data;
}

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

	this.setMode = function(m, l) {
		if(!active) {
			tool.activate();
		}
		mode = m;
		map.removeInteraction(interaction);
		interaction = new ol.interaction.Draw({
			source: source,
			type: mode
		});

		interaction.on('drawstart', function(e) {
			sketch = e.feature;
		}, this);

		interaction.on('drawend', function(e) {
			$gis2016.GeometryForm(l, sketch);
		}, this);
		
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
				type: 'MultiLineString'
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

/***********************************************************************
 * CONSTRUCT
 **********************************************************************/
$gis2016.SyncLayer.getLayerNames(function(names) {	
	$.each(names, function(index, name) {
		$gis2016.SyncLayer.loadLayer(name, function(layer) {
			$gis2016.LayerBox.addLayer(layer);			
		}, function() {
			alert('No se pudo cargar la capa ' + name);
		});
	})
}, function() { 
	alert('No se pudo obtener los nombres de las capas del servidor'); 
});


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

//add scaleline control
$gis2016.map.addControl(new ol.control.ScaleLine());

$('.draw-tool-button').hide();

