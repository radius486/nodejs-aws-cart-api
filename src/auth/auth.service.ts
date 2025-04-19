import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { User } from '../users';
// import { contentSecurityPolicy } from 'helmet';
type TokenResponse = {
  token_type: string;
  access_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(payload: User) {
    const user = await this.usersService.findOne(payload.email);

    if (user) {
      throw new BadRequestException('User with such email already exists');
    }

    const { id: userId } = await this.usersService.createOne(payload);
    return { userId };
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.usersService.findOne(email);

    if (user) {
      return user;
    }

    return await this.usersService.createOne({ email, password });
  }

  async login(
    payload: User,
    type: 'jwt' | 'basic' | 'default',
  ): Promise<TokenResponse> {
    const user = await this.usersService.findOne(payload.email);

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    if (user.password !== payload.password) {
      throw new BadRequestException('Invalid credentials');
    }

    const LOGIN_MAP = {
      jwt: this.loginJWT,
      basic: this.loginBasic,
      default: this.loginJWT,
    };
    const login = LOGIN_MAP[type];

    return login ? login(payload) : LOGIN_MAP.default(payload);
  }

  loginJWT(user: User) {
    const payload = { email: user.email, sub: user.id };

    return {
      token_type: 'Bearer',
      access_token: this.jwtService.sign(payload),
    };
  }

  loginBasic(user: User) {
    function encodeUserToken(user: User) {
      const { email, password } = user;
      const buf = Buffer.from([email, password].join(':'), 'utf8');

      return buf.toString('base64');
    }

    return {
      token_type: 'Basic',
      access_token: encodeUserToken(user),
    };
  }
}
