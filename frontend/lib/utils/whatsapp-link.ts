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

  const lines = [
    `*¡Hola AMIAS!*`,
    ``,
    `Acabo de realizar un pedido en la plataforma y adjunto mi constancia de pago.`,
    ``,
    `*CÓDIGO DE PEDIDO:* ${data.orderNumber}`,
    `*CLIENTE:* ${data.customerName}`,
    `*Nº OPERACIÓN VOUCHER:* ${data.operationCode}`,
    ``,
    `*RESUMEN DEL PEDIDO:*`,
  ];

  data.items.forEach((item, index) => {
    const subtotal = item.quantity * item.unitPrice;
    lines.push(`  ${index + 1}. ${item.productName} [Talla ${item.sizeLabel}] x${item.quantity} — ${formatCurrencyPEN(subtotal)}`);
  });

  lines.push(``);
  lines.push(`*TOTAL ABONADO:* ${formatCurrencyPEN(data.totalAmount)}`);
  lines.push(``);
  lines.push(`Quedo a la espera de su confirmación para la confección. ¡Muchas gracias!`);

  const fullMessage = lines.join('\n');
  const encodedText = encodeURIComponent(fullMessage);
  return `https://wa.me/${phone}?text=${encodedText}`;
}
