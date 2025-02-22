import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, LoginDto } from '../dto/user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUpWithEmail(createUserDto: CreateUserDto, res: any) {
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
      res.setHeader('Access-Control-Expose-Headers', 'Authorization');
      res.setHeader('Authorization', `Bearer ${token}`);
      res.setHeader('set-cookie', `jwt=${token};  Path=/; Max-Age=3600;`);

      return res.status(HttpStatus.OK).json({
        user: user
      });
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

  async signInWithEmail(loginDto: LoginDto, res: any) {

    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email},
      });
      if (!user || user.passwordHash !== loginDto.password_hash) {
        throw new HttpException('Invalid User or password', HttpStatus.UNAUTHORIZED);
      } 
  
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);
      res.setHeader('Access-Control-Expose-Headers', 'Authorization');
      res.setHeader('Authorization', `Bearer ${token}`);
      res.setHeader('set-cookie', `jwt=${token}; Path=/; Max-Age=3600;`);

      return res.status(HttpStatus.OK).json({
        user: user
      });

    } catch (error) {
      if (error.status === HttpStatus.UNAUTHORIZED) {
        throw new HttpException('Invalid User or password', HttpStatus.UNAUTHORIZED);
      } else {
        throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
  }
}