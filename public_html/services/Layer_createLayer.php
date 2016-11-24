<?php
namespace gis2016;

include './Layer.php';

header('Content-Type: application/json');
$layer = new Layer(json_decode($_POST['schema']));
echo json_encode($layer->getData());

?>
