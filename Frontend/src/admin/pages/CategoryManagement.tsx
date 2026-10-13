import React, { useEffect, useState } from "react";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  AdminCategory,
} from "../services/adminApi";
import {
  Tag,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Add / Edit form state
  const [newCatName, setNewCatName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data.categories || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmitting(true);
    try {
      await addCategory({ name: newCatName.trim() });
      setNewCatName("");
      showToast("Category added successfully");
      await loadCategories();
    } catch (err: any) {
      showToast("Error: " + (err?.message || "Failed to add category"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateCategory(id, { name: editName.trim() });
      setEditingId(null);
      showToast("Category updated");
      loadCategories();
    } catch {
      showToast("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      showToast("Category removed");
      loadCategories();
    } catch {
      showToast("Failed to delete");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleCategoryStatus(id);
      loadCategories();
    } catch {
      showToast("Failed to toggle status");
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
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
          Boutique Categories
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
          Create and organize kidswear collections featured on the customer navigation menu.
        </p>
      </div>

      {/* Create New Category Card */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-soft">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3">
          Add New Boutique Category
        </h3>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="e.g. Daily Essentials, Festive Kurtas..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-card transition-all"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-soft cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />}
            <span>Add Category</span>
          </button>
        </form>
      </div>

      {/* Search and List Card */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {filtered.length} categories active
          </span>
        </div>

        <div className="divide-y divide-border/40">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary mb-1" />
              <span>Loading categories...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              No categories found
            </div>
          ) : (
            filtered.map((cat) => {
              const isEditing = editingId === cat._id;
              return (
                <div
                  key={cat._id}
                  className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-primary text-xs font-bold text-foreground bg-card"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdate(cat._id)}
                        className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                        <Tag size={15} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-xs">{cat.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Slug: /{cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-")}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(cat._id)}
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1 ${
                        cat.isActive !== false
                          ? "bg-primary-soft/50 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cat.isActive !== false ? (
                        <>
                          <CheckCircle size={11} /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={11} /> Hidden
                        </>
                      )}
                    </button>

                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditingId(cat._id);
                          setEditName(cat.name);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-muted/60"
                        title="Edit name"
                      >
                        <Pencil size={13} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10"
                      title="Delete category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
