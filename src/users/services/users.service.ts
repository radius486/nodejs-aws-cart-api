import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { User } from '../models';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOne(email: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({ email });
  }

  async createOne({ email, password }: User): Promise<UserEntity> {
    const id = randomUUID();
    const newUser = { id, email, password };

    return await this.userRepository.save(newUser);
  }
}
