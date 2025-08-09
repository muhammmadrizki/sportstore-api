import { OpenAPIHono } from "@hono/zod-openapi";

import { cors } from "hono/cors";
import { createRoute } from "@hono/zod-openapi";

import { prisma } from "./lib/prisma";
import { ProductsSchema } from "./modules/product/schema";

const app = new OpenAPIHono();

app.use(cors());

app.get("/", (c) => {
  return c.json({
    message: "Sport Store API",
  });
});

//GET API PRODUCTS
const route = createRoute({
  method: "get",
  path: "/products",

  responses: {
    200: {
      content: { "application/json": { schema: ProductsSchema } },
      description: "Get all Products",
    },
  },
});

app.openapi(route, async (c) => {
  const products = await prisma.product.findMany();

  return c.json(products);
});

app.get("/products/:id", async (c) => {
  const id = c.req.param("id");

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) return c.notFound();

  return c.json(product);
});

app.post("/products", async (c) => {
  const body = await c.req.json();
  const product = await prisma.product.create({
    data: {
      slug: body.slug,
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      price: body.price,
    },
  });
  return c.json(product);
});

app.delete("/products/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const deleted = await prisma.product.delete({
      where: { id },
    });
    return c.json(deleted);
  } catch (error) {
    return c.json({ error: "product not found" }, 404);
  }
});

app.patch("/products/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        slug: body.slug,
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
        price: body.price,
      },
    });

    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Product not found and update failed" }, 404);
  }
});

export default app;
