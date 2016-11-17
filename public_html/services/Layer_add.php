<?php
namespace gis2016;

include './Layer.php';

$fields = $_POST['fields'];
$name = $_POST['name'];

header('Content-Type: application/json');
$layer = new Layer($name);
$fields = json_decode($fields, true);
$fields['geom'] = json_encode($fields['geom']);
echo json_encode($layer->add($fields));

?>
