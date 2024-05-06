type Guest = {
  email: string;
  status: "active" | "invited";
  projects: string[];
};

export default Guest
