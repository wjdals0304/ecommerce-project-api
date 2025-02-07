import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUpWithEmail(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        fullName: createUserDto.full_name,
        email: createUserDto.email,
        phoneNumber: createUserDto.phone_number,
        passwordHash: createUserDto.password_hash,
        signupMethod: 'email',
      },
    });
    return user;
  }

  async signUpWithGoogle(googleUser: any) {
    const user = await this.prisma.user.create({
      data: {
        fullName: googleUser.displayName,
        email: googleUser.emails[0].value,
        phoneNumber: '',
        passwordHash: '',
        signupMethod: 'google',
      },
    });
    return user;
  }
}