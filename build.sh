#!/usr/bin/env bash
# Exit on error
set -o errexit

# Upgrade pip & install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations
python myproject/manage.py migrate

# Collect static files
python myproject/manage.py collectstatic --no-input
