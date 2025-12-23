<?php
class AdminController extends Controller
{
    public function addUser()
    {
        if (!isset($_SESSION['username']) || User::getRole($_SESSION['username']) !== 'Admin') {
            die('Access denied.');
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $name = $_POST['username'];
            User::create($_POST['username'], $_POST['password'], $_POST['role']);
            $time = date('Y-m-d H:i:s');
            Database::query("INSERT INTO logs (username, updated_category, previous_value, updated_value, timestamp)
                         VALUES (?, 'create_account', '', 'success', ?)", [$name, $time], 'ss');
        }
        $users = User::getAll();
        $this->view('manage_users', ['users' => $users]);
    }

    public function deleteUser()
    {
        $role = User::getRole($_SESSION['username']);
        if (!in_array($role, ['Admin'])) {
            die('Access denied.');
        }

        if (isset($_GET['id'])) {
            User::delete($_GET['id']);
        }
        header('Location: index.php?action=manage_users');
    }
}