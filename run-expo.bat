@echo off
echo Starting ERPNext Mobile App...
echo.

REM Add Node.js to PATH
set PATH=%PATH%;C:\Program Files\nodejs

REM Check Node.js version
echo Node.js version:
"C:\Program Files\nodejs\node.exe" --version
echo.

REM Start Expo development server
echo Starting Expo development server...
"C:\Program Files\nodejs\npx.cmd" expo start -c

pause