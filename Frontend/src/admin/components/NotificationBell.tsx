import React, { useState, useEffect, useRef } from "react";
import { Bell, ShoppingBag, AlertTriangle, MessageSquare, Trash2, CheckCheck, Clock } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../services/adminApi";

const formatRelativeTime = (dateString: string) => {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  } catch {
    return "";
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
    await markAllAsRead();
    fetchNotifs();
  };

  const handleRead = async (id: string) => {
    await markAsRead(id);
    fetchNotifs();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(id);
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
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleRead(item._id)}
                  className={`p-3 flex items-start gap-3 hover:bg-muted/40 transition-colors cursor-pointer ${
                    !item.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="p-2 rounded-xl bg-muted/60 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{item.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1 font-medium">
                      <Clock size={10} /> {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(item._id, e)}
                    className="p-1 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
