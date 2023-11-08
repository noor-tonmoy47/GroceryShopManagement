
let transactionDetailsID = 5001;
let transactionID = 7002;


function gettingInfo(prValue, quanValue, price) {

    const total = quanValue * price;

    const invoiceTable = document.getElementById('invoice');
    const tbody = invoiceTable.querySelector('tbody');


    const row = document.createElement('tr');


    row.innerHTML = `
    <td>${prValue}</td>
    <td>${quanValue}</td>
    <td>${price}</td>
    <td>${total}</td>
    `;
    tbody.prepend(row);

    const totalField = document.getElementById('total');
    let totalAmount = 0;
    let columnIndex = 3;

    for (let i = 1; i < invoiceTable.rows.length; i++) {
        let cell = invoiceTable.rows[i].cells[columnIndex];
        cell = parseInt(cell.innerText);
        totalAmount += cell;
        console.log(totalAmount);
        totalField.innerText = totalAmount;
    }


}

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

            const productSelect = document.getElementById('Product');


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
            console.log(productSelect.value);
            productSelected();
        })
        .catch(error => {
            console.error('Error fetching data: ' + error);
        });

}

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

function categorySelected() {
    const productDropDown = document.getElementById("Product");

    productDropDown.innerHTML = '';

    // console.log(78);
    const categorySelectedValue = document.getElementById('Category').value;

    getProductNames(categorySelectedValue);
    // productDropDown.selectedIndex = 1;
    // productSelected();
}

function productSelected() {

    const productDropDownValue = document.getElementById("Product").value;

    const priceBox = document.getElementById('myText');

    priceBox.value = '';

    if (!productDropDownValue) {
        return;
    }

    console.log(productDropDownValue);
    fetch('http://localhost:3000/api/getUnitPrice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: productDropDownValue
        })
    })
        .then(res => res.json())

        .then(data => {
            console.log(data[0].Price);
            // console.log(data.stringify);
            priceBox.value = data[0].Price
        })

        .catch(error => {
            console.error('Error fetching data: ' + error);
        });

}

function btnSubmit() {
    const quanValue = document.getElementById('QuanInput').value;
    const productDropDownValue = document.getElementById("Product").value;

    const priceBoxValue = document.getElementById('myText').value;

    // try {

    fetch('http://localhost:3000/api/invoice', {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trID: transactionID, name: productDropDownValue, quantity: quanValue })
    })
        .then(response => response.json())

        .then(result => {
            const mess = `Invoice updated`;

            alert(result.message);

            if (mess === result.message) {

                gettingInfo(productDropDownValue, quanValue, priceBoxValue);
                //             const row = document.createElement('tr');
                //             row.innerHTML = `<td colspan="2"></td>
                // <td style ="font-weight : bold;">Total Payable:</td>
                //   <td id = "total"></td>`;
                //             tbody.appendChild(row);
            }

        }).catch(error => {
            // console.error('Error:', error);
        });
    // } catch (error) {
    //     console.log(error.message);
    // }

}
