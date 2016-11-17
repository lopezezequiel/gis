<?php

namespace gis2016;

class Database 
{
    private static $db;


    private function __clone(){}

    public static function getInstance() {
        if (!(self::$db instanceof \PDO)) {
            self::$db = new \PDO('pgsql:host=localhost;port=5432;dbname=gisdb20162;user=postgres;password=postgres');
            self::$db->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        }
        return self::$db;
    }

}
?>
