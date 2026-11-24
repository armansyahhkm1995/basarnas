@echo off
title ROV Trainer Simulator - Basarnas 2026 Launcher
cd /d "%~dp0"
echo =====================================================================
echo   MEMBUKA LAUNCHER SIMULATOR ROV BASARNAS 2026 (STATION TRAINEE)
echo   Design System: Falah One x Basarnas Oceanic Dark Tactical
echo   3D Spatial Viewport: Three.js WebGL (Offline Ready)
echo =====================================================================
echo.
echo Memulai server lokal simulator pada port 8080...
start /b python -m http.server 8080 --bind 127.0.0.1 >nul 2>&1
timeout /t 1 /nobreak >nul
echo Membuka antarmuka launcher di browser...
start "" "http://localhost:8080"
echo.
echo Simulator aktif di: http://localhost:8080
echo Tips: Tekan F11 di browser untuk mode simulator stasiun layar penuh.
echo.
pause
