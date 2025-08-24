<?php
declare(strict_types=1);

/**
 * Cookie-based authentication needs a blowfish secret.
 * It should be a 32-character long random string.
 * You can generate one here: https://www.phpmyadmin.net/blowfish-secret/
 */
$cfg['blowfish_secret'] = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; // <-- 32文字のランダムな文字列に変更

$i = 1;

/*
 * Server Configuration
 */
$cfg['Servers'][$i]['host'] = 'db'; // Connect to the 'db' service
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = false;

/*
 * SSL settings
 * Enable SSL for the connection
 */
$cfg['Servers'][$i]['ssl'] = true;

/**
 * Verifies the server certificate.
 * Recommended for production, but can be set to false for local dev
 * if you are using self-signed certificates without a proper CA.
 */
$cfg['Servers'][$i]['ssl_verify'] = false;


/*
 * Directories for saving/loading files from server
 */
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';
