#!/bin/bash


###############################################################################
#FUNCTIONS
###############################################################################
function isInstalled {
	echo $(dpkg-query -W -f='${Status}' $1 2>/dev/null | grep -c "ok installed")
}

function absPath {
	echo "`( cd \"$1\" && pwd )`"
}


###############################################################################
#VARS
###############################################################################
ROOT="`dirname \"$0\"`"
ROOT=$(absPath $ROOT/..)
WMS_URL="/cgi-bin/qgis_mapserv.fcgi?MAP=$ROOT/qgis/gis2016.qgs"
PG_DB=gisdb2016
VIRTUALHOST_DOMAIN=gis2016.com
VIRTUALHOST_ROOT=$(absPath $ROOT/public_html)
VIRTUALHOST_NAME=gis2016.conf
VIRTUALHOST_CONF="
<VirtualHost *:80>
	ServerAdmin mail@lopezezequiel.com
        DocumentRoot $VIRTUALHOST_ROOT
	DirectoryIndex index.html

	<Directory $VIRTUALHOST_ROOT>
		#Options Indexes FollowSymLinks
		AllowOverride None
		Require all granted
	</Directory>


	ScriptAlias /cgi-bin/ /usr/lib/cgi-bin/
	<Directory \"/usr/lib/cgi-bin/\">
		Options ExecCGI FollowSymLinks
		Require all granted
		AddHandler fcgid-script .fcgi
	</Directory>
</VirtualHost>
"

###############################################################################
#PROGRAM
###############################################################################
clear
sudo echo "need sudo" > /dev/null

for D in apache2 qgis qgis-mapserver libapache2-mod-fcgid postgresql postgresql-9.4-postgis-2.1 pgadmin3
do
	if [ $(isInstalled $D) -eq 0 ];
	then
		echo "Instalando $D...";
		sudo apt-get -y install $D > /dev/null;
	fi
done

echo "Habilitando fcgi y /cgi-bin en apache2"
sudo a2enmod fcgid > /dev/null
sudo a2enconf serve-cgi-bin > /dev/null

echo "Creando virtualhost '$VIRTUALHOST_NAME'"
sudo echo "$VIRTUALHOST_CONF" > tmp.conf
sudo mv tmp.conf /etc/apache2/sites-available/$VIRTUALHOST_NAME > /dev/null

echo "Deshabilitando virtualhost por defecto '000-default.conf'"
sudo a2dissite 000-default.conf > /dev/null

echo "Habilitando virtualhost '$VIRTUALHOST_NAME'"
sudo a2ensite $VIRTUALHOST_NAME > /dev/null

#echo "Configurando dominio $VIRTUALHOST_DOMAIN"
#sudo echo "127.0.0.10 $VIRTUALHOST_DOMAIN" >> /etc/hosts > /dev/null

echo "Reiniciando apache2..."
sudo service apache2 reload > /dev/null

echo "Seteando 'postgres' como contraseña para el usuario 'postgres'"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" > /dev/null

echo "Creando base de datos '$PG_DB'..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $PG_DB;"  > /dev/null
sudo -u postgres psql -c "
CREATE DATABASE $PG_DB
  WITH OWNER = postgres
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'es_AR.UTF-8'
       LC_CTYPE = 'es_AR.UTF-8'
       CONNECTION LIMIT = -1;" > /dev/null
sudo -u postgres psql -d $PG_DB -c "CREATE EXTENSION postgis" > /dev/null

echo "Descomprimiendo datos..."
sudo 7z x -y -o"$ROOT/install/pgdump" "$ROOT/install/pgdump/gisdb2016.dump.7z.001" > /dev/null

echo "Cargando base de datos..."
sudo -u postgres psql -v ON_ERROR_STOP=1 -d $PG_DB < "$ROOT/install/pgdump/gisdb2016.dump" > /dev/null

echo "Removiendo archivos temporales..."
sudo rm "$ROOT/install/pgdump/gisdb2016.dump" > /dev/null

echo "Creando wmsURL.js"
echo "\$wmsURL = '$WMS_URL';" > "$ROOT/public_html/js/wmsURL.js"

echo "Abriendo browser..."
nohup sensible-browser "http://127.0.0.1" > /dev/null &

echo "Ya podes probar el sitio http://127.0.0.1"
