import { Types } from 'mongoose';

import { HTTP_STATUS } from '../constants/http-status';
import { UserModel } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { signAccessToken } from '../utils/jwt';
import { LoginInput, RegisterInput } from '../validations/auth.validation';

interface AuthUser {
  user: {
    id: string;
    email: string;
  };
}

export interface AuthResponse extends AuthUser {
  accessToken: string;
}

const toAuthResponse = (
  user: { _id: Types.ObjectId; email: string },
): AuthResponse => {
  const accessToken = signAccessToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
    },
    accessToken,
  };
};

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const existingUser = await UserModel.findOne({ email: input.email }).lean().exec();

  if (existingUser) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Email is already registered');
  }

  const createdUser = await UserModel.create(input);

  return toAuthResponse(createdUser);
};

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const user = await UserModel.findOne({ email: input.email }).select('+password').exec();

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(input.password);

  if (!isPasswordValid) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
  }

  return toAuthResponse(user);
};

export const getCurrentUser = async (userId: string): Promise<AuthUser> => {
  const user = await UserModel.findById(userId).lean().exec();

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid authentication state');
  }

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
    },
  };
};
