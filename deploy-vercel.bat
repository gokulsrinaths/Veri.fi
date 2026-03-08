@echo off
echo Deploying veri.fi frontend to Vercel...
cd /d "%~dp0apps\web"
call npx vercel deploy --yes
if errorlevel 1 (
  echo.
  echo If you see login/link prompts, run manually: cd apps\web ^&^& vercel deploy
  pause
) else (
  echo.
  echo Done. Copy the URL above into HACKATHON-SUBMISSION.md as Live demo.
  pause
)
