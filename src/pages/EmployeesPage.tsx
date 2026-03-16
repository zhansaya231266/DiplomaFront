import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { EmployeeCard } from "../components/EmployeeCard";
import { AddEmployeeModal } from "../components/modals/AddEmployeeModal";
import { Search, Filter, Plus, ChevronDown, X } from "lucide-react";

export const EmployeesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState<{
    type: "edit" | "view" | null;
    target: any;
  }>({ type: null, target: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");

  const [data, setData] = useState([
    {
      id: 1,
      name: "Жансая Курманбеккызы",
      role: "Senior Developer",
      email: "zhansaya.k@company.com",
      phone: "+7 (775) 123 4567",
      dept: "Engineering",
      salary: "250,000 ₸",
      image: "https://i.pravatar.cc/150?u=1",
    },
    {
      id: 2,
      name: "Чингис Терекбаев",
      role: "Marketing Manager",
      email: "chin.chen@company.com",
      phone: "+7 (705) 234 5678",
      dept: "Marketing",
      salary: "455,000 ₸",
      image: "https://i.pravatar.cc/150?u=2",
    },
    {
      id: 3,
      name: "Адэль Кенесова",
      role: "HR Specialist",
      email: "adel.k@company.com",
      phone: "+7 (702) 345 6789",
      dept: "Human Resources",
      salary: "652,000 ₸",
      image: "https://i.pravatar.cc/150?u=3",
    },
  ]);

  const departments = [
    "All Departments",
    ...Array.from(new Set(data.map((e) => e.dept))),
  ];

  const handleAddOrUpdate = (emp: any) => {
    setData((prev) =>
      prev.find((e) => e.id === emp.id)
        ? prev.map((e) => (e.id === emp.id ? emp : e))
        : [emp, ...prev],
    );
    setIsModalOpen(false);
    setModalState({ type: null, target: null });
  };

  const filteredEmployees = data.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      selectedDept === "All Departments" || emp.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-end mb-10">
          <div className="text-left">
            <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">
              Employees
            </h1>
            <p className="text-[15px] text-gray-500 mt-1 font-medium">
              Manage your workforce ({data.length})
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            <Plus size={20} strokeWidth={3} /> Add Employee
          </button>
        </header>

        <div className="flex gap-4 mb-10">
          <div className="flex-1 relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or position..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] outline-none shadow-sm focus:ring-4 focus:ring-blue-50 transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="appearance-none bg-white border border-gray-200 pl-6 pr-12 py-3.5 rounded-xl text-[15px] font-bold text-gray-700 outline-none shadow-sm cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={18}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              {...emp}
              onDelete={() =>
                window.confirm("Delete?") &&
                setData(data.filter((e) => e.id !== emp.id))
              }
              onEdit={() => setModalState({ type: "edit", target: emp })}
              onView={() => setModalState({ type: "view", target: emp })}
            />
          ))}
        </div>

        {/* Modal View Profile */}
        {modalState.type === "view" && modalState.target && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] w-full max-w-sm p-10 text-center relative animate-in zoom-in">
              <button
                onClick={() => setModalState({ type: null, target: null })}
                className="absolute top-5 right-5 text-gray-400"
              >
                <X size={20} />
              </button>
              <img
                src={modalState.target.image}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-50 object-cover"
              />
              <h2 className="text-[22px] font-bold">
                {modalState.target.name}
              </h2>
              <p className="text-blue-600 font-medium mb-8">
                {modalState.target.role}
              </p>
              <div className="space-y-4 text-left bg-gray-50 p-6 rounded-2xl">
                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-400">Department</span>
                  <span className="font-bold">{modalState.target.dept}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-400">Salary</span>
                  <span className="font-bold">{modalState.target.salary}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-400">Email</span>
                  <span className="font-bold">{modalState.target.email}</span>
                </div>
              </div>
              <button
                onClick={() => setModalState({ type: null, target: null })}
                className="w-full mt-8 py-4 bg-gray-900 text-white rounded-xl font-bold"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}

        <AddEmployeeModal
          isOpen={isModalOpen || modalState.type === "edit"}
          onClose={() => {
            setIsModalOpen(false);
            setModalState({ type: null, target: null });
          }}
          onAdd={handleAddOrUpdate}
          departments={departments}
          initialData={modalState.type === "edit" ? modalState.target : null}
        />
      </main>
    </div>
  );
};
