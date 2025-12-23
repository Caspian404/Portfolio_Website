<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventory System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
    <script>
        function filterTable() {
            let input = document.getElementById('searchInput').value.toLowerCase();
            let category = document.getElementById('categoryFilter').value.toLowerCase();
            let rows = document.querySelectorAll('#inventoryTable tbody tr');

            rows.forEach(row => {
                let name = row.querySelector('.name').textContent.toLowerCase();
                let cat = row.querySelector('.category').textContent.toLowerCase();
                let match = name.includes(input) && (category === '' || cat === category);
                row.style.display = match ? '' : 'none';
            });
        }

        function updateQuantity(id, delta) {
            const input = document.getElementById('qty-' + id);
            let current = parseInt(input.value);
            const newQty = current + delta;

            if (newQty < 0) {
                alert('Cannot reduce quantity below zero');
                return;
            }

            input.value = newQty;

            const form = new FormData();
            form.append('id', id);
            form.append('field', 'quantity');
            form.append('value', newQty);

            fetch('index.php?action=edit_item', {
                method: 'POST',
                body: form
            }).then(res => res.text()).then(console.log);
            fetchUpdates();
        }
    </script>
</head>

<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="#">Inventory System</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link active" href="index.php?action=dashboard">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="index.php?action=add_item">Add Item</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="index.php?action=import_csv">Import CSV</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="index.php?action=export_csv">Export CSV</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="index.php?action=manage_users">Manage Users</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="index.php?action=view_logs">View Logs</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="index.php?action=qr_scanner">QR Scanner</a>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <span class="nav-link">Welcome, <?php echo htmlspecialchars($_SESSION["username"]); ?></span>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="index.php?action=logout">Logout</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <div id="alertContainer"></div>

        <div class="row">
            <!-- Inventory Table -->
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Inventory Items</h5>
                    </div>
                    <div class="card-body">
                        <input type="text" id="searchInput" onkeyup="filterTable()" placeholder="Search by name">
                        <select id="categoryFilter" onchange="filterTable()">
                            <option value="">All Categories</option>
                            <?php
                            $categories = [];
                            foreach ($items as $item) {
                                if (!in_array($item['category'], $categories)) {
                                    $categories[] = $item['category'];
                                    echo '<option value="' . htmlspecialchars($item['category']) . '">' . htmlspecialchars($item['category']) . '</option>';
                                }
                            }
                            ?>
                        </select>
                        <div class="table-responsive">
                            <table id="inventoryTable" class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Location</th>
                                        <th>Quantity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($items as $item): ?>
                                        <tr>
                                            <td class="name"><?php echo htmlspecialchars($item["name"]); ?></td>
                                            <td class="category"><?php echo htmlspecialchars($item["category"]); ?></td>
                                            <td><?php echo htmlspecialchars($item["location"]); ?></td>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <button type="button" class="btn btn-sm btn-outline-danger me-2"
                                                        onclick="updateQuantity(<?= $item['id'] ?>, -1)">
                                                        <i class="bi bi-dash"></i>
                                                    </button>
                                                    <input type="text" id="qty-<?php echo $item['id']; ?>"
                                                        class="form-control form-control-sm text-center"
                                                        style="width: 60px;"
                                                        value="<?php echo htmlspecialchars($item["quantity"]); ?>" readonly
                                                        data-item-id="<?php echo $item['id']; ?>"
                                                        data-quantity-display="true">
                                                    <button type="button" class="btn btn-sm btn-outline-success ms-2"
                                                        onclick="updateQuantity(<?php echo $item['id']; ?>, 1)"
                                                        data-item-id="<?php echo $item['id']; ?>">
                                                        <i class="bi bi-plus"></i>
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <!-- Update button -->
                                                <button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal"
                                                    data-bs-target="#updateModal" data-item-id="<?php echo $item['id']; ?>"
                                                    data-item-name="<?php echo htmlspecialchars($item['name']); ?>"
                                                    data-item-quan="<?php echo $item['quantity']; ?>">
                                                    Update Stock
                                                </button>
                                                <!-- QR Code button -->
                                                <button type="button" class="btn btn-sm btn-secondary"
                                                    data-bs-toggle="modal" data-bs-target="#generateQR"
                                                    data-item-id="<?php echo $item['id']; ?>"
                                                    data-item-name="<?= htmlspecialchars($item['name']); ?>"
                                                    data-item-quan="<?= $item['quantity']; ?>"
                                                    data-item-location="<?= htmlspecialchars($item['location']); ?>"
                                                    data-item-category="<?= htmlspecialchars($item['category']); ?>"
                                                    data-item-salePrice="<?= htmlspecialchars($item['sale_price']); ?>"
                                                    data-item-purchasePrice="<?= htmlspecialchars($item['purchase_price']); ?>">
                                                    Generate QR
                                                </button>
                                                <?php if (in_array(User::getRole($_SESSION['username']), ['Admin', 'Manager'])): ?>
                                                <!-- Delete button -->
                                                <button type="button" class="btn btn-sm btn-danger mt-1"
                                                    data-bs-toggle="modal" data-bs-target="#deleteItemModal"
                                                    data-item-id="<?php echo $item['id']; ?>"
                                                    data-item-name="<?php echo htmlspecialchars($item['name']); ?>">
                                                    <i class="bi bi-trash"></i> Delete
                                                </button>
                                                <?php endif; ?>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Activity Log -->
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Recent Activity</h5>
                    </div>
                    <div class="card-body">
                        <div class="activity-feed">
                            <?php foreach ($logs as $log): ?>
                                <div class="activity-item mb-3">
                                    <small
                                        class="text-muted"><?php echo date('M j, Y g:i A', strtotime($log["timestamp"])); ?></small>
                                    <p class="mb-0">
                                        <?php
                                        echo htmlspecialchars($log["username"]) . " ";
                                        if ($log["updated_category"] === "quantity") {
                                            $change = $log["updated_value"] - $log["previous_value"];
                                            echo $change > 0 ? "added" : "removed";
                                            echo " " . abs($change) . " items";
                                            echo " to <strong>" . htmlspecialchars($log["name"]) . "</strong>";
                                            echo " (New total: " . $log["updated_value"] . ")";
                                        } elseif ($log["updated_category"] === "delete") {
                                            echo "<span class='text-danger'>deleted</span> item <strong>" . htmlspecialchars($log["previous_value"]) . "</strong>";
                                        } else {
                                            echo "updated " . htmlspecialchars($log["updated_category"]);
                                            if (isset($log["name"])) {
                                                echo " for <strong>" . htmlspecialchars($log["name"]) . "</strong>";
                                            }
                                        }
                                        ?>
                                    </p>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Update Stock Modal -->
    <div class="modal fade" id="updateModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Update Stock</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="updateForm" action="index.php?action=edit_item_relative" method="post">
                        <input type="hidden" name="id" id="itemId">
                        <input type="hidden" name="quan" id="itemQuan">
                        <div class="mb-3">
                            <label class="form-label">Item Name</label>
                            <input type="text" class="form-control" id="itemName" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Action</label>
                            <select class="form-select" name="action" required>
                                <option value="add">Add Stock</option>
                                <option value="remove">Remove Stock</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Quantity</label>
                            <input type="number" class="form-control" name="quantity_change" min="1" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Update Stock</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Generate QR Modal -->
    <div class="modal fade" id="generateQR" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Generate QR Code</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="qrForm" action="index.php?action=edit_item_relative" method="post">
                        <input type="hidden" name="qr_id" id="QRitemId">
                        <input type="hidden" name="qr_quan" id="QRitemQuan">
                        <input type="hidden" name="qr_category" id="QRitemCat">
                        <input type="hidden" name="qr_location" id="QRitemLocation">
                        <input type="hidden" name="qr_sale" id="QRitemSale">
                        <input type="hidden" name="qr_purchase" id="QRitemPurchase">
                        <div class="mb-3">
                            <label class="form-label">Item Name</label>
                            <input type="text" class="form-control" id="QRitemName" readonly>
                        </div>
                        <div class="mb-3">
                            <canvas id="qrCode"></canvas>
                        </div>
                        <!-- <button type="submit" class="btn btn-primary">Open QR Scanner</button> -->
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Item Modal -->
    <div class="modal fade" id="deleteItemModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Delete</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete <span id="deleteItemName"></span>?</p>
                    <p class="text-danger">This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <a href="#" id="confirmDeleteBtn" class="btn btn-danger">Delete</a>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- QRious (QR Generator) Github: https://github.com/neocotic/qrious -->
    <script src="https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js"></script>
    <script>
        // Handle modal data
        document.getElementById('updateModal').addEventListener('show.bs.modal', function (event) {
            var button = event.relatedTarget;
            var itemId = button.getAttribute('data-item-id');
            var itemName = button.getAttribute('data-item-name');
            var itemQuantity = button.getAttribute('data-item-quan');

            document.getElementById('itemId').value = itemId;
            document.getElementById('itemName').value = itemName;
            document.getElementById('itemQuan').value = itemQuantity;
        }); 

        // Handles modals for QR Code Generation
        document.getElementById('generateQR').addEventListener('show.bs.modal', function (event) {
            var button = event.relatedTarget;

            var itemID = button.getAttribute('data-item-id');
            var itemName = button.getAttribute('data-item-name');
            var itemQuantity = button.getAttribute('data-item-quan');
            var itemLocation = button.getAttribute('data-item-location');
            var itemCategory = button.getAttribute('data-item-category');
            var itemPurchasePrice = button.getAttribute('data-item-purchasePrice');
            var itemSalePrice = button.getAttribute('data-item-salePrice');

            document.getElementById('QRitemId').value = itemID;
            document.getElementById('QRitemName').value = itemName;
            document.getElementById('QRitemQuan').value = itemQuantity;
            document.getElementById('QRitemLocation').value = itemLocation;
            document.getElementById('QRitemCat').value = itemCategory;
            document.getElementById('QRitemPurchase').value = itemPurchasePrice;
            document.getElementById('QRitemSale').value = itemSalePrice;

            var qr = new QRious({
                element: document.getElementById('qrCode'),
                value: "" + itemPurchasePrice + itemName + "" + itemID + itemCategory + itemQuantity + itemLocation + itemSalePrice,
                backgroundAlpha: 0,
                foregroundAlpha: 1,
                level: 'H',
                size: 450
            });
        });

        // Handle delete modal data
        document.getElementById('deleteItemModal').addEventListener('show.bs.modal', function (event) {
            var button = event.relatedTarget;
            var itemId = button.getAttribute('data-item-id');
            var itemName = button.getAttribute('data-item-name');
            
            document.getElementById('deleteItemName').textContent = itemName;
            document.getElementById('confirmDeleteBtn').href = 'index.php?action=delete_item&id=' + itemId;
        });

        // Function to format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
        }

        // Function to update inventory table
        function updateInventoryTable(inventory) {
            // First, store the current state of all rows
            const tbody = document.querySelector('#inventoryTable tbody');
            const currentRows = {};

            // Store references to all existing rows by item ID
            Array.from(tbody.querySelectorAll('tr')).forEach(row => {
                const buttons = row.querySelectorAll('button[data-item-id]');
                if (buttons.length > 0) {
                    const itemId = buttons[0].getAttribute('data-item-id');
                    currentRows[itemId] = row;
                }
            });

            // Now update each row's quantity input
            inventory.forEach(item => {
                if (currentRows[item.id]) {
                    const row = currentRows[item.id];
                    const qtyInput = row.querySelector(`#qty-${item.id}`);
                    if (qtyInput) {
                        qtyInput.value = item.quantity;
                    }
                }
            });
        }

        // Function to update activity log
        function updateActivityLog(logs) {
            const feed = document.querySelector('.activity-feed');
            feed.innerHTML = '';

            logs.forEach(log => {
                const div = document.createElement('div');
                div.className = 'activity-item mb-3';
                div.innerHTML = `
                    <small class="text-muted">${formatDate(log.changed_at)}</small>
                    <p class="mb-0">
                        ${log.username} 
                        ${log.updated_category === 'quantity' ?
                        `${Number(log.updated_value) > Number(log.previous_value) ? 'added' : 'removed'} 
                            ${Math.abs(log.updated_value - log.previous_value)} items
                            to <strong>${log.name}</strong>
                            (New total: ${log.updated_value})` :
                        `updated ${log.updated_category}`}
                    </p>
                `;
                feed.appendChild(div);
            });
        }

        // Function to fetch updates
        async function fetchUpdates() {
            try {
                const response = await fetch('get_updates.php');
                const data = await response.json();

                if (data.success) {
                    updateInventoryTable(data.inventory);
                    updateActivityLog(data.logs);
                }
            } catch (error) {
                console.error('Error fetching updates:', error);
            }
        }

        // Poll for updates every 1 second
        setInterval(fetchUpdates, 1000);

    </script>
</body>

</html>