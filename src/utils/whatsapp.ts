import type { CartItem, RestaurantConfig } from '../types';

export const formatWhatsAppMessage = (
  cart: CartItem[],
  customerInfo: { name: string; address: string; payment: string; type: string },
  config: RestaurantConfig
) => {
  const itemsText = cart
    .map(
      (item) =>
        `*${item.quantity}x ${item.product.name}* ${
          item.selectedOptions.length > 0
            ? `\n  _Opções: ${item.selectedOptions.map((o) => o.name).join(', ')}_`
            : ''
        }${item.notes ? `\n  _Obs: ${item.notes}_` : ''}\n  R$ ${(
          (item.product.price +
            item.selectedOptions.reduce((acc, o) => acc + o.price, 0)) *
          item.quantity
        ).toFixed(2)}`
    )
    .join('\n\n');

  const total = cart.reduce((acc, item) => {
    const optionsPrice = item.selectedOptions.reduce((sum, o) => sum + o.price, 0);
    return acc + (item.product.price + optionsPrice) * item.quantity;
  }, 0);

  const finalTotal = total + config.deliveryFee;

  const message = `
🍔 *NOVO PEDIDO - ${config.name}*
------------------------------

${itemsText}

------------------------------
*Subtotal:* R$ ${total.toFixed(2)}
*Taxa de Entrega:* R$ ${config.deliveryFee.toFixed(2)}
*TOTAL:* R$ ${finalTotal.toFixed(2)}

📍 *DADOS DE ENTREGA*
*Nome:* ${customerInfo.name}
*Tipo:* ${customerInfo.type === 'delivery' ? 'Entrega' : 'Retirada'}
*Endereço:* ${customerInfo.address}
*Pagamento:* ${customerInfo.payment}

_Pedido feito via Web App_
  `.trim();

  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
};
