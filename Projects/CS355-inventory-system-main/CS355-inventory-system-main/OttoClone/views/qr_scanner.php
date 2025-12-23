<?php
    $items_to_add = [];
    //example data
    $items_to_add[0] = array(
        "temp_id"=>0,
        "name"=>"Boxes",
        "category"=>"Storage",
        "location"=>"Store",
        "purchase_price"=>0.99,
        "sale_price"=>4.99,
        "quantity"=>40
    );
    $items_to_add[1] = array(
        "temp_id"=>1,
        "name"=>"Crates",
        "category"=>"Storage",
        "location"=>"Store",
        "purchase_price"=>11.99,
        "sale_price"=>18.99,
        "quantity"=>20
    );
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Code Scanner</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Font Awesome for icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

  <style>

    #loadingMessage {
        text-align: center;
        padding: 40px;
        background-color: #eee;
    }

    /* Video Stream */
    #canvas {
        width: 40%;
        margin: 0 auto;
        display: block;
        border-bottom-left-radius: var(--bs-card-inner-border-radius);
        border-bottom-right-radius: var(--bs-card-inner-border-radius);
    }

    #output {
        margin-top: 20px;
        background: #eee;
        padding: 10px;
        padding-bottom: 0;
    }

    #output div {
        padding-bottom: 10px;
        word-wrap: break-word;
    }

    #noQRFound {
        text-align: center;
    }

    #container
    {
        width: 40%;
        margin: 0 auto;
        display: block;
    }

    div.card-body
    {
        padding: 0;
    }

</style>

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
            <a class="nav-link" href="index.php?action=view_logs">View Logs</a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="index.php?action=qr_scanner">QR Scanner</a>
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
        <div class="card shadow-sm" id="tempItemContainer">
          <div id="container" class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h2 class="h4 mb-0"><i class="fa-solid fa-qrcode"></i> QR Scanner</h2>
            <a href="index.php?action=dashboard" class="btn btn-outline-light btn-sm">
              <i class="fas fa-arrow-left me-1"></i>Back to Dashboard
            </a>
          </div>
          <div class="card-body">
            <canvas id="canvas" hidden></canvas>
            <div id="loadingMessage">🎥 Unable to access video stream (please make sure you have a webcam enabled)</div>
            <div id="output" hidden>
                <div id="outputMessage">No QR code detected.</div>
                <div hidden><b>Data:</b><span id="outputData"></span></div>
            </div>
            </div>



          </div>
        </div>
      </div>
    </div>
    </div>
  
    <!-- Bootstrap JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <!--  jsQR (QR Scanner) Github: https://github.com/cozmo/jsQR?tab=readme-ov-file -->
    <script src="https://cdn.jsdelivr.net/npm/jsqr@1.0.0/dist/jsQR.min.js"></script> 
    <script>

        const items_to_add = [];

        function removeItem(index) {
          items_to_add.splice(index, 1);
            if (items_to_add.length == 0) {
              const card = document.getElementById("addingItemsCard");
              card.remove();
            }
        };

        function addAllItems() {
            if (items_to_add.length === 0) {
              alert("No items to add.");
            return;
            }

            fetch('index.php?action=add_items_batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: items_to_add })
            })
            .then(async response => {
              const text = await response.text();
              try {
                const data = JSON.parse(text);
                if (data.success) {
                  alert("Items added successfully!");
                  items_to_add.length = 0;
                  const card = document.getElementById("addingItemsCard");
                  card.remove();
                } else {
                  alert("Failed to add items: " + (data.message || "Unknown error"));
                }
              } catch (e) {
                alert("Error adding items: Invalid JSON response\n" + text);
              }
            })
            .catch(error => {
              alert("Error adding items: " + error);
            });

        }

        var video = document.createElement("video");
        var canvasElement = document.getElementById("canvas");
        var canvas = canvasElement.getContext("2d", { willReadFrequently: true, desynchronized: true});
        var loadingMessage = document.getElementById("loadingMessage");
        var outputContainer = document.getElementById("output");
        var outputMessage = document.getElementById("outputMessage");
        var outputData = document.getElementById("outputData");

        var decodedQR;

        function drawLine(begin, end, color) {
            canvas.beginPath();
            canvas.moveTo(begin.x, begin.y);
            canvas.lineTo(end.x, end.y);
            canvas.lineWidth = 4;
            canvas.strokeStyle = color;
            canvas.stroke();
        }
        navigator.mediaDevices.getUserMedia({   
          video: { 
            facingMode: "environment",
          }  
        }).then(function(stream) {
          video.srcObject = stream;
          video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
          video.play();
          requestAnimationFrame(tick);
        }).catch(function(err) {
          console.error("Error accessing camera:", err);
          loadingMessage.innerText = "Error accessing camera: " + err.message;
        });


        /**
         * Validates QR code data in the format 'PurchasePriceNameIDCategoryQuantityLocationSalePrice'
         *    Purchase Price and Sale Price are optional.
         * 
         * @param {string} qrData - The data string from the QR code
         * @returns {boolean|object} - false if invalid, or parsed data object if valid
         */
        function validateQRFormat(qrData) {
          if (!qrData || typeof qrData !== 'string') {
            return false;
          }
          const pattern = /^(\d+\.\d+)?([A-Za-z]+)(\d+)([A-Za-z]+)(\d+)([A-Za-z]+)(\d+\.\d+)?$/;
          const match = qrData.match(pattern);

          if (!match) {
            return false;
          }

          const [_, purchasePrice, name, idStr, category, quantityStr, location, sellPrice] = match;

          const id = parseInt(idStr, 10);
          const quantity = parseInt(quantityStr, 10);
          const purchase = purchasePrice ? parseFloat(purchasePrice) : null;
          const sell = sellPrice ? parseFloat(sellPrice) : null;

          if (isNaN(id) || isNaN(quantity) || quantity <= 0) {
            return false;
          }

          return {
            purchasePrice: purchase,
            name,
            id,
            category,
            quantity,
            location,
            sellPrice: sell
          };
        }

        let lastScanTime = 0;
        const scanCooldown = 1500; // Delay between scans allowed in ms
        function tick() {
          try {
            loadingMessage.innerText = "⌛ Loading video...";
            const currentTime = Date.now();
            if (video.readyState === video.HAVE_ENOUGH_DATA &&
                    video.videoWidth > 0 && video.videoHeight > 0) {  
  
                loadingMessage.hidden = true;
                canvasElement.hidden = false;
                outputContainer.hidden = false;

                canvasElement.height = video.videoHeight;
                canvasElement.width = video.videoWidth;

                canvas.clearRect(0,0,canvasElement.width, canvasElement.height);
                canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
                if (currentTime - lastScanTime > scanCooldown || lastScanTime == 0) {
                  try {
                    var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
                    if (imageData.width > 0 && imageData.height > 0 && imageData.data && imageData.data.length > 0) {
                      var code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                      });
  
                      if (code && code.location) {
                        if (code.location.topLeftCorner && 
                          code.location.topRightCorner && 
                          code.location.bottomRightCorner && 
                          code.location.bottomLeftCorner) {
                          drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
                          drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
                          drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
                          drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
  
                          const validData = validateQRFormat(code.data);
  
                          if (validData) {
                            lastScanTime = currentTime;
                          
                            outputMessage.hidden = true;
                            outputData.parentElement.hidden = false;
                            outputData.innerText = " QR Code Successfully Scanned!✅";
                            setTimeout(() => {
                              outputData.parentElement.hidden = true;
                              outputMessage.hidden = false;
                            }, scanCooldown);
                            decodedQR = code.data;
                            addTempItem(validData)
                          }

                        }
                      }

                  }
                } catch (imgError) {
                  console.error("Error processing image data: ", imgError);
                }
              }
            }
          requestAnimationFrame(tick);
        } catch (tickError) {
          console.error("Error in tick function", tickError);
          requestAnimationFrame(tick);
        }
      }

        function addTempItem(data) {
          if (items_to_add.some(item => item.name === data.name && item.category === data.category && item.location === data.location)) {
            return;
          }

          const newItem = {
            id: data.id ?? 0,
            quantity: data.quantity ?? 1,
            name: data.name ?? "default",
            location: data.location ?? "default",
            category: data.category ?? "default",
            purchase_price: data.purchasePrice ?? 10.00,
            sale_price: data.sellPrice ?? 10.00,
          };

          items_to_add.push(newItem);

          if (!document.getElementById("addingItemsCard")) {
            const tempItemContainer = document.getElementById('tempItemContainer');
            const newTable = document.createElement('div');
            newTable.id = 'addingItemsCard';
            newTable.className = 'card';
            newTable.innerHTML = `
                <div class="card-body"> 
                  <div class="table-responsive">
                    <table id="inventoryTable" class="table table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Location</th>
                          <th>Purchase Price</th>
                          <th>Sale Price</th>
                          <th>Quantity</th>
                          <th>
                          <button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal"
                            onclick="addAllItems();">
                            Add All</button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>

                      </tbody>
                    </table>
                  </div>
                </div>
            `;
            tempItemContainer.appendChild(newTable);
          }

          const tableBody = document.querySelector("#inventoryTable tbody");
            const newRow = document.createElement("tr");
            newRow.id = `item-row-${newItem['id']}`;

            newRow.innerHTML = `
            <td>
              <input type="hidden" name="item_id" id="itemID" value="${newItem['id']}">
              <input type="text" class="form-control" value="${newItem['name']}">
            </td>
            <td><input type="text" class="form-control" value="${newItem['category']}"></td>
            <td><input type="text" class="form-control" value="${newItem['location']}"></td>
            <td><input type="number" class="form-control" value="${newItem['purchase_price']}"></td>
            <td><input type="number" class="form-control" value="${newItem['sale_price']}"></td>
            <td><input type="number" class="form-control" value="${newItem['quantity']}"></td>
            <td>
              <button type="button" class="btn btn-sm btn-danger" data-bs-toggle="modal"
              onclick="removeItem(${items_to_add.length-1}); document.getElementById('item-row-${newItem['id']}').remove();">
              Remove</button>
            </td>
            `;  
          tableBody.appendChild(newRow);
      };
        </script>
    </body>

</html>