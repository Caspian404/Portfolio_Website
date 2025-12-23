<?php
class InventoryController extends Controller
{
    public function dashboard()
    {
        if (!isset($_SESSION['username'])) {
            die('Access denied.');
        }
        $items = Item::getAll();
        $logs = LogItem::getAll();
        $this->view('dashboard', ['items' => $items, 'logs' => $logs]);
    }

    public function addItem()
    {
        $role = User::getRole($_SESSION['username']);
        if (!in_array($role, ['Admin', 'Manager'])) {
            die('Access denied.');
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            Item::create(
                $_POST['name'],
                $_POST['category'],
                $_POST['location'],
                $_POST['purchase_price'],
                $_POST['sale_price'],
                $_POST['quantity']
            );
            header('Location: index.php?action=dashboard');
        } else {
            $this->view('add_item');
        }
    }

    public function addItemsBatch()
    {
        $role = User::getRole($_SESSION['username']);
        if (!in_array($role, ['Admin', 'Manager'])) {
            die('Access denied.');
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    if (isset($item['id']) && $item['id']) {
                        $existingItem = Item::get($item['id']);
                        if ($existingItem && $existingItem['location'] == $item['location']) {
                            $newQuantity = $existingItem['quantity'] + $item['quantity'];
                            Item::update($existingItem['id'], 'quantity', $newQuantity, $_SESSION['username']);
                            continue;
                        }
                    }
                    Item::create(
                        $item['name'],
                        $item['category'],
                        $item['location'],
                        $item['purchase_price'],
                        $item['sale_price'],
                        $item['quantity']
                    );
                }
                header('Content-Type: application/json');
                echo json_encode(['success' => true]);
                exit;
            } else {
                header('Content-Type: application/json');
                echo json_encode(['status' => 'error', 'message' => 'Invalid items data']);
                exit;
            }
        } else {
            $this->view('add_item');
        }
    }

    public function editItem()
    {
        $role = User::getRole($_SESSION['username']);
        if (!in_array($role, ['Admin', 'Manager', 'Worker'])) {
            die('Access denied.');
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            Item::update($_POST['id'], $_POST['field'], $_POST['value'], $_SESSION['username']);
            echo 'Updated';
        } else {
            echo 'Invalid';
        }
    }

    public function editItemRelative()
    {
        $role = User::getRole($_SESSION['username']);
        if (!in_array($role, ['Admin', 'Manager', 'Worker'])) {
            die('Access denied.');
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $old = Item::get($_POST['id'])['quantity'];
            if ($_POST['action'] === 'add') {
                $quantity = (int)$old + (int)$_POST['quantity_change'];
                Item::update($_POST['id'], 'quantity', $quantity, $_SESSION['username']);
                echo 'Updated|';
                echo $quantity;
                echo '|';
                echo $_POST['quantity_change'];
                echo '|';
                echo $_POST['quan'];

            }
            elseif ($_POST['action'] === 'remove') {
                $quantity = $old - $_POST['quantity_change'];
                Item::update($_POST['id'], 'quantity', $quantity, $_SESSION['username']);
                echo 'Updated';
            }
            else {
                echo 'Invalid';
            }
        }
        else {
            echo 'Invalid';
        }
        header('Location: index.php?action=dashboard');
    }

    public function deleteItem()
    {
        $role = User::getRole($_SESSION['username']);
        if (!in_array($role, ['Admin', 'Manager'])) {
            die('Access denied.');
        }

        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            // Item::delete method now handles the logging internally
            Item::delete($id);
        }
        header('Location: index.php?action=dashboard');
    }

    public function qrScanner() 
    {
        $role = User::getRole($_SESSION['username']);
        if (!in_array($role, ['Admin', 'Manager', 'Worker'])) {
            die('Access denied.');
        }

        $this->view('qr_scanner');
    }
    public function qrCode() 
    {
        $role = User::getRole($_SESSION['username']);
        if (!in_array($role, ['Admin', 'Manager', 'Worker'])) {
            die('Access denied.');
        }

        $this->view('qr_scanner');
    }
}