import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper function to convert numbers to words
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertHundreds = (n: number): string => {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result;
  };
  
  if (num === 0) return 'Zero Rupees Only';
  
  let integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = '';
  
  if (integerPart >= 10000000) {
    result += convertHundreds(Math.floor(integerPart / 10000000)) + 'Crore ';
    integerPart %= 10000000;
  }
  if (integerPart >= 100000) {
    result += convertHundreds(Math.floor(integerPart / 100000)) + 'Lakh ';
    integerPart %= 100000;
  }
  if (integerPart >= 1000) {
    result += convertHundreds(Math.floor(integerPart / 1000)) + 'Thousand ';
    integerPart %= 1000;
  }
  if (integerPart > 0) {
    result += convertHundreds(integerPart);
  }
  
  result += 'Rupees';
  
  if (decimalPart > 0) {
    result += ' and ' + convertHundreds(decimalPart) + 'Paise';
  }
  
  return result.trim() + ' Only';
};

export interface BillData {
  billNumber: string;
  billDate: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pinCode?: string;
    };
    gstNumber?: string;
  };
  items: Array<{
    description: string;
    hsnCode: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
    purity?: number;
    weight?: number;
    wastage?: number;
    makingCharges?: number;
    huid?: string;
    taxableAmount: number;
    cgstRate: number;
    cgstAmount: number;
    sgstRate: number;
    sgstAmount: number;
    igstRate?: number;
    igstAmount?: number;
  }>;
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst?: number;
  totalTax: number;
  totalAmount: number;
  roundOffAmount?: number;
  finalAmount: number;
  notes?: string;
  termsAndConditions?: string;
}

export const generateBillPDF = async (billData: BillData): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Company details
  const companyName = 'Arjun Swarnkar';
  const companyGST = '24XXXXX1234X1ZX';
  const companyAddress = 'Gold & Jewelry Shop\nMarket Street, City - 123456\nPhone: +91-9876543210 | Email: info@arjunswarnkar.com';
  
  // Draw outer border
  pdf.setLineWidth(0.5);
  pdf.rect(10, 10, 190, 277);
  
  // Header section
  pdf.setLineWidth(0.3);
  pdf.rect(10, 10, 190, 25);
  
  // GSTIN and Original/Duplicate Bill
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`GSTIN No.: ${companyGST}`, 12, 18);
  pdf.text('Original / Duplicate Bill', 150, 18);
  
  // Tax Invoice title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tax Invoice', 105, 28, { align: 'center' });
  
  // Company details section
  pdf.rect(10, 35, 190, 40);
  
  // Logo area
  pdf.rect(12, 37, 40, 36);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LOGO', 32, 57, { align: 'center' });
  
  // Company info
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Company Name:', 55, 42);
  pdf.setFont('helvetica', 'normal');
  pdf.text(companyName, 55, 47);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Address:', 55, 52);
  pdf.setFont('helvetica', 'normal');
  const addressLines = companyAddress.split('\n');
  addressLines.forEach((line, index) => {
    pdf.text(line, 55, 57 + (index * 4));
  });
  
  // Customer and Invoice details section
  pdf.rect(10, 75, 190, 35);
  
  // Vertical divider
  pdf.line(115, 75, 115, 110);
  
  // Customer details
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer Care Details:', 12, 82);
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer Name:', 12, 88);
  pdf.setFont('helvetica', 'normal');
  
  // Truncate long customer names
  const customerName = billData.customer.name.length > 20 ? 
    billData.customer.name.substring(0, 20) + '...' : billData.customer.name;
  pdf.text(customerName, 12, 93);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Address:', 12, 98);
  pdf.setFont('helvetica', 'normal');
  if (billData.customer.address) {
    const customerAddress = [
      billData.customer.address.street,
      billData.customer.address.city,
      billData.customer.address.state,
      billData.customer.address.pinCode
    ].filter(Boolean).join(', ');
    // Truncate long addresses
    const truncatedAddress = customerAddress.length > 25 ? 
      customerAddress.substring(0, 25) + '...' : customerAddress;
    pdf.text(truncatedAddress || 'N/A', 12, 103);
  } else {
    pdf.text('N/A', 12, 103);
  }
  
  // Phone and State Code - smaller font
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Phone No.:', 12, 108);
  pdf.setFont('helvetica', 'normal');
  pdf.text(billData.customer.phone, 30, 108);
  
  if (billData.customer.gstNumber) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('State Code:', 75, 108);
    pdf.setFont('helvetica', 'normal');
    pdf.text(billData.customer.gstNumber.substring(0, 2), 95, 108);
  }
  
  // Invoice details
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Details:', 117, 82);
  
  pdf.setFontSize(7);
  pdf.text('Invoice Date:', 117, 88);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(billData.billDate).toLocaleDateString('en-IN'), 117, 93);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice No.:', 117, 98);
  pdf.setFont('helvetica', 'normal');
  pdf.text(billData.billNumber, 117, 103);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Payment Mode:', 117, 108);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Cash', 160, 108); // Move to the right to avoid overlap
  
  // Note section
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Note:', 12, 117);
  
  // Items table header
  let yPos = 122;
  pdf.rect(10, yPos, 190, 12);
  
  // Table headers with jewelry-specific columns - Fixed column widths
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  
  // Draw vertical lines first - Better spacing for readability
  const columnPositions = [10, 18, 50, 70, 82, 96, 115, 130, 145, 160, 175, 185, 200];
  columnPositions.forEach(x => {
    pdf.line(x, yPos, x, yPos + 12);
  });
  
  // Headers with better positioning and proper centering
  pdf.text('SL No.', 14, yPos + 6, { align: 'center' });
  pdf.text('Item Name & Description', 34, yPos + 6, { align: 'center' });
  pdf.text('HSN/SAC', 60, yPos + 6, { align: 'center' });
  pdf.text('Purity', 76, yPos + 6, { align: 'center' });
  pdf.text('Gold Rate/gm', 89, yPos + 6, { align: 'center' });
  pdf.text('Gross Wt. (gm)', 105.5, yPos + 6, { align: 'center' });
  pdf.text('Stone Wt.', 122.5, yPos + 6, { align: 'center' });
  pdf.text('Net Wt. (gm)', 137.5, yPos + 6, { align: 'center' });
  pdf.text('Value', 152.5, yPos + 6, { align: 'center' });
  pdf.text('Making Charges', 167.5, yPos + 6, { align: 'center' });
  pdf.text('Stone Value', 180, yPos + 6, { align: 'center' });
  pdf.text('Total Value', 192.5, yPos + 6, { align: 'center' });
  
  yPos += 12;
  
  // Items
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  
  billData.items.forEach((item, index) => {
    const rowHeight = 10;
    const currentY = yPos + (index * rowHeight);
    
    // Draw horizontal line
    pdf.line(10, currentY, 200, currentY);
    
    // Draw vertical lines for each column
    columnPositions.forEach(x => {
      pdf.line(x, currentY, x, currentY + rowHeight);
    });
    
    // Item data with better text positioning
    pdf.text((index + 1).toString(), 14, currentY + 6, { align: 'center' });
    
    // Truncate long descriptions
    const description = item.description || '';
    const truncatedDesc = description.length > 15 ? description.substring(0, 15) + '...' : description;
    pdf.text(truncatedDesc, 20, currentY + 6);
    
    pdf.text(item.hsnCode || '', 60, currentY + 6, { align: 'center' });
    pdf.text(`${item.purity || 22}K`, 76, currentY + 6, { align: 'center' });
    pdf.text((item.rate / (item.weight || 1)).toFixed(0), 89, currentY + 6, { align: 'center' });
    pdf.text(((item.weight || 0) + (item.wastage || 0)).toFixed(1), 105.5, currentY + 6, { align: 'center' });
    pdf.text((item.wastage || 0).toFixed(1), 122.5, currentY + 6, { align: 'center' });
    pdf.text((item.weight || 0).toFixed(1), 137.5, currentY + 6, { align: 'center' });
    pdf.text(item.amount.toFixed(0), 152.5, currentY + 6, { align: 'center' });
    pdf.text((item.makingCharges || 0).toFixed(0), 167.5, currentY + 6, { align: 'center' });
    pdf.text('0', 180, currentY + 6, { align: 'center' }); // Stone value
    pdf.text((item.amount + (item.makingCharges || 0)).toFixed(0), 192.5, currentY + 6, { align: 'center' });
  });
  
  // Close the table
  const tableEndY = yPos + (billData.items.length * 10);
  pdf.line(10, tableEndY, 200, tableEndY);
  
  // Draw final vertical lines to close the table
  columnPositions.forEach(x => {
    pdf.line(x, yPos, x, tableEndY);
  });
  
  yPos = tableEndY;
  
  // Tax calculations section
  const taxSectionY = yPos + 5;
  
  // Left side - Amount in words (wider box)
  pdf.rect(10, taxSectionY, 120, 25);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Amount In Words:', 12, taxSectionY + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  
  const amountInWords = numberToWords(billData.finalAmount);
  const wordLines = pdf.splitTextToSize(amountInWords, 115);
  pdf.text(wordLines, 12, taxSectionY + 12);
  
  // Right side - Tax calculations (narrower box)
  pdf.rect(130, taxSectionY, 70, 25);
  
  // Tax breakdown with smaller font
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  
  const taxY = taxSectionY + 4;
  pdf.text('Total Amount Before Tax:', 132, taxY);
  pdf.text(billData.subtotal.toFixed(0), 195, taxY, { align: 'right' });
  
  pdf.text('Additional Discount:', 132, taxY + 4);
  pdf.text((billData.roundOffAmount || 0).toFixed(0), 195, taxY + 4, { align: 'right' });
  
  pdf.text('Total Amount After Tax & Disc:', 132, taxY + 8);
  pdf.text(billData.finalAmount.toFixed(0), 195, taxY + 8, { align: 'right' });
  
  // Small tax details table
  pdf.rect(132, taxY + 12, 66, 8);
  pdf.setFontSize(5);
  pdf.text('CGST @ Rate:', 134, taxY + 15);
  pdf.text('1.50%', 150, taxY + 15);
  pdf.text(billData.totalCgst.toFixed(2), 175, taxY + 15, { align: 'right' });
  
  pdf.text('SGST @ Rate:', 134, taxY + 19);
  pdf.text('1.50%', 150, taxY + 19);
  pdf.text(billData.totalSgst.toFixed(2), 175, taxY + 19, { align: 'right' });
  
  // Signature section
  const signatureY = taxSectionY + 35;
  pdf.rect(10, signatureY, 190, 20);
  pdf.line(105, signatureY, 105, signatureY + 20);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer Signature', 55, signatureY + 15, { align: 'center' });
  pdf.text('Company Seal & Signature', 152, signatureY + 15, { align: 'center' });
  
  // Footer
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Thank you for your business!', 105, 270, { align: 'center' });
  
  // Save the PDF
  pdf.save(`Invoice-${billData.billNumber}.pdf`);
};

export const generateBillPDFFromElement = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }
  
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    allowTaint: true,
    useCORS: true
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 295; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  
  let position = 0;
  
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  pdf.save(filename);
};

// Landscape version for better column spacing
export const generateBillPDFLandscape = async (billData: BillData): Promise<void> => {
  const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape
  
  // Company details
  const companyName = 'Arjun Swarnkar';
  const companyGST = '24XXXXX1234X1ZX';
  const companyAddress = 'Gold & Jewelry Shop\nMarket Street, City - 123456\nPhone: +91-9876543210 | Email: info@arjunswarnkar.com';
  
  // Draw outer border (landscape dimensions: 297x210)
  pdf.setLineWidth(0.5);
  pdf.rect(10, 10, 277, 190);
  
  // Header section
  pdf.setLineWidth(0.3);
  pdf.rect(10, 10, 277, 20);
  
  // GSTIN and Original/Duplicate Bill
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`GSTIN No.: ${companyGST}`, 12, 18);
  pdf.text('Original / Duplicate Bill', 250, 18);
  
  // Tax Invoice title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tax Invoice', 148.5, 25, { align: 'center' });
  
  // Company details section
  pdf.rect(10, 30, 277, 35);
  
  // Logo area
  pdf.rect(12, 32, 50, 31);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LOGO', 37, 50, { align: 'center' });
  
  // Company info
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Company Name:', 65, 37);
  pdf.setFont('helvetica', 'normal');
  pdf.text(companyName, 65, 42);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Address:', 65, 47);
  pdf.setFont('helvetica', 'normal');
  const addressLines = companyAddress.split('\n');
  addressLines.forEach((line, index) => {
    pdf.text(line, 65, 52 + (index * 4));
  });
  
  // Customer and Invoice details section
  pdf.rect(10, 65, 277, 30);
  
  // Vertical divider
  pdf.line(148.5, 65, 148.5, 95);
  
  // Customer details
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer Care Details:', 12, 72);
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer Name:', 12, 78);
  pdf.setFont('helvetica', 'normal');
  pdf.text(billData.customer.name, 12, 83);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Address:', 12, 88);
  pdf.setFont('helvetica', 'normal');
  if (billData.customer.address) {
    const customerAddress = [
      billData.customer.address.street,
      billData.customer.address.city,
      billData.customer.address.state,
      billData.customer.address.pinCode
    ].filter(Boolean).join(', ');
    pdf.text(customerAddress || 'N/A', 12, 93);
  } else {
    pdf.text('N/A', 12, 93);
  }
  
  // Phone
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Phone No.:', 12, 98);
  pdf.setFont('helvetica', 'normal');
  pdf.text(billData.customer.phone, 35, 98);
  
  // Invoice details
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Details:', 150, 72);
  
  pdf.setFontSize(7);
  pdf.text('Invoice Date:', 150, 78);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(billData.billDate).toLocaleDateString('en-IN'), 150, 83);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice No.:', 150, 88);
  pdf.setFont('helvetica', 'normal');
  pdf.text(billData.billNumber, 150, 93);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Payment Mode:', 220, 88);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Cash', 220, 93);
  
  // Items table header
  let yPos = 105;
  pdf.rect(10, yPos, 277, 12);
  
  // Table headers with landscape spacing - Much better column widths
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  
  // Draw vertical lines with better spacing for landscape
  const columnPositions = [10, 25, 80, 110, 130, 155, 180, 205, 225, 240, 255, 270, 287];
  columnPositions.forEach(x => {
    pdf.line(x, yPos, x, yPos + 12);
  });
  
  // Headers with much better spacing in landscape
  pdf.text('SL No.', 17.5, yPos + 7, { align: 'center' });
  pdf.text('Item Name & Description', 52.5, yPos + 7, { align: 'center' });
  pdf.text('HSN/SAC', 95, yPos + 7, { align: 'center' });
  pdf.text('Purity', 120, yPos + 7, { align: 'center' });
  pdf.text('Gold Rate/gm', 142.5, yPos + 7, { align: 'center' });
  pdf.text('Gross Wt. (gm)', 167.5, yPos + 7, { align: 'center' });
  pdf.text('Stone Wt.', 192.5, yPos + 7, { align: 'center' });
  pdf.text('Net Wt. (gm)', 215, yPos + 7, { align: 'center' });
  pdf.text('Value', 232.5, yPos + 7, { align: 'center' });
  pdf.text('Making Charges', 247.5, yPos + 7, { align: 'center' });
  pdf.text('Stone Value', 262.5, yPos + 7, { align: 'center' });
  pdf.text('Total Value', 278.5, yPos + 7, { align: 'center' });
  
  yPos += 12;
  
  // Items
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  
  billData.items.forEach((item, index) => {
    const rowHeight = 10;
    const currentY = yPos + (index * rowHeight);
    
    // Draw horizontal line
    pdf.line(10, currentY, 287, currentY);
    
    // Draw vertical lines for each column
    columnPositions.forEach(x => {
      pdf.line(x, currentY, x, currentY + rowHeight);
    });
    
    // Item data with better text positioning in landscape
    pdf.text((index + 1).toString(), 17.5, currentY + 6, { align: 'center' });
    pdf.text(item.description || '', 27, currentY + 6);
    pdf.text(item.hsnCode || '', 95, currentY + 6, { align: 'center' });
    pdf.text(`${item.purity || 22}K`, 120, currentY + 6, { align: 'center' });
    pdf.text((item.rate / (item.weight || 1)).toFixed(0), 142.5, currentY + 6, { align: 'center' });
    pdf.text(((item.weight || 0) + (item.wastage || 0)).toFixed(1), 167.5, currentY + 6, { align: 'center' });
    pdf.text((item.wastage || 0).toFixed(1), 192.5, currentY + 6, { align: 'center' });
    pdf.text((item.weight || 0).toFixed(1), 215, currentY + 6, { align: 'center' });
    pdf.text(item.amount.toFixed(0), 232.5, currentY + 6, { align: 'center' });
    pdf.text((item.makingCharges || 0).toFixed(0), 247.5, currentY + 6, { align: 'center' });
    pdf.text('0', 262.5, currentY + 6, { align: 'center' });
    pdf.text((item.amount + (item.makingCharges || 0)).toFixed(0), 278.5, currentY + 6, { align: 'center' });
  });
  
  // Close the table
  const tableEndY = yPos + (billData.items.length * 10);
  pdf.line(10, tableEndY, 287, tableEndY);
  
  // Draw final vertical lines to close the table
  columnPositions.forEach(x => {
    pdf.line(x, yPos, x, tableEndY);
  });
  
  yPos = tableEndY;
  
  // Tax calculations section
  const taxSectionY = yPos + 5;
  
  // Left side - Amount in words
  pdf.rect(10, taxSectionY, 180, 20);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Amount In Words:', 12, taxSectionY + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  
  const amountInWords = numberToWords(billData.finalAmount);
  const wordLines = pdf.splitTextToSize(amountInWords, 175);
  pdf.text(wordLines, 12, taxSectionY + 12);
  
  // Right side - Tax calculations
  pdf.rect(190, taxSectionY, 97, 20);
  
  // Tax breakdown
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  
  const taxY = taxSectionY + 4;
  pdf.text('Total Amount Before Tax:', 192, taxY);
  pdf.text(billData.subtotal.toFixed(0), 280, taxY, { align: 'right' });
  
  pdf.text('Additional Discount:', 192, taxY + 4);
  pdf.text((billData.roundOffAmount || 0).toFixed(0), 280, taxY + 4, { align: 'right' });
  
  pdf.text('Total Amount After Tax & Disc:', 192, taxY + 8);
  pdf.text(billData.finalAmount.toFixed(0), 280, taxY + 8, { align: 'right' });
  
  // Tax details
  pdf.rect(192, taxY + 12, 93, 6);
  pdf.setFontSize(5);
  pdf.text('CGST @ 1.50%:', 194, taxY + 15);
  pdf.text(billData.totalCgst.toFixed(2), 230, taxY + 15);
  pdf.text('SGST @ 1.50%:', 240, taxY + 15);
  pdf.text(billData.totalSgst.toFixed(2), 275, taxY + 15);
  
  // Signature section
  const signatureY = taxSectionY + 30;
  pdf.rect(10, signatureY, 277, 15);
  pdf.line(148.5, signatureY, 148.5, signatureY + 15);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer Signature', 79, signatureY + 10, { align: 'center' });
  pdf.text('Company Seal & Signature', 218, signatureY + 10, { align: 'center' });
  
  // Save the landscape PDF
  pdf.save(`Invoice-${billData.billNumber}-Landscape.pdf`);
};