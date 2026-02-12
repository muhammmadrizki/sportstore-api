import { createRoute } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";

// import { AuthHeaderSchema } from "./schema";

import {
  AddCartItemSchema,
  CartSchema,
  DeleteCartItemParamSchema,
  PatchCartItemSchema,
} from "./schema";
import { checkAuthorized } from "../auth/middleware";
import { prisma } from "../../lib/prisma";

export const cartRoute = new OpenAPIHono();

//GET/cart
cartRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    middleware: checkAuthorized,
    responses: {
      200: {
        content: { "application/json": { schema: CartSchema } },
        description: "Get cart",
      },
      404: {
        description: "User not found",
      },
    },
  }),
  async (c) => {
    const user = c.get("user");
    const cart = await prisma.cart.findFirst({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });
    if (!cart) {
      const newCart = await prisma.cart.create({
        data: { userId: user.id },
        include: { items: { include: { product: true } } },
      });

      return c.json(newCart);
    }

    return c.json(cart);
  },
);

//POST/cart/items
// cartRoute.openapi(
//   createRoute({
//     method: "post",
//     path: "/items",
//     request: {
//       body: { content: { "application/json": { schema: AddCartItemSchema } } },
//     },
//     middleware: checkAuthorized,
//     responses: {
//       200: {
//         content: { "application/json": { schema: CartSchema } },
//         description: "Add item to cart",
//       },
//       400: {
//         description: "Failed to add item to cart",
//       },
//     },
//   }),
//   async (c) => {
//     try {
//       const body = c.req.valid("json");
//       const user = c.get("user");

//       const cart = await prisma.cart.findFirst({
//         where: { userId: user.id },
//       });

//       if (!cart) {
//         return c.json({ message: "Cart not found" }, 400);
//       }

//       const newCartItem = await prisma.cartItem.create({
//         data: {
//           cartId: cart.id,
//           productId: body.productId,
//           quantity: body.quantity,
//         },
//         include: { product: true },
//       });

//       return c.json(newCartItem);
//     } catch (error) {
//       return c.json({ message: "Failed to add item to cart" }, 400);
//     }
//   },
// );
//POST/cart/items
cartRoute.openapi(
  createRoute({
    method: "post",
    path: "/items",
    request: {
      body: {
        content: {
          "application/json": { schema: AddCartItemSchema },
        },
      },
    },
    middleware: checkAuthorized,
    responses: {
      200: {
        content: { "application/json": { schema: CartSchema } },
        description: "Add item to cart",
      },
      400: {
        description: "Failed to add item to cart",
      },
    },
  }),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const user = c.get("user");

      // 1️⃣ cari cart
      let cart = await prisma.cart.findFirst({
        where: { userId: user.id },
      });

      // 2️⃣ kalau belum ada → buat
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: user.id },
        });
      }

      // 3️⃣ create cart item
      const newCartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: body.productId,
          quantity: body.quantity,
        },
        include: { product: true },
      });

      return c.json(newCartItem);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Failed to add item to cart" }, 400);
    }
  },
);

// DELETE /cart/items/:id
cartRoute.openapi(
  createRoute({
    method: "delete",
    path: "/items/{id}",
    middleware: checkAuthorized,
    request: {
      params: DeleteCartItemParamSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: CartSchema,
          },
        },
        description: "Item removed from cart",
      },
      404: {
        description: "Cart item not found",
      },
    },
  }),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: { userId: user.id },
      },
    });

    if (!cartItem) {
      return c.json({ message: "Cart item not found" }, 404);
    }

    await prisma.cartItem.delete({ where: { id } });

    const updatedCart = await prisma.cart.findFirst({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });

    return c.json(updatedCart);
  },
);

//patch /cart/items/:id
cartRoute.openapi(
  createRoute({
    method: "patch",
    path: "/items/{id}",
    middleware: checkAuthorized,
    request: {
      params: DeleteCartItemParamSchema,
      body: {
        content: {
          "application/json": {
            schema: PatchCartItemSchema,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: CartSchema,
          },
        },
        description: "Cart item patched",
      },
      404: { description: "Cart item not found" },
    },
  }),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: { userId: user.id },
      },
    });

    if (!cartItem) {
      return c.json({ message: "Cart item not found" }, 404);
    }

    let newQuantity = cartItem.quantity;

    if (body.action === "increment") {
      newQuantity += body.amount;
    }

    if (body.action === "decrement") {
      newQuantity -= body.amount;
    }

    // kalau quantity <= 0 → delete item
    if (newQuantity <= 0) {
      await prisma.cartItem.delete({ where: { id } });
    } else {
      await prisma.cartItem.update({
        where: { id },
        data: { quantity: newQuantity },
      });
    }

    const updatedCart = await prisma.cart.findFirst({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });

    return c.json(updatedCart);
  },
);
