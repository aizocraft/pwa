'use client'

import { Product } from '../types/product';
import { formatCurrency, cn } from '../lib/utils';
import { MessageCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface OrderToWhatsAppProps {
  product: Product;
  quantity: number;
}

export default function OrderToWhatsApp({ product, quantity }: OrderToWhatsAppProps) {
  const [isLoading, setIsLoading] = useState(false);

  const whatsappNumber = '+254741653862'; // Company sales WhatsApp number
  const productImage = product.images?.[0] || '';
  const productPrice = formatCurrency(Number(product.price));

const message = ` Hello Plasma Water

*ORDER REQUEST*

\`\`\`
Product : ${product.name}
ID      : ${product._id}
Qty     : ${quantity}
Price   : ${productPrice}
Total   : ${formatCurrency(Number(product.price) * quantity)}
\`\`\`

Please assist with checkout `;

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

  const handleWhatsAppOrder = () => {
    setIsLoading(true);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  onClick={handleWhatsAppOrder}
  disabled={isLoading || !product._id}
  className={cn(
    'flex-1 flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg',
    isLoading || !product._id
      ? 'bg-gray-400 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
  )}
>
  {isLoading ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <span>Opening WhatsApp...</span>
    </>
  ) : (
    <>
      {/* WhatsApp SVG Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-5 h-5 fill-white"
      >
        <path d="M16 .396C7.163.396 0 7.559 0 16.396c0 2.887.755 5.708 2.188 8.192L0 32l7.627-2.145a15.944 15.944 0 008.373 2.355h.007c8.837 0 16-7.163 16-16S24.837.396 16 .396zm0 29.24a13.15 13.15 0 01-6.697-1.833l-.48-.284-4.525 1.272 1.208-4.406-.312-.452A13.132 13.132 0 012.85 16.4c0-7.262 5.907-13.17 13.17-13.17 3.52 0 6.827 1.37 9.317 3.858a13.07 13.07 0 013.853 9.312c-.003 7.263-5.91 13.17-13.17 13.17zm7.268-9.858c-.398-.199-2.355-1.162-2.72-1.295-.365-.133-.63-.199-.896.2-.265.398-1.029 1.295-1.26 1.56-.232.265-.464.298-.862.1-.398-.199-1.68-.619-3.2-1.975-1.183-1.055-1.98-2.356-2.212-2.754-.232-.398-.025-.613.174-.812.18-.179.398-.464.597-.696.199-.232.265-.398.398-.663.133-.265.066-.497-.033-.696-.1-.199-.896-2.163-1.227-2.96-.322-.775-.65-.669-.896-.681l-.763-.014c-.265 0-.696.1-1.06.497s-1.392 1.36-1.392 3.313 1.425 3.843 1.624 4.108c.199.265 2.807 4.287 6.804 6.012.951.41 1.693.655 2.272.838.955.303 1.825.261 2.512.158.766-.114 2.355-.961 2.687-1.889.332-.928.332-1.723.232-1.889-.1-.166-.365-.265-.763-.464z" />
      </svg>

      <span>Order via WhatsApp</span>
    </>
  )}
</motion.button>
  );
}
