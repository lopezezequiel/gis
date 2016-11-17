<?php

namespace gis2016;

class Layer
{
	
	private $name;
	private $fields = array();
	
	function __construct($name)
	{
		$this->name = $name;
	}

	private function addAttribute($name, $value) 
	{
		$this->fields[$name] = '"' . $name . '" ' . $value;		
	}
	
	public function addIntegerAttribute($name)
	{
		$this->addAttribute($name, 'numeric(10,0)');
	}
	
	public function addStringAttribute($name)
	{
		$this->addAttribute($name, 'character varying(254)');
	}
	
	public function addDecimalAttribute($name)
	{
		$this->addAttribute($name, 'double precision');
	}
	
	public function addDateAttribute($name)
	{
		$this->addAttribute($name, 'date');
	}

	public function toDDL($template)
	{        
        $tableName = $this->name;
        $fields = $this->fields;
        
		ob_start();
		include $template;
		$output = ob_get_contents();
		ob_end_clean();
		return $output;
	}

}

?>
