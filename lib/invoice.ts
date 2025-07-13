import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Item {
  id: number;
  name: string;
  stock: number;
  price: number;
}

interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

export function generateInvoicePDF(cart: Item[]) {
  const doc = new jsPDF();

  // Group items to calculate quantity
  const cartItems: CartItem[] = [];
  cart.forEach(item => {
    const existingItem = cartItems.find(cartItem => cartItem.name === item.name);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cartItems.push({ name: item.name, quantity: 1, price: item.price });
    }
  });

  // Header
  doc.setFontSize(20);
  doc.text('INVOICE', 150, 20);

  doc.setFontSize(12);
  doc.text('GROCI', 20, 30);
  doc.text('123 Market Street, Cityville', 20, 37);
  doc.text('Phone: (555) 123-4567 | Email: support@groci.com', 20, 44);

  doc.text('Bill To:', 20, 60);
  doc.text('John Doe', 20, 67);
  doc.text('789 Elm Street, Townsville', 20, 74);
  doc.text('Phone: (555) 987-6543 | Email: john.doe@example.com', 20, 81);

  doc.text(`Invoice #: ${Math.floor(Math.random() * 100000)}`, 20, 95);
  doc.text(`Date: ${new Date().toISOString().split('T')[0]}`, 20, 102);

  // Items Table
  autoTable(doc, {
    startY: 110,
    head: [['Qty', 'Description', 'Unit Price', 'Total']],
    body: cartItems.map(item => [
      item.quantity,
      item.name,
      `₹${item.price.toFixed(2)}`,
      `₹${(item.price * item.quantity).toFixed(2)}`
    ]),
  });

  // Summary
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.07;
  const total = subtotal + tax;

  const finalY = (doc as any).lastAutoTable.finalY;
  doc.setFontSize(12);
  doc.text('Subtotal:', 150, finalY + 10);
  doc.text(`₹${subtotal.toFixed(2)}`, 180, finalY + 10);
  doc.text('Tax (7%):', 150, finalY + 17);
  doc.text(`₹${tax.toFixed(2)}`, 180, finalY + 17);
  doc.text('Total:', 150, finalY + 24);
  doc.text(`₹${total.toFixed(2)}`, 180, finalY + 24);

  // Footer
  doc.setFontSize(10);
  doc.text('Thank you for shopping with GROCI!', 20, finalY + 40);
  doc.text('Payment due within 15 days.', 20, finalY + 45);
  doc.text('For questions, contact support@groci.com', 20, finalY + 50);


  doc.save('invoice.pdf');
}
