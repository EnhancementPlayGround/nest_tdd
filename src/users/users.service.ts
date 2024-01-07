import {
  Inject,
  Injectable,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { SerializeInterceptor } from '@/interceptors/serialize.interceptor';

import { User } from '@/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
@UseInterceptors(SerializeInterceptor)
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async create(body: CreateUserDto): Promise<User> {
    const result = this.userRepository.create({
      ...body,
      createdAt: new Date(),
    });
    this.userRepository.save(result);

    return result;
  }

  async findOne(id: string): Promise<User> {
    if (!id) return null;

    return this.userRepository.findOneBy({ id });
  }

  async findAll({ email, username }: Partial<User>): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('users');

    if (email) {
      queryBuilder.andWhere('users.email = :email', { email });
    }

    if (username) {
      queryBuilder.andWhere('users.username LIKE :username', { username });
    }

    return queryBuilder.getMany();
  }

  async update(id: string, attr: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    Object.assign(user, attr);

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    this.userRepository.remove(user);
  }
}
