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
        <div className="fixed top-20 right-6 z-50 bg-dark-navy text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-slideDown">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-dark-navy tracking-tight font-sans">
          Customer Inquiries & Messages
        </h1>
        <p className="text-xs sm:text-sm text-muted-gray mt-1 font-medium">
          Messages received from customer inquiries, custom tailoring requests, and questions.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none"
          />
        </div>
        <span className="text-xs font-bold text-muted-gray">{filtered.length} inquiries</span>
      </div>

      {/* Contacts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-muted-gray bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0F9D8A] mb-2" />
            <span className="text-xs font-bold">Loading inquiries...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-gray bg-white rounded-2xl border border-slate-200">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-dark-navy text-xs">No customer inquiries found</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-dark-navy text-sm">{item.subject}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-gray">
                    <span className="font-semibold text-dark-navy">{item.name}</span>
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
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  title="Delete message"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                {item.message}
              </div>

              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
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
