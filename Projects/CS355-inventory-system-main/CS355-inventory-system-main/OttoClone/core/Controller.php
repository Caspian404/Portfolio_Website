<?php
class Controller
{
    protected function view($view, $data = [])
    {
        extract($data);
        include "views/$view.php";
    }
}