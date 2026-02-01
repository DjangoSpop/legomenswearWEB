import clsx from 'clsx';

interface PriceProps {
  price: number;
  originalPrice?: number;
  className?: string;
  showCurrency?: boolean;
}

export default function Price({
  price,
  originalPrice,
  className,
  showCurrency = true,
}: PriceProps) {
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <span className={clsx('price', hasDiscount && 'price-sale')}>
        {showCurrency && '$'}
        {price.toFixed(2)}
      </span>
      {hasDiscount && (
        <span className="price-original">
          {showCurrency && '$'}
          {originalPrice.toFixed(2)}
        </span>
      )}
    </div>
  );
}
