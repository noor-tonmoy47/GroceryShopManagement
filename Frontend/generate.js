const PDFDocument = require('pdfkit');
const fs = require('fs');
// let transactionID = 7002;


const filename = 'table-data.pdf';

function tableToJson(tableId) {
    const table = document.getElementById("invoice");
    const headers = [...table.querySelectorAll('thead th')];
    const rows = [...table.querySelectorAll('tbody tr')];

    const jsonData = rows.map(row => {
        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header.textContent] = row.querySelectorAll('td')[index].textContent;
        });
        return rowData;
    });

    return JSON.stringify(jsonData, null, 2);
}


function generateReceipt() {
    const doc = new PDFDocument();
    const invoiceJson = tableToJson("myTable");
    // console.log(json);

    // Create a PDF document

    // Pipe the PDF content to a writable stream (a file in this case)
    doc.pipe(fs.createWriteStream(filename));

    // Define table headers
    const headers = ["ProductName", "Quantity", "UnitPrice", "Total"];

    // Add table headers
    headers.forEach(header => {
        doc.fontSize(12).text(header, { continued: true });
        doc.moveUp();
        doc.text("______________", { continued: true });
    });

    doc.moveDown();

    // Loop through and add table data
    invoiceJson.forEach(row => {
        headers.forEach(header => {
            doc.fontSize(12).text(row[header], { continued: true });
        });
        doc.moveDown();
    });

    // Finalize and close the PDF document
    doc.end();



    transactionID++;
}