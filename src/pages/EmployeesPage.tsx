import { useEffect, useState, type FormEvent } from "react";
import { Sidebar } from "../components/Sidebar";
import { EmployeeCard } from "../components/EmployeeCard";
import {
  AddEmployeeModal,
  type EmployeeModalData,
} from "../components/modals/AddEmployeeModal";
import {
  Search,
  Plus,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import {
  employeesApi,
  inviteApi,
  referenceApi,
  type DepartmentItem,
  type EmployeeItem,
  getApiErrorMessage,
  type PositionItem,
} from "../api";
import { useAuth } from "../components/context/AuthContext";
import { normalizeRole } from "../shared/utils/roles";
import { saveInviteEmployeeDraft } from "../shared/utils/inviteEmployeeDraft";
import {
  type DepartmentEmployee,
  type DepartmentTask,
} from "../shared/constants/adminPanel";

type EmployeeViewModel = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone: string;
  dept: string;
  deptId?: string;
  salary: string;
  salaryValue: number;
  image: string;
  status: string;
  position: string;
  positionId?: string;
};

type TeamModalState =
  | { type: "view"; employee: AdminTeamEmployee }
  | { type: "edit"; employee: AdminTeamEmployee }
  | { type: "task"; employee: AdminTeamEmployee }
  | { type: "report"; employee: AdminTeamEmployee; task: DepartmentTask }
  | null;

type AdminTeamEmployee = Omit<DepartmentEmployee, "id"> & {
  id: string;
  firstName: string;
  lastName: string;
  departmentId?: string;
  positionId?: string;
  role: string;
  status: string;
};

const formatKZT = (amount: number) =>
  new Intl.NumberFormat("kk-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(amount);

const parseSalary = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildEmployeeAvatar = (seed: string) =>
  `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;

const mapEmployee = (employee: EmployeeItem): EmployeeViewModel => {
  const salaryValue = parseSalary(employee.salaryRate);

  return {
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`.trim(),
    firstName: employee.firstName,
    lastName: employee.lastName,
    role: employee.role,
    email: employee.email,
    phone: employee.phoneNumber || "Not provided",
    dept: employee.departmentName || "Unassigned",
    deptId: employee.departmentId || undefined,
    salary: formatKZT(salaryValue),
    salaryValue,
    image: buildEmployeeAvatar(employee.email || employee.id),
    status: employee.status,
    position: employee.positionName || "Not assigned",
    positionId: employee.positionId || undefined,
  };
};

const toModalData = (employee: EmployeeViewModel): EmployeeModalData => ({
  id: employee.id,
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
  role: employee.role,
  positionId: employee.positionId,
  position: employee.position,
  departmentId: employee.deptId,
  department: employee.dept,
  salary: employee.salaryValue,
  phoneNumber: employee.phone,
  status: employee.status,
});

const toAdminModalData = (employee: AdminTeamEmployee): EmployeeModalData => {
  return {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    role: employee.role,
    positionId: employee.positionId,
    position: employee.position,
    departmentId: employee.departmentId,
    department: employee.department,
    salary: employee.salary,
    phoneNumber: employee.phone,
    status: employee.status,
  };
};

const mapAdminTeamEmployee = (employee: EmployeeItem): AdminTeamEmployee => ({
  id: employee.id,
  firstName: employee.firstName,
  lastName: employee.lastName,
  name: `${employee.firstName} ${employee.lastName}`.trim(),
  role: employee.role,
  position: employee.positionName || "Not assigned",
  positionId: employee.positionId || undefined,
  email: employee.email,
  phone: employee.phoneNumber || "Not provided",
  department: employee.departmentName || "Unassigned",
  departmentId: employee.departmentId || undefined,
  location: "Not set",
  employmentType: "Full-time",
  workModel: "Office",
  attendance: employee.status.toLowerCase().includes("leave")
    ? "Absent"
    : "In Office",
  joinedDate: "Not set",
  rScore: 0,
  salary: parseSalary(employee.salaryRate),
  bonus: 0,
  deductions: 0,
  image: buildEmployeeAvatar(employee.email || employee.id),
  status: employee.status,
  tasks: [],
});

const SuperAdminEmployeesPage = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState<{
    type: "edit" | "view" | null;
    target: EmployeeViewModel | null;
  }>({ type: null, target: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [employees, setEmployees] = useState<EmployeeViewModel[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReferenceLoading, setIsReferenceLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [referenceErrorMessage, setReferenceErrorMessage] = useState("");

  const loadEmployees = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const employeesResponse = await employeesApi.list();
      setEmployees(employeesResponse.map(mapEmployee));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to load employees"));
    } finally {
      setIsLoading(false);
    }
  };

  const loadReferences = async () => {
    setIsReferenceLoading(true);
    setReferenceErrorMessage("");

    const [departmentsResult, positionsResult] = await Promise.allSettled([
      referenceApi.listDepartments(),
      referenceApi.listPositions(),
    ]);

    if (departmentsResult.status === "fulfilled") {
      setDepartments(departmentsResult.value);
    } else {
      setDepartments([]);
    }

    if (positionsResult.status === "fulfilled") {
      setPositions(positionsResult.value);
    } else {
      setPositions([]);
    }

    const errors: string[] = [];

    if (departmentsResult.status === "rejected") {
      errors.push(
        `Departments: ${getApiErrorMessage(
          departmentsResult.reason,
          "Failed to load departments",
        )}`,
      );
    }

    if (positionsResult.status === "rejected") {
      errors.push(
        `Positions: ${getApiErrorMessage(
          positionsResult.reason,
          "Failed to load positions",
        )}`,
      );
    }

    setReferenceErrorMessage(errors.join(" "));
    setIsReferenceLoading(false);
  };

  useEffect(() => {
    void loadEmployees();
    void loadReferences();
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    if (departments.length > 0 && positions.length > 0) {
      return;
    }

    void loadReferences();
  }, [isModalOpen, departments.length, positions.length]);

  const departmentFilters = [
    "All Departments",
    ...Array.from(new Set(employees.map((employee) => employee.dept))),
  ];

  const filteredEmployees = employees.filter((employee) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      employee.name.toLowerCase().includes(query) ||
      employee.role.toLowerCase().includes(query) ||
      employee.position.toLowerCase().includes(query);
    const matchesDept =
      selectedDept === "All Departments" || employee.dept === selectedDept;

    return matchesSearch && matchesDept;
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setModalState({ type: null, target: null });
  };

  const handleDelete = async (employeeId: string) => {
    if (!window.confirm("Delete this employee?")) {
      return;
    }

    try {
      await employeesApi.delete(employeeId);
      setEmployees((prev) => prev.filter((employee) => employee.id !== employeeId));
    } catch (error) {
      window.alert(getApiErrorMessage(error, "Failed to delete employee"));
    }
  };

  const handleSubmit = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    departmentId?: string;
    departmentName?: string;
    positionId?: string;
    position: string;
    salary: number;
    status: string;
  }) => {
    if (modalState.type === "edit" && modalState.target) {
      const employeeId = modalState.target.id;

      await Promise.all([
        employeesApi.updateRole(employeeId, { role: payload.role }),
        employeesApi.updateSalary(employeeId, {
          salaryRate: payload.salary.toFixed(2),
        }),
        employeesApi.updateStatus(employeeId, { status: payload.status }),
        ...(payload.departmentId
          ? [
              employeesApi.updateDepartment(employeeId, {
                departmentId: payload.departmentId,
              }),
            ]
          : []),
        ...(payload.positionId
          ? [
              employeesApi.updatePosition(employeeId, {
                positionId: payload.positionId,
              }),
            ]
          : []),
      ]);

      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === employeeId
            ? {
                ...employee,
                role: payload.role,
                deptId: payload.departmentId || employee.deptId,
                dept: payload.departmentName || employee.dept,
                salaryValue: payload.salary,
                salary: formatKZT(payload.salary),
                status: payload.status,
                positionId: payload.positionId || employee.positionId,
                position: payload.position || employee.position,
              }
            : employee,
        ),
      );

      closeModal();
      return;
    }

    if (!user?.organizationId) {
      throw new Error("Current user does not have an organizationId");
    }

    const response = await inviteApi.generate({
      organizationId: user.organizationId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      role: payload.role,
      departmentId: payload.departmentId,
      positionId: payload.positionId,
      position: payload.position,
    });

    if (payload.departmentId && payload.positionId) {
      saveInviteEmployeeDraft({
        code: response.code,
        email: payload.email,
        departmentId: payload.departmentId,
        positionId: payload.positionId,
        role: payload.role,
        salaryRate: payload.salary.toFixed(2),
        status: payload.status || "Active",
      });
    }

    return { inviteCode: response.code };
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] transition-colors duration-300 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10">
        <header className="mb-10 flex items-end justify-between">
          <div className="text-left">
            <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-white">
              Employees
            </h1>
            <p className="mt-1 text-[15px] font-medium text-gray-500 dark:text-gray-400">
              Manage your workforce ({employees.length})
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 dark:shadow-none"
          >
            <Plus size={20} strokeWidth={3} /> Add Employee
          </button>
        </header>

        <div className="mb-10 flex gap-4">
          <div className="group relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500"
              size={20}
            />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, role or position..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-[15px] outline-none shadow-sm transition-all focus:ring-4 focus:ring-blue-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900/20"
            />
          </div>
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(event) => setSelectedDept(event.target.value)}
              className="cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-3.5 pl-6 pr-12 text-[15px] font-bold text-gray-700 outline-none shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
            >
              {departmentFilters.map((department) => (
                <option
                  key={department}
                  value={department}
                  className="dark:bg-gray-900"
                >
                  {department}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[24px] border border-gray-100 bg-white text-[15px] font-medium text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <Loader2 size={18} className="animate-spin" />
              Loading employees...
            </div>
          </div>
        ) : errorMessage ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[24px] border border-red-100 bg-white px-6 text-center text-[15px] font-medium text-red-600 shadow-sm dark:border-red-900/40 dark:bg-gray-900 dark:text-red-400">
            {errorMessage}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[24px] border border-gray-100 bg-white px-6 text-center text-[15px] font-medium text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            No employees match the current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                {...employee}
                onDelete={() => void handleDelete(employee.id)}
                onEdit={() =>
                  setModalState({ type: "edit", target: employee })
                }
                onView={() =>
                  setModalState({ type: "view", target: employee })
                }
              />
            ))}
          </div>
        )}

        {modalState.type === "view" && modalState.target && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-[24px] bg-white p-10 text-center transition-colors duration-300 animate-in zoom-in dark:bg-gray-900">
              <button
                onClick={closeModal}
                className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
              <img
                src={modalState.target.image}
                className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-blue-50 object-cover dark:border-blue-900/30"
                alt="Profile"
              />
              <h2 className="text-[22px] font-bold dark:text-white">
                {modalState.target.name}
              </h2>
              <p className="mb-8 font-medium text-blue-600 dark:text-blue-400">
                {modalState.target.role}
              </p>
              <div className="space-y-4 rounded-2xl bg-gray-50 p-6 text-left dark:bg-gray-800/50">
                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-400 dark:text-gray-500">
                    Department
                  </span>
                  <span className="font-bold dark:text-gray-200">
                    {modalState.target.dept}
                  </span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-400 dark:text-gray-500">
                    Position
                  </span>
                  <span className="font-bold dark:text-gray-200">
                    {modalState.target.position}
                  </span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-400 dark:text-gray-500">
                    Salary
                  </span>
                  <span className="font-bold dark:text-gray-200">
                    {modalState.target.salary}
                  </span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-400 dark:text-gray-500">Email</span>
                  <span className="font-bold dark:text-gray-200">
                    {modalState.target.email}
                  </span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-400 dark:text-gray-500">Status</span>
                  <span className="font-bold dark:text-gray-200">
                    {modalState.target.status}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="mt-8 w-full rounded-xl bg-gray-900 py-4 font-bold text-white transition-colors hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}

        <AddEmployeeModal
          isOpen={isModalOpen || modalState.type === "edit"}
          onClose={closeModal}
          onSubmit={handleSubmit}
          departments={departments}
          positions={positions}
          isReferenceLoading={isReferenceLoading}
          referenceErrorMessage={referenceErrorMessage}
          initialData={
            modalState.type === "edit" && modalState.target
              ? toModalData(modalState.target)
              : null
          }
        />
      </main>
    </div>
  );
};

const AdminTeamPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalState, setModalState] = useState<TeamModalState>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [isReferenceLoading, setIsReferenceLoading] = useState(true);
  const [referenceErrorMessage, setReferenceErrorMessage] = useState("");
  const [employees, setEmployees] = useState<AdminTeamEmployee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [employeesErrorMessage, setEmployeesErrorMessage] = useState("");
  const departmentOptions =
    user?.departmentId && user?.department
      ? [{ id: user.departmentId, name: user.department }]
      : [];

  useEffect(() => {
    const loadAdminEmployees = async () => {
      setIsLoadingEmployees(true);
      setEmployeesErrorMessage("");

      try {
        const response = await employeesApi.list();
        const filtered = response
          .filter((employee) =>
            user?.departmentId
              ? employee.departmentId === user.departmentId
              : employee.departmentName === user?.department,
          )
          .map(mapAdminTeamEmployee);
        setEmployees(filtered);
      } catch (error) {
        setEmployeesErrorMessage(
          getApiErrorMessage(error, "Failed to load team members"),
        );
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    const loadAdminReferences = async () => {
      setIsReferenceLoading(true);
      setReferenceErrorMessage("");

      try {
        const response = await referenceApi.listPositions();
        setPositions(response);
      } catch (error) {
        setReferenceErrorMessage(
          getApiErrorMessage(error, "Failed to load positions"),
        );
      } finally {
        setIsReferenceLoading(false);
      }
    };

    void loadAdminEmployees();
    void loadAdminReferences();
  }, [user?.department, user?.departmentId]);

  const query = searchQuery.trim().toLowerCase();
  const filteredEmployees = query
    ? employees.filter((employee) =>
        [employee.name, employee.position, employee.email]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : employees;

  const handleAssignTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!modalState || modalState.type !== "task") {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "").trim();
    const dueDate = String(formData.get("dueDate") || "").trim();

    if (!title || !dueDate) {
      return;
    }

    setEmployees((currentEmployees) =>
      currentEmployees.map((employee) =>
        employee.id === modalState.employee.id
          ? {
              ...employee,
              tasks: [
                {
                  id: Date.now(),
                  title,
                  dueDate,
                  status: "Planned",
                  assignee: employee.name,
                },
                ...employee.tasks,
              ],
            }
          : employee,
      ),
    );

    setModalState(null);
  };

  const handleInviteEmployee = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    departmentId?: string;
    departmentName?: string;
    positionId?: string;
    position: string;
    salary: number;
    status: string;
  }) => {
    if (!user?.organizationId) {
      throw new Error("Current user does not have an organizationId");
    }

    if (!user.departmentId) {
      throw new Error("Current admin does not have a departmentId");
    }

    const response = await inviteApi.generate({
      organizationId: user.organizationId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      role: payload.role,
      departmentId: user.departmentId,
      positionId: payload.positionId,
      position: payload.position,
    });

    if (payload.positionId) {
      saveInviteEmployeeDraft({
        code: response.code,
        email: payload.email,
        departmentId: user.departmentId,
        positionId: payload.positionId,
        role: payload.role,
        salaryRate: payload.salary.toFixed(2),
        status: payload.status || "Active",
      });
    }

    return { inviteCode: response.code };
  };

  const handleAdminEditEmployee = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    departmentId?: string;
    departmentName?: string;
    positionId?: string;
    position: string;
    salary: number;
    status: string;
  }) => {
    if (!modalState || modalState.type !== "edit") {
      return;
    }

    const employeeId = modalState.employee.id;

    await Promise.all([
      employeesApi.updateRole(employeeId, { role: payload.role }),
      employeesApi.updateSalary(employeeId, {
        salaryRate: payload.salary.toFixed(2),
      }),
      employeesApi.updateStatus(employeeId, { status: payload.status }),
      ...(payload.positionId
        ? [
            employeesApi.updatePosition(employeeId, {
              positionId: payload.positionId,
            }),
          ]
        : []),
      ...(user?.departmentId
        ? [
            employeesApi.updateDepartment(employeeId, {
              departmentId: user.departmentId,
            }),
          ]
        : []),
    ]);

    setEmployees((currentEmployees) =>
      currentEmployees.map((employee) =>
        employee.id === employeeId
          ? {
              ...employee,
              firstName: payload.firstName,
              lastName: payload.lastName,
              name: `${payload.firstName} ${payload.lastName}`.trim(),
              role: payload.role,
              email: payload.email,
              positionId: payload.positionId || employee.positionId,
              position: payload.position || employee.position,
              salary: payload.salary,
              departmentId: user?.departmentId || employee.departmentId,
              department: user?.department || employee.department,
              status: payload.status,
              attendance: payload.status === "Inactive" ? "Absent" : "In Office",
            }
          : employee,
      ),
    );

    setModalState(null);
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-[28px] font-extrabold text-gray-900 dark:text-white tracking-tight">
              My Team
            </h1>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {user?.department || "Your department"} employees only.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 dark:shadow-none"
          >
            <Plus size={20} strokeWidth={3} /> Add Employee
          </button>
        </header>

        <div className="relative mb-8 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, position or email..."
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 pl-12 pr-5 py-4 text-base text-gray-900 dark:text-white outline-none shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingEmployees ? (
            <div className="col-span-full flex min-h-[220px] items-center justify-center rounded-[24px] border border-gray-100 bg-white text-[15px] font-medium text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <Loader2 size={18} className="animate-spin" />
                Loading team members...
              </div>
            </div>
          ) : employeesErrorMessage ? (
            <div className="col-span-full flex min-h-[220px] items-center justify-center rounded-[24px] border border-red-100 bg-white px-6 text-center text-[15px] font-medium text-red-600 shadow-sm dark:border-red-900/40 dark:bg-gray-900 dark:text-red-400">
              {employeesErrorMessage}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="col-span-full flex min-h-[220px] items-center justify-center rounded-[24px] border border-gray-100 bg-white px-6 text-center text-[15px] font-medium text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              No team members found for this department.
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                name={employee.name}
                role={employee.position}
                email={employee.email}
                phone={employee.phone}
                dept={employee.department}
                salary={formatKZT(employee.salary)}
                image={employee.image}
                status={employee.attendance === "Absent" ? "Inactive" : "Active"}
                onDelete={() => window.alert("Deleting team members is not available in the admin portal.")}
                onEdit={() => setModalState({ type: "edit", employee })}
                onView={() => setModalState({ type: "view", employee })}
              />
            ))
          )}
        </div>

        {modalState && modalState.type !== "edit" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-2xl rounded-[30px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-2xl">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                    {modalState.type === "view"
                      ? "Employee Profile"
                      : modalState.type === "task"
                          ? "Assign Task"
                          : "Task Report"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {modalState.employee.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalState(null)}
                  className="rounded-xl bg-gray-100 dark:bg-gray-800 p-2 text-gray-500 dark:text-gray-300"
                >
                  <X size={18} />
                </button>
              </div>

              {modalState.type === "view" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: "Email", value: modalState.employee.email },
                    { label: "Phone", value: modalState.employee.phone },
                    { label: "Department", value: modalState.employee.department },
                    { label: "Position", value: modalState.employee.position },
                    { label: "Location", value: modalState.employee.location },
                    { label: "Joined", value: modalState.employee.joinedDate },
                    { label: "Salary", value: formatKZT(modalState.employee.salary) },
                    {
                      label: "Status",
                      value:
                        modalState.employee.attendance === "Absent"
                          ? "Inactive"
                          : "Active",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4"
                    >
                      <p className="text-[11px] font-black uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-[15px] font-bold text-gray-900 dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {modalState.type === "task" && (
                <form onSubmit={handleAssignTask} className="space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Task Title
                    </span>
                    <input
                      name="title"
                      placeholder="Prepare month-end department report"
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Due Date
                    </span>
                    <input
                      name="dueDate"
                      type="date"
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none"
                    />
                  </label>
                  <button type="submit" className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">
                    Assign Task
                  </button>
                </form>
              )}

              {modalState.type === "report" && (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-5">
                    <p className="text-[11px] font-black uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Task
                    </p>
                    <p className="mt-2 text-[16px] font-bold text-gray-900 dark:text-white">
                      {modalState.task.title}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Submitted {modalState.task.report?.submittedAt}
                    </p>
                  </div>
                  {[
                    { label: "Summary", value: modalState.task.report?.summary || "Not provided" },
                    { label: "Result", value: modalState.task.report?.result || "Not provided" },
                    { label: "Blockers", value: modalState.task.report?.blockers || "No blockers" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                      <p className="text-[11px] font-black uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <AddEmployeeModal
          isOpen={isInviteModalOpen || modalState?.type === "edit"}
          onClose={() => {
            setIsInviteModalOpen(false);
            if (modalState?.type === "edit") {
              setModalState(null);
            }
          }}
          onSubmit={
            modalState?.type === "edit"
              ? handleAdminEditEmployee
              : handleInviteEmployee
          }
          initialData={
            modalState?.type === "edit"
              ? toAdminModalData(modalState.employee)
              : null
          }
          departments={departmentOptions}
          positions={positions}
          isReferenceLoading={isReferenceLoading}
          referenceErrorMessage={
            referenceErrorMessage ||
            (!user?.departmentId
              ? "Current admin profile does not have a departmentId."
              : "")
          }
        />
      </main>
    </div>
  );
};

export const EmployeesPage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  if (role === "Admin") {
    return <AdminTeamPage />;
  }

  return <SuperAdminEmployeesPage />;
};
