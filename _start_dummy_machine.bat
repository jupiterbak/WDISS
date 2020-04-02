@echo off
SET original=%CD%
cd %original%/ressources/dummymachine
start start_dummymachine.bat
ping 127.0.0.1 -n 16 > nul
cd %original%
