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
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case "stock":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case "review":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-gray hover:text-dark-navy rounded-xl hover:bg-slate-100/70 transition-all cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-slideDown">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-dark-navy uppercase tracking-wider">
                Boutique Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-[11px] font-bold text-[#0F9D8A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-gray">
                No new notifications
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleRead(item._id)}
                  className={`p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !item.isRead ? "bg-teal-50/20" : ""
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold text-dark-navy truncate">{item.title}</p>
                    <p className="text-[11px] text-muted-gray line-clamp-2 mt-0.5">{item.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                      <Clock size={10} /> {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(item._id, e)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100"
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
