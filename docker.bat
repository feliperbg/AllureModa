@echo off
REM AllureModa Docker Helper for Windows

if "%1" neq "" goto run_arg

:menu
cls
echo ==========================================
echo   AllureModa Docker Helper
echo ==========================================
echo.
echo   [1] dev      - Start development environment
echo   [2] migrate  - Apply database migrations
echo   [3] logs     - View logs
echo   [4] clean    - Remove containers and volumes
echo   [5] build    - Build all containers
echo   [6] up       - Start all services (no build)
echo   [7] down     - Stop all services
echo   [8] prod     - Start production
echo.
set /p choice="Select an option (or type command): "

if "%choice%"=="1" goto dev
if "%choice%"=="dev" goto dev
if "%choice%"=="2" goto migrate
if "%choice%"=="migrate" goto migrate
if "%choice%"=="3" goto logs
if "%choice%"=="logs" goto logs
if "%choice%"=="4" goto clean
if "%choice%"=="clean" goto clean
if "%choice%"=="5" goto build
if "%choice%"=="build" goto build
if "%choice%"=="6" goto up
if "%choice%"=="up" goto up
if "%choice%"=="7" goto down
if "%choice%"=="down" goto down
if "%choice%"=="8" goto prod
if "%choice%"=="prod" goto prod

goto menu

:run_arg
if "%1"=="dev" goto dev
if "%1"=="prod" goto prod
if "%1"=="build" goto build
if "%1"=="up" goto up
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="clean" goto clean
if "%1"=="migrate" goto migrate
echo Invalid command: %1
pause
goto end

:dev
docker-compose up -d postgres backend frontend
echo.
echo Development environment started!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   Swagger:  http://localhost:5000/swagger
if "%1"=="" pause
goto end

:migrate
echo Applying database migrations...
cd Backend
dotnet ef database update
cd ..
echo Migrations applied!
if "%1"=="" pause
goto end

:prod
docker-compose --profile production up -d
echo.
echo Production environment started!
echo   Application: http://localhost
if "%1"=="" pause
goto end

:build
docker-compose build
if "%1"=="" pause
goto end

:up
docker-compose up -d
if "%1"=="" pause
goto end

:down
docker-compose down
if "%1"=="" pause
goto end

:logs
docker-compose logs -f
if "%1"=="" pause
goto end

:clean
docker-compose down -v --rmi local
echo Cleaned all containers, volumes, and images
if "%1"=="" pause
goto end

:end
