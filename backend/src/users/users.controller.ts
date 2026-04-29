// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto'; // DTO dla tworzenia użytkownika
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body() body: { role: 'ADMIN' | 'PARENT' | 'CAREGIVER' },
  ) {
    return this.usersService.updateRole(id, body.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/verify-email')
  verifyEmail(@Param('id') id: string) {
    return this.usersService.verifyEmail(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  deleteUser(@Param('id') id: string, @Request() req: any) {
    const requestingUserId = req.user?.id; // ID zalogowanego użytkownika z JWT
    return this.usersService.deleteUser(id, requestingUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/profile')
  async updateProfile(
    @Param('id') id: string,
    @Body() body: { firstName?: string; lastName?: string; email?: string },
    @Request() req: any,
  ) {
    const requestingUserId = req.user?.id;
    
    // Użytkownik może aktualizować tylko swój własny profil
    if (id !== requestingUserId) {
      throw new ForbiddenException('Możesz edytować tylko swój własny profil');
    }
    return this.usersService.updateProfile(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() body: { currentPassword: string; newPassword: string },
    @Request() req: any,
  ) {
    const bcrypt = require('bcrypt');
    const requestingUserId = req.user?.id;
    
    // Użytkownik może zmieniać tylko swoje własne hasło
    if (id !== requestingUserId) {
      throw new ForbiddenException('Możesz zmienić tylko swoje własne hasło');
    }

    // Validate password strength
    const password = body.newPassword;
    if (password.length < 12) {
      throw new BadRequestException('Hasło musi mieć co najmniej 12 znaków');
    }
    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Hasło musi zawierać co najmniej jedną małą literę');
    }
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Hasło musi zawierać co najmniej jedną wielką literę');
    }
    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('Hasło musi zawierać co najmniej jedną cyfrę');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new BadRequestException('Hasło musi zawierać co najmniej jeden znak specjalny');
    }

    const user = await this.usersService.findOne(id);
    const isPasswordValid = await bcrypt.compare(body.currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new BadRequestException('Obecne hasło jest nieprawidłowe');
    }

    // Check if new password is the same as current password
    const isSamePassword = await bcrypt.compare(body.newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('Nowe hasło nie może być takie samo jak obecne hasło');
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);
    await this.usersService.changePassword(id, body.currentPassword, hashedPassword);
    
    return { message: 'Hasło zmienione pomyślnie' };
  }
}
