import type { User } from '@/src/domain/types';
import type { AuthPort, AuthSession } from '@/src/ports/auth';
import { defaultUser } from '@/src/domain/defaults';

/** Local guest session stub — swap for Expo Auth / Supabase / Clerk. */
export class StubAuthAdapter implements AuthPort {
  private session: AuthSession | null = {
    user: defaultUser(),
  };

  async getSession(): Promise<AuthSession | null> {
    return this.session;
  }

  async signInWithEmail(email: string, _password: string): Promise<AuthSession> {
    const user: User = {
      ...defaultUser(),
      email,
    };
    this.session = { user, accessToken: 'stub-token' };
    return this.session;
  }

  async signOut(): Promise<void> {
    this.session = null;
  }
}
