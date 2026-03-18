import { useState } from "react";
import {
  Mail,
  Phone,
  MoreVertical,
  Edit2,
  Trash2,
  UserCircle,
} from "lucide-react";

export const EmployeeCard = ({
  name,
  role,
  email,
  phone,
  dept,
  salary,
  image,
  onDelete,
  onEdit,
  onView,
}: any) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-[20px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md dark:hover:shadow-blue-900/10 transition-all relative group text-left">
      {/* Кнопка меню */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-6 right-5 text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 p-1"
      >
        <MoreVertical size={20} />
      </button>

      {/* Выпадающее меню */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="absolute top-12 right-5 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => {
                onView();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium transition-colors"
            >
              <UserCircle
                size={16}
                className="text-gray-400 dark:text-gray-500"
              />{" "}
              View Profile
            </button>
            <button
              onClick={() => {
                onEdit();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium transition-colors"
            >
              <Edit2 size={16} className="text-gray-400 dark:text-gray-500" />{" "}
              Edit Employee
            </button>
            <hr className="my-1 border-gray-50 dark:border-gray-700" />
            <button
              onClick={() => {
                onDelete();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </>
      )}

      {/* Основная инфа */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={image}
          className="w-14 h-14 rounded-full object-cover border border-gray-50 dark:border-gray-800"
          alt={name}
        />
        <div>
          <h4 className="text-[16px] font-bold text-gray-900 dark:text-white leading-tight">
            {name}
          </h4>
          <p className="text-[14px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
            {role}
          </p>
        </div>
      </div>

      {/* Контакты */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <Mail size={16} className="text-gray-400 dark:text-gray-500" />
          <span className="text-[14px] truncate">{email}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <Phone size={16} className="text-gray-400 dark:text-gray-500" />
          <span className="text-[14px]">{phone}</span>
        </div>
      </div>

      {/* Футер карточки */}
      <div className="pt-5 border-t border-gray-50 dark:border-gray-800 flex justify-between items-end">
        <div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">
            Department
          </p>
          <p className="text-[14px] font-bold text-gray-900 dark:text-gray-200">
            {dept}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">
            Salary
          </p>
          <p className="text-[14px] font-bold text-gray-900 dark:text-gray-200">
            {salary}
          </p>
        </div>
      </div>

      {/* Статус */}
      <div className="mt-4">
        <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[11px] font-bold rounded-lg uppercase tracking-wide transition-colors">
          Active
        </span>
      </div>
    </div>
  );
};
