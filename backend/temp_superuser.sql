-- Run this as a PostgreSQL superuser (postgres)

-- Connect to the cashflow database:
-- \c cashflow

-- Grant superuser privileges temporarily for migration
ALTER USER cashflowuser WITH SUPERUSER;

-- After migration is complete, you can remove superuser:
-- ALTER USER cashflowuser WITH NOSUPERUSER;
