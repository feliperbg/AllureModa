
# AllureModa Database Documentation

This document provides an overview of the database schema for the AllureModa application.

## Schema

The database schema is defined in the `schema.prisma` file. It uses Prisma as the ORM (Object-Relational Mapper) to interact with the PostgreSQL database.

### Models

The following models are defined in the schema:

- `User`: Represents a user of the application.
- `Address`: Represents a user's address.
- `Category`: Represents a product category.
- `Brand`: Represents a product brand.
- `Product`: Represents a product.
- `Attribute`: Represents a product attribute (e.g., color, size).
- `AttributeValue`: Represents a value for a product attribute (e.g., red, large).
- `ProductVariant`: Represents a specific variant of a product (e.g., a red, large t-shirt).
- `ProductVariantAttributeValue`: A join table between `ProductVariant` and `AttributeValue`.
- `ProductImage`: Represents an image of a product.
- `Cart`: Represents a user's shopping cart.
- `CartItem`: Represents an item in a shopping cart.
- `Order`: Represents a user's order.
- `OrderItem`: Represents an item in an order.
- `Review`: Represents a user's review of a product.
- `WishlistItem`: Represents an item in a user's wishlist.

## Migrations

Database migrations are managed using Prisma Migrate. To create a new migration, run the following command:

```
npx prisma migrate dev --name <migration-name>
```

To apply migrations to the database, run the following command:

```
npx prisma migrate deploy
```
