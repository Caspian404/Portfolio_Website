# Inventory Management System

A comprehensive web-based inventory management system built with PHP following the MVC (Model-View-Controller) architecture pattern. This system provides robust inventory tracking, user management, and reporting capabilities.

## Project Overview

This inventory management system enables efficient tracking, management, and monitoring of inventory items. It features a modern dashboard interface and supports advanced inventory operations including:

- Real-time inventory tracking
- QR code scanning for quick item lookup
- CSV import/export functionality
- User activity logging
- Role-based access control
- Detailed inventory reporting

## System Requirements

- PHP 7.0 or higher
- MySQL 5.7 or higher
- XAMPP/Apache web server
- Web browser (Chrome, Firefox, Safari, etc.)
- Camera access for QR scanning (optional)

## Project Structure

```
CS355-inventory-system/
├── OttoClone/                      # Main application directory
│   ├── controllers/                # Application logic handlers
│   │   ├── AdminController.php     # Admin functionality
│   │   ├── AuthController.php      # Authentication handling
│   │   ├── CSVController.php       # CSV import/export
│   │   ├── InventoryController.php # Inventory management
│   │   └── LogController.php       # Activity logging
│   ├── core/                       # Framework core
│   ├── models/                     # Data models
│   │   ├── Item.php               # Inventory item model
│   │   ├── LogItem.php            # Activity log model
│   │   └── User.php               # User account model
│   ├── views/                      # UI templates
│   │   ├── dashboard.php          # Main dashboard
│   │   ├── add_item.php           # Item management
│   │   ├── admin_dash.php         # Admin panel
│   │   ├── import_csv.php         # CSV operations
│   │   ├── login.php              # Authentication
│   │   ├── logs.php              # Activity logs
│   │   ├── manage_users.php      # User management
│   │   └── qr_scanner.php        # QR code scanning
│   ├── img/                       # Image assets
│   ├── create_admin.php           # Admin setup
│   ├── index.php                  # Entry point
│   └── schema.sql                 # Database schema
```

### Component Details

#### Controllers
- `AdminController.php`: Manages administrative functions and user management
- `AuthController.php`: Handles user authentication and session management
- `CSVController.php`: Processes CSV file imports and exports
- `InventoryController.php`: Core inventory operations (CRUD)
- `LogController.php`: Tracks and records system activities

#### Models
- `Item.php`: Defines inventory item properties and database interactions
- `LogItem.php`: Manages activity logging and audit trail
- `User.php`: Handles user data and authentication

#### Views
- `dashboard.php`: Main interface with inventory overview
- `add_item.php`: Form for adding/editing inventory items
- `admin_dash.php`: Administrative control panel
- `import_csv.php`: CSV file handling interface
- `qr_scanner.php`: QR code scanning functionality
- `manage_users.php`: User management interface
- `logs.php`: Activity log viewer

## Installation

### Prerequisites
1. Install XAMPP (version 7.4 or higher recommended)
2. Ensure MySQL and Apache modules are properly configured
3. Git for version control

### Setup Steps
1. Clone the repository to your XAMPP's htdocs directory:
   ```bash
   git clone [repository-url] c:/xampp/htdocs/CS355-inventory-system
   ```

2. Database Configuration:
   ```bash
   # Start Apache and MySQL in XAMPP Control Panel
   # Open phpMyAdmin (http://localhost/phpmyadmin)
   # Create a new database named 'inventory_system'
   # Import schema.sql from the OttoClone directory
   ```

3. Initial Setup:
   - Default credentials:
     ```
     Username: admin
     Password: password
     ```
   - To promote a user to admin status:
     1. Access phpMyAdmin
     2. Navigate to the `users` table
     3. Find the user you want to promote
     4. Change the `role` column value to 'admin'
   - Note: It's highly recommended to change the default password immediately after first login

4. System Configuration:
   - Verify file permissions (read/write access for the web server)
   - Configure your PHP settings in php.ini:
     ```ini
     upload_max_filesize = 10M
     post_max_size = 10M
     max_execution_time = 300
     ```

## Features

### Inventory Management
- Real-time inventory tracking and updates
- Bulk import/export via CSV
- QR code generation for items
- Low stock alerts and notifications
- Item categorization and tagging

### User Management
- Role-based access control (Admin/Staff)
- User activity logging
- Password recovery system
- Session management

### Reporting & Analytics
- Stock level reports
- Activity audit logs
- Usage statistics
- Export capabilities

## Usage Guide

### Basic Operations
1. **Login**:
   - Access `http://localhost/CS355-inventory-system/OttoClone`
   - Enter your credentials

2. **Dashboard Navigation**:
   - Overview of current inventory status
   - Quick access to common functions
   - Real-time alerts and notifications

3. **Inventory Management**:
   - Add items: Use the 'Add Item' form
   - Edit items: Click on any item in the list
   - Delete items: Use the delete button (admin only)
   - Scan QR codes: Access via the QR scanner page

4. **CSV Operations**:
   - Import: Use the CSV import page
   - Export: Generate reports in CSV format
   - Supported fields: SKU, name, quantity, price

### Advanced Features
1. **QR Code Scanning**:
   - Enable camera access when prompted
   - Point camera at item QR code
   - System will automatically locate item

2. **User Management** (Admin only):
   - Create new users
   - Assign roles
   - Reset passwords
   - View user activity

## Security Features

### Authentication
- Secure password hashing using modern algorithms
- Session-based authentication
- Automatic session timeout
- CSRF protection

### Data Protection
- Input validation and sanitization
- Prepared statements for SQL queries
- XSS protection
- File upload validation

### Access Control
- Role-based permissions
- IP-based access restrictions
- Failed login attempt tracking
- Secure password policies

## Troubleshooting

### Common Issues
1. **Database Connection Errors**:
   - Verify MySQL service is running
   - Check database credentials
   - Confirm database exists

2. **Permission Issues**:
   - Verify file permissions
   - Check PHP configuration
   - Ensure proper folder ownership

3. **QR Scanner Issues**:
   - Enable HTTPS for camera access
   - Allow camera permissions
   - Update browser if needed

## Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/YourFeatureName
   ```
5. Submit a pull request

### Coding Standards
- Follow PSR-4 autoloading standards
- Maintain consistent code formatting
- Write meaningful commit messages
- Include appropriate documentation

## License

This project is part of CS355 coursework. All rights reserved.

© 2025 CS355 Inventory System
