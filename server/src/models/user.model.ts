import bcrypt from 'bcryptjs';
import { InferSchemaType, Model, Schema, model } from 'mongoose';

interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ email: 1 }, { unique: true });

type User = InferSchemaType<typeof userSchema>;

type UserModelType = Model<User, Record<string, never>, UserMethods>;

userSchema.pre('save', async function passwordHashHook() {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = model<User, UserModelType>('User', userSchema);
