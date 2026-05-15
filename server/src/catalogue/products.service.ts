import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import type { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/create-product.dto';
import { toCatalogueProduct } from './product.mapper';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const perPage = Math.min(query.perPage ?? 24, 100);
    const where: Prisma.ProductWhereInput = {
      inStock: true,
    };

    if (query.featured === true) {
      where.featured = true;
    }
    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }
    if (query.search?.trim()) {
      where.title = {
        contains: query.search.trim(),
        mode: 'insensitive',
      };
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { category: true },
      }),
    ]);

    return {
      data: rows.map(toCatalogueProduct),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage) || 0,
    };
  }

  async featuredList(limit = 8) {
    const rows = await this.prisma.product.findMany({
      where: { featured: true, inStock: true },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 24),
      include: { category: true },
    });
    return rows.map(toCatalogueProduct);
  }

  async search(q: string, limit = 50) {
    const rows = await this.prisma.product.findMany({
      where: {
        title: { contains: q.trim(), mode: 'insensitive' },
        inStock: true,
      },
      orderBy: { title: 'asc' },
      take: Math.min(limit, 100),
      include: { category: true },
    });
    return rows.map(toCatalogueProduct);
  }

  async getBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!product || !product.inStock) {
      throw new NotFoundException('Product not found');
    }
    return toCatalogueProduct(product);
  }

  async getById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product || !product.inStock) {
      throw new NotFoundException('Product not found');
    }
    return toCatalogueProduct(product);
  }

  async getByCatalogueKey(catalogueKey: string) {
    const product = await this.prisma.product.findUnique({
      where: { catalogueKey },
      include: { category: true },
    });
    if (!product || !product.inStock) {
      throw new NotFoundException('Product not found');
    }
    return toCatalogueProduct(product);
  }

  async create(dto: CreateProductDto) {
    const row = await this.prisma.product.create({
      data: {
        catalogueKey: dto.catalogueKey,
        slug: dto.slug,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        currency: dto.currency ?? 'NGN',
        sku: dto.sku,
        inStock: dto.inStock ?? true,
        featured: dto.featured ?? false,
        sizes: dto.sizes === undefined ? undefined : (dto.sizes as Prisma.InputJsonValue),
        images: dto.images ?? [],
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
    return toCatalogueProduct(row);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.getRawById(id);
    const row = await this.prisma.product.update({
      where: { id },
      data: {
        catalogueKey: dto.catalogueKey,
        slug: dto.slug,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        currency: dto.currency,
        sku: dto.sku,
        inStock: dto.inStock,
        featured: dto.featured,
        sizes: dto.sizes === undefined ? undefined : (dto.sizes as Prisma.InputJsonValue),
        images: dto.images,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
    return toCatalogueProduct(row);
  }

  /** Detaches cart lines and order line FKs, then removes the product. */
  async delete(id: string) {
    await this.getRawById(id);
    await this.prisma.$transaction([
      this.prisma.orderItem.updateMany({
        where: { productId: id },
        data: { productId: null },
      }),
      this.prisma.cartItem.deleteMany({ where: { productId: id } }),
      this.prisma.product.delete({ where: { id } }),
    ]);
    return { deleted: true };
  }

  private async getRawById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
