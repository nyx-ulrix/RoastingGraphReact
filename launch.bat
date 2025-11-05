@echo off
REM Batch file to launch Roasting Graph React project from root directory
REM Navigates to RoastingGrapher directory and runs the launch script

cd /d "%~dp0RoastingGrapher"
if exist "launch.bat" (
    call launch.bat
) else (
    echo [ERROR] RoastingGrapher directory or launch.bat not found
    echo Please run this from the project root directory
    pause
    exit /b 1
)

