<?php
class AuthController extends Controller
{
    public function login()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = $_POST['username'];
            $password = $_POST['password'];
            if (User::verify($username, $password)) {
                $_SESSION['username'] = $username;
                User::logAuthAttempt($username, 'success');
                header('Location: index.php?action=dashboard');
            } else {
                User::logAuthAttempt($username, 'fail');
                $this->view('login', ['error' => 'Invalid credentials']);
            }
        } else {
            $this->view('login');
        }
    }

    public function logout()
    {
        session_destroy();
        header('Location: index.php?action=login');
    }
}