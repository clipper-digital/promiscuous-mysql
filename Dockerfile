FROM mysql:5.7

ENV MYSQL_ROOT_PASSWORD root_password
ENV MYSQL_DATABASE promiscuous
ENV MYSQL_USER test_user
ENV MYSQL_PASSWORD test_user_password

COPY tests/data/schema.sql /docker-entrypoint-initdb.d/
