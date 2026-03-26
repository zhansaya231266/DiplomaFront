const INVITE_EMPLOYEE_DRAFTS_KEY = "invite_employee_drafts";

export type InviteEmployeeDraft = {
  code: string;
  email: string;
  departmentId: string;
  positionId: string;
  role: string;
  salaryRate: string;
  status: string;
};

const readDrafts = (): InviteEmployeeDraft[] => {
  const raw = localStorage.getItem(INVITE_EMPLOYEE_DRAFTS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as InviteEmployeeDraft[]) : [];
  } catch {
    localStorage.removeItem(INVITE_EMPLOYEE_DRAFTS_KEY);
    return [];
  }
};

const writeDrafts = (drafts: InviteEmployeeDraft[]) => {
  localStorage.setItem(INVITE_EMPLOYEE_DRAFTS_KEY, JSON.stringify(drafts));
};

export const saveInviteEmployeeDraft = (draft: InviteEmployeeDraft) => {
  const drafts = readDrafts().filter(
    (item) => item.code !== draft.code && item.email !== draft.email,
  );
  drafts.push(draft);
  writeDrafts(drafts);
};

export const getInviteEmployeeDraft = (params: {
  code?: string;
  email?: string;
}) => {
  const code = params.code?.trim();
  const email = params.email?.trim().toLowerCase();

  return (
    readDrafts().find(
      (draft) =>
        (code && draft.code === code) ||
        (email && draft.email.trim().toLowerCase() === email),
    ) || null
  );
};

export const removeInviteEmployeeDraft = (params: {
  code?: string;
  email?: string;
}) => {
  const code = params.code?.trim();
  const email = params.email?.trim().toLowerCase();

  writeDrafts(
    readDrafts().filter(
      (draft) =>
        draft.code !== code &&
        draft.email.trim().toLowerCase() !== email,
    ),
  );
};
