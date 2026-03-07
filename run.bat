@echo off
echo === veri.fi - Run locally ===
cd /d "%~dp0"

echo.
echo [1/4] Installing dependencies...
call pnpm install
if errorlevel 1 ( echo pnpm install failed. & exit /b 1 )

echo.
echo [2/4] Building shared package...
call pnpm --filter @verifi/shared build
if errorlevel 1 ( echo Build failed. & exit /b 1 )

echo.
echo [3/4] Database (optional - skip if no PostgreSQL)...
call pnpm db:push 2>nul
call pnpm db:seed 2>nul

echo.
echo [4/4] Starting API + Web...
echo API: http://localhost:3001
echo Web: http://localhost:3000
echo.
call pnpm dev
