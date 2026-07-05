@echo off
cd /d "%~dp0"
echo Cleaning Zone Planner is starting...
echo Open http://localhost:5173 in your browser.
node server.js 5173
