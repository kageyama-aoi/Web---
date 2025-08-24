FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf \
    && a2enmod rewrite

WORKDIR /var/www/html