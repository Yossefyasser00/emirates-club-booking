@echo off
echo.
echo  ==========================================
echo     Emirates cLub Football Stadium Platform
echo     Booking System - Development Mode
echo  ==========================================
echo.
echo  Starting Backend Server on port 5000...
start "Emirates cLub Backend" cmd /k "npx tsx server/index.ts"
timeout /t 2 /nobreak > nul

echo  Starting Frontend on port 5173...
start "Emirates cLub Frontend" cmd /k "npx vite"
timeout /t 3 /nobreak > nul

echo.
echo  Opening Customer Website...
start http://localhost:5173
echo.
echo  Customer Site:  http://localhost:5173
echo  Admin Portal:   http://localhost:5173/management
echo  Default Password: Emirates2026!
echo.
pause
