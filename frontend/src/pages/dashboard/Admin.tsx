import { useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { format } from "date-fns";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Inbox, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Badge, Card, Chip, EmptyState, Input, Select, Skeleton, StatusBadge } from "@/components/ui";
import { useLeads, usePhotographers, useSetLeadStatus, useUsers } from "@/hooks/queries";
import { errorMessage, refName } from "@/lib/utils";
import type { Lead, LeadStatus, Role } from "@/types";
import { PageHeader, Stat } from "./shared";

const LEAD_STATUSES: LeadStatus[] = ["pending", "assigned", "completed"];
const leadColor: Record<LeadStatus, string> = { pending: "hsl(var(--warning))", assigned: "hsl(var(--accent))", completed: "hsl(var(--success))" };

function Overview() {
  const { data: users, isLoading: uLoading, isError: uError } = useUsers();
  const { data: leads, isLoading: lLoading } = useLeads();
  const { data: photographers, isLoading: pLoading } = usePhotographers();

  const byRole = (r: Role) => users?.filter((u) => u.role === r).length ?? 0;
  const leadData = LEAD_STATUSES.map((s) => ({ name: s, value: leads?.filter((l) => l.status === s).length ?? 0 }));
  const cities = useMemo(() => {
    const m = new Map<string, number>();
    photographers?.forEach((p) => p.location && m.set(p.location, (m.get(p.location) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [photographers]);
  const maxCity = Math.max(1, ...cities.map((c) => c[1]));

  return (
    <>
      <PageHeader title="Platform overview" description="Marketplace health across Click-Star." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Listed photographers" value={photographers?.length ?? 0} loading={pLoading} />
        <Stat label="Clients" value={uError ? "—" : byRole("client")} loading={uLoading} hint={uError ? "Users endpoint unavailable" : undefined} />
        <Stat label="Open leads" value={leads?.filter((l) => l.status !== "completed").length ?? 0} loading={lLoading} />
        <Stat label="Completed leads" value={leads?.filter((l) => l.status === "completed").length ?? 0} loading={lLoading} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Leads by status</h2>
          {lLoading ? <Skeleton className="mt-4 h-48" /> : (
            <div className="mt-2 flex items-center gap-6">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={leadData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="none">
                      {leadData.map((d) => <Cell key={d.name} fill={leadColor[d.name as LeadStatus]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--line))", borderRadius: 6, fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-sm">
                {leadData.map((d) => (
                  <li key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: leadColor[d.name as LeadStatus] }} />
                    <span className="capitalize text-muted">{d.name}</span>
                    <span className="ml-auto pl-6 font-medium tabular-nums">{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Photographers by city</h2>
          {pLoading ? <Skeleton className="mt-4 h-48" /> : (
            <ul className="mt-4 space-y-3">
              {cities.map(([c, n]) => (
                <li key={c} className="grid grid-cols-[110px_1fr_24px] items-center gap-3 text-sm">
                  <span className="truncate text-muted">{c}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-ink/[0.06]"><div className="h-full rounded-full bg-ink/70" style={{ width: `${(n / maxCity) * 100}%` }} /></div>
                  <span className="text-right tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function Leads() {
  const { data, isLoading, isError, error } = useLeads();
  const setStatus = useSetLeadStatus();
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const list = (data ?? []).filter((l) => filter === "all" || l.status === filter).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const change = (l: Lead, status: LeadStatus) =>
    setStatus.mutate({ id: l._id, status }, { onSuccess: () => toast.success(`Lead marked ${status}`), onError: (e) => toast.error(errorMessage(e)) });

  return (
    <>
      <PageHeader title="Leads" description="Client requests routed to photographers." />
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", ...LEAD_STATUSES] as const).map((s) => (
          <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>
            <span className="capitalize">{s}</span> <span className="tabular-nums opacity-60">{s === "all" ? data?.length ?? 0 : data?.filter((l) => l.status === s).length ?? 0}</span>
          </Chip>
        ))}
      </div>
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : isError ? (
          <EmptyState icon={<Inbox />} title="Couldn't load leads" body={errorMessage(error)} />
        ) : !list.length ? (
          <EmptyState icon={<Inbox />} title="No leads here" body="New client requests will appear in this queue." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-line bg-ink/[0.02] text-left">
                <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-mono [&>th]:text-xs [&>th]:font-normal [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-muted">
                  <th>Client</th><th>Photographer</th><th>Created</th><th>Status</th><th className="text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((l) => (
                  <tr key={l._id} className="[&>td]:px-4 [&>td]:py-3" data-testid={`row-lead-${l._id}`}>
                    <td><span className="flex items-center gap-2"><Avatar name={refName(l.clientId)} size={28} />{refName(l.clientId)}</span></td>
                    <td>
                      <p>{refName(l.photographerId)}</p>
                      {typeof l.photographerId === "object" && l.photographerId.location && <p className="text-xs text-muted">{l.photographerId.location}</p>}
                    </td>
                    <td className="tabular-nums text-muted">{format(new Date(l.createdAt), "d MMM yyyy")}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td className="text-right">
                      <label className="sr-only" htmlFor={`lead-${l._id}`}>Change status</label>
                      <Select id={`lead-${l._id}`} value={l.status} onChange={(e) => change(l, e.target.value as LeadStatus)} className="ml-auto h-9 w-36 text-sm" data-testid={`select-lead-${l._id}`}>
                        {LEAD_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s[0]!.toUpperCase() + s.slice(1)}</option>)}
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

function Users() {
  const { data, isLoading, isError } = useUsers();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | Role>("all");
  const list = (data ?? []).filter((u) => (role === "all" || u.role === role) && `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  const tone = { client: "neutral", photographer: "accent", admin: "success" } as const;

  return (
    <>
      <PageHeader title="Users" description="Everyone with a Click-Star account." />
      <div className="mb-6 flex flex-wrap gap-2">
        <label htmlFor="user-q" className="sr-only">Search users</label>
        <Input id="user-q" type="search" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        {(["all", "client", "photographer", "admin"] as const).map((r) => <Chip key={r} active={role === r} onClick={() => setRole(r)}><span className="capitalize">{r}</span></Chip>)}
      </div>
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : isError ? (
          <EmptyState icon={<UsersRound />} title="User list unavailable" body="The API doesn't expose GET /api/admin/users yet. Add that endpoint to manage accounts here." />
        ) : !list.length ? (
          <EmptyState icon={<UsersRound />} title="No matching users" body="Try a different search or role filter." />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={u.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-muted">{u.email}</p>
                </div>
                {u.createdAt && <span className="hidden text-xs tabular-nums text-muted sm:block">Joined {format(new Date(u.createdAt), "MMM yyyy")}</span>}
                <Badge tone={tone[u.role]} className="capitalize">{u.role}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

export default function Admin() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="leads" element={<Leads />} />
      <Route path="users" element={<Users />} />
      <Route path="*" element={<Overview />} />
    </Routes>
  );
}
