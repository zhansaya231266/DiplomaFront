import { useState } from "react";
import { Plus, X } from "lucide-react";

interface Event {
  id: number;
  date: string;
  month: string;
  task: string;
  type: string;
}

export const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      date: "15",
      month: "MAR",
      task: "Payroll Processing",
      type: "Payroll",
    },
    {
      id: 2,
      date: "18",
      month: "MAR",
      task: "Performance Reviews",
      type: "Review",
    },
    {
      id: 3,
      date: "22",
      month: "MAR",
      task: "Department Meeting",
      type: "Meeting",
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    task: "",
    type: "General",
    date: "",
  });

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.task || !formData.date) return;
    const d = new Date(formData.date);
    const newEv = {
      id: Date.now(),
      date: d.getDate().toString(),
      month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      task: formData.task,
      type: formData.type,
    };
    setEvents([newEv, ...events]);
    setIsAdding(false);
    setFormData({ task: "", type: "General", date: "" });
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm h-full transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
          Upcoming Events
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-gray-300 hover:text-blue-600 dark:text-gray-600 dark:hover:text-blue-400 transition-colors"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={addEvent}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3 animate-in fade-in duration-200"
        >
          <input
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-[13px] outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="Event name..."
            value={formData.task}
            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              required
              type="date"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-[13px] outline-none transition-colors"
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[12px] font-bold transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      )}

      <div className="space-y-5">
        {events.map((ev) => (
          <div key={ev.id} className="flex items-start gap-4 group">
            {/* Date Circle/Box Area */}
            <div className="flex flex-col items-center min-w-[42px] py-1 border-r border-gray-50 dark:border-gray-800 pr-4">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                {ev.month}
              </span>
              <span className="text-[15px] font-bold text-gray-900 dark:text-white leading-none mt-0.5">
                {ev.date}
              </span>
            </div>

            {/* Event Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {ev.task}
              </p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                {ev.type}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
