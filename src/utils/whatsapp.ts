import type { CartItem, RestaurantConfig } from '../types';

export const formatWhatsAppMessage = (
  cart: CartItem[],
  customerInfo: { name: string; address: string; payment: string; type: string },
  config: RestaurantConfig,
  orderId?: string,
  storeSlug?: string
) => {
  const itemsText = cart
    .map(
      (item) => {
        const optionsPrice = item.selectedOptions.reduce((acc, o) => acc + Number(o.price), 0);
        const itemTotal = (item.product.price + optionsPrice) * item.quantity;
        
        const optionsText = item.selectedOptions.length > 0
          ? `\n  _Opcionais: ${item.selectedOptions.map((o) => o.name).join(', ')}_`
          : '';
          
        const notesText = item.notes ? `\n  _Obs: ${item.notes}_` : '';

        return `*${item.quantity}x ${item.product.name}*\n  R$ ${item.product.price.toFixed(2)}${optionsText}${notesText}\n  *Subtotal: R$ ${itemTotal.toFixed(2)}*`;
      }
    )
    .join('\n\n');

  const total = cart.reduce((acc, item) => {
    const optionsPrice = item.selectedOptions.reduce((sum, o) => sum + Number(o.price), 0);
    return acc + (item.product.price + optionsPrice) * item.quantity;
  }, 0);

  const finalTotal = total + (customerInfo.type === 'delivery' ? config.deliveryFee : 0);

  const trackingUrl = orderId && storeSlug 
    ? `\n\n📍 *ACOMPANHE SEU PEDIDO:* \n${window.location.origin}/${storeSlug}/order/${orderId}`
    : '';

  const message = `
🍔 *NOVO PEDIDO - ${config.name}*
------------------------------

${itemsText}

------------------------------
*Subtotal:* R$ ${total.toFixed(2)}
${customerInfo.type === 'delivery' ? `*Taxa de Entrega:* R$ ${config.deliveryFee.toFixed(2)}` : '*Retirada no Balcão*'}
*TOTAL: R$ ${finalTotal.toFixed(2)}*

📍 *DADOS DO CLIENTE*
*Nome:* ${customerInfo.name}
*Tipo:* ${customerInfo.type === 'delivery' ? '🚀 Entrega' : '🏪 Retirada'}
*Endereço:* ${customerInfo.address}
*Pagamento:* 💳 ${customerInfo.payment}${trackingUrl}

_Pedido enviado via ANOTÔ_
  `.trim();

  const phone = config.whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
