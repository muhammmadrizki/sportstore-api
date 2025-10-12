import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { Scalar } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";

import { productRoute } from "./modules/product/route";
import { userRoute } from "./modules/user/route";
import { authRoute } from "./modules/auth/route";
import { cartRoute } from "./modules/cart/route";

const app = new OpenAPIHono();

app.use(logger());
app.use(cors());
app.route("/products", productRoute);
app.route("/users", userRoute);
app.route("/auth", authRoute);
app.route("/cart", cartRoute);

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Sport Store API",
  },
});

app.get("/", Scalar({ url: "/openapi.json" }));

// app.post("/products", async (c) => {
//   const body = await c.req.json();
//   const product = await prisma.product.create({
//     data: {
//       slug: body.slug,
//       name: body.name,
//       description: body.description,
//       imageUrl: body.imageUrl,
//       price: body.price,
//     },
//   });
//   return c.json(product);
// });

// app.delete("/products/:id", async (c) => {
//   const id = c.req.param("id");

//   try {
//     const deleted = await prisma.product.delete({
//       where: { id },
//     });
//     return c.json(deleted);
//   } catch (error) {
//     return c.json({ error: "product not found" }, 404);
//   }
// });

// app.patch("/products/:id", async (c) => {
//   const id = c.req.param("id");
//   const body = await c.req.json();
//   try {
//     const updated = await prisma.product.update({
//       where: { id },
//       data: {
//         slug: body.slug,
//         name: body.name,
//         description: body.description,
//         imageUrl: body.imageUrl,
//         price: body.price,
//       },
//     });

//     return c.json(updated);
//   } catch (error) {
//     return c.json({ error: "Product not found and update failed" }, 404);
//   }
// });

export default app;
