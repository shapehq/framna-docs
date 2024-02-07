type Guest = {
    id: string;
    email: string;
    status: "active" | "invited";
    projects: string[];
};
