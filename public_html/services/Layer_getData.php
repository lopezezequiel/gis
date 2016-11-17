<?php
namespace gis2016;

include './Layer.php';

header('Content-Type: application/json');
$layer = new Layer($_POST['name']);
echo json_encode($layer->getData());

?>
