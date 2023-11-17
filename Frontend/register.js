
//Getting the products table
function getProducts() {
    fetch('http://localhost:3000/api/products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }) // Replace with your actual API endpoint
        .then(response => response.json())
        .then(data => {
            const productsTable = document.getElementById('productsTable');
            const tbody = productsTable.querySelector('tbody');

            data.forEach(products => {
                const dateTimeString = products.ExpiryDate;
                let dateOnly;
                if (dateTimeString !== null) {

                    dateOnly = new Date(dateTimeString).toISOString().split('T')[0];
                }
                else {
                    dateOnly = dateTimeString;
                }
                const row = document.createElement('tr');
                row.innerHTML = `
                              <td>${products.ProductID}</td>
                              <td>${products.Name}</td>
                              <td>${products.Category}</td>
                              <td>${products.Supplier}</td>
                              <td>${dateOnly}</td>
                              <td>${products.Price}</td>
                          `;
                tbody.appendChild(row);

            });
        })
        .catch(error => {
            console.error('Error fetching data: ' + error);
        });

}

function isAlphabet(input) {
    const alphabetRegex = /^[A-Za-z]+$/;
    return alphabetRegex.test(input);
}
getProducts();

//getting the suppliers name
fetch('http://localhost:3000/api/getSupplier', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
})
    .then(response => response.json())
    .then(data => {
        const SupplierSelect = document.getElementById('SupplierName');


        data.forEach(supplier => {
            const option = document.createElement('option');

            option.value = supplier.SupplierName;
            option.text = supplier.SupplierName;
            SupplierSelect.appendChild(option);

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


function onSubmit(e) {


    const nameValue = document.getElementById('ProductName').value;

    const categoryValue = document.getElementById('Category').value;

    const supplierValue = document.getElementById('SupplierName').value;

    const expiryValue = document.getElementById('ExpiryDate').value;

    const quanValue = document.getElementById('numberInput').value;

    const priceValue = document.getElementById('UnitPrice').value;

    if (nameValue.length === 0 || categoryValue.length === 0 || supplierValue.length === 0 || expiryValue.length === 0 || quanValue.length === 0 || priceValue.length === 0) {
        alert('All fields are required');
        return;
    }

    let formError = false;


    if (!isAlphabet(nameValue)) {

        alert('Product Name must contain only alphabets');
        formError = true;
    }

    if (formError) {

        e.preventDefault();
        return;
    }

    fetch('http://localhost:3000/products/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: nameValue, category: categoryValue, supplierName: supplierValue, expiryDate: expiryValue, quantity: quanValue, price: priceValue })
    })
        .then(res => res.json())

        .then(result => {
            const m = 'Product added successfully';

            alert(result.message);

            if (m === result.message) {
                getProducts();
            }
        })
        .catch(error => {
            console.log(error.message);
        });
}