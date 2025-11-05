@echo off
setlocal enabledelayedexpansion
REM Batch file to launch Roasting Graph React project
REM Checks for Node.js, npm, and dependencies before launching
REM Stops any running instances before launching

echo ========================================
echo Roasting Graph React - Launch Script
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

REM Change to the RoastingGrapher directory
cd /d "%~dp0"
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the RoastingGrapher directory.
    pause
    exit /b 1
)

REM ========================================
REM Stop any running instances
REM ========================================
echo [INFO] Checking for running instances on port 5173...
echo.

REM Find and kill processes using port 5173 (Vite default port)
set "PORT_FOUND=0"
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173" ^| findstr "LISTENING"') do (
    set "PORT_FOUND=1"
    set "PID=%%a"
    echo [INFO] Found process using port 5173 (PID: !PID!)
    taskkill /F /PID !PID! >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo [SUCCESS] Stopped process on port 5173
    ) else (
        echo [WARNING] Could not stop process !PID! (may require admin rights or process already stopped)
    )
)

if !PORT_FOUND! EQU 0 (
    echo [INFO] No running instances found on port 5173
) else (
    REM Wait a moment for ports to be released
    echo [INFO] Waiting for ports to be released...
    timeout /t 2 /nobreak >nul
)
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] node_modules not found. Installing dependencies...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed successfully
    echo.
) else (
    echo [INFO] node_modules found. Checking for package updates...
    echo.
    
    REM Check if package-lock.json is newer than node_modules (rough check)
    REM If package.json was modified, we should reinstall
    echo [INFO] Verifying dependencies are up to date...
    call npm ci --prefer-offline >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [INFO] Some dependencies may be missing or outdated. Installing...
        call npm install
        if %ERRORLEVEL% NEQ 0 (
            echo [ERROR] Failed to install/update dependencies
            pause
            exit /b 1
        )
        echo [SUCCESS] Dependencies updated successfully
        echo.
    ) else (
        echo [SUCCESS] All dependencies are up to date
        echo.
    )
)

echo ========================================
echo Starting development server...
echo ========================================
echo.
echo The app will be available at http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

REM Launch the development server
call npm run dev

REM If the dev server exits, pause to see any error messages
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Development server exited with an error
    pause
    exit /b 1
)

