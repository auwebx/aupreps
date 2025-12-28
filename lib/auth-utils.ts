export const getUserRole = (roles: string[]): 'admin' | 'staff' | 'user' => {
  if (roles.includes('ROLE_ADMIN')) return 'admin';
  if (roles.includes('ROLE_STAFF')) return 'staff';
  return 'user';
};

export const getDashboardRoute = (roles: string[]): string => {
  const role = getUserRole(roles);
  return `/dashboard/${role}`;
};