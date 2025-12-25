# AllureModa Docker Commands

.PHONY: help build up down logs clean dev prod

help:
	@echo "AllureModa Docker Commands:"
	@echo "  make dev      - Start development environment"
	@echo "  make prod     - Start production with Nginx"
	@echo "  make build    - Build all containers"
	@echo "  make up       - Start all services"
	@echo "  make down     - Stop all services"
	@echo "  make logs     - View logs"
	@echo "  make clean    - Remove containers and volumes"

# Development (without Nginx)
dev:
	docker-compose up -d postgres backend frontend
	@echo "Development environment started!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:5000"
	@echo "  Swagger:  http://localhost:5000/swagger"

# Production (with Nginx)
prod:
	docker-compose --profile production up -d
	@echo "Production environment started!"
	@echo "  Application: http://localhost"

# Build all images
build:
	docker-compose build

# Start services
up:
	docker-compose up -d

# Stop services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# Clean everything
clean:
	docker-compose down -v --rmi local
	@echo "Cleaned all containers, volumes, and images"

# Database commands
db-shell:
	docker-compose exec postgres psql -U alluremoda -d alluremoda

db-backup:
	docker-compose exec postgres pg_dump -U alluremoda alluremoda > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Rebuild specific service
rebuild-backend:
	docker-compose build backend
	docker-compose up -d backend

rebuild-frontend:
	docker-compose build frontend
	docker-compose up -d frontend
