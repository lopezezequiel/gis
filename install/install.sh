#!/bin/bash
clear
echo "Instalando dependencias..."
sudo apt-get install qgis qgis-mapserver postgresql postgresql-9.4-postgis-2.1 pgadmin3 > /dev/null
echo "Instalación de dependencias finalizada"
echo

echo "Seteando 'postgres' como contraseña para el usuario 'postgres'"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" > /dev/null

echo "Creando base de datos 'gisdb'..."
sudo -u postgres psql -c "DROP DATABASE if EXISTS gisdb;"  > /dev/null
sudo -u postgres psql -c "
CREATE DATABASE gisdb
  WITH OWNER = postgres
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'es_AR.UTF-8'
       LC_CTYPE = 'es_AR.UTF-8'
       CONNECTION LIMIT = -1;" > /dev/null

echo "Cargando base de datos..."
sudo -u postgres psql gisdb < ../data/gisdb.sql > /dev/null
