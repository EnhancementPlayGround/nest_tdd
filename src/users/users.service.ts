import {
  Inject,
  Injectable,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { User } from 'src/entities/user.entity';
import { SerializeInterceptor } from 'src/interceptors/serialize.interceptor';

@Injectable()
@UseInterceptors(SerializeInterceptor)
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private _userRepository: Repository<User>,
  ) {}

  async create(body: Partial<User>): Promise<User> {
    const result = this._userRepository.create({
      ...body,
      created_at: new Date(),
    });
    this._userRepository.save(result);

    return result;
  }

  async findOne(id: string): Promise<User> {
    if (!id) return null;

    return this._userRepository.findOneBy({ id });
  }

  async findAll({ email, username }: Partial<User>): Promise<User[]> {
    const queryBuilder = this._userRepository.createQueryBuilder('users');

    if (email) {
      queryBuilder.andWhere('users.email = :email', { email });
    }

    if (username) {
      queryBuilder.andWhere('users.username LIKE :username', { username });
    }

    return queryBuilder.getMany();
  }

  async update(id: string, attr: Partial<User>): Promise<User> {
    const user = await this._userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    Object.assign(user, attr);

    return this._userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    this._userRepository.remove(user);
  }
}