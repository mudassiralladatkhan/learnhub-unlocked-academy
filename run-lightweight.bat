@echo off
echo === LearnHub Lightweight Mode ====
echo Starting application with performance optimizations...

set VITE_LIGHTWEIGHT_MODE=true
npm run dev:light

if %ERRORLEVEL% NEQ 0 (
  echo Error running lightweight mode
  exit /b %ERRORLEVEL%
)
