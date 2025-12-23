<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activity Log</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Font Awesome for icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

</head>

<body class="bg-light">
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand" href="#">Inventory System</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <a class="nav-link" href="index.php?action=dashboard">Dashboard</a>
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
            <a class="nav-link active" href="index.php?action=view_logs">View Logs</a>
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
  
  <div class="container-fluid py-4">
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h2 class="h4 mb-0"><i class="fas fa-history me-2"></i>Activity Log</h2>
            <a href="index.php?action=dashboard" class="btn btn-outline-light btn-sm">
              <i class="fas fa-arrow-left me-1"></i>Back to Dashboard
            </a>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped table-hover table-sm">
                <thead class="table-dark">
                  <tr>
                    <th><i class="fas fa-user me-1"></i> Username</th>
                    <th><i class="fas fa-box me-1"></i> Item Name</th>
                    <th><i class="fas fa-tag me-1"></i> Category</th>
                    <th><i class="fas fa-history me-1"></i> Previous Value</th>
                    <th><i class="fas fa-edit me-1"></i> Updated Value</th>
                    <th><i class="fas fa-clock me-1"></i> Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  <?php foreach ($logs as $log): ?>
                    <tr>
                      <td><?= htmlspecialchars($log['username']) ?></td>
                      <td><?= htmlspecialchars($log['name']) ?></td>
                      <td><span class="badge bg-info text-dark"><?= htmlspecialchars($log['updated_category']) ?></span></td>
                      <td><code><?= htmlspecialchars($log['previous_value']) ?></code></td>
                      <td><code class="text-success"><?= htmlspecialchars($log['updated_value']) ?></code></td>
                      <td><small class="text-muted"><?= htmlspecialchars($log['timestamp']) ?></small></td>
                    </tr>
                  <?php endforeach; ?>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap JS Bundle with Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>