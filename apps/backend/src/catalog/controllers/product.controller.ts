import {
  ParseUUIDPipe,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { ProductService } from '../application/services/product.service';

import { CreateProductDto } from '../application/dto/create-product.dto';
import { VariantService } from '../application/services/variant.service';
import { CreateProductVariantDto } from '../application/dto/create-product-variant.dto';

import { InventoryService } from '../application/services/inventory.service';
import { CreateInventoryDto } from '../application/dto/create-inventory.dto';

import { UpdateInventoryDto } from '../application/dto/update-inventory.dto';
import { UpdateProductDto } from '../application/dto/update-product.dto'; // NUEVO
import { UpdateProductVariantDto } from '../application/dto/update-product-variant.dto'; // NUEVO
import { UpdateProductPublicationDto } from '../application/dto/update-product-publication.dto';
import { ProductImageService } from '../product-image/services/product-image.service';

import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';


@Controller('seller/products')
@UseGuards(JwtAuthGuard)
export class ProductController {

  constructor(
    private readonly productService: ProductService,
    private readonly variantService: VariantService,
    private readonly inventoryService: InventoryService,
    private readonly productImageService: ProductImageService,
  ) {}

  
  /** "Mis productos" — paginado y acotado a la tienda del vendedor. */
  @Get()
  findMine(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Query('page')
    page?: string,

    @Query('limit')
    limit?: string,

    @Query('search')
    search?: string,
  ) {
    return this.productService.findMine(
      user.id,
      Number(page ?? 1),
      Number(limit ?? 20),
      search?.trim() || undefined,
    );
  }

  @Get(':id')
  findMineById(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Param('id', ParseUUIDPipe)
    productId: string,
  ) {
    return this.productService.findMineById(
      user.id,
      productId,
    );
  }

  /** Publica o retira de publicación. Sin esto un producto nunca podía venderse. */
  @Patch(':id/publication')
  updatePublication(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Param('id', ParseUUIDPipe)
    productId: string,

    @Body()
    dto: UpdateProductPublicationDto,
  ) {
    return this.productService.updatePublication(
      user.id,
      productId,
      dto.publicado,
    );
  }

  /** NUEVO: edita nombre, descripción y peso de un producto propio. */
  @Patch(':id')
  updateDetails(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Param('id', ParseUUIDPipe)
    productId: string,

    @Body()
    dto: UpdateProductDto,
  ) {
    return this.productService.updateDetails(
      user.id,
      productId,
      dto,
    );
  }

    /** NUEVO: edita SKU, precio y peso de una variante propia. */
  @Patch('variants/:id')
  updateVariant(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Param('id', ParseUUIDPipe)
    variantId: string,

    @Body()
    dto: UpdateProductVariantDto,
  ) {
    return this.variantService.update(
      user.id,
      variantId,
      dto,
    );
  }
  
  @Post()
  create(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Body()
    dto: CreateProductDto,
  ) {
    return this.productService.create(
      user.id,
      dto,
    );
  }

  //variant creation endpoint

  @Post(':id/variants')
  createVariant(
    @CurrentUser()
    user: AuthenticatedUserDto,

    @Param('id', ParseUUIDPipe)
    productId: string,

    @Body()
    dto: CreateProductVariantDto,
  ) {

    return this.variantService.create(
      user.id,
      productId,
      dto,
    );

}
//inventory creation endpoint
@Post('variants/:id/inventory')
createInventory(

  @CurrentUser()
  user: AuthenticatedUserDto,

  @Param('id', ParseUUIDPipe)
  variantId: string,

  @Body()
  dto: CreateInventoryDto,

) {

  return this.inventoryService.create(
    user.id,
    variantId,
    dto,
  );

}
//actualizar inventario endpoint
@Patch('variants/:id/inventory')
updateInventory(

  @CurrentUser()
  user: AuthenticatedUserDto,

  @Param('id', ParseUUIDPipe)
  variantId: string,

  @Body()
  dto: UpdateInventoryDto,

) {

  return this.inventoryService.update(
    user.id,
    variantId,
    dto,
  );

}
/*
 * `reserve`, `release` y `confirm` no se exponen por HTTP.
 *
 * Son primitivas internas del ciclo de vida del stock: quien las ejecuta es
 * Orders, dentro de su propia transacción (`order.repository.ts`), nunca un
 * cliente HTTP. Publicarlas permitía descuadrar el stock reservado de
 * cualquier vendedor al margen de un pedido real. Los métodos siguen en
 * InventoryService por si otro módulo los necesita desde dentro.
 */
//upload product image endpoint
@Post(':productId/images')
@UseInterceptors(FileInterceptor('file'))
async uploadProductImage(

  @CurrentUser()
  user: AuthenticatedUserDto,

  @Param('productId', ParseUUIDPipe)
  productId: string,

  @UploadedFile(

  new ParseFilePipe({

    validators: [

      new MaxFileSizeValidator({

        maxSize: 5 * 1024 * 1024,

      }),

      new FileTypeValidator({

        fileType: /^image\/(jpeg|png|webp)$/,

      }),

    ],

    fileIsRequired: true,

  }),

)

file: Express.Multer.File,

) {


  return this.productImageService.uploadProductImage(

    user.id,

    productId,

    {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    },

  );

}
}