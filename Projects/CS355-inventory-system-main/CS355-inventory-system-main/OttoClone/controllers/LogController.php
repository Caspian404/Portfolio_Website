<?php
class LogController extends Controller
{
    public function viewLogs()
    {
        if (!isset($_SESSION['username']) || User::getRole($_SESSION['username']) !== 'Admin') {
            die('Access denied.');
        }

        $logs = LogItem::getAll();
        $this->view('logs', ['logs' => $logs]);
    }
}