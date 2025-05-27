type User = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  dob: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export default User;
