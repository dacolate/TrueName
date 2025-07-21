export interface Result {
  generatedNumber: number;
  result: boolean;
  balanceChange: number;
  newBalance: number;
  date: Date;
  userId: string;
}

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
  phone?: string;
  balance?: number | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
}

export interface CreateUserData extends UserWithRole {
  password: string;
}
