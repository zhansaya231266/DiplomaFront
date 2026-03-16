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
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[16px] font-bold text-gray-900">Upcoming Events</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-gray-300 hover:text-blue-600 transition-colors"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={addEvent}
          className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3 animate-in fade-in duration-200"
        >
          <input
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Event name..."
            value={formData.task}
            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              required
              type="date"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] outline-none"
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[12px] font-bold"
            >
              Add
            </button>
          </div>
        </form>
      )}

      <div className="space-y-5">
        {events.map((ev) => (
          <div key={ev.id} className="flex items-start gap-4 group">
            <div className="flex flex-col items-center min-w-[42px] py-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                {ev.month}
              </span>
              <span className="text-[15px] font-bold text-gray-900 leading-none mt-0.5">
                {ev.date}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {ev.task}
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5">{ev.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
