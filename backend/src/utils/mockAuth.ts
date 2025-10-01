// Mock authentication for development
export const mockUsers = [
  {
    id: '1',
    name: 'Test Student',
    email: 'student@example.com',
    password: 'password123',
    username: 'student',
    role: 'student',
    year_of_study: 3,
    verified: true,
    approval_status: 'approved',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Test Admin',
    email: 'admin@example.com',
    password: 'password123',
    username: 'admin',
    role: 'admin',
    year_of_study: null,
    verified: true,
    approval_status: 'approved',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Test Super Admin',
    email: 'superadmin@example.com',
    password: 'password123',
    username: 'superadmin',
    role: 'super-admin',
    year_of_study: null,
    verified: true,
    approval_status: 'approved',
    created_at: new Date().toISOString()
  }
];

export const findUserByEmail = (email: string) => {
  return mockUsers.find(user => user.email === email);
};

export const findUserById = (id: string) => {
  return mockUsers.find(user => user.id === id);
};

export const createUser = (userData: any) => {
  const newUser = {
    id: (mockUsers.length + 1).toString(),
    ...userData,
    verified: true,
    approval_status: 'approved',
    created_at: new Date().toISOString()
  };
  mockUsers.push(newUser);
  return newUser;
};
