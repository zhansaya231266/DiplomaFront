import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import {
  Briefcase,
  Building2,
  CalendarDays,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import {
  calendarApi,
  referenceApi,
  type CalendarSummaryResponse,
  type DepartmentItem,
  type PositionItem,
} from "../api";
import { useAuth } from "../components/context/useAuth";
import { normalizeRole } from "../shared/utils/roles";

export const SettingsPage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isSuperAdmin = role === "SuperAdmin";
  const isAdmin = role === "Admin";
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newPositionName, setNewPositionName] = useState("");
  const [isStructureLoading, setIsStructureLoading] = useState(true);
  const [isStructureSaving, setIsStructureSaving] = useState(false);
  const [structureError, setStructureError] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [calendarSummary, setCalendarSummary] =
    useState<CalendarSummaryResponse | null>(null);
  const [calendarError, setCalendarError] = useState("");
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const [isCalendarSaving, setIsCalendarSaving] = useState(false);

  const loadOrganizationStructure = useCallback(async () => {
    setIsStructureLoading(true);
    setStructureError("");

    try {
      const [departmentItems, positionItems] = await Promise.all([
        referenceApi.listDepartments(),
        referenceApi.listPositions(),
      ]);
      setDepartments(departmentItems);
      setPositions(
        isAdmin
          ? positionItems.filter(
              (position) =>
                !position.departmentId ||
                position.departmentId === user?.departmentId,
            )
          : positionItems,
      );
    } catch (error) {
      setStructureError(
        error instanceof Error
          ? error.message
          : "Failed to load organization structure",
      );
    } finally {
      setIsStructureLoading(false);
    }
  }, [isAdmin, user?.departmentId]);

  useEffect(() => {
    void loadOrganizationStructure();
  }, [loadOrganizationStructure]);

  const loadCalendarSummary = useCallback(async (month = calendarMonth) => {
    setIsCalendarLoading(true);
    setCalendarError("");

    try {
      const summary = await calendarApi.getSummary(month);
      setCalendarSummary(summary);
    } catch (error) {
      setCalendarError(
        error instanceof Error ? error.message : "Failed to load calendar",
      );
    } finally {
      setIsCalendarLoading(false);
    }
  }, [calendarMonth]);

  useEffect(() => {
    void loadCalendarSummary(calendarMonth);
  }, [calendarMonth, loadCalendarSummary]);

  const handleCreateDepartment = async (event: React.FormEvent) => {
    event.preventDefault();
    const departmentName = newDepartmentName.trim();
    if (!departmentName) return;

    setIsStructureSaving(true);
    setStructureError("");

    try {
      const created = await referenceApi.createDepartment({ departmentName });
      setDepartments((current) => [...current, created]);
      setNewDepartmentName("");
    } catch (error) {
      setStructureError(
        error instanceof Error ? error.message : "Failed to create department",
      );
    } finally {
      setIsStructureSaving(false);
    }
  };

  const handleCreatePosition = async (event: React.FormEvent) => {
    event.preventDefault();
    const positionName = newPositionName.trim();
    if (!positionName) return;

    setIsStructureSaving(true);
    setStructureError("");

    try {
      const created = await referenceApi.createPosition({
        positionName,
        departmentId: isAdmin ? user?.departmentId : undefined,
      });
      setPositions((current) => [...current, created]);
      setNewPositionName("");
    } catch (error) {
      setStructureError(
        error instanceof Error ? error.message : "Failed to create position",
      );
    } finally {
      setIsStructureSaving(false);
    }
  };

  const handleDeleteDepartment = async (department: DepartmentItem) => {
    if (!window.confirm(`Delete department "${department.name}"?`)) return;

    setIsStructureSaving(true);
    setStructureError("");

    try {
      await referenceApi.deleteDepartment(department.id);
      setDepartments((current) =>
        current.filter((item) => item.id !== department.id),
      );
    } catch (error) {
      setStructureError(
        error instanceof Error ? error.message : "Failed to delete department",
      );
    } finally {
      setIsStructureSaving(false);
    }
  };

  const handleDeletePosition = async (position: PositionItem) => {
    if (!window.confirm(`Delete position "${position.name}"?`)) return;

    setIsStructureSaving(true);
    setStructureError("");

    try {
      await referenceApi.deletePosition(position.id);
      setPositions((current) =>
        current.filter((item) => item.id !== position.id),
      );
    } catch (error) {
      setStructureError(
        error instanceof Error ? error.message : "Failed to delete position",
      );
    } finally {
      setIsStructureSaving(false);
    }
  };

  const handleAddCalendarDay = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const date = String(formData.get("date") || "");
    const type = String(formData.get("type") || "") as "HOLIDAY" | "WORKDAY";
    const name = String(formData.get("name") || "").trim();

    if (!date || !type) {
      setCalendarError("Date and type are required.");
      return;
    }

    setIsCalendarSaving(true);
    setCalendarError("");

    try {
      await calendarApi.addDay({ date, type, name });
      form.reset();
      await loadCalendarSummary(calendarMonth);
    } catch (error) {
      setCalendarError(
        error instanceof Error ? error.message : "Failed to save calendar day",
      );
    } finally {
      setIsCalendarSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8">
        {/* HEADER */}
        <header className="mb-6 flex items-end justify-between text-left">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Configure Smart EMP and system preferences
            </p>
          </div>
        </header>

        <div className="max-w-6xl">
          <div className="space-y-5">
            {/* 1. ORGANIZATION STRUCTURE */}
            <section className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 shadow-sm text-left">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="text-blue-600" size={22} />
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      Organization Structure
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {isSuperAdmin
                        ? "Manage departments and positions used across employees."
                        : "Manage positions for your department."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void loadOrganizationStructure()}
                  disabled={isStructureLoading || isStructureSaving}
                  className="rounded-xl border border-gray-100 px-4 py-2.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  {isStructureLoading ? "Loading..." : "Refresh"}
                </button>
              </div>

              {structureError && (
                <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {structureError}
                </div>
              )}

              {isStructureLoading ? (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 px-4 py-10 text-sm font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <Loader2 size={18} className="animate-spin" />
                  Loading organization structure...
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {isSuperAdmin && (
                  <div className="rounded-[24px] border border-gray-100 p-5 dark:border-gray-800">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-black text-gray-900 dark:text-white">
                          Departments
                        </h4>
                        <p className="mt-1 text-xs font-medium text-gray-400">
                          {departments.length} total
                        </p>
                      </div>
                      <Building2 size={20} className="text-blue-600" />
                    </div>

                    <form
                      onSubmit={handleCreateDepartment}
                      className="mb-5 flex gap-3"
                    >
                      <input
                        value={newDepartmentName}
                        onChange={(event) =>
                          setNewDepartmentName(event.target.value)
                        }
                        placeholder="New department name"
                        className="min-w-0 flex-1 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none ring-1 ring-transparent transition focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={
                          isStructureSaving || !newDepartmentName.trim()
                        }
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Plus size={16} /> Add
                      </button>
                    </form>

                    <div className="space-y-3">
                      {departments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400 dark:border-gray-800">
                          No departments yet.
                        </div>
                      ) : (
                        departments.map((department) => (
                          <div
                            key={department.id}
                            className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50"
                          >
                            <p className="min-w-0 truncate text-sm font-bold text-gray-900 dark:text-white">
                              {department.name}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                void handleDeleteDepartment(department)
                              }
                              disabled={isStructureSaving}
                              className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20"
                              title="Delete department"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  )}

                  <div className="rounded-[24px] border border-gray-100 p-5 dark:border-gray-800">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-black text-gray-900 dark:text-white">
                          Positions
                        </h4>
                        <p className="mt-1 text-xs font-medium text-gray-400">
                          {positions.length} total
                          {isAdmin && user?.department
                            ? ` in ${user.department}`
                            : ""}
                        </p>
                      </div>
                      <Briefcase size={20} className="text-green-600" />
                    </div>

                    <form
                      onSubmit={handleCreatePosition}
                      className="mb-5 flex gap-3"
                    >
                      <input
                        value={newPositionName}
                        onChange={(event) =>
                          setNewPositionName(event.target.value)
                        }
                        placeholder="New position name"
                        className="min-w-0 flex-1 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none ring-1 ring-transparent transition focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={
                          isStructureSaving ||
                          !newPositionName.trim() ||
                          (isAdmin && !user?.departmentId)
                        }
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Plus size={16} /> Add
                      </button>
                    </form>

                    <div className="space-y-3">
                      {positions.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400 dark:border-gray-800">
                          No positions yet.
                        </div>
                      ) : (
                        positions.map((position) => (
                          <div
                            key={position.id}
                            className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50"
                          >
                            <p className="min-w-0 truncate text-sm font-bold text-gray-900 dark:text-white">
                              {position.name}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                void handleDeletePosition(position)
                              }
                              disabled={isStructureSaving}
                              className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20"
                              title="Delete position"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 2. WORKING CALENDAR */}
            <section className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 shadow-sm text-left">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="text-blue-600" size={22} />
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      Working Calendar
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {isSuperAdmin
                        ? "Manage holidays and weekend workday overrides."
                        : "View holidays and workday overrides."}
                    </p>
                  </div>
                </div>
                <input
                  type="month"
                  value={calendarMonth}
                  onChange={(event) => setCalendarMonth(event.target.value)}
                  className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-700 outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {calendarError && (
                <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                  {calendarError}
                </div>
              )}

              <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Working Days",
                    value: calendarSummary?.workingDays ?? 0,
                  },
                  { label: "Weekends", value: calendarSummary?.weekends ?? 0 },
                  { label: "Holidays", value: calendarSummary?.holidays ?? 0 },
                  {
                    label: "Overrides",
                    value: calendarSummary?.workdayOverrides ?? 0,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/50"
                  >
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                      {isCalendarLoading ? "-" : item.value}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {isSuperAdmin && (
                <form
                  onSubmit={handleAddCalendarDay}
                  className="mb-6 grid grid-cols-1 md:grid-cols-[1fr_1fr_1.4fr_auto] gap-3"
                >
                  <input
                    name="date"
                    type="date"
                    className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
                  />
                  <select
                    name="type"
                    defaultValue="HOLIDAY"
                    className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
                  >
                    <option value="HOLIDAY">Holiday</option>
                    <option value="WORKDAY">Workday override</option>
                  </select>
                  <input
                    name="name"
                    placeholder="Name"
                    className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={isCalendarSaving}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add Day
                  </button>
                </form>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
                {(calendarSummary?.days || []).slice(0, 35).map((day) => (
                  <div
                    key={day.date}
                    className={`rounded-2xl px-3 py-3 ${
                      day.isWorking
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400"
                    }`}
                  >
                    <p className="text-xs font-black text-gray-900 dark:text-white">
                      {day.date.slice(8, 10)}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide">
                      {day.type || day.weekday}
                    </p>
                    {day.name && (
                      <p className="mt-2 truncate text-xs font-semibold">
                        {day.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
