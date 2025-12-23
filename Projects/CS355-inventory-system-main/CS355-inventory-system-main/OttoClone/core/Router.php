<?php
class Router
{
    public function route()
    {
        $action = $_GET['action'] ?? 'login';
        switch ($action) {
            case 'login':
                (new AuthController())->login();
                break;
            case 'logout':
                (new AuthController())->logout();
                break;
            case 'dashboard':
                (new InventoryController())->dashboard();
                break;
            case 'add_item':
                (new InventoryController())->addItem();
                break;
            case 'add_items_batch':
                (new InventoryController())->addItemsBatch();
                break;
            case 'edit_item':
                (new InventoryController())->editItem();
                break;
            case 'edit_item_relative':
                (new InventoryController())->editItemRelative();
                break;
            case 'delete_item':
                (new InventoryController())->deleteItem();
                break;
            case 'manage_users':
                (new AdminController())->addUser();
                break;
            case 'delete_user':
                (new AdminController())->deleteUser();
                break;
            case 'view_logs':
                (new LogController())->viewLogs();
                break;
            case 'export_csv':
                (new CSVController())->exportCSV();
                break;
            case 'import_csv':
                (new CSVController())->importCSV();
                break;
            case 'logs':
                (new LogController())->viewLogs();
                break;
            case 'qr_scanner':
                (new InventoryController())->qrScanner();
                break;
            case 'qr_code':
                (new InventoryController())->qrCode();
                break;
            default:
                echo "404 Not Found";
        }
    }
}