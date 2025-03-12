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
      const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      res.setHeader('Access-Control-Expose-Headers', 'Authorization');
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.setHeader('set-cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800;${process.env.NODE_ENV === 'production' ? ' Secure; SameSite=None;' : ''}`);

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

  async signUpWithGoogle(tokenDto: { access_token: string, provider: string }, res: any) {
    try {      
      if (!tokenDto.access_token) {
        throw new HttpException('액세스 토큰이 제공되지 않았습니다.', HttpStatus.BAD_REQUEST);
      }

      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenDto.access_token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        
        if (response.status === 401) {
          throw new HttpException(
            '구글 인증에 실패했습니다. 다시 로그인해주세요.',
            HttpStatus.UNAUTHORIZED
          );
        }
        
        throw new HttpException(
          '구글 API 호출 중 오류가 발생했습니다.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      const googleUser = await response.json();

      if (!googleUser.email) {
        throw new HttpException(
          '구글 계정에서 이메일을 가져올 수 없습니다.',
          HttpStatus.BAD_REQUEST
        );
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (existingUser) {
        return this.signInWithGoogle(existingUser, res);
      }

      const user = await this.prisma.user.create({
        data: {
          fullName: googleUser.name || '',
          email: googleUser.email,
          phoneNumber: '',
          passwordHash: '',
          signupMethod: 'google',
        },
      });

      return this.signInWithGoogle(user, res);
    } catch (error) {
      console.error('Google signup error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        '구글 로그인 처리 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async signInWithGoogle(user: any, res: any) {
    try {
      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      res.setHeader('Access-Control-Expose-Headers', 'Authorization');
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.setHeader('set-cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800;${process.env.NODE_ENV === 'production' ? ' Secure; SameSite=None;' : ''}`);

      return res.status(HttpStatus.OK).json({
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          signupMethod: user.signupMethod,
        },
        access_token: accessToken
      });
    } catch (error) {
      throw new HttpException('Google 로그인 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
      const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      res.setHeader('Access-Control-Expose-Headers', 'Authorization');
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.setHeader('set-cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800;${process.env.NODE_ENV === 'production' ? ' Secure; SameSite=None;' : ''}`);

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

  async refreshAccessToken(req: any, res: any) {
    try {
      const refreshToken = req.headers.cookie.split('; ').find(row => row.startsWith('refreshToken=')).split('=')[1];
      if (!refreshToken) {
        throw new HttpException('Refresh token not found', HttpStatus.UNAUTHORIZED);
      }

      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      const newAccessToken = this.jwtService.sign({ email: user.email, sub: user.id }, { expiresIn: '1h' });

      res.setHeader('Access-Control-Expose-Headers', 'Authorization');
      res.setHeader('Authorization', `Bearer ${newAccessToken}`);

      return res.status(HttpStatus.OK).json({
        accessToken: newAccessToken
      });
    } catch (error) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  }

  async getCurrentUser(req: any) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new HttpException('Authorization header not found', HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new HttpException('Token not found', HttpStatus.UNAUTHORIZED);
      }

      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async logout(res: any) {
    try {
      res.setHeader('set-cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0');
      res.clearCookie('refreshToken');
      
      return res.status(HttpStatus.OK).json({
        message: '로그아웃되었습니다.'
      });
    } catch (error) {
      throw new HttpException('로그아웃 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}