//Getting the warehouse table

function getWarehouse() {

    const warehouseTable = document.getElementById('warehouseTable');
    const tbody = warehouseTable.querySelector('tbody');
    tbody.innerHTML = '';

    fetch('http://localhost:3000/api/warehouse', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }) // Replace with your actual API endpoint
        .then(response => response.json())
        .then(data => {
            const warehouseTable = document.getElementById('warehouseTable');
            const tbody = warehouseTable.querySelector('tbody');

            data.forEach(warehouse => {
                const row = document.createElement('tr');
                row.innerHTML = `
          <td>${warehouse.Name}</td>
          <td>${warehouse.Current_Availability}</td>
        `;
                tbody.appendChild(row);

            });
        })
        .catch(error => {
            console.error('Error fetching data: ' + error);
        });
}




//getting the products name
function getProductNames(categorySelectedValue) {

    fetch('http://localhost:3000/api/getCategoryProducts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: categorySelectedValue })
    }) // Replace with your actual API endpoint
        .then(response => response.json())
        .then(data => {
            const productSelect = document.getElementById('Products');


            data.forEach(product => {
                const option = document.createElement('option');
                // option.innerHTML = `
                //   <td>${supplier.SupplierID}</td>
                //   <td>${supplier.SupplierName}</td>
                //   <td>${supplier.ContactInfo}</td>
                //   <td>${supplier.Address}</td>
                // `;
                option.value = product.Name;
                option.text = product.Name;
                productSelect.appendChild(option);

            });
        })
        .catch(error => {
            console.error('Error fetching data: ' + error);
        });
}




//Getting all categories

function getCategoryNames() {
    fetch('http://localhost:3000/api/getCategory', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            const categorySelect = document.getElementById('Category');


            data.forEach(category => {
                const option = document.createElement('option');

                option.value = category.CategoryName;
                option.text = category.CategoryName;
                categorySelect.appendChild(option);

            });
        })
        .catch(error => {
            console.error('Error fetching data: ' + error);
        });
}



getCategoryNames();

getWarehouse();

function optionSelected() {
    const productDropDown = document.getElementById("Products");

    productDropDown.innerHTML = '';

    // console.log(78);
    const categorySelectedValue = document.getElementById('Category').value;

    getProductNames(categorySelectedValue);
}

function addWarehouse() {
    const productValue = document.getElementById("Products").value;

    const numValue = document.getElementById("numberInput").value;

    fetch('http://localhost:3000/api/warehouseUpdate', {

        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: productValue, quantity: numValue })
    })
        .then(response => response.json())

        .then(result => {
            const mess = `Warehouse updated`;

            alert(result.message);

            if (mess === result.message) {

                getWarehouse();
            }

        }).catch(error => {
            // console.error('Error:', error);
        });
}



