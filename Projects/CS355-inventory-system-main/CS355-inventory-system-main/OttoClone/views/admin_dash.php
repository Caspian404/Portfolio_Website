<!DOCTYPE html>
<html>

<head>
    <title>Inventory Dashboard</title>
    <style>
        input,
        select,
        button {
            margin: 5px;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th,
        td {
            border: 1px solid #ccc;
            padding: 8px;
        }

        th {
            background: #f0f0f0;
        }
    </style>
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
            input.value = newQty;

            const form = new FormData();
            form.append('id', id);
            form.append('field', 'quantity');
            form.append('value', newQty);

            fetch('index.php?action=edit_item', {
                method: 'POST',
                body: form
            }).then(res => res.text()).then(console.log);
        }
    </script>
</head>

<body>
    <h2>Inventory Dashboard</h2>
    <a href="index.php?action=add_item">Add Item</a> |
    <a href="index.php?action=import_csv">Import CSV</a> |
    <a href="index.php?action=export_csv">Export CSV</a> |
    <a href="index.php?action=logout">Logout</a>

    <br><br>
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

    <table id="inventoryTable">
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Purchase Price</th>
                <th>Sale Price</th>
                <th>Quantity</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($items as $item): ?>
                <tr>
                    <td><?= $item['id'] ?></td>
                    <td class="name"><?= $item['name'] ?></td>
                    <td class="category"><?= $item['category'] ?></td>
                    <td><?= $item['location'] ?></td>
                    <td><?= $item['purchase_price'] ?></td>
                    <td><?= $item['sale_price'] ?></td>
                    <td>
                        <button onclick="updateQuantity(<?= $item['id'] ?>, -1)">−</button>
                        <input type="text" id="qty-<?= $item['id'] ?>" value="<?= $item['quantity'] ?>" size="3" readonly>
                        <button onclick="updateQuantity(<?= $item['id'] ?>, 1)">+</button>
                    </td>
                    <td><a href="index.php?action=delete_item&id=<?= $item['id'] ?>">Delete</a></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</body>

</html>