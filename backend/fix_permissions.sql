-- Run this as a PostgreSQL superuser (postgres)

-- Connect to the cashflow database first:
-- \c cashflow

-- Drop and recreate the user with proper permissions
DROP USER IF EXISTS cashflowuser;
CREATE USER cashflowuser WITH PASSWORD 'yourstrongpassword';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE cashflow TO cashflowuser;

-- Connect to the database and grant schema permissions
\c cashflow

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO cashflowuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cashflowuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cashflowuser;

-- Set default permissions for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cashflowuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cashflowuser;

-- Make the user the owner of the schema
ALTER SCHEMA public OWNER TO cashflowuser;
