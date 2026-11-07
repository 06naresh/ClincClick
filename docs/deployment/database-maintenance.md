# Database Maintenance – Backups & Restore

The primary development database is `service_booking_db` managed through **pgAdmin 4**.
This guide covers pgAdmin 4 backup/restore plus CLI equivalents.

## Backup with pgAdmin 4

1. Connect to the local PostgreSQL server via pgAdmin 4.
2. Expand **Servers → PostgreSQL → Databases**.
3. Right-click `service_booking_db` → **Backup…**.
4. Set file path (for example `C:\backups\service_booking_db_YYYYMMDD.binary`).
5. Select format **Custom** (recommended) and compression if needed.
6. Under backup options, include **Blobs** and **Owner**.
7. Click **Backup** and verify the file from the Messages panel.

## Restore with pgAdmin 4

1. Right-click **Databases → Create → Database**, name it `service_booking_db_restore` (or drop/recreate the original if allowed).
2. Right-click the database → **Restore…**.
3. Select the same backup file, format **Custom**.
4. Click **Restore** and review the Messages panel.

## CLI Equivalents

Backup:
```bash
pg_dump -h localhost -p 5432 -U postgres -d service_booking_db -Fc -f service_booking_db.dump
```

Restore:
```bash
pg_restore -h localhost -p 5432 -U postgres -d service_booking_db -Fc -c service_booking_db.dump
```

Database migrations rely on Alembic. Keep Alembic migrations in sync, and never modify the application schema manually in production without a migration.
