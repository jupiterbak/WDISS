@echo off
SET original=%CD%
cd %original%/ressources/dummymachine
call install_dummymachine.bat
cd %original%/ressources/dummymachine2
call install_dummymachine.bat
cd %original%/ontology_client
call install_ontology_client.bat
cd %original%/skillmonitoring
call install_skillmonitoring.bat
cd %original%
