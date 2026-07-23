export type Project = {
  name: string;
  category: string;
  description: string;
  technologies: string[];
  status: string;
  featured: boolean;
};

export const projects: Project[] = [
  {
    name: "Jangora",
    category: "Personal Finance",
    description:
      "An AI-assisted personal finance application designed to help users track expenses, build better saving habits, work toward financial goals, and develop financial discipline.",
    technologies: [
      "Ionic Angular",
      "NestJS",
      "TypeScript",
      "PostgreSQL",
    ],
    status: "In development",
    featured: true,
  },
  {
    name: "PharmaCompare",
    category: "Digital Healthcare",
    description:
      "An online healthcare platform that helps people access medical services from home and receive faster assistance during urgent situations, with AI-supported features.",
    technologies: [
      "Angular",
      "Ionic",
      "PHP",
      "MySQL",
      "PHP VISA",
    ],
    status: "Team project",
    featured: true,
  },
];