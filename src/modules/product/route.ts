import { createRoute } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { ProductSchema, ProductsSchema, ProductsSlugSchema } from "./schema";

export const productRoute = new OpenAPIHono();
//GET API PRODUCTS
productRoute.openapi(
  createRoute({
    method: "get",
    path: "/",

    responses: {
      200: {
        content: { "application/json": { schema: ProductsSchema } },
        description: "Get all Products",
      },
    },
  }),
  async (c) => {
    const products = await prisma.product.findMany();

    return c.json(products);
  }
);

//GET API BY SLUG
productRoute.openapi(
  createRoute({
    method: "get",
    path: "/{slug}",
    request: {
      params: ProductsSlugSchema,
    },
    responses: {
      200: {
        content: { "application/json": { schema: ProductSchema } },
        description: "Get product by slug",
      },
      404: {
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const { slug } = c.req.valid("param");

    const product = await prisma.product.findUnique({
      where: { slug },
    });
    if (!product) {
      return c.json({ message: "Product not found" }, 404);
    }

    return c.json(product);
  }
);
