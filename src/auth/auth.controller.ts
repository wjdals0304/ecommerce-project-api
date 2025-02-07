import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/email')
  async signUpWithEmail(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUpWithEmail(createUserDto);
  }

  @Get('signup/google')
  @UseGuards(AuthGuard('google'))
  async signUpWithGoogle(@Req() req) {
    return this.authService.signUpWithGoogle(req.user);
  }
} 