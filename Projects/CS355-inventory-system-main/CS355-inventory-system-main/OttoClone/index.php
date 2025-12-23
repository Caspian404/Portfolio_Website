<?php
session_start();
require_once 'core/Router.php';
require_once 'core/Controller.php';
require_once 'core/Database.php';
require_once 'controllers/AuthController.php';
require_once 'controllers/InventoryController.php';
require_once 'controllers/AdminController.php';
require_once 'controllers/CSVController.php';
require_once 'controllers/LogController.php';
require_once 'models/User.php';
require_once 'models/Item.php';
require_once 'models/LogItem.php';
$router = new Router();
$router->route();