export interface IjwtPayload {
  _id: string;
  name: string;
  email: string;
  role: "viewer" | "analyst" | "admin";
  status: string;
}
