@echo off
setlocal
title SmaartSchedule Local Server
cd /d "%~dp0"

echo Folder project: %CD%
echo.

where docker >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker belum terinstal atau tidak masuk PATH.
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo Membuka Docker Desktop...

    if not exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
        echo ERROR: Docker Desktop tidak ditemukan.
        pause
        exit /b 1
    )

    start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
)

echo Menunggu Docker siap...
:WAIT_DOCKER
docker info >nul 2>&1
if errorlevel 1 (
    ping 127.0.0.1 -n 4 > nul
    goto WAIT_DOCKER
)

echo Docker sudah siap.
echo Menjalankan Supabase...
call npx --yes supabase start

if errorlevel 1 (
    echo.
    echo ERROR: Supabase gagal dijalankan.
    pause
    exit /b 1
)

echo.
echo Menjalankan aplikasi...
start "" cmd /c "ping 127.0.0.1 -n 9 > nul && start http://localhost:3000"
call npm run dev

echo.
echo Aplikasi berhenti atau mengalami error.
pause