import React, { useEffect, useState } from "react";
import { getContacts, deleteContactApi, AdminContact } from "../services/adminApi";
import {
  MessageSquare,
  Search,
  Trash2,
  Mail,
  Phone,
  Clock,
  Check,
  Loader2,
} from "lucide-react";

const ContactDetails: React.FC = () => {
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const loadContacts = async () => {
    setLoading(true);
    try {
      const res = await getContacts();
      setContacts(res.data.contacts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteContactApi(id);
      showToast("Message deleted");
      loadContacts();
    } catch {
      showToast("Failed to delete message");
    }
  };

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-foreground text-background text-xs font-bold px-4 py-2.5 rounded-xl shadow-soft flex items-center gap-2 animate-slideDown">
          <Check size={14} className="text-butter" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-foreground tracking-tight">
          Customer Inquiries & Messages
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
          Messages received from customer inquiries, custom tailoring requests, and questions.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-soft flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-muted/20 border border-border text-xs text-foreground focus:bg-card focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground">{filtered.length} inquiries</span>
      </div>

      {/* Contacts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground bg-card rounded-2xl border border-border">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
            <span className="text-xs font-bold">Loading inquiries...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground bg-card rounded-2xl border border-border">
            <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-bold text-foreground text-xs">No customer inquiries found</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item._id}
              className="bg-card border border-border/80 rounded-2xl p-5 shadow-soft space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-foreground text-sm">{item.subject}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{item.name}</span>
                    <span className="flex items-center gap-1">
                      <Mail size={12} /> {item.email}
                    </span>
                    {item.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} /> {item.phone}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10"
                  title="Delete message"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="p-3 bg-muted/20 rounded-xl text-xs text-foreground leading-relaxed border border-border/50">
                {item.message}
              </div>

              <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Clock size={11} /> Received on {new Date(item.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactDetails;
