<?php
namespace gis2016;

include './Layer.php';

$schema = json_decode('{ 
	"name": "aqa21asr32a2",
	"type": "LINE",
	"fields": {
		"entero": "INTEGER",
		"texto": "STRING",
		"fecha": "DATE",
		"decimal": "DECIMAL"
	}
}');

$DSN = 'pgsql:host=localhost;port=5432;dbname=gisdb20162;user=postgres;password=postgres';
try {
	$db = new \PDO($DSN);
	$db->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
	$x = new \gis2016\Layer($db, $schema);

	$x->add(array('texto'=> 'mi texto', 'entero' => 5, 'decimal' => 1.45));
	$x->add(array('texto'=> 'sin texto', 'entero' => 3, 'decimal' => 1.38));

	print_r($x->getData());

	print_r($x->getSchema());

	print_r(\gis2016\Layer::getLayerNames($db));
	/*
	$x = new Layer($db, json_decode('{ 
		"name": "layer21sa2sa",
		"type": "LINE",
		"fields": {
			"entero": "INTEGER",
			"texto": "STRING",
			"fecha": "DATE",
			"decimal": "DECIMAL"
		}
	}'));

	$x->remove(10);
	//
	*/
} catch (\PDOException $e) {
	print_r($e);
}
?>
