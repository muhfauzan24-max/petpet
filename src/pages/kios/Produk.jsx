import { useState, useEffect, useRef } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { formatRupiah, formatBerat } from "../../data/mockData";
import { produkAPI, getImageUrl } from "../../services/api";
import { Plus, Trash2, RefreshCw, Upload, X, ImagePlus, Pencil, Save, Tag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const sidebarLinks = [
  { href: "/kios", icon: "🏠", label: "Dashboard" },
  { href: "/kios/produk", icon: "📦", label: "Produk" },
  { href: "/kios/pesanan", icon: "🛒", label: "Pesanan" },
  { href: "/kios/chat", icon: "💬", label: "Chat" },
  { href: "/kios/analitik", icon: "📊", label: "Analitik" },
  { href: "/akun", icon: "👤", label: "Profil Saya" },
];

// Kategori produk sesuai kombinasi jenisHewan + tipeProduk
const KATEGORI_MAP = {
  "kucing-makanan":   { idKategori: 1, label: "🐱 Makanan Kucing" },
  "anjing-makanan":   { idKategori: 2, label: "🐶 Makanan Anjing" },
  "kucing-pasir":     { idKategori: 3, label: "🪣 Pasir Kucing" },
  "anjing-pasir":     { idKategori: 4, label: "🪣 Pasir Anjing" },
  "kucing-mainan":    { idKategori: 5, label: "🎾 Mainan Kucing" },
  "anjing-mainan":    { idKategori: 6, label: "🦴 Mainan Anjing" },
};

const TIPE_OPTIONS = [
  { value: "makanan", label: "🍖 Makanan" },
  { value: "pasir",   label: "🪣 Pasir" },
  { value: "mainan",  label: "🎾 Mainan" },
];

const EMPTY_FORM = {
  nama: "", harga: "", hargaDiskon: "", beratGram: "", stok: "10",
  jenisHewan: "kucing", tipeProduk: "makanan", deskripsi: "", fotoFile: null, fotoPreview: null
};

const EMPTY_EDIT = {
  id: null, nama: "", harga: "", hargaDiskon: "", beratGram: "", stok: "",
  jenisHewan: "kucing", tipeProduk: "makanan", deskripsi: "",
};

export default function KiosProduk() {
  const { user } = useAuth();
  const idKios = user?.kios?.id;
  const fileInputRef = useRef(null);

  const [produkList, setProdukList] = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [dragOver, setDragOver]     = useState(false);

  // State untuk modal edit
  const [editId, setEditId]         = useState(null); // produk yg sedang diedit
  const [editForm, setEditForm]     = useState(EMPTY_EDIT);
  const [savingEdit, setSavingEdit] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadProduk = async () => {
    if (!idKios) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await produkAPI.list({ kios: idKios, limit: 100 });
      setProdukList(data.produk || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProduk(); }, [idKios]);

  // ── Foto upload helpers ──────────────────────────────────────────────
  const handleFotoChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "File harus berupa gambar (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Ukuran foto maksimal 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm(f => ({ ...f, fotoFile: file, fotoPreview: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFotoChange(file);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit tambah produk baru ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.harga || !form.stok) {
      showToast("error", "Nama, Harga, dan Stok wajib diisi!");
      return;
    }
    const key = `${form.jenisHewan}-${form.tipeProduk}`;
    const kat  = KATEGORI_MAP[key];
    if (!kat) {
      showToast("error", "Kombinasi jenis hewan dan tipe produk tidak valid");
      return;
    }
    setSaving(true);
    try {
      await produkAPI.create({
        idKios,
        idKategori: kat.idKategori,
        nama: form.nama,
        deskripsi: form.deskripsi,
        jenisHewan: form.jenisHewan,
        tipeProduk: form.tipeProduk,
        harga: parseInt(form.harga),
        hargaDiskon: form.hargaDiskon ? parseInt(form.hargaDiskon) : null,
        beratGram: parseInt(form.beratGram || 0),
        stok: parseInt(form.stok),
        foto: form.fotoPreview || null,
      });
      await loadProduk();
      showToast("success", "✅ Produk berhasil ditambahkan!");
      setShowForm(false);
      resetForm();
    } catch (err) {
      showToast("error", err.message || "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  // ── Buka modal edit ──────────────────────────────────────────────────
  const openEdit = (p) => {
    setEditId(p.id);
    setEditForm({
      id: p.id,
      nama: p.nama || "",
      harga: p.harga || "",
      hargaDiskon: p.hargaDiskon || "",
      beratGram: p.beratGram || "",
      stok: p.stok || "",
      jenisHewan: p.jenisHewan || "kucing",
      tipeProduk: p.tipeProduk || "makanan",
      deskripsi: p.deskripsi || "",
    });
  };

  const closeEdit = () => {
    setEditId(null);
    setEditForm(EMPTY_EDIT);
  };

  // ── Submit edit produk ───────────────────────────────────────────────
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.nama || !editForm.harga || !editForm.stok) {
      showToast("error", "Nama, Harga, dan Stok wajib diisi!");
      return;
    }
    const key = `${editForm.jenisHewan}-${editForm.tipeProduk}`;
    const kat  = KATEGORI_MAP[key];
    if (!kat) {
      showToast("error", "Kombinasi jenis hewan dan tipe produk tidak valid");
      return;
    }
    setSavingEdit(true);
    try {
      await produkAPI.update(editForm.id, {
        idKategori: kat.idKategori,
        nama: editForm.nama,
        deskripsi: editForm.deskripsi,
        jenisHewan: editForm.jenisHewan,
        tipeProduk: editForm.tipeProduk,
        harga: parseInt(editForm.harga),
        hargaDiskon: editForm.hargaDiskon ? parseInt(editForm.hargaDiskon) : null,
        beratGram: parseInt(editForm.beratGram || 0),
        stok: parseInt(editForm.stok),
      });
      await loadProduk();
      showToast("success", "✅ Produk berhasil diperbarui!");
      closeEdit();
    } catch (err) {
      showToast("error", err.message || "Gagal memperbarui produk");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      await produkAPI.delete(id);
      setProdukList(prev => prev.filter(p => p.id !== id));
      showToast("success", "Produk berhasil dihapus");
    } catch (err) {
      showToast("error", err.message);
    }
  };

  // Kategori preview label
  const getKatLabel = (jenisHewan, tipeProduk) => {
    const key = `${jenisHewan}-${tipeProduk}`;
    return KATEGORI_MAP[key]?.label || `${jenisHewan} • ${tipeProduk}`;
  };

  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      <DashboardSidebar links={sidebarLinks} title="Dashboard Kios" />
      <div style={{ flex:1 }}>

        {/* Toast */}
        {toast && (
          <div className={`alert alert-${toast.type === "success" ? "success" : "error"}`}
            style={{ marginBottom:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center", animation:"fadeIn 0.3s ease" }}>
            {toast.msg}
            <button onClick={() => setToast(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"inherit", fontSize:"1.1rem" }}>×</button>
          </div>
        )}

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <h2>📦 Kelola Produk</h2>
          <div style={{ display:"flex", gap:"0.5rem" }}>
            <button onClick={loadProduk} className="btn btn-secondary btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
              <RefreshCw size={14} />
            </button>
            <button onClick={() => { setShowForm(!showForm); resetForm(); closeEdit(); }} className="btn btn-primary btn-sm">
              <Plus size={15}/> Tambah Produk
            </button>
          </div>
        </div>

        {/* ── FORM TAMBAH PRODUK ── */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ padding:"1.75rem", marginBottom:"1.5rem", animation:"fadeIn 0.3s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
              <h4 style={{ margin:0 }}>📦 Tambah Produk Baru</h4>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
                <X size={18}/>
              </button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.875rem" }}>
              {/* Nama Produk */}
              <div className="form-group" style={{ gridColumn:"1/-1" }}>
                <label className="form-label">Nama Produk <span style={{ color:"#F87171" }}>*</span></label>
                <input required value={form.nama} onChange={e => setForm(f => ({...f, nama:e.target.value}))} className="form-input" placeholder="Contoh: Whiskas Adult Salmon 1.2kg" />
              </div>

              {/* Jenis Hewan */}
              <div className="form-group">
                <label className="form-label">Jenis Hewan</label>
                <select value={form.jenisHewan} onChange={e => setForm(f => ({...f, jenisHewan:e.target.value}))} className="form-input">
                  <option value="kucing">🐱 Kucing</option>
                  <option value="anjing">🐶 Anjing</option>
                </select>
              </div>

              {/* Tipe Produk */}
              <div className="form-group">
                <label className="form-label">Jenis Produk</label>
                <select value={form.tipeProduk} onChange={e => setForm(f => ({...f, tipeProduk:e.target.value}))} className="form-input">
                  {TIPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Harga & Diskon */}
              <div className="form-group">
                <label className="form-label">Harga Normal (Rp) <span style={{ color:"#F87171" }}>*</span></label>
                <input required type="number" value={form.harga} onChange={e => setForm(f => ({...f, harga:e.target.value}))} className="form-input" placeholder="45000" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Harga Diskon (Rp) <span style={{ color:"var(--text-muted)", fontWeight:400 }}>— kosongkan jika tidak ada</span></label>
                <input type="number" value={form.hargaDiskon} onChange={e => setForm(f => ({...f, hargaDiskon:e.target.value}))} className="form-input" placeholder="38000" min="0" />
              </div>

              {/* Berat & Stok */}
              <div className="form-group">
                <label className="form-label">Berat (gram)</label>
                <input type="number" value={form.beratGram} onChange={e => setForm(f => ({...f, beratGram:e.target.value}))} className="form-input" placeholder="1200" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Stok <span style={{ color:"#F87171" }}>*</span></label>
                <input required type="number" value={form.stok} onChange={e => setForm(f => ({...f, stok:e.target.value}))} className="form-input" placeholder="50" min="0" />
              </div>

              {/* Upload Foto */}
              <div className="form-group" style={{ gridColumn:"1/-1" }}>
                <label className="form-label">Foto Produk</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: "var(--radius-md)",
                    padding: form.fotoPreview ? "0.5rem" : "1.75rem",
                    textAlign: "center", cursor: "pointer",
                    background: dragOver ? "rgba(249,115,22,0.05)" : "var(--bg-secondary)",
                    transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: "1rem", minHeight: form.fotoPreview ? "auto" : 100,
                  }}
                >
                  {form.fotoPreview ? (
                    <>
                      <img src={form.fotoPreview} alt="preview"
                        style={{ width:90, height:90, objectFit:"cover", borderRadius:"var(--radius-md)", border:"1px solid var(--border)", flexShrink:0 }} />
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontWeight:700, fontSize:"0.85rem", marginBottom:"0.25rem" }}>{form.fotoFile?.name}</div>
                        <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{form.fotoFile ? `${(form.fotoFile.size / 1024).toFixed(0)} KB` : ""}</div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setForm(f => ({...f, fotoFile:null, fotoPreview:null})); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          style={{ marginTop:"0.5rem", background:"none", border:"1px solid #F87171", color:"#F87171", borderRadius:"var(--radius-sm)", padding:"0.25rem 0.6rem", fontSize:"0.75rem", cursor:"pointer", display:"flex", alignItems:"center", gap:"0.3rem" }}>
                          <X size={12}/> Hapus foto
                        </button>
                      </div>
                    </>
                  ) : (
                    <div>
                      <ImagePlus size={32} style={{ color:"var(--text-muted)", marginBottom:"0.5rem" }} />
                      <div style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text-secondary)" }}>Klik atau seret foto ke sini</div>
                      <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginTop:"0.25rem" }}>JPG, PNG, WebP • Maks. 5MB</div>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => handleFotoChange(e.target.files[0])} />
              </div>

              {/* Deskripsi */}
              <div className="form-group" style={{ gridColumn:"1/-1" }}>
                <label className="form-label">Deskripsi Produk</label>
                <textarea value={form.deskripsi} onChange={e => setForm(f => ({...f, deskripsi:e.target.value}))} className="form-input" rows={3} placeholder="Tuliskan bahan, kandungan gizi, manfaat, atau informasi penting lainnya..." />
              </div>
            </div>

            {/* Kategori preview */}
            {KATEGORI_MAP[`${form.jenisHewan}-${form.tipeProduk}`] && (
              <div style={{ marginTop:"0.75rem", padding:"0.6rem 1rem", background:"rgba(249,115,22,0.07)", borderRadius:"var(--radius-md)", fontSize:"0.8rem", color:"var(--primary)", fontWeight:600 }}>
                📁 Kategori: {KATEGORI_MAP[`${form.jenisHewan}-${form.tipeProduk}`].label}
              </div>
            )}

            <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.25rem" }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving} style={{ minWidth:140 }}>
                {saving ? (
                  <span style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem" }}>
                    <span style={{ width:14, height:14, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }} />
                    Menyimpan...
                  </span>
                ) : (
                  <><Upload size={14}/> Simpan Produk</>
                )}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn btn-secondary btn-sm">Batal</button>
            </div>
          </form>
        )}

        {/* ── DAFTAR PRODUK ── */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>⏳ Memuat produk...</div>
        ) : produkList.length === 0 ? (
          <div style={{ textAlign:"center", padding:"4rem", color:"var(--text-muted)" }}>
            <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>📦</div>
            <h3>Belum Ada Produk</h3>
            <p style={{ marginBottom:"1rem" }}>Tambahkan produk pertama Anda agar pembeli bisa melihatnya!</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <Plus size={15}/> Tambah Produk Pertama
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            {produkList.map(p => (
              <div key={p.id}>
                {/* ── Card produk normal ── */}
                <div className="card" style={{ padding:"1rem", display:"flex", gap:"1rem", alignItems:"center",
                  border: editId === p.id ? "1px solid var(--secondary)" : "1px solid var(--border)",
                  borderRadius:"var(--radius-lg)", transition:"border-color 0.2s" }}>
                  {/* Foto */}
                  <div style={{ width:72, height:72, borderRadius:"var(--radius-md)", overflow:"hidden", flexShrink:0, background:"var(--bg-secondary)", border:"1px solid var(--border)" }}>
                    <img
                      src={getImageUrl(p.foto) || 'https://placehold.co/72x72/1C1C1C/666?text=No+Foto'}
                      alt={p.nama}
                      style={{ width:"100%", height:"100%", objectFit:"cover" }}
                      onError={e => { e.target.src = 'https://placehold.co/72x72/1C1C1C/666?text=No+Foto'; }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:"0.2rem" }}>{p.nama}</div>
                    {p.deskripsi && (
                      <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginBottom:"0.25rem",
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:380 }}>
                        {p.deskripsi}
                      </div>
                    )}
                    <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", alignItems:"center" }}>
                      <span className={`tag tag-${p.jenisHewan}`}>{p.jenisHewan === "kucing" ? "🐱" : "🐶"} {p.jenisHewan}</span>
                      <span className="badge badge-gray" style={{ fontSize:"0.65rem" }}>{p.tipeProduk}</span>
                      {p.beratGram > 0 && <span className="badge badge-gray" style={{ fontSize:"0.65rem" }}>{formatBerat(p.beratGram)}</span>}
                    </div>
                  </div>

                  {/* Harga & Stok */}
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontWeight:800, color:"var(--primary)" }}>{formatRupiah(p.hargaDiskon || p.harga)}</div>
                    {p.hargaDiskon && <div className="price-original" style={{ fontSize:"0.72rem" }}>{formatRupiah(p.harga)}</div>}
                    <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:"0.15rem" }}>Stok: {p.stok} • 🔥 {p.terjual} terjual</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:"flex", gap:"0.35rem", flexShrink:0 }}>
                    <button
                      className={editId === p.id ? "btn btn-secondary btn-sm" : "btn btn-sm"}
                      onClick={() => editId === p.id ? closeEdit() : openEdit(p)}
                      style={{ padding:"0.35rem 0.6rem", display:"flex", alignItems:"center", gap:"0.3rem",
                        background: editId === p.id ? "rgba(139,92,246,0.15)" : undefined,
                        border: editId === p.id ? "1px solid var(--secondary)" : undefined,
                        color: editId === p.id ? "var(--secondary)" : undefined,
                      }}
                      title={editId === p.id ? "Tutup edit" : "Edit produk"}
                    >
                      <Pencil size={13}/>
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)} style={{ padding:"0.35rem 0.6rem" }}
                      title="Hapus produk">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>

                {/* ── Panel edit inline (muncul di bawah card saat tombol edit diklik) ── */}
                {editId === p.id && (
                  <form onSubmit={handleSaveEdit} className="card" style={{
                    padding:"1.5rem",
                    marginTop:"0.25rem",
                    border:"1px solid var(--secondary)",
                    borderRadius:"var(--radius-lg)",
                    background:"rgba(139,92,246,0.04)",
                    animation:"fadeIn 0.2s ease",
                  }}>
                    {/* Header panel edit */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                        <Tag size={16} style={{ color:"var(--secondary)" }} />
                        <span style={{ fontWeight:700, fontSize:"0.95rem" }}>Edit Produk</span>
                        <span style={{ fontSize:"0.75rem", color:"var(--text-muted)", background:"var(--bg-secondary)", padding:"0.15rem 0.5rem", borderRadius:999 }}>
                          {p.nama}
                        </span>
                      </div>
                      <button type="button" onClick={closeEdit} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
                        <X size={16}/>
                      </button>
                    </div>

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.875rem" }}>
                      {/* Nama */}
                      <div className="form-group" style={{ gridColumn:"1/-1" }}>
                        <label className="form-label">Nama Produk <span style={{ color:"#F87171" }}>*</span></label>
                        <input required value={editForm.nama} onChange={e => setEditForm(f => ({...f, nama:e.target.value}))} className="form-input" placeholder="Nama produk" />
                      </div>

                      {/* ── Bagian LABEL/KATEGORI ── */}
                      <div className="form-group" style={{ gridColumn:"1/-1" }}>
                        <label className="form-label" style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                          <Tag size={13} style={{ color:"var(--secondary)" }} />
                          Label / Kategori Produk
                          <span style={{ fontSize:"0.7rem", color:"var(--secondary)", background:"rgba(139,92,246,0.1)", padding:"0.1rem 0.5rem", borderRadius:999, fontWeight:600 }}>
                            bisa diubah
                          </span>
                        </label>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
                          <div>
                            <label style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginBottom:"0.25rem", display:"block" }}>Jenis Hewan</label>
                            <select value={editForm.jenisHewan} onChange={e => setEditForm(f => ({...f, jenisHewan:e.target.value}))} className="form-input">
                              <option value="kucing">🐱 Kucing</option>
                              <option value="anjing">🐶 Anjing</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginBottom:"0.25rem", display:"block" }}>Jenis Produk</label>
                            <select value={editForm.tipeProduk} onChange={e => setEditForm(f => ({...f, tipeProduk:e.target.value}))} className="form-input">
                              {TIPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                        </div>
                        {/* Preview kategori baru */}
                        {KATEGORI_MAP[`${editForm.jenisHewan}-${editForm.tipeProduk}`] && (
                          <div style={{ marginTop:"0.5rem", padding:"0.5rem 0.85rem", background:"rgba(139,92,246,0.08)", borderRadius:"var(--radius-md)", fontSize:"0.78rem", color:"var(--secondary)", fontWeight:600, display:"flex", alignItems:"center", gap:"0.4rem" }}>
                            <Tag size={12}/> Kategori baru: {KATEGORI_MAP[`${editForm.jenisHewan}-${editForm.tipeProduk}`].label}
                            {(editForm.jenisHewan !== p.jenisHewan || editForm.tipeProduk !== p.tipeProduk) && (
                              <span style={{ background:"rgba(249,115,22,0.15)", color:"var(--primary)", padding:"0.1rem 0.45rem", borderRadius:999, fontSize:"0.65rem", fontWeight:700, marginLeft:"0.25rem" }}>
                                diubah dari: {getKatLabel(p.jenisHewan, p.tipeProduk)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Harga & Diskon */}
                      <div className="form-group">
                        <label className="form-label">Harga Normal (Rp) <span style={{ color:"#F87171" }}>*</span></label>
                        <input required type="number" value={editForm.harga} onChange={e => setEditForm(f => ({...f, harga:e.target.value}))} className="form-input" placeholder="45000" min="0" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Harga Diskon (Rp) <span style={{ color:"var(--text-muted)", fontWeight:400 }}>— kosongkan jika tidak ada</span></label>
                        <input type="number" value={editForm.hargaDiskon} onChange={e => setEditForm(f => ({...f, hargaDiskon:e.target.value}))} className="form-input" placeholder="38000" min="0" />
                      </div>

                      {/* Berat & Stok */}
                      <div className="form-group">
                        <label className="form-label">Berat (gram)</label>
                        <input type="number" value={editForm.beratGram} onChange={e => setEditForm(f => ({...f, beratGram:e.target.value}))} className="form-input" placeholder="1200" min="0" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Stok <span style={{ color:"#F87171" }}>*</span></label>
                        <input required type="number" value={editForm.stok} onChange={e => setEditForm(f => ({...f, stok:e.target.value}))} className="form-input" placeholder="50" min="0" />
                      </div>

                      {/* Deskripsi */}
                      <div className="form-group" style={{ gridColumn:"1/-1" }}>
                        <label className="form-label">Deskripsi Produk</label>
                        <textarea value={editForm.deskripsi} onChange={e => setEditForm(f => ({...f, deskripsi:e.target.value}))} className="form-input" rows={2} placeholder="Deskripsi produk..." />
                      </div>
                    </div>

                    <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.1rem" }}>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={savingEdit} style={{ minWidth:130, display:"flex", alignItems:"center", gap:"0.4rem" }}>
                        {savingEdit ? (
                          <>
                            <span style={{ width:13, height:13, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }} />
                            Menyimpan...
                          </>
                        ) : (
                          <><Save size={14}/> Simpan Perubahan</>
                        )}
                      </button>
                      <button type="button" onClick={closeEdit} className="btn btn-secondary btn-sm">Batal</button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
