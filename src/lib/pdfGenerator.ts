import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const companyAddress = 'Gold & Jewelry Shop\nMarket Street, City - 123456\nGST: 24XXXXX1234X1ZX | BIS Reg: BIS/H/1234567';
  
  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(companyName, 105, 20, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(companyAddress, 105, 30, { align: 'center' });
  
  // Title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TAX INVOICE', 105, 50, { align: 'center' });
  
  // Bill details
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Bill No: ${billData.billNumber}`, 20, 65);
  pdf.text(`Date: ${new Date(billData.billDate).toLocaleDateString('en-IN')}`, 150, 65);
  
  // Customer details
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bill To:', 20, 80);
  pdf.setFont('helvetica', 'normal');
  pdf.text(billData.customer.name, 20, 88);
  pdf.text(billData.customer.phone, 20, 95);
  
  if (billData.customer.email) {
    pdf.text(billData.customer.email, 20, 102);
  }
  
  if (billData.customer.address) {
    const address = [
      billData.customer.address.street,
      billData.customer.address.city,
      billData.customer.address.state,
      billData.customer.address.pinCode
    ].filter(Boolean).join(', ');
    
    if (address) {
      pdf.text(address, 20, billData.customer.email ? 109 : 102);
    }
  }
  
  if (billData.customer.gstNumber) {
    pdf.text(`GST: ${billData.customer.gstNumber}`, 20, billData.customer.email ? 116 : 109);
  }
  
  // Items table
  let yPos = 130;
  
  // Table headers
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('S.No', 20, yPos);
  pdf.text('Description', 30, yPos);
  pdf.text('HSN', 70, yPos);
  pdf.text('Qty', 85, yPos);
  pdf.text('Rate', 100, yPos);
  pdf.text('Amount', 115, yPos);
  pdf.text('CGST', 135, yPos);
  pdf.text('SGST', 150, yPos);
  pdf.text('Total', 165, yPos);
  
  // Draw header line
  pdf.line(20, yPos + 2, 190, yPos + 2);
  yPos += 8;
  
  // Items
  pdf.setFont('helvetica', 'normal');
  billData.items.forEach((item, index) => {
    pdf.text((index + 1).toString(), 20, yPos);
    pdf.text(item.description.substring(0, 20), 30, yPos);
    pdf.text(item.hsnCode, 70, yPos);
    pdf.text(`${item.quantity} ${item.unit}`, 85, yPos);
    pdf.text(item.rate.toFixed(2), 100, yPos);
    pdf.text(item.amount.toFixed(2), 115, yPos);
    pdf.text(item.cgstAmount.toFixed(2), 135, yPos);
    pdf.text(item.sgstAmount.toFixed(2), 150, yPos);
    pdf.text((item.amount + item.cgstAmount + item.sgstAmount + (item.igstAmount || 0)).toFixed(2), 165, yPos);
    
    yPos += 6;
    
    // Add page break if needed
    if (yPos > 260) {
      pdf.addPage();
      yPos = 20;
    }
  });
  
  // Totals
  yPos += 5;
  pdf.line(20, yPos, 190, yPos);
  yPos += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Subtotal:', 135, yPos);
  pdf.text(billData.subtotal.toFixed(2), 165, yPos);
  yPos += 6;
  
  pdf.text('Total CGST:', 135, yPos);
  pdf.text(billData.totalCgst.toFixed(2), 165, yPos);
  yPos += 6;
  
  pdf.text('Total SGST:', 135, yPos);
  pdf.text(billData.totalSgst.toFixed(2), 165, yPos);
  yPos += 6;
  
  if (billData.totalIgst && billData.totalIgst > 0) {
    pdf.text('Total IGST:', 135, yPos);
    pdf.text(billData.totalIgst.toFixed(2), 165, yPos);
    yPos += 6;
  }
  
  pdf.text('Total Tax:', 135, yPos);
  pdf.text(billData.totalTax.toFixed(2), 165, yPos);
  yPos += 6;
  
  if (billData.roundOffAmount && billData.roundOffAmount !== 0) {
    pdf.text('Round Off:', 135, yPos);
    pdf.text(billData.roundOffAmount.toFixed(2), 165, yPos);
    yPos += 6;
  }
  
  pdf.setFontSize(12);
  pdf.text('Grand Total:', 135, yPos);
  pdf.text(`₹ ${billData.finalAmount.toFixed(2)}`, 165, yPos);
  
  // Terms and conditions
  if (billData.termsAndConditions) {
    yPos += 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Terms & Conditions:', 20, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(billData.termsAndConditions, 20, yPos + 6);
  }
  
  // Notes
  if (billData.notes) {
    yPos += 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notes:', 20, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(billData.notes, 20, yPos + 6);
  }
  
  // Footer
  yPos = 280;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Thank you for your business!', 105, yPos, { align: 'center' });
  
  // Save the PDF
  pdf.save(`Bill-${billData.billNumber}.pdf`);
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