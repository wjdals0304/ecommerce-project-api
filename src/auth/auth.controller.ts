import { Controller, Post, Body, Req, UseGuards, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from '../dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/email')
  async signUpWithEmail(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    return this.authService.signUpWithEmail(createUserDto, res);
  }

  @Get('signup/google')
  @UseGuards(AuthGuard('google'))
  async signUpWithGoogle(@Req() req) {
    return this.authService.signUpWithGoogle(req.user);
  }

  @Post('signin/email')
  async signInWithEmail(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.authService.signInWithEmail(loginDto, res);
  }
} 