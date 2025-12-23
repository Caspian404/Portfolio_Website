<?php
class Item
{
    public static function getAll()
    {
        return Database::query("SELECT * FROM items");
    }

    public static function get($id)
    {
        $result = Database::query("SELECT * FROM items WHERE id = ?", [$id], 'i');
        return $result->fetch_assoc();
    }

    public static function create($name, $category, $location, $purchasePrice, $salePrice, $quantity)
    {
        Database::query("INSERT INTO items (name, category, location, purchase_price, sale_price, quantity)
                         VALUES (?, ?, ?, ?, ?, ?)", [$name, $category, $location, $purchasePrice, $salePrice, $quantity], 'sssddi');
    }

    public static function update($id, $field, $newValue, $username)
    {
        $old = self::get($id)[$field];
        Database::query("UPDATE items SET $field = ? WHERE id = ?", [$newValue, $id], 'si');
        LogItem::create($id, $username, $field, $old, $newValue);
    }

    public static function delete($id)
    {
        // Get the item name before deletion for reference
        $item = self::get($id);
        if (!$item) {
            return false;
        }
        
        // Store the item name for future reference in logs
        $itemName = $item['name'];
        
        // First delete all related log entries to avoid foreign key constraint
        Database::query("DELETE FROM logs WHERE item_id = ?", [$id], 'i');
        
        // Delete the item
        Database::query("DELETE FROM items WHERE id = ?", [$id], 'i');
        
        // Create a special log entry for the deletion
        LogItem::createDeletionLog($_SESSION['username'], $itemName);
        
        return true;
    }
}