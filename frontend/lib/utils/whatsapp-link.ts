import { formatCurrencyPEN } from './format-currency';

export interface WhatsAppOrderData {
  orderNumber: string; // e.g. #ORD-0001
  customerName: string;
  totalAmount: number;
  items: {
    productName: string;
    sizeLabel: string;
    quantity: number;
    unitPrice: number;
  }[];
  operationCode: string;
  storePhoneNumber?: string; // Default: 51999999999
}

/**
 * Generates direct WhatsApp API URL with pre-filled formal order summary (TR-023 / US-06).
 */
export function generateWhatsAppOrderLink(data: WhatsAppOrderData): string {
  const phone = data.storePhoneNumber || '51999999999';

  let message = `*¡Hola AMIAS Textile Studio!* 👋\n\n`;
  message += `Acabo de realizar mi pedido a través de la plataforma y adjunto mi constancia de pago.\n\n`;
  message += `📌 *Código de Pedido:* ${data.orderNumber}\n`;
  message += `👤 *Cliente:* ${data.customerName}\n`;
  message += `🔢 *Nº de Operación Vouché:* ${data.operationCode}\n\n`;
  message += `🛍️ *Resumen de Prendas:*\n`;

  data.items.forEach((item, index) => {
    const subtotal = item.quantity * item.unitPrice;
    message += `  ${index + 1}. ${item.productName} (Talla: ${item.sizeLabel}) x${item.quantity} - ${formatCurrencyPEN(subtotal)}\n`;
  });

  message += `\n💰 *Total Aprobado:* ${formatCurrencyPEN(data.totalAmount)}\n\n`;
  message += `Quedo a la espera de la confirmación para la confección. ¡Muchas gracias!`;

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedText}`;
}
