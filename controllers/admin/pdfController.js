const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const Orders = require('../../models/orderSchema');

const createPdf = async (req, res) => {
  try {
    let salesData = [];
    console.log("Starting PDF generation...");

    // Fetch orders from the database
    const order = await Orders.find({});
    console.log("Orders fetched from DB:", order);

    // Prepare sales data
    order.forEach(order => {
      let val = {
        orderId: order.orderId,
        date: order.createdOn,
        totalAmount: order.totalPrice,
        discount: order.discount,
        finalAmount: order.finalAmount,
        status: order.status,
      };
      salesData.push(val);
    });

    // EJS template rendering
    const templatePath = path.join(__dirname, 'template.ejs');
    if (!fs.existsSync(templatePath)) {
      throw new Error('Template file not found at: ' + templatePath);
    }

    const template = fs.readFileSync(templatePath, 'utf-8');
    const html = ejs.render(template, { title: 'Sales Report', salesData });

    console.log('Rendered HTML:', html); // Debug rendered HTML

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'load' });
    } catch (renderError) {
      console.error('Error rendering page content:', renderError);
      throw renderError;
    }

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    console.log('PDF Buffer Size:', pdfBuffer.length);
    
    if (pdfBuffer.length === 0) {
      throw new Error('Generated PDF is empty.');
    }

    const outputFilePath = path.join(__dirname, 'test_sales_report.pdf');
    fs.writeFileSync(outputFilePath, pdfBuffer);
    console.log('PDF saved as:', outputFilePath);

    // Clean up Puppeteer resources
    await browser.close();

    // Send PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="sales_report.pdf"');

    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Failed to generate PDF');
  }
};

module.exports = { createPdf };
