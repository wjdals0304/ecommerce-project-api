import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { CreateUserDto, LoginDto } from "../dto/user.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup/email")
  async signUpWithEmail(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    return this.authService.signUpWithEmail(createUserDto, res);
  }

  @Post("signup/google")
  async signUpWithGoogle(
    @Body() tokenDto: { access_token: string; provider: string },
    @Res() res: Response,
  ) {
    return this.authService.signUpWithGoogle(tokenDto, res);
  }

  @Post("signin/email")
  async signInWithEmail(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.authService.signInWithEmail(loginDto, res);
  }

  @Post("refresh")
  async refreshAccessToken(@Req() req, @Res() res: Response) {
    return this.authService.refreshAccessToken(req, res);
  }

  @Get("me")
  async getCurrentUser(@Req() req) {
    return this.authService.getCurrentUser(req);
  }

  @Post("logout")
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}
