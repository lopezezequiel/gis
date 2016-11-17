<?php
$schema = json_decode($_POST['schema']);

include 'Layer.php';

$layer = new \gis2016\Layer($schema->name);
print_r($schema);

switch($schema->type) {
	case 'Point': $template = 'templates/point.template'; break;
	case 'Line': $template = 'templates/line.template'; break;
	case 'Polygon': $template = 'templates/polygon.template'; break;
	default: echo "Tipo de capa inválido";
}

foreach($schema->fields as $name => $type) {
	switch($type) {
		case 'Integer': $layer->addIntegerAttribute($name); break;
		case 'String': $layer->addStringAttribute($name); break;
		case 'Date': $layer->addDateAttribute($name); break;
		case 'Decimal': $layer->addDecimalAttribute($name); break;
		default: echo "Tipo de atributo inválido";
	}
}

echo $layer->toDDL($template);

?>
