import type { User } from '@/src/domain/types';

export type AuthSession = {
  user: User;
  accessToken?: string;
};

/** Port: authentication (email/password, magic link, etc.). */
export interface AuthPort {
  getSession(): Promise<AuthSession | null>;
  signInWithEmail(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
}
