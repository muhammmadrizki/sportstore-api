import { Hono } from "hono";
import { prisma } from "./lib/prisma";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    message: "Sport Store API",
  });
});

app.get("/products", async (c) => {
  const products = await prisma.product.findMany();
  return c.json(products);
});

app.post("/products")

export default app;
