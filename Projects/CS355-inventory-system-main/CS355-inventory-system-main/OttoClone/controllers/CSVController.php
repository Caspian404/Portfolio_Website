<?php
class CSVController extends Controller
{
    public function exportCSV()
    {
        $role = User::getRole($_SESSION['username']);
        if (!in_array($role, ['Admin', 'Manager'])) {
            die('Access denied.');
        }

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment;filename="inventory_export.csv"');

        $items = Item::getAll();
        $output = fopen("php://output", "w");
        fputcsv($output, ['ID', 'Name', 'Category', 'Location', 'Purchase Price', 'Sale Price', 'Quantity']);

        while ($item = $items->fetch_assoc()) {
            fputcsv($output, [
                $item['id'],
                $item['name'],
                $item['category'],
                $item['location'],
                $item['purchase_price'],
                $item['sale_price'],
                $item['quantity']
            ]);
        }
        fclose($output);
        exit;
    }

    public function importCSV()
    {
        $role = User::getRole($_SESSION['username']);
        if (!in_array($role, ['Admin', 'Manager'])) {
            die('Access denied.');
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['csv_file'])) {
            $file = $_FILES['csv_file']['tmp_name'];
            $handle = fopen($file, 'r');
            fgetcsv($handle); // Skip header

            while (($row = fgetcsv($handle)) !== false) {
                list($id, $name, $category, $location, $purchasePrice, $salePrice, $quantity) = $row;
                Item::create($name, $category, $location, $purchasePrice, $salePrice, $quantity);
            }
            fclose($handle);
            header('Location: index.php?action=dashboard');
        } else {
            $this->view('import_csv');
        }
    }
}