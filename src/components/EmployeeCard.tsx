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
    <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md transition-all relative group text-left">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-6 right-5 text-gray-300 hover:text-gray-600 p-1"
      >
        <MoreVertical size={20} />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="absolute top-12 right-5 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => {
                onView();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 font-medium"
            >
              <UserCircle size={16} className="text-gray-400" /> View Profile
            </button>
            <button
              onClick={() => {
                onEdit();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 font-medium"
            >
              <Edit2 size={16} className="text-gray-400" /> Edit Employee
            </button>
            <hr className="my-1 border-gray-50" />
            <button
              onClick={() => {
                onDelete();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-600 hover:bg-red-50 font-medium"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </>
      )}

      <div className="flex items-center gap-4 mb-6">
        <img
          src={image}
          className="w-14 h-14 rounded-full object-cover border border-gray-50"
          alt={name}
        />
        <div>
          <h4 className="text-[16px] font-bold text-gray-900 leading-tight">
            {name}
          </h4>
          <p className="text-[14px] text-gray-400 font-medium mt-0.5">{role}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-gray-500">
          <Mail size={16} className="text-gray-400" />
          <span className="text-[14px] truncate">{email}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <Phone size={16} className="text-gray-400" />
          <span className="text-[14px]">{phone}</span>
        </div>
      </div>

      <div className="pt-5 border-t border-gray-50 flex justify-between items-end">
        <div>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">
            Department
          </p>
          <p className="text-[14px] font-bold text-gray-900">{dept}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">
            Salary
          </p>
          <p className="text-[14px] font-bold text-gray-900">{salary}</p>
        </div>
      </div>
      <div className="mt-4">
        <span className="px-3 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-lg uppercase tracking-wide">
          Active
        </span>
      </div>
    </div>
  );
};
