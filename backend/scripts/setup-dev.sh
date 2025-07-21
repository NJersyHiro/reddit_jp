#!/bin/bash

echo "=== Itaita Development Setup ==="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker first:"
    echo ""
    echo "Visit: https://docs.docker.com/get-docker/"
    echo ""
    exit 1
fi

echo "✓ Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Please install Docker Compose"
    exit 1
fi

echo "✓ Docker Compose is available"

# Navigate to backend directory
cd "$(dirname "$0")/.." || exit

# Start services
echo ""
echo "Starting PostgreSQL and Redis..."
if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi

# Wait for PostgreSQL to be ready
echo ""
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec itaita_postgres pg_isready -U itaita_user -d itaita_dev &> /dev/null; then
        echo "✓ PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL failed to start"
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Wait for Redis to be ready
echo ""
echo "Checking Redis..."
if docker exec itaita_redis redis-cli ping &> /dev/null; then
    echo "✓ Redis is ready!"
else
    echo "❌ Redis failed to start"
    exit 1
fi

# Generate Prisma client
echo ""
echo "Generating Prisma client..."
npm run prisma:generate

# Run migrations
echo ""
echo "Running database migrations..."
npm run prisma:migrate

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Services running:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "You can now run: npm run dev"
echo ""
echo "Other useful commands:"
echo "  - npm run prisma:studio   # Open Prisma Studio"
echo "  - docker compose logs -f  # View logs"
echo "  - docker compose down     # Stop services"