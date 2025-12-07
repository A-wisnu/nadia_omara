@echo off
echo ===========================================
echo Starting IEF Vending Machine (MVP)
echo ===========================================

:: Start Backend in a new window
echo Starting Backend (Golang)...
start "IEF Backend Server" /D "backend" cmd /c "go run main.go && pause"

:: Wait a moment for backend to initialize
timeout /t 2 >nul

:: Start Frontend in a new window
echo Starting Frontend (React/Vite)...
start "IEF Frontend" /D "frontend" cmd /c "npm run dev"

echo.
echo ===========================================
echo All services started!
echo -------------------------------------------
echo Backend running at: http://localhost:8080
echo Frontend running at: http://localhost:5173
echo.
echo Close the popup windows to stop the servers.
echo ===========================================
pause
