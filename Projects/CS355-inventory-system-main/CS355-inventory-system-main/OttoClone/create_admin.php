<?php
require_once 'core/Database.php';

$username = 'admin';
$password = 'password';
$role = 'Admin';
$hash = password_hash($password, PASSWORD_DEFAULT);

Database::query("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", [$username, $hash, $role], 'sss');

echo "Admin user created!";
