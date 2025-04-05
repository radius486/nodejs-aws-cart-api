import { IsEmail, MaxLength, IsNotEmpty } from 'class-validator';

export class User {
  id?: string;

  @MaxLength(255)
  @IsEmail()
  @IsNotEmpty({ message: 'Email required' })
  email: string;

  @IsNotEmpty({ message: 'Password required' })
  @MaxLength(255)
  password: string;
}
