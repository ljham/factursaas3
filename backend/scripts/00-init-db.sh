#!/bin/bash
set -e

echo "🚀 [init-db.sh] Iniciando configuración de base de datos PostgreSQL..."

# Variables de entorno
export PGHOST=postgres
export PGPORT=5432
export PGPASSWORD="$POSTGRES_PASSWORD"

echo "🗃️ Base datos app: $DB_APP_NAME"
echo "👤 Usuario app: $DB_APP_USER"
echo "🛠️  Conectando a la base '$POSTGRES_DB' en $PGHOST:$PGPORT como usuario '$POSTGRES_USER'..."

# Ejecutar comandos SQL con conexión explícita
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    
    -- Crear base de datos si no existe
    SELECT 'CREATE DATABASE ${DB_APP_NAME}'
    WHERE NOT EXISTS (
        SELECT FROM pg_database WHERE datname = '${DB_APP_NAME}'
    )\gexec

    -- Crear usuario si no existe
    DO \$\$
    BEGIN
       IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_APP_USER}') THEN
          CREATE USER ${DB_APP_USER} WITH ENCRYPTED PASSWORD '${DB_APP_PASSWORD}';
          RAISE NOTICE 'Usuario ${DB_APP_USER} creado exitosamente';
       ELSE
          RAISE NOTICE 'Usuario ${DB_APP_USER} ya existe';
       END IF;
    END
    \$\$;

    -- Otorgar privilegios
    GRANT ALL PRIVILEGES ON DATABASE ${DB_APP_NAME} TO ${DB_APP_USER};

    -- Confirmar creación
    SELECT 'Base de datos ${DB_APP_NAME} configurada correctamente' as resultado;

EOSQL

echo "✅ [init-db.sh] Configuración completada exitosamente"