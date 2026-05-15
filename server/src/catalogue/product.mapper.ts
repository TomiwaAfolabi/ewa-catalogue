import type { Category, Product } from '@prisma/client';

/** Shape aligned with the Vue `Product` type (price in naira). */
export type CatalogueProductDto = {
  id: string;
  catalogueKey?: string | null;
  slug: string;
  title: string;
  description?: string | null;
  /** Display / UX — whole naira (rounded from kobo). */
  price: number;
  /** Authoritative smallest-unit amount; must match server on checkout. */
  priceKobo: number;
  currency_symbol: string;
  imgSrc: string;
  images: string[];
  /** Merged JSON: optional cm numerics, garmentType, legacy string keys. */
  sizes: Record<string, unknown>;
  category?: string;
  inStock: boolean;
  /** Units in stock when provided; otherwise derived from `inStock` (0 or 1). */
  stockQuantity: number;
  featured: boolean;
  createdAt: string;
};

export function toCatalogueProduct(
  p: Product & { category?: Category | null },
): CatalogueProductDto {
  const naira = Math.round(p.price / 100);
  const images = [...p.images];
  const imgSrc = images[0] ?? '';
  const fromDbSizes =
    p.sizes && typeof p.sizes === 'object' && !Array.isArray(p.sizes)
      ? { ...(p.sizes as Record<string, unknown>) }
      : {};
  const pr = p as Record<string, unknown>;
  const rawMs = pr.measurements ?? pr.measurement;
  const fromMeasurements =
    rawMs && typeof rawMs === 'object' && !Array.isArray(rawMs)
      ? { ...(rawMs as Record<string, unknown>) }
      : {};
  const sizes = { ...fromMeasurements, ...fromDbSizes };
  const rawSq = pr.stockQuantity ?? pr.stock_quantity ?? pr.quantityInStock;
  const stockQuantity =
    typeof rawSq === 'number' && Number.isFinite(rawSq)
      ? Math.max(0, Math.floor(rawSq))
      : p.inStock
        ? 1
        : 0;
  return {
    id: p.id,
    catalogueKey: p.catalogueKey,
    slug: p.slug,
    title: p.title,
    description: p.description,
    price: naira,
    priceKobo: p.price,
    currency_symbol: p.currency === 'NGN' ? '₦' : p.currency,
    imgSrc,
    images,
    sizes,
    category: p.category?.slug,
    inStock: p.inStock,
    stockQuantity,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
  };
}
