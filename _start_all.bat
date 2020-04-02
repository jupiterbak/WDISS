@echo off
SET original=%CD%
cd %original%/ontology_server
start start_ontology_server.bat
cd %original%/ressources/dummymachine
start start_dummymachine.bat
ping 127.0.0.1 -n 16 > nul
cd %original%/ontology_client
start start_ontology_client.bat
cd %original%/skillmonitoring
start start_skill_monitoring.bat
cd %original%
