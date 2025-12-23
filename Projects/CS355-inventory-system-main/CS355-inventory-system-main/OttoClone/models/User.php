<?php
class User
{
    public static function getAll()
    {
        return Database::query("SELECT * FROM users");
    }

    public static function verify($username, $password)
    {
        $result = Database::query("SELECT password_hash FROM users WHERE username = ?", [$username], 's');
        if ($row = $result->fetch_assoc()) {
            return password_verify($password, $row['password_hash']);
        }
        return false;
    }

    public static function create($username, $password, $role = 'Worker')
    {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        Database::query("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", [$username, $hash, $role], 'sss');
    }

    public static function getRole($username)
    {
        $result = Database::query("SELECT role FROM users WHERE username = ?", [$username], 's');
        $row = $result->fetch_assoc();
        return $row ? $row['role'] : null;
    }

    public static function logAuthAttempt($username, $status)
    {
        $time = date('Y-m-d H:i:s');
        Database::query("INSERT INTO logs (username, updated_category, previous_value, updated_value, timestamp)
                         VALUES (?, 'login', '', ?, ?)", [$username, $status, $time], 'sss');
    }

    public static function delete($id)
    {
        $result = Database::query("SELECT username FROM users WHERE id = ?", [$id], 'i');
        $row = $result->fetch_assoc();
        $name = $row ? $row['username'] : null;
        $time = date('Y-m-d H:i:s');
            Database::query("INSERT INTO logs (username, updated_category, previous_value, updated_value, timestamp)
                         VALUES (?, 'del_account', '', 'success', ?)", [$name, $time], 'ss');
        Database::query("DELETE FROM users WHERE id = ?", [$id], 'i');
    }
}