<?php
class LogItem
{
    public static function create($item_id, $username, $category, $prev, $updated)
    {
        $time = date('Y-m-d H:i:s');
        Database::query("INSERT INTO logs (item_id, username, updated_category, previous_value, updated_value, timestamp)
                         VALUES (?, ?, ?, ?, ?, ?)", [$item_id, $username, $category, $prev, $updated, $time], 'isssss');
    }
    
    /**
     * Create a log entry for item deletion that will be visible in the dashboard
     * This method creates a special log entry that doesn't rely on foreign keys
     */
    public static function createDeletionLog($username, $itemName)
    {
        $time = date('Y-m-d H:i:s');
        // Use a direct query to bypass the foreign key constraint for deletion logs
        $conn = Database::connect();
        $stmt = $conn->prepare("INSERT INTO logs (username, updated_category, previous_value, updated_value, timestamp) 
                              VALUES (?, 'delete', ?, 'Deleted', ?)");
        $stmt->bind_param('sss', $username, $itemName, $time);
        $stmt->execute();
    }

    public static function getAll()
    {
        // Modified query to include logs that don't have an item_id (deletion logs)
        return Database::query("SELECT logs.*, items.name 
                              FROM logs 
                              LEFT JOIN items ON logs.item_id = items.id 
                              ORDER BY logs.timestamp DESC");
    }
}