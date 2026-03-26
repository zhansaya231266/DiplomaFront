export type DepartmentTaskReport = {
  summary: string;
  result: string;
  blockers: string;
  submittedAt: string;
};

export type DepartmentTask = {
  id: number;
  title: string;
  dueDate: string;
  status: "Planned" | "In Progress" | "Completed";
  assignee: string;
  report?: DepartmentTaskReport;
};

export type DepartmentEmployee = {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  department: string;
  location: string;
  employmentType: string;
  workModel: "Office" | "Remote" | "Hybrid";
  attendance: "In Office" | "Remote" | "Absent";
  joinedDate: string;
  rScore: number;
  salary: number;
  bonus: number;
  deductions: number;
  image: string;
  tasks: DepartmentTask[];
};

type DepartmentOverview = {
  departmentName: string;
  totalEmployees: number;
  inOffice: number;
  remote: number;
  absent: number;
  avgRScore: number;
  employees: DepartmentEmployee[];
};

const departmentData: Record<string, DepartmentOverview> = {
  Engineering: {
    departmentName: "Engineering",
    totalEmployees: 4,
    inOffice: 2,
    remote: 1,
    absent: 1,
    avgRScore: 89,
    employees: [
      {
        id: 1,
        name: "Aruzhan Sarsembayeva",
        position: "Frontend Engineer",
        email: "aruzhan@company.com",
        phone: "+7 (701) 111 2233",
        department: "Engineering",
        location: "Almaty HQ",
        employmentType: "Full-time",
        workModel: "Hybrid",
        attendance: "In Office",
        joinedDate: "2024-02-12",
        rScore: 94,
        salary: 780000,
        bonus: 65000,
        deductions: 24000,
        image: "https://i.pravatar.cc/150?u=eng-1",
        tasks: [
          {
            id: 11,
            title: "Finalize dashboard release checklist",
            dueDate: "2026-03-28",
            status: "Completed",
            assignee: "Aruzhan Sarsembayeva",
            report: {
              summary: "Updated release checklist and validated main dashboard flows.",
              result: "Checklist handed over to QA and product owner.",
              blockers: "Needed final copy from design team.",
              submittedAt: "2026-03-25 17:20",
            },
          },
        ],
      },
      {
        id: 2,
        name: "Dias Mukhamed",
        position: "Backend Engineer",
        email: "dias@company.com",
        phone: "+7 (702) 444 2211",
        department: "Engineering",
        location: "Almaty HQ",
        employmentType: "Full-time",
        workModel: "Office",
        attendance: "In Office",
        joinedDate: "2023-09-03",
        rScore: 91,
        salary: 820000,
        bonus: 72000,
        deductions: 18000,
        image: "https://i.pravatar.cc/150?u=eng-2",
        tasks: [
          {
            id: 12,
            title: "Review API error handling logs",
            dueDate: "2026-03-29",
            status: "In Progress",
            assignee: "Dias Mukhamed",
          },
        ],
      },
      {
        id: 3,
        name: "Anel Turgynbek",
        position: "QA Engineer",
        email: "anel@company.com",
        phone: "+7 (705) 998 5511",
        department: "Engineering",
        location: "Remote",
        employmentType: "Full-time",
        workModel: "Remote",
        attendance: "Remote",
        joinedDate: "2024-05-09",
        rScore: 86,
        salary: 620000,
        bonus: 40000,
        deductions: 12000,
        image: "https://i.pravatar.cc/150?u=eng-3",
        tasks: [
          {
            id: 13,
            title: "Prepare smoke-test report",
            dueDate: "2026-03-30",
            status: "Completed",
            assignee: "Anel Turgynbek",
            report: {
              summary: "Completed smoke test run for payroll and profile flows.",
              result: "Two medium issues logged and assigned.",
              blockers: "One unstable staging endpoint.",
              submittedAt: "2026-03-24 11:10",
            },
          },
        ],
      },
      {
        id: 4,
        name: "Miras Kaliev",
        position: "DevOps Engineer",
        email: "miras@company.com",
        phone: "+7 (775) 113 7700",
        department: "Engineering",
        location: "Almaty HQ",
        employmentType: "Full-time",
        workModel: "Office",
        attendance: "Absent",
        joinedDate: "2022-11-19",
        rScore: 85,
        salary: 910000,
        bonus: 55000,
        deductions: 32000,
        image: "https://i.pravatar.cc/150?u=eng-4",
        tasks: [
          {
            id: 14,
            title: "Prepare infra cost snapshot",
            dueDate: "2026-03-31",
            status: "Planned",
            assignee: "Miras Kaliev",
          },
        ],
      },
    ],
  },
  Marketing: {
    departmentName: "Marketing",
    totalEmployees: 2,
    inOffice: 1,
    remote: 1,
    absent: 0,
    avgRScore: 84,
    employees: [],
  },
};

const defaultDepartment = departmentData.Engineering;

export const getDepartmentOverview = (department?: string | null) =>
  departmentData[department || ""] || defaultDepartment;

export const getDepartmentEmployees = (department?: string | null) =>
  getDepartmentOverview(department).employees;

export const formatKzt = (amount: number) =>
  new Intl.NumberFormat("kk-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(amount);
