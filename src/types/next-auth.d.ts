
export declare module "next-auth" {
  interface User {
    id: string; // User ID must be a string
    email: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }

  interface JWT {
    id: string;
    email: string;
    role: string;
  }
}
