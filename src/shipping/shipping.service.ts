import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async getAddress(userId: number) {
    try {
      return await this.prisma.shipping_address.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });
    } catch (error) {
      console.error('Error in getAddresses:', error);
      throw new Error('Failed to get shipping addresses');
    }
  }

  async addAddress(userId: number, addressData: {
    name: string;
    phone: string;
    address: string;
    city: string;
    zipcode: string;
    memo?: string;
    is_default?: boolean;
  }) {
    try {
      if (addressData.is_default) {
        // 기존 기본 배송지 해제
        await this.prisma.shipping_address.updateMany({
          where: { user_id: userId, is_default: true },
          data: { is_default: false },
        });
      }
      addressData.is_default = true;
      return await this.prisma.shipping_address.create({
        data: {
          user_id: userId,
          ...addressData,
        },
      });
    } catch (error) {
      console.error('Error in addAddress:', error);
      throw new Error('Failed to add shipping address');
    }
  }

  async updateAddress(userId: number, addressId: number, addressData: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    zipcode?: string;
    memo?: string;
    is_default?: boolean;
  }) {
    try {
      const address = await this.prisma.shipping_address.findFirst({
        where: { id: addressId, user_id: userId },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      if (addressData.is_default) {
        await this.prisma.shipping_address.updateMany({
          where: { user_id: userId, is_default: true },
          data: { is_default: false },
        });
      }

      return await this.prisma.shipping_address.update({
        where: { id: addressId },
        data: addressData,
      });
    } catch (error) {
      console.error('Error in updateAddress:', error);
      throw new Error('Failed to update shipping address');
    }
  }

  async deleteAddress(userId: number, addressId: number) {
    try {
      const address = await this.prisma.shipping_address.findFirst({
        where: { id: addressId, user_id: userId },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      return await this.prisma.shipping_address.delete({
        where: { id: addressId },
      });
    } catch (error) {
      console.error('Error in deleteAddress:', error);
      throw new Error('Failed to delete shipping address');
    }
  }
} 