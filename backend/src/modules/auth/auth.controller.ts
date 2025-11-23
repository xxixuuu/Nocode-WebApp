import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto, LoginDto, RefreshTokenDto, MagicLinkDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('magic-link')
  @ApiOperation({ summary: 'Request magic link for passwordless login' })
  async requestMagicLink(@Body() dto: MagicLinkDto) {
    const link = await this.authService.generateMagicLink(dto.email);
    return { message: 'Magic link sent', link }; // In production, don't return the link
  }

  @Post('magic-link/verify')
  @ApiOperation({ summary: 'Verify magic link token' })
  async verifyMagicLink(@Body() dto: { token: string }) {
    return this.authService.verifyMagicLink(dto.token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getCurrentUser(@Request() req: any) {
    return req.user;
  }
}
