@echo off
REM ========================================
REM Coffee Roasting Grapher v1.1.0
REM Root Launcher
REM ========================================
REM Navigates to the RoastingGrapher directory and launches the application

echo Starting Coffee Roasting Grapher v1.1.0...
echo.

cd /d "%~dp0RoastingGrapher"
if exist "launch.bat" (
    call launch.bat
) else (
    echo [ERROR] Cannot find RoastingGrapher\launch.bat
    echo Please ensure this script is in the project root directory
    pause
    exit /b 1
)
