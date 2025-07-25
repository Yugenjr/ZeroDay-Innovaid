export interface User {
  uid: string;
  _id: string; // For backward compatibility with student components
  name: string;
  email: string;
  role: 'user' | 'admin';
  studentId?: string;
  department?: string;
  year?: number;
  phone?: string;
  createdAt: Date;
}
