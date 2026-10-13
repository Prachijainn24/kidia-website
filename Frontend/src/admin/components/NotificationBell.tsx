import React, { useState, useEffect, useRef } from "react";
import { Bell, ShoppingBag, AlertTriangle, MessageSquare, Trash2, CheckCheck, Clock } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../services/adminApi";

const formatRelativeTime = (rawDate?: any): string => {
  if (!rawDate) return "Just now";
  try {
    const d = new Date(rawDate);
    const time = d.getTime();
    if (isNaN(time)) return "Just now";

    const diffMs = Date.now() - time;
    // Allow for slight client-server clock skew or immediate actions
    if (diffMs < 60000) return "Just now";

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Just now";
  }
};

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const res = await getNotifications();
      if (res.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.warn("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Auto-refresh notifications every 10 seconds to catch newly placed orders
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, is_read: true })));
    await markAllAsRead();
    fetchNotifs();
  };

  const handleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true, is_read: true } : n))
    );
    await markAsRead(id);
    fetchNotifs();
  };

  const handleDelete = async (item: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const idToDelete = item._id || item.id;
    // Optimistic UI update: remove ONLY this clicked item, never all items
    setNotifications((prev) =>
      prev.filter((n) => {
        if (idToDelete && (n._id === idToDelete || n.id === idToDelete)) return false;
        if (n.title === item.title && n.message === item.message) return false;
        return true;
      })
    );
    await deleteNotification(idToDelete, item);
    fetchNotifs();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="w-4 h-4 text-primary" />;
      case "stock":
        return <AlertTriangle className="w-4 h-4 text-accent" />;
      case "review":
        return <MessageSquare className="w-4 h-4 text-plum" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/60 transition-all cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-soft z-50 overflow-hidden animate-slideDown text-left">
          <div className="p-3.5 border-b border-border/60 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                Boutique Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No new notifications
              </div>
            ) : (
              notifications.map((item, idx) => {
                const notifId = item._id || item.id || `notif-idx-${idx}`;
                const notifDate = item.createdAt || item.created_at || item.timestamp;
                return (
                  <div
                    key={notifId}
                    onClick={() => handleRead(notifId)}
                    className={`p-3 flex items-start gap-3 hover:bg-muted/40 transition-colors cursor-pointer group ${
                      !item.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-muted/60 shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                        {!item.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" title="Unread" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{item.message}</p>
                      <p
                        className="text-[10px] text-muted-foreground/80 mt-1.5 flex items-center gap-1 font-medium"
                        title={notifDate ? new Date(notifDate).toLocaleString("en-IN") : ""}
                      >
                        <Clock size={11} className="text-muted-foreground/60 shrink-0" />
                        <span>{formatRelativeTime(notifDate)}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item, e)}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
