@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to start Kill The Time Demo from source.
  echo Install Node.js from https://nodejs.org/ and run this script again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is required to install and start Kill The Time Demo from source.
  echo Install Node.js from https://nodejs.org/; npm is included with the installer.
  pause
  exit /b 1
)

if not exist "node_modules\electron" (
  echo Installing dependencies...
  if exist "package-lock.json" (
    call npm ci
    if errorlevel 1 call npm install
  ) else (
    call npm install
  )
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting Kill The Time Demo...
call npm start -- %*
if errorlevel 1 (
  echo Kill The Time Demo exited with an error.
  pause
  exit /b 1
)

endlocal
