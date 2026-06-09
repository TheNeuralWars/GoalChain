@echo off
title Conectar al Servidor VPS de GoalChain - Hermes
echo =======================================================================
echo     🚀 BIENVENIDO AL CENTRO DE OPERACIONES DE GOALCHAIN (HERMES) 🚀
echo =======================================================================
echo.
echo Hola Lucas, este archivo automatiza tu conexion SSH con el servidor.
echo.
echo [!] REQUISITO: Tener la clave SSH configurada o la contraseña del VPS a mano.
echo [!] Para salir de la consola del servidor cuando termines, escribe 'exit'.
echo.
echo =======================================================================
echo Conectando a ubuntu@89.168.20.135 (Oracle)...
echo =======================================================================
echo.
ssh ubuntu@89.168.20.135 "export PATH=\"\$HOME/.local/bin:\$PATH\"; echo '=== Entorno cargado exitosamente ==='; echo 'Repo: /data/apps/GoalChain'; echo 'Prueba: hermes gateway status'; exec bash -i"
pause
