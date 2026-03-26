export type EmployeeTask = {
  id: number;
  title: string;
  assignedBy: string;
  dueDate: string;
  status: "Assigned" | "In Progress" | "Completed";
  report?: string;
};

export const employeeNotifications = [
  "Your March payslip is ready.",
  "Reminder: check-in before 09:00 tomorrow.",
  "Admin assigned a new task for this week.",
];

export const employeeAnnouncements = [
  {
    id: 1,
    title: "Quarterly Town Hall",
    text: "Company-wide meeting on Friday at 16:00 in the main conference room.",
    priority: "High",
  },
  {
    id: 2,
    title: "Benefits Update",
    text: "Medical insurance provider updates will take effect from next month.",
    priority: "Medium",
  },
];

export const employeeTasks: EmployeeTask[] = [
  {
    id: 1,
    title: "Prepare updated feature checklist",
    assignedBy: "Head of Department",
    dueDate: "2026-03-29",
    status: "Assigned",
  },
  {
    id: 2,
    title: "Review release notes draft",
    assignedBy: "Head of Department",
    dueDate: "2026-03-30",
    status: "Completed",
    report: "Reviewed release notes, fixed naming inconsistencies and sent comments to admin.",
  },
];

export const employeeWorkdays = [
  {
    date: "2026-03-21",
    checkIn: "08:56",
    checkOut: "18:03",
    hours: "9h 07m",
    status: "Present",
  },
  {
    date: "2026-03-22",
    checkIn: "09:04",
    checkOut: "18:10",
    hours: "9h 06m",
    status: "Present",
  },
  {
    date: "2026-03-23",
    checkIn: "08:48",
    checkOut: "17:54",
    hours: "9h 06m",
    status: "Present",
  },
  {
    date: "2026-03-24",
    checkIn: "09:20",
    checkOut: "18:01",
    hours: "8h 41m",
    status: "Late",
  },
];

export const employeePayslips = [
  {
    id: 1,
    month: "March 2026",
    status: "Paid",
    netSalary: 640000,
    payDate: "2026-03-05",
    pdfLabel: "payslip-march-2026.pdf",
  },
  {
    id: 2,
    month: "February 2026",
    status: "Paid",
    netSalary: 628000,
    payDate: "2026-02-05",
    pdfLabel: "payslip-february-2026.pdf",
  },
];
