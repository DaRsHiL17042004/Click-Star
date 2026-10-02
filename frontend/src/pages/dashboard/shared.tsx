import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format, isAfter } from "date-fns";
import { CalendarClock, MapPin } from "lucide-react";
import { Avatar, Button, Card, Chip, Dialog, EmptyState, Skeleton, StatusBadge, buttonClass } from "@/components/ui";
import { useSetBookingStatus } from "@/hooks/queries";
import { cn, errorMessage, formatINR, refId, refName } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";
import { toast } from "sonner";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-xl font-medium">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, loading }: { label: string; value: ReactNode; hint?: string; loading?: boolean }) {
  return (
    <Card className="p-5">
      <p className="eyebrow">{label}</p>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-xl font-medium tabular-nums">
          {value}
        </motion.p>
      )}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

const FILTERS: ("all" | BookingStatus)[] = ["all", "pending", "confirmed", "completed", "cancelled"];

export function BookingList({
  bookings, loading, perspective, emptyAction,
}: { bookings?: Booking[]; loading?: boolean; perspective: "client" | "photographer"; emptyAction?: ReactNode }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [confirm, setConfirm] = useState<{ b: Booking; status: BookingStatus } | null>(null);
  const setStatus = useSetBookingStatus();

  const sorted = [...(bookings ?? [])].sort((a, b) => {
    const now = new Date();
    const af = isAfter(new Date(a.shootDate), now), bf = isAfter(new Date(b.shootDate), now);
    if (af !== bf) return af ? -1 : 1;
    return af ? +new Date(a.shootDate) - +new Date(b.shootDate) : +new Date(b.shootDate) - +new Date(a.shootDate);
  });
  const list = filter === "all" ? sorted : sorted.filter((b) => b.status === filter);
  const count = (s: (typeof FILTERS)[number]) => (s === "all" ? bookings?.length ?? 0 : bookings?.filter((b) => b.status === s).length ?? 0);

  const run = (b: Booking, status: BookingStatus) =>
    setStatus.mutate(
      { id: b._id, status },
      {
        onSuccess: () => {
          toast.success(`Booking ${status}`);
          setConfirm(null);
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  const actions = (b: Booking) => {
    if (perspective === "photographer") {
      if (b.status === "pending")
        return (
          <>
            <Button size="sm" variant="ghost" onClick={() => setConfirm({ b, status: "cancelled" })} data-testid={`button-decline-${b._id}`}>Decline</Button>
            <Button size="sm" onClick={() => run(b, "confirmed")} loading={setStatus.isPending && setStatus.variables?.id === b._id} data-testid={`button-accept-${b._id}`}>Accept</Button>
          </>
        );
      if (b.status === "confirmed")
        return (
          <>
            <Button size="sm" variant="ghost" onClick={() => setConfirm({ b, status: "cancelled" })}>Cancel</Button>
            <Button size="sm" variant="outline" onClick={() => run(b, "completed")} data-testid={`button-complete-${b._id}`}>Mark completed</Button>
          </>
        );
      return null;
    }
    if (b.status === "pending" || b.status === "confirmed")
      return <Button size="sm" variant="ghost" onClick={() => setConfirm({ b, status: "cancelled" })} data-testid={`button-cancel-${b._id}`}>Cancel</Button>;
    if (b.status === "completed")
      return (
        <Link to={`/review/${refId(b.photographerId)}/${b._id}`} className={buttonClass("outline", "sm")} data-testid={`link-review-${b._id}`}>
          Leave a review
        </Link>
      );
    return null;
  };

  return (
    <div>
      <div className="scrollbar-none -mx-1 mb-6 flex gap-2 overflow-x-auto px-1">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)} data-testid={`chip-filter-${f}`}>
            {f[0]!.toUpperCase() + f.slice(1)} <span className="tabular-nums opacity-60">{count(f)}</span>
          </Chip>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : !list.length ? (
        <Card>
          <EmptyState
            icon={<CalendarClock />}
            title={filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
            body={perspective === "client" ? "When you request a shoot, it'll show up here with its status." : "Requests from clients will land here. A complete profile gets booked faster."}
            action={filter === "all" ? emptyAction : undefined}
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {list.map((b, i) => {
            const other = perspective === "client" ? b.photographerId : b.clientId;
            const d = new Date(b.shootDate);
            const upcoming = isAfter(d, new Date());
            return (
              <motion.li
                key={b._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 6) * 0.03 }}
                data-testid={`row-booking-${b._id}`}
              >
                <Card className={cn("grid items-center gap-4 p-4 sm:grid-cols-[72px_1fr_auto] sm:p-5", !upcoming && "bg-surface/60")}>
                  <div className="flex items-center gap-3 sm:block sm:text-center">
                    <div className={cn("rounded-md border px-2 py-1.5 text-center", upcoming ? "border-ink/20" : "border-line text-muted")}>
                      <p className="font-mono text-[11px] uppercase tracking-wider">{format(d, "MMM")}</p>
                      <p className="font-display text-lg font-medium leading-none tabular-nums">{format(d, "d")}</p>
                    </div>
                    <p className="font-mono text-[11px] text-muted sm:mt-1">{format(d, "EEE")}</p>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-medium">{b.shootType}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar name={refName(other)} size={20} />
                        {perspective === "client" ? (
                          <Link to={`/photographers/${refId(other)}`} className="hover:text-ink hover:underline">{refName(other)}</Link>
                        ) : (
                          refName(other, "Client")
                        )}
                      </span>
                      <span className="inline-flex min-w-0 items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{b.location}</span></span>
                      <span className="tabular-nums text-ink">{formatINR(b.price)}</span>
                    </div>
                    {b.notes && <p className="mt-2 line-clamp-1 text-xs text-muted">{b.notes}</p>}
                  </div>
                  <div className="flex gap-2 sm:justify-end">{actions(b)}</div>
                </Card>
              </motion.li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={perspective === "photographer" && confirm?.b.status === "pending" ? "Decline this request?" : "Cancel this booking?"}
        description="The other party will see the booking as cancelled. This can't be undone."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirm(null)}>Keep it</Button>
          <Button variant="danger" loading={setStatus.isPending} onClick={() => confirm && run(confirm.b, confirm.status)} data-testid="button-confirm-cancel">
            Yes, cancel
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
