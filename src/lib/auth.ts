
export interface UserProfile {
    username: string;
    role: 'admin' | 'user';
    name: string;
    initials: string;
    email: string;
}

interface UserWithPassword extends UserProfile {
    password: string;
}

const users: UserWithPassword[] = [
  {
    username: 'moqadri',
    password: '12345',
    role: 'admin',
    name: 'Mo Qadri',
    initials: 'MQ',
    email: 'mo.qadri@example.com'
  },
  {
    username: 'casey.white',
    password: 'password123',
    role: 'user',
    name: 'Dr. Casey White',
    initials: 'CW',
    email: 'casey.white@health.org'
  },
];

export const checkCredentials = (username: string, pass: string): UserProfile | null => {
  const user = users.find((user) => user.username === username);
  if (!user) return null;

  if (user.password === pass) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}
