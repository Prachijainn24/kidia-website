import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoBlossom from "@/assets/logo-blossom.png";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  List,
  X,
  Users,
  Star,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, profile } = useAuth();

  const [productsMenuOpen, setProductsMenuOpen] = useState(
    location.pathname.startsWith("/admin/products") ||
      location.pathname === "/admin/create-product"
  );

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard size={17} />,
    },
    {
      title: "Products",
      icon: <ShoppingBag size={17} />,
      submenu: [
        {
          title: "All Products",
          path: "/admin/products",
          icon: <List size={14} />,
        },
        {
          title: "Create Product",
          path: "/admin/create-product",
          icon: <PlusCircle size={14} />,
        },
      ],
    },
    {
      title: "Categories",
      path: "/admin/categories",
      icon: <Tag size={17} />,
    },
    {
      title: "Orders",
      path: "/admin/orders",
      icon: <FileText size={17} />,
    },
    {
      title: "Customer Reviews",
      path: "/admin/reviews",
      icon: <Star size={17} />,
    },
    {
      title: "Customers & Users",
      path: "/admin/users",
      icon: <Users size={17} />,
    },
    {
      title: "Contact Queries",
      path: "/admin/contacts",
      icon: <MessageSquare size={17} />,
    },
    {
      title: "Store Settings",
      path: "/admin/settings",
      icon: <Settings size={17} />,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-card border-r border-border/80 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card">
          <Link
            to="/admin"
            className="flex items-center gap-2.5 text-left group"
            onClick={() => setIsOpen(false)}
          >
            <img src={logoBlossom} alt="KIDIA" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
            <div>
              <span className="font-display font-black text-lg text-primary tracking-tight block leading-tight">
                KIDIA
              </span>
              <span className="text-[10px] font-extrabold text-accent uppercase tracking-widest block leading-tight">
                Admin Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close Sidebar Navigation"
            className="p-1.5 text-muted-foreground hover:text-foreground lg:hidden rounded-lg hover:bg-muted/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="text-[10px] font-extrabold uppercase text-muted-foreground/80 tracking-wider px-3 mb-2">
            Store Management
          </div>

          {navItems.map((item) => {
            if (item.submenu) {
              const hasActiveChild = item.submenu.some((sub) => location.pathname === sub.path);
              return (
                <div key={item.title} className="space-y-1">
                  <button
                    onClick={() => setProductsMenuOpen(!productsMenuOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      hasActiveChild
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    {productsMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {productsMenuOpen && (
                    <div className="pl-6 space-y-1 pt-0.5">
                      {item.submenu.map((sub) => {
                        const active = location.pathname === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                              active
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            }`}
                          >
                            {sub.icon}
                            <span>{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin Profile Footer */}
        <div className="p-3 border-t border-border/60 bg-muted/30">
          <Link
            to="/admin/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-card hover:shadow-soft transition-all border border-transparent hover:border-border/60 group"
          >
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              {(profile?.display_name || "A").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <span className="text-xs font-black text-foreground block truncate leading-tight group-hover:text-primary transition-colors">
                {profile?.display_name || "Kidia Admin"}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground block truncate leading-tight">
                {user?.email || "admin@kidia.com"}
              </span>
            </div>
            <Settings size={15} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
