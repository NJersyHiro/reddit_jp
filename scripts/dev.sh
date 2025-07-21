#!/bin/bash

echo "Starting Itaita development environment..."

# Start Docker services
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

# Check if services are running
docker-compose ps

# Run database migrations
echo "Running database migrations..."
cd backend && npm run db:migrate

# Start backend in one terminal
echo "Starting backend server..."
npm run dev &

# Start frontend in another terminal
cd ../frontend
echo "Starting frontend server..."
npm run dev &

echo "Development environment is ready!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo "Database: postgres://localhost:5432/itaita_dev"
echo "Redis: redis://localhost:6379"
echo "Mail UI: http://localhost:1080"

# Keep script running
wait