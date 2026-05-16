import { useState } from "react";
import {
  Mail,
  Phone,
  MoreVertical,
  Edit2,
  Trash2,
  UserCircle,
  ClipboardList,
  FileText,
} from "lucide-react";

type EmployeeCardProps = {
  name: string;
  role: string;
  email: string;
  phone: string;
  dept: string;
  salary: string;
  image: string;
  status: string;
  onDelete: () => void;
  onEdit: () => void;
  onView: () => void;
  onAssignTask?: () => void;
  onViewReports?: () => void;
  pendingReportsCount?: number;
};

const getStatusBadgeClassName = (status: string) => {
  if (status.toLowerCase() === "active") {
    return "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400";
  }

  return "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400";
};

export const EmployeeCard = ({
  name,
  role,
  email,
  phone,
  dept,
  salary,
  image,
  status,
  onDelete,
  onEdit,
  onView,
  onAssignTask,
  onViewReports,
  pendingReportsCount = 0,
}: EmployeeCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group relative rounded-[20px] border border-gray-100 bg-white p-6 text-left shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-blue-900/10">
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        className="absolute right-5 top-6 p-1 text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
      >
        <MoreVertical size={20} />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-5 top-12 z-20 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-xl duration-150 animate-in fade-in zoom-in dark:border-gray-700 dark:bg-gray-800">
            <button
              onClick={() => {
                onView();
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
            >
              <UserCircle
                size={16}
                className="text-gray-400 dark:text-gray-500"
              />
              View Profile
            </button>
            <button
              onClick={() => {
                onEdit();
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
            >
              <Edit2 size={16} className="text-gray-400 dark:text-gray-500" />
              Edit Employee
            </button>
            {onAssignTask && (
              <button
                onClick={() => {
                  onAssignTask();
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
              >
                <ClipboardList
                  size={16}
                  className="text-gray-400 dark:text-gray-500"
                />
                Assign Task
              </button>
            )}
            {onViewReports && (
              <button
                onClick={() => {
                  onViewReports();
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
              >
                <FileText
                  size={16}
                  className="text-gray-400 dark:text-gray-500"
                />
                Task Reports
              </button>
            )}
            <hr className="my-1 border-gray-50 dark:border-gray-700" />
            <button
              onClick={() => {
                onDelete();
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </>
      )}

      <div className="mb-6 flex items-center gap-4">
        <img
          src={image}
          className="h-14 w-14 rounded-full border border-gray-50 object-cover dark:border-gray-800"
          alt={name}
        />
        <div>
          <h4 className="text-base font-bold leading-tight text-gray-900 dark:text-white">
            {name}
          </h4>
          <p className="mt-0.5 text-sm font-medium text-gray-400 dark:text-gray-500">
            {role}
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <Mail size={16} className="text-gray-400 dark:text-gray-500" />
          <span className="truncate text-sm">{email}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <Phone size={16} className="text-gray-400 dark:text-gray-500" />
          <span className="text-sm">{phone}</span>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-gray-50 pt-5 dark:border-gray-800">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Department
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-200">
            {dept}
          </p>
        </div>
        <div className="text-right">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Salary
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-200">
            {salary}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <span
          className={`rounded-lg px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors ${getStatusBadgeClassName(
            status,
          )}`}
        >
          {status}
        </span>
        {pendingReportsCount > 0 && (
          <span className="ml-2 rounded-lg bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
            {pendingReportsCount} report{pendingReportsCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </div>
  );
};
