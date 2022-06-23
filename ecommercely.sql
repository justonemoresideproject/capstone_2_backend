\echo 'Delete and recreate ecommercely db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE ecommercely;
CREATE DATABASE ecommercely;
\connect ecommercely

\i ecommercely-schema.sql
\i ecommercely-seed.sql

\echo 'Delete and recreate ecommercely_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE ecommercely_test;
CREATE DATABASE ecommercely_test;
\connect ecommercely_test

\i ecommercely-schema.sql
\i ecommercely-seed.sql