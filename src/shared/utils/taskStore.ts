export type StoredTaskReportStatus = "Pending" | "Approved" | "Rejected";

export type StoredTaskReport = {
  summary: string;
  result: string;
  blockers: string;
  submittedAt: string;
  status: StoredTaskReportStatus;
  reviewedAt?: string;
};

export type StoredDepartmentTask = {
  id: string;
  employeeId: string;
  employeeEmail: string;
  employeeName: string;
  departmentId?: string;
  departmentName?: string;
  title: string;
  dueDate: string;
  assignedBy: string;
  assignedByEmail: string;
  createdAt: string;
  status: "Assigned" | "In Progress" | "Completed";
  report?: StoredTaskReport;
};

const TASK_STORAGE_KEY = "smart_emp_department_tasks";

const readTasks = (): StoredDepartmentTask[] => {
  const rawTasks = localStorage.getItem(TASK_STORAGE_KEY);

  if (!rawTasks) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawTasks);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(TASK_STORAGE_KEY);
    return [];
  }
};

const writeTasks = (tasks: StoredDepartmentTask[]) => {
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
  window.dispatchEvent(new Event("smart_emp_tasks_updated"));
};

type PlaceholderEmployee = {
  id: string;
  email: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
};

const buildDueDate = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const buildPlaceholderTasks = (
  employee: PlaceholderEmployee,
  assignedBy: string,
  assignedByEmail: string,
): StoredDepartmentTask[] => [
  {
    id: `placeholder-${employee.id}-1`,
    employeeId: employee.id,
    employeeEmail: employee.email,
    employeeName: employee.name,
    departmentId: employee.departmentId,
    departmentName: employee.departmentName,
    title: "Review department onboarding checklist",
    dueDate: buildDueDate(3),
    assignedBy,
    assignedByEmail,
    createdAt: new Date().toISOString(),
    status: "Assigned",
  },
  {
    id: `placeholder-${employee.id}-2`,
    employeeId: employee.id,
    employeeEmail: employee.email,
    employeeName: employee.name,
    departmentId: employee.departmentId,
    departmentName: employee.departmentName,
    title: "Prepare weekly progress update",
    dueDate: buildDueDate(1),
    assignedBy,
    assignedByEmail,
    createdAt: new Date().toISOString(),
    status: "Completed",
    report: {
      summary: "Drafted a short weekly update with current progress.",
      result: "Ready for admin review.",
      blockers: "Waiting for final numbers from the team.",
      submittedAt: new Date().toISOString(),
      status: "Pending",
    },
  },
];

export const taskStore = {
  list: () => readTasks(),
  listForEmployee: (employeeId: string, employeeEmail?: string) =>
    readTasks().filter(
      (task) =>
        task.employeeId === employeeId ||
        (!!employeeEmail && task.employeeEmail === employeeEmail),
    ),
  listForDepartment: (departmentId?: string, departmentName?: string) =>
    readTasks().filter(
      (task) =>
        (!!departmentId && task.departmentId === departmentId) ||
        (!!departmentName && task.departmentName === departmentName),
    ),
  create: (
    task: Omit<StoredDepartmentTask, "id" | "createdAt" | "status">,
  ) => {
    const nextTask: StoredDepartmentTask = {
      ...task,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      status: "Assigned",
    };
    writeTasks([nextTask, ...readTasks()]);
    return nextTask;
  },
  submitReport: (
    taskId: string,
    report: Pick<StoredTaskReport, "summary" | "result" | "blockers">,
  ) => {
    writeTasks(
      readTasks().map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "Completed",
              report: {
                ...report,
                status: "Pending",
                submittedAt: new Date().toISOString(),
              },
            }
          : task,
      ),
    );
  },
  reviewReport: (taskId: string, status: StoredTaskReportStatus) => {
    writeTasks(
      readTasks().map((task) =>
        task.id === taskId && task.report
          ? {
              ...task,
              report: {
                ...task.report,
                status,
                reviewedAt: new Date().toISOString(),
              },
            }
          : task,
      ),
    );
  },
  seedPlaceholdersForEmployee: (
    employee: PlaceholderEmployee,
    assignedBy = "Department Admin",
    assignedByEmail = "",
  ) => {
    const currentTasks = readTasks();
    const hasTasks = currentTasks.some(
      (task) =>
        task.employeeId === employee.id || task.employeeEmail === employee.email,
    );

    if (hasTasks) {
      return currentTasks.filter(
        (task) =>
          task.employeeId === employee.id ||
          task.employeeEmail === employee.email,
      );
    }

    const placeholderTasks = buildPlaceholderTasks(
      employee,
      assignedBy,
      assignedByEmail,
    );
    writeTasks([...placeholderTasks, ...currentTasks]);
    return placeholderTasks;
  },
};
