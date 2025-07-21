#!/bin/bash

echo "=== Itaita Database Setup ==="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed!"
    echo "Please install PostgreSQL first:"
    echo ""
    echo "Ubuntu/Debian: sudo apt update && sudo apt install postgresql postgresql-contrib"
    echo "macOS: brew install postgresql"
    echo ""
    exit 1
fi

echo "✓ PostgreSQL is installed"

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "❌ PostgreSQL is not running!"
    echo "Please start PostgreSQL:"
    echo ""
    echo "Ubuntu/Debian: sudo systemctl start postgresql"
    echo "macOS: brew services start postgresql"
    echo ""
    exit 1
fi

echo "✓ PostgreSQL is running"

# Read database credentials from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found!"
    echo "Please create a .env file in the backend directory"
    exit 1
fi

# Parse DATABASE_URL
DB_URL=$DATABASE_URL
if [[ $DB_URL =~ postgresql://([^:]+):([^@]+)@([^:/]+):?([0-9]+)?/([^?]+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]:-5432}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "❌ Invalid DATABASE_URL format!"
    echo "Expected format: postgresql://user:password@host:port/database"
    exit 1
fi

echo ""
echo "Database configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Create database user if it doesn't exist
echo "Creating database user..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "User might already exist"

# Create database
echo "Creating database..."
sudo -u postgres createdb -O $DB_USER $DB_NAME 2>/dev/null || echo "Database might already exist"

# Grant privileges
echo "Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Enable UUID extension
echo "Enabling UUID extension..."
sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Test connection
echo ""
echo "Testing connection..."
if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
    echo "✓ Database connection successful!"
else
    echo "❌ Failed to connect to database!"
    echo "Please check your credentials and try again."
    exit 1
fi

echo ""
echo "=== Database setup complete! ==="
echo ""
echo "You can now run:"
echo "  npx prisma migrate dev"
echo "  npm run dev"