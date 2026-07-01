import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * AdminGuard — proteksi route admin.
 * - Saat auth masih loading → tampil spinner (bukan layar hitam).
 * - Bukan admin → redirect ke /masuk secara synchronous (tanpa useEffect agar tidak ada flicker).
 */
export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();

  // Masih mengecek sesi — tampilkan loading screen ringan
  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        flexDirection: "column",
        gap: "1rem",
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: "3px solid rgba(139,92,246,0.2)",
          borderTopColor: "var(--secondary, #8B5CF6)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "var(--text-muted, #6B7280)", fontSize: "0.875rem" }}>
          Memeriksa sesi...
        </p>
      </div>
    );
  }

  // Belum login → redirect ke halaman masuk
  if (!user) {
    return <Navigate to="/masuk" state={{ from: "/admin", message: "Silakan login sebagai admin terlebih dahulu." }} replace />;
  }

  // Sudah login tapi bukan admin → kembali ke beranda
  if (user.peran !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Lolos semua cek → render konten admin
  return children;
}
