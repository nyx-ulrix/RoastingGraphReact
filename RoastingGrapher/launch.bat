@echo off
setlocal enabledelayedexpansion
REM ========================================
REM Coffee Roasting Grapher - Launch Script
REM ========================================
REM This script will:
REM - Verify Node.js and npm are installed
REM - Kill all Node.js processes
REM - Stop any existing instances on port 5173
REM - Install/update dependencies if needed
REM - Start the Vite development server with clean cache
REM ========================================

echo ========================================
echo Coffee Roasting Grapher v1.1.0
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed or not in PATH
    echo Please install Node.js (which includes npm) from https://nodejs.org/
    pause
    exit /b 1
)

REM Display Node.js and npm versions
echo [INFO] Node.js version:
node --version
echo [INFO] npm version:
npm --version
echo.

REM Verify we're in the correct directory
cd /d "%~dp0"
if not exist "package.json" (
    echo [ERROR] package.json not found in current directory
    echo Please ensure this script is in the RoastingGrapher folder
    pause
    exit /b 1
)

echo ========================================
echo Stopping Existing Processes
echo ========================================

REM Kill all Node.js processes to ensure clean start
echo [INFO] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo [SUCCESS] Stopped all Node.js processes
) else (
    echo [INFO] No Node.js processes were running
)

REM Additional check for processes on port 5173
set "PORT_FOUND=0"
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173" ^| findstr "LISTENING"') do (
    set "PORT_FOUND=1"
    set "PID=%%a"
    echo [INFO] Found process on port 5173 (PID: !PID!)
    taskkill /F /PID !PID! >nul 2>&1
)

if !PORT_FOUND! EQU 1 (
    echo [INFO] Waiting for port to be released...
    timeout /t 2 /nobreak >nul
)
echo.

echo ========================================
echo Checking Dependencies
echo ========================================

if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed
    echo.
) else (
    echo [INFO] Verifying dependencies...
    call npm ci --prefer-offline >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [INFO] Updating dependencies...
        call npm install
        if %ERRORLEVEL% NEQ 0 (
            echo [ERROR] Failed to update dependencies
            pause
            exit /b 1
        )
        echo [SUCCESS] Dependencies updated
    ) else (
        echo [SUCCESS] Dependencies up to date
    )
    echo.
)

echo ========================================
echo Starting Development Server
echo ========================================
echo.
echo Application: Coffee Roasting Grapher
echo Version: 1.1.0
echo URL: http://localhost:5173
echo.
echo [TIP] After opening in browser, press Ctrl+Shift+R for hard refresh
echo [TIP] Or open DevTools (F12) and check "Disable cache"
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Development server exited with errors
    pause
    exit /b 1
)
