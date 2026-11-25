#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=========================================="
echo "STARTING DEPLOYMENT BUILD ON RENDER"
echo "=========================================="

# 1. Upgrade pip & install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# 2. Build React Frontend (if Node/npm is present)
if [ -d "frontend" ] && command -v npm &> /dev/null; then
  echo "Building React frontend with Vite..."
  cd frontend
  npm install
  npm run build
  cd ..
fi

# 3. Run database migrations
echo "Applying database migrations..."
python backend/manage.py migrate

# 4. Seed initial default demo records and accounts if clean
echo "Seeding default accounts and data..."
python backend/manage.py seed_data

# 5. Collect all static files (Django + React build)
echo "Collecting static files for WhiteNoise..."
python backend/manage.py collectstatic --no-input

echo "=========================================="
echo "DEPLOYMENT BUILD FINISHED SUCCESSFULLY!"
echo "=========================================="
