import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, ShoppingCart, AlertOctagon, Users, Star, Wallet, Info } from "lucide-react";
import { notificationApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, any> = {
  order: ShoppingCart,
  dispute: AlertOctagon,
  vendor: Users,
  review: Star,
  payout: Wallet,
  system: Info,
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    notificationApi.list().then((d: any) => {
      setNotifications(d.notifications || []);
      setUnread(d.unreadCount || 0);
    }).catch(() => {});
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(timer);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    load();
  };

  const handleClick = async (n: any) => {
    if (!n.read) {
      await notificationApi.markRead(n._id);
      load();
    }
    if (n.link) window.location.href = n.link;
    setOpen(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-muted transition"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-bold">Notifications</h3>
            {unread > 0 && (
              <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n: any) => {
                const Icon = typeIcons[n.type] || Info;
                return (
                  <button
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/50",
                      !n.read && "bg-accent/5"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full",
                      !n.read ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-tight", !n.read && "font-semibold")}>{n.title}</p>
                      {n.message && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>}
                      <p className="mt-1 text-[11px] text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-border px-4 py-2.5 text-center">
              <span className="text-xs text-muted-foreground">
                {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
