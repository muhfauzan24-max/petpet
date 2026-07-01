/**
 * AuthGuard — mencegah layar hitam saat auth masih loading.
 * 
 * Pola: tampilkan full-screen loading overlay hingga AuthContext
 * selesai membaca token dari sessionStorage, setelah itu baru render children.
 * 
 * Digunakan di App.jsx untuk membungkus SELURUH Routes — bukan hanya admin route.
 * AdminGuard tetap menggunakan Navigate redirect untuk proteksi per-route.
 */
import { useAuth } from "../../context/AuthContext";

export default function AuthLoadingGuard({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-primary, #0F0F0F)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        zIndex: 9999,
      }}>
        {/* Logo animasi */}
        <div style={{
          width: 56,
          height: 56,
          background: "linear-gradient(135deg, var(--primary, #F97316), #F59E0B)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.75rem",
          boxShadow: "0 0 30px rgba(249,115,22,0.4)",
          animation: "float 2s ease-in-out infinite",
        }}>
          🐾
        </div>

        {/* Spinner */}
        <div style={{
          width: 36,
          height: 36,
          border: "3px solid rgba(249,115,22,0.15)",
          borderTopColor: "var(--primary, #F97316)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />

        <p style={{
          color: "var(--text-muted, #71717A)",
          fontSize: "0.8rem",
          fontWeight: 500,
          letterSpacing: "0.05em",
        }}>
          Memuat sesi...
        </p>
      </div>
    );
  }

  return children;
}
