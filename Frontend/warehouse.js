//Getting the warehouse table
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


//getting the products name
fetch('http://localhost:3000/api/getProducts', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
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



//Getting all categories

fetch('http://localhost:3000/api/getCategory', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
}) // Replace with your actual API endpoint
    .then(response => response.json())
    .then(data => {
        const categorySelect = document.getElementById('Category');


        data.forEach(category => {
            const option = document.createElement('option');
            // option.innerHTML = `
            //   <td>${supplier.SupplierID}</td>
            //   <td>${supplier.SupplierName}</td>
            //   <td>${supplier.ContactInfo}</td>
            //   <td>${supplier.Address}</td>
            // `;
            option.value = category.CategoryName;
            option.text = category.CategoryName;
            categorySelect.appendChild(option);

        });
    })
    .catch(error => {
        console.error('Error fetching data: ' + error);
    });


