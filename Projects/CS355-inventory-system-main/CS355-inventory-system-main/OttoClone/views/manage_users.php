<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manage Users</title>
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
            <a class="nav-link active" href="index.php?action=manage_users">Manage Users</a>
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

  <div class="container py-4">
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h2 class="h4 mb-0"><i class="fas fa-users-cog me-2"></i>Admin - Manage Users</h2>
            <a href="index.php?action=dashboard" class="btn btn-outline-light btn-sm">
              <i class="fas fa-arrow-left me-1"></i>Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-md-5">
        <div class="card shadow-sm">
          <div class="card-header bg-success text-white">
            <h3 class="h5 mb-0"><i class="fas fa-user-plus me-2"></i>Create a User</h3>
          </div>
          <div class="card-body">
            <form method="POST">
              <div class="mb-3">
                <label for="username" class="form-label">Username:</label>
                <input type="text" class="form-control" id="username" name="username" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password:</label>
                <input type="password" class="form-control" id="password" name="password" required>
              </div>
              <div class="mb-3">
                <label for="role" class="form-label">Role:</label>
                <select class="form-select" id="role" name="role">
                  <option value="Worker">Worker</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-success">
                  <i class="fas fa-save me-2"></i>Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-md-7">
        <div class="card shadow-sm">
          <div class="card-header bg-danger text-white">
            <h3 class="h5 mb-0"><i class="fas fa-user-minus me-2"></i>Delete a User</h3>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table id="userTable" class="table table-striped table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <?php foreach ($users as $user): ?>
                    <tr>
                      <td><?= htmlspecialchars($user['username']) ?></td>
                      <td>
                        <span
                          class="badge <?= $user['role'] == 'Admin' ? 'bg-danger' : ($user['role'] == 'Manager' ? 'bg-warning text-dark' : 'bg-info text-dark') ?>">
                          <?= htmlspecialchars($user['role']) ?>
                        </span>
                      </td>
                      <td>
                        <a href="index.php?action=delete_user&id=<?= $user['id'] ?>" class="btn btn-danger btn-sm">
                          <i class="fas fa-trash-alt"></i> Delete
                        </a>
                      </td>
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