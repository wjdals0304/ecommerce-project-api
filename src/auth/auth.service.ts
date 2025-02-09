import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUpWithEmail(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          fullName: createUserDto.full_name,
          email: createUserDto.email,
          phoneNumber: createUserDto.phone_number,
          passwordHash: createUserDto.password_hash,
          signupMethod: 'email',
        },
      });

      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);

      return { user, token };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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