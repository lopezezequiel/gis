<?php
namespace gis2016;

include './Layer.php';

header('Content-Type: application/json');
echo json_encode(Layer::getLayerNames());

?>
