-- Initialize the database for Therapeutic Nutrition App
-- This script runs automatically when PostgreSQL container starts

-- Create database if it doesn't exist
-- Note: The database is already created by Docker environment variables

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE nutrition_app TO nutrition_user;

-- Create schema for application tables
-- Note: Tables will be created by the application using Drizzle ORM

-- Insert some initial data if needed
-- This will be handled by the application's initialization logic