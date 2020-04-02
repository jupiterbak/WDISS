@echo off
SET original=%CD%
cd %original%/ontology_server
start start_ontology_server.bat
ping 127.0.0.1 -n 16 > nul
cd %original%/skillmonitoring
start start_skill_monitoring.bat
cd %original%
