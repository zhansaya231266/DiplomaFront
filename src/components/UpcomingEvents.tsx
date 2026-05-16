import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  eventsApi,
  type CreateEventPayload,
  type EventItem,
  type UpdateEventPayload,
} from "../api";
import { useAuth } from "./context/useAuth";
import { normalizeRole } from "../shared/utils/roles";

type EventFormState = {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
};

const emptyFormState: EventFormState = {
  title: "",
  description: "",
  startsAt: "",
  endsAt: "",
};

const toDateParts = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { date: "--", month: "---" };
  }

  return {
    date: String(date.getDate()).padStart(2, "0"),
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
  };
};

const toDateTimeLocalValue = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toUtcIso = (value: string) => {
  if (!value) {
    return "";
  }

  const [datePart, timePart] = value.split("T");

  if (!datePart || !timePart) {
    return "";
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (Number.isNaN(localDate.getTime())) {
    return "";
  }

  return localDate.toISOString();
};

export const UpcomingEvents = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [formState, setFormState] = useState<EventFormState>(emptyFormState);

  const canCreate = role === "SuperAdmin" || role === "Admin";
  const departmentId = role === "Admin" ? user?.departmentId || null : null;
  const canSeeEvent = useCallback((event: EventItem) => {
    const creatorRole = normalizeRole(event.createdByRole);

    if (role === "SuperAdmin") {
      return true;
    }

    if (creatorRole === "SuperAdmin" || event.scope === "global") {
      return true;
    }

    if (role === "Admin") {
      return (
        creatorRole === "Admin" &&
        (event.createdBy === user?.id ||
          event.createdBy === user?.email ||
          event.departmentId === user?.departmentId)
      );
    }

    return (
      creatorRole === "Admin" &&
      event.departmentId &&
      event.departmentId === user?.departmentId
    );
  }, [role, user?.departmentId, user?.email, user?.id]);

  const sortEvents = (items: EventItem[]) =>
    [...items].sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const upcoming = await eventsApi.getUpcoming();
      setEvents(sortEvents(upcoming.filter(canSeeEvent)));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load events",
      );
    } finally {
      setIsLoading(false);
    }
  }, [canSeeEvent]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const resetForm = () => {
    setEditingEvent(null);
    setFormState(emptyFormState);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    setEditingEvent(null);
    setFormState(emptyFormState);
    setIsFormOpen(true);
  };

  const openEditForm = (event: EventItem) => {
    setEditingEvent(event);
    setFormState({
      title: event.title,
      description: event.description,
      startsAt: toDateTimeLocalValue(event.startsAt),
      endsAt: toDateTimeLocalValue(event.endsAt),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingEvent) {
        const payload: UpdateEventPayload = {
          title: formState.title,
          description: formState.description,
          startsAt: toUtcIso(formState.startsAt),
          endsAt: toUtcIso(formState.endsAt),
          departmentId: editingEvent.departmentId || null,
        };
        const updatedEvent = await eventsApi.update(editingEvent.id, payload);
        setEvents((prev) =>
          sortEvents(
            prev.map((event) =>
              event.id === updatedEvent.id ? updatedEvent : event,
            ),
          ),
        );
      } else {
        if (!formState.startsAt || !formState.endsAt) {
          throw new Error("Start and end date are required.");
        }

        if (new Date(formState.startsAt) >= new Date(formState.endsAt)) {
          throw new Error("End date must be later than start date.");
        }

        if (role === "Admin" && !departmentId) {
          throw new Error("Department is not loaded for the current admin profile.");
        }

        const payload: CreateEventPayload = {
          title: formState.title,
          description: formState.description,
          startsAt: toUtcIso(formState.startsAt),
          endsAt: toUtcIso(formState.endsAt),
          scope: role === "Admin" ? "department" : "global",
          departmentId,
        };
        await eventsApi.create(payload);
        await loadEvents();
      }

      resetForm();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save event",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await eventsApi.delete(id);
      await loadEvents();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete event",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300 overflow-visible">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Upcoming Events
        </h3>
        {canCreate && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition-colors shadow-sm"
            title="Add event"
          >
            <Plus size={16} />
            Add Event
          </button>
        )}
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-4 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {editingEvent ? "Edit event" : "New event"}
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <input
            required
            value={formState.title}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Event title"
          />

          <textarea
            required
            value={formState.description}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Description"
          />

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Starts At
              </label>
              <input
                required
                type="datetime-local"
                value={formState.startsAt}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    startsAt: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Ends At
              </label>
              <input
                required
                type="datetime-local"
                value={formState.endsAt}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, endsAt: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {role === "Admin"
              ? "New events are created for your department."
              : "New events are created as global events for the organization."}
          </p>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              {editingEvent ? "Save" : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-gray-400 dark:text-gray-500">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 px-4 py-8 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No upcoming events.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {events.map((event) => {
            const { date, month } = toDateParts(event.startsAt);

            return (
              <div key={event.id} className="flex items-start gap-4 group">
                <div className="flex flex-col items-center min-w-[42px] py-1 border-r border-gray-50 dark:border-gray-800 pr-4">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                    {month}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white leading-none mt-0.5">
                    {date}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {(event.canEdit || event.canDelete) && (
                      <div className="flex items-center gap-2 shrink-0">
                        {event.canEdit && (
                          <button
                            type="button"
                            onClick={() => openEditForm(event)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                            title="Edit"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                        )}
                        {event.canDelete && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(event.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={12} />
                      {new Date(event.startsAt).toLocaleString("en-GB")}
                    </span>
                    <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5">
                      {event.scope === "global" ? "Global" : "Department"}
                    </span>
                    {event.departmentName && (
                      <span className="rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-0.5">
                        {event.departmentName}
                      </span>
                    )}
                    <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5">
                      {event.createdByRole}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
