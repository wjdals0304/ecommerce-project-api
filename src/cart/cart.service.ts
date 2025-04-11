import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
        },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const cartItems = await this.prisma.cart.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          user_id: true,
          product_id: true,
          quantity: true,
          created_at: true,
          updated_at: true,
        },
      });

      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await this.prisma.product.findUnique({
            where: { id: item.product_id },
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          });
          return { ...item, product };
        }),
      );

      const subtotal = itemsWithProducts.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0,
      );

      return {
        user: {
          id: user.id,
          fullName: user.fullName,
        },
        items: itemsWithProducts,
        subtotal,
        deliveryCharge: 1000,
        total: subtotal + 1000,
      };
    } catch (error) {
      console.error("Error in getCart:", error);
      throw new Error("Failed to get cart items");
    }
  }

  async addToCart(userId: number, productId: number, quantity: number = 1) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException("Product not found");
      }

      const existingItem = await this.prisma.cart.findFirst({
        where: {
          user_id: userId,
          product_id: productId,
        },
      });

      if (existingItem) {
        return this.prisma.cart.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      }

      return this.prisma.cart.create({
        data: {
          user_id: userId,
          product_id: productId,
          quantity,
        },
      });
    } catch (error) {
      console.error("Error in addToCart:", error);
      throw new Error("Failed to add item to cart");
    }
  }

  async updateQuantity(userId: number, productId: number, quantity: number) {
    try {
      const cartItem = await this.prisma.cart.findFirst({
        where: {
          user_id: userId,
          product_id: productId,
        },
      });

      if (!cartItem) {
        throw new NotFoundException("Cart item not found");
      }

      return this.prisma.cart.update({
        where: { id: cartItem.id },
        data: { quantity },
      });
    } catch (error) {
      console.error("Error in updateQuantity:", error);
      throw new Error("Failed to update quantity");
    }
  }

  async removeFromCart(userId: number, productId: number) {
    try {
      const cartItem = await this.prisma.cart.findFirst({
        where: {
          user_id: userId,
          product_id: productId,
        },
      });

      if (!cartItem) {
        throw new NotFoundException("Cart item not found");
      }

      return this.prisma.cart.delete({
        where: { id: cartItem.id },
      });
    } catch (error) {
      console.error("Error in removeFromCart:", error);
      throw new Error("Failed to remove cart item");
    }
  }
}
