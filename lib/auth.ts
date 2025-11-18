import { currentUser } from '@clerk/nextjs/server';

/**
 * Get user role from Clerk session
 * Defaults to 'user' if role is not set
 */
export async function getUserRole(): Promise<'user' | 'admin'> {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  
  // Validate role and default to 'user'
  if (role === 'admin' || role === 'user') {
    return role;
  }
  
  return 'user';
}

/**
 * Permission definitions for roles
 */
const ROLE_PERMISSIONS: Record<'user' | 'admin', string[]> = {
  user: [
    'chat:access',
    'chat:send',
    'profile:view',
    'profile:edit',
  ],
  admin: [
    'chat:access',
    'chat:send',
    'profile:view',
    'profile:edit',
    'admin:access',
    'admin:users',
  ],
};

/**
 * Check if user has a specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const role = await getUserRole();
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

