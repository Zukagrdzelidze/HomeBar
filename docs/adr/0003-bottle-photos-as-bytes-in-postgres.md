# Bottle photos are stored as raw bytes in Postgres

Bottle photos are stored in the database as raw bytes plus a content type, and served from their own endpoint. They are not stored as base64 text (the original plan) or as files on disk. Base64 is about 33% larger, and it bloats every Bottle JSON response. Files on disk would split the data across two places to back up and would break on redeploys. At home-bar scale (dozens of photos, 5 MB max each), the database copes easily. If photo volume ever grows, the move is to object storage with a data migration.
