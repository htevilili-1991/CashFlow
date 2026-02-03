-- Connect to PostgreSQL as superuser and run these commands:

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO cashflowuser;

-- Grant create permission on schema
GRANT CREATE ON SCHEMA public TO cashflowuser;

-- Grant all permissions on all tables in the schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cashflowuser;

-- Grant all permissions on all sequences in the schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cashflowuser;

-- Set default permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cashflowuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cashflowuser;
