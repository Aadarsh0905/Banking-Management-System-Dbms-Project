#!/bin/bash
set -e

echo "============================================================"
echo "🏦 Starting Banking Management System on Render"
echo "============================================================"

PORT="${PORT:-8080}"
echo "Render Port configured: ${PORT}"

# 1. Initialize MariaDB/MySQL data dir if missing
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Initializing MySQL system tables..."
    mysql_install_db --user=mysql --datadir=/var/lib/mysql > /dev/null 2>&1
fi

# 2. Start MySQL service in background
echo "Starting MySQL daemon..."
mysqld_safe --datadir='/var/lib/mysql' --skip-syslog &
MYSQL_PID=$!

# Wait for MySQL to become ready
echo "Waiting for MySQL to accept connections..."
while ! mysqladmin ping --silent; do
    sleep 1
done
echo "MySQL is UP and running."

# 3. Create database, user, and run seed scripts if not already present
if ! mysql -e "USE banking_db" > /dev/null 2>&1; then
    echo "Creating database 'banking_db' and granting privileges..."
    mysql -e "CREATE DATABASE IF NOT EXISTS banking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql -e "CREATE USER IF NOT EXISTS 'banking_user'@'localhost' IDENTIFIED BY 'banking_password';"
    mysql -e "CREATE USER IF NOT EXISTS 'banking_user'@'127.0.0.1' IDENTIFIED BY 'banking_password';"
    mysql -e "GRANT ALL PRIVILEGES ON banking_db.* TO 'banking_user'@'localhost';"
    mysql -e "GRANT ALL PRIVILEGES ON banking_db.* TO 'banking_user'@'127.0.0.1';"
    mysql -e "FLUSH PRIVILEGES;"

    echo "Running 01_schema.sql..."
    mysql banking_db < /docker-entrypoint-initdb.d/01_schema.sql || true

    echo "Running 02_indexes_views_procedures.sql..."
    mysql banking_db < /docker-entrypoint-initdb.d/02_indexes_views_procedures.sql || true

    echo "Running 03_seed_data.sql..."
    mysql banking_db < /docker-entrypoint-initdb.d/03_seed_data.sql || true

    echo "Database migrations and seeding complete!"
else
    echo "Database 'banking_db' already exists."
fi

# 4. Generate dynamic Nginx configuration listening on Render's assigned $PORT
cat <<EOF > /etc/nginx/sites-available/default
server {
    listen ${PORT};
    listen [::]:${PORT};
    server_name _;

    # React Frontend Static Assets
    location / {
        root /var/www/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    # Reverse proxy to Spring Boot Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8081/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 5. Start Nginx
echo "Starting Nginx on port ${PORT}..."
nginx

# 6. Start Spring Boot on internal port 8081
echo "Starting Spring Boot application on internal port 8081..."
exec java -Dserver.port=8081 \
          -Dserver.servlet.context-path=/api \
          -Dspring.datasource.url="jdbc:mysql://127.0.0.1:3306/banking_db?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true" \
          -Dspring.datasource.username=banking_user \
          -Dspring.datasource.password=banking_password \
          -Dspring.jpa.hibernate.ddl-auto=update \
          -Xms128m -Xmx350m \
          -jar /app/app.jar
