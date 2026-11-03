import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductService } from '../application/services/product.service';

@Controller('catalog/products')
export class PublicProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoriaId') categoriaId?: string,
  ) {
    const parsedPage = Number(page) > 0 ? Number(page) : 1;
    const parsedLimit = Number(limit) > 0 ? Number(limit) : 20;

    return this.productService.findPublic(
      parsedPage,
      parsedLimit,
      search,
      categoriaId,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findPublicById(id);
  }
}
