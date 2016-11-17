<?php

namespace gis2016;

include './LayerException.php';
include './Database.php';

class Layer
{
	private $name;
	private $schema;
	private $dbToSchema = array(
		'numeric' => 'Integer',
		'character varying' => 'String',
		'date' => 'Date',
		'double precision' => 'Decimal',
		'POINT' => 'Point',
		'MULTILINESTRING' => 'MultiLineString',
		'MULTIPOLYGON' => 'MultiPolygon'
	);
	private $schemaToDb = array(
		'Integer' => 'numeric(10,0)',
		'String' => 'character varying(254)',
		'Date' => 'date',
		'Decimal' => 'double precision',
		'Point' => 'geometry(Point)',
		'MultiLineString' => 'geometry(MultiLineString,4326)',
		'MultiPolygon' => 'geometry(MultiPolygon,4326)'
	);

	public static function getLayerNames()
	{
        $query = Database::getInstance()->query(
		
			"SELECT  c.relname as name
			FROM pg_catalog.pg_class c
			LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
			WHERE
				n.nspname <> 'pg_catalog'
				AND n.nspname <> 'information_schema'
				AND n.nspname !~ '^pg_toast'
				AND pg_catalog.pg_table_is_visible(c.oid) 
				AND c.relkind='r' 
				AND c.relname != 'spatial_ref_sys'
			"
		);

        return $query->fetchAll(\PDO::FETCH_COLUMN, 0);
    }
	
	function __construct($nameOrSchema)
	{
		
		if(is_string($nameOrSchema)) {
			$this->loadSchema($nameOrSchema);
		} else {
			$this->saveSchema($nameOrSchema);
		}
	}
	
	private function loadSchema($name)
	{
		
		$sql = 
			"SELECT 
				g.column_name,
				g.data_type,
				f.type
			FROM 
				 information_schema.columns as g JOIN
				 geometry_columns AS f 
			ON (g.table_schema = f.f_table_schema and g.table_name = f.f_table_name )
			WHERE
				g.column_name != 'gid'
				AND table_name = :table_name";

		$query = Database::getInstance()->prepare($sql);
		$query->bindParam(':table_name', $name);
		$query->execute();

		if($query->rowCount() == 0) {
			throw new LayerException('La capa no existe', 1);
		} 

        $schema = new \stdClass();
        $schema->name = $name;
        $schema->fields = new \stdClass();

        while ($row = $query->fetch(\PDO::FETCH_ASSOC)) {
			$type = $row['column_name'] == 'geom' ? $row['type'] : $row['data_type'];
			$schema->fields->$row['column_name'] = $this->dbToSchema[$type];
        }
        
        $this->name = $name;
        $this->schema = $schema;
	}

	private function saveSchema($schema)
	{
        $tableName = $schema->name;
        $fields = array();
        foreach($schema->fields as $name => $type) {
			$fields[$name] = '"' . $name . '" ' . $this->schemaToDb[$type];
		}
        
		ob_start();
		include 'template.php';
		$sql = ob_get_contents();
		ob_end_clean();

		try {
			Database::getInstance()->exec($sql);
			$this->name = $tableName;
			$this->schema = $schema;
		} catch (\PDOException $e) {
			if($e->getCode() == '42P07') {
				throw new LayerException('La capa ya existe', 2);
			}
		}

	}

	public function add($data)
	{
		
		$d = array();
		foreach($data as $name => $value) {
			if($name == 'geom') {
				$d[$name] = 'ST_SetSRID(ST_GeomFromGeoJSON(\'' . $data['geom'] . '\'), 4326)';
			} else {
				$d[$name] = '\'' . $data[$name] . '\'';
			}
		}
		
		$sql = sprintf(
			"INSERT INTO " . $this->name . " (%s) VALUES ("
			. implode(',', array_values($d)) . ")",
			implode(',', array_keys($d))
		);
		

		try {
			$db = Database::getInstance();
			$query = $db->query($sql);
			return array('gid' => $db->lastInsertId());
		} catch (\PDOException $e) {
			if($e->getCode() == '42703') {
				throw new LayerException('Campos inválidos', 3);
			}
		}
	}

	public function remove($gid)
	{
		$sql = "DELETE FROM " . $this->name . " WHERE gid = :gid";
		$query = Database::getInstance()->prepare($sql);
		$query->bindParam(':gid', $gid);

		try {
			$query->execute();
		} catch (\PDOException $e) {
			print_r($e);
		}
	}
	
	public function getData()
	{
		
		$db = Database::getInstance();
		
		//create tempTable
        $query = $db->exec(
			"SELECT *, ST_AsGeoJSON(geom) AS geom_json 
			INTO tempTable
			FROM " . $this->name . ";
			
			ALTER TABLE tempTable DROP COLUMN geom;
			
			ALTER TABLE tempTable RENAME geom_json TO geom;"
		);

		//get data
        $query = $db->query(
			"SELECT * FROM tempTable"
		);
		$data = array();
		while($row = $query->fetch(\PDO::FETCH_ASSOC)) {
			$row['geom'] = json_decode($row['geom']);
			$data[intval($row['gid'])] = $row;
		}
		
		
		//remove tempTable
        $query = $db->exec(
			"DROP TABLE tempTable;"
		);
		
		return $data;
	}
	
	public function getSchema()
	{
		return $this->schema;
	}
	
	public function getName()
	{
		return $this->name;
	}

}
?>
