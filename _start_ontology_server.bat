@echo off
SET original=%CD%
cd %original%/ontology_server
start start_ontology_server.bat
cd %original%
