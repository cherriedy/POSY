// Module
export * from './products.module';

// DTOs
export * from './dto/product-attribute-cuisine-response.dto';
export * from './dto/product-attribute-response.dto';
export * from './dto/product-attribute-upsert-request.dto';
export * from './dto/product-category-response.dto';
export * from './dto/product-create-request.dto';
export * from './dto/product-detailed-response.dto';
export * from './dto/product-ingredient-bulk-delete-request.dto';
export * from './dto/product-ingredient-bulk-delete-response.dto';
export * from './dto/product-ingredient-bulk-upsert-request.dto';
export * from './dto/product-ingredient-response.dto';
export * from './dto/product-preview-response.dto';
export * from './dto/product-public-detailed-response.dto';
export * from './dto/product-public-preview-response.dto';
export * from './dto/product-public-query-params.dto';
export * from './dto/product-query-params.dto';
export * from './dto/product-update-request.dto';

// Entities
export * from './entities/product';
export * from './entities/product.mapper';
export * from './entities/product-attribute';
export * from './entities/product-attribute.mapper';
export * from './entities/product-ingredient';
export * from './entities/product-ingredient.mapper';
export * from './entities/seasonal-pattern';
export * from './entities/seasonal-pattern.mapper';

// Enums
export * from './enums/product.enum';
export * from './enums/product-attribute.enum';

// Exceptions
export * from './exceptions/product-not-found.exception';
export * from './exceptions/product-ingredient-not-found.exception';

// Interfaces
export * from './interfaces/product-payloads.interface';
export * from './interfaces/product-query-params.interface';

// Abstract repositories (NOT impls, NOT module)
export * from './repositories/product-repository.abstract';
export * from './repositories/product-attribute-repository.abstract';
export * from './repositories/product-ingredient-repository.abstract';
export * from './repositories/seasonal-pattern-repository.abstract';

// Services
export * from './get-products/get-products.service';
export * from './create-product/create-product.service';
export * from './update-product/update-product.service';
export * from './delete-product/delete-product.service';
export * from './get-attributes/get-attributes.service';
export * from './upsert-attributes/upsert-attributes.service';
export * from './get-product-ingredients/get-product-ingredients.service';
export * from './remove-product-ingredient/remove-product-ingredient.service';
export * from './upsert-ingredients/upsert-ingredients.service';

// MeiliSearch
export * from './providers/meilisearch/meilisearch-product.service';
