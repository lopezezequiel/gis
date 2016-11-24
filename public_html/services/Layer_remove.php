<?php
namespace gis2016;

include './Layer.php';

$name = $_POST['name'];
$gid = $_POST['gid'];

header('Content-Type: application/json');
$layer = new Layer($name);
echo json_encode($layer->remove($gid));

?>
