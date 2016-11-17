--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: <?php echo $tableName; ?>; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE <?php echo $tableName; ?> (
    gid integer NOT NULL
<?php foreach ($fields as $field): ?>
    ,<?php echo $field; ?>  
<?php endforeach ?>
);


ALTER TABLE <?php echo $tableName; ?> OWNER TO postgres;

--
-- Name: <?php echo $tableName; ?>_gid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE <?php echo $tableName; ?>_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE <?php echo $tableName; ?>_gid_seq OWNER TO postgres;

--
-- Name: <?php echo $tableName; ?>_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE <?php echo $tableName; ?>_gid_seq OWNED BY <?php echo $tableName; ?>.gid;


--
-- Name: gid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY <?php echo $tableName; ?> ALTER COLUMN gid SET DEFAULT nextval('<?php echo $tableName; ?>_gid_seq'::regclass);


--
-- Name: <?php echo $tableName; ?>_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY <?php echo $tableName; ?>
    ADD CONSTRAINT <?php echo $tableName; ?>_pkey PRIMARY KEY (gid);


--
-- Name: <?php echo $tableName; ?>_geom_idx; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX <?php echo $tableName; ?>_geom_idx ON <?php echo $tableName; ?> USING gist (geom);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

