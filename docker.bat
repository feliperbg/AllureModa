@echo off
REM AllureModa Docker Helper for Windows

if "%1"=="" goto help
if "%1"=="dev" goto dev
if "%1"=="prod" goto prod
if "%1"=="build" goto build
if "%1"=="up" goto up
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="clean" goto clean
goto help

:help
echo AllureModa Docker Commands:
echo   docker.bat dev     - Start development environment
echo   docker.bat prod    - Start production with Nginx
echo   docker.bat build   - Build all containers
echo   docker.bat up      - Start all services
echo   docker.bat down    - Stop all services
echo   docker.bat logs    - View logs
echo   docker.bat clean   - Remove containers and volumes
goto end

:dev
docker-compose up -d postgres backend frontend
echo.
echo Development environment started!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   Swagger:  http://localhost:5000/swagger
goto end

:prod
docker-compose --profile production up -d
echo.
echo Production environment started!
echo   Application: http://localhost
goto end

:build
docker-compose build
goto end

:up
docker-compose up -d
goto end

:down
docker-compose down
goto end

:logs
docker-compose logs -f
goto end

:clean
docker-compose down -v --rmi local
echo Cleaned all containers, volumes, and images
goto end

:end
