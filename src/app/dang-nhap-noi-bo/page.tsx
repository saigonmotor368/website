"use client";

import Image from "next/image";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type AuthMode = "login" | "forgot" | "reset";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlMode = searchParams.get("mode");
  const initialMode: AuthMode =
    urlMode === "reset" || urlMode === "forgot" ? (urlMode as AuthMode) : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");

  useEffect(() => {
    // Check for access_token or token in URL hash (Supabase auth redirect)
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && hash.includes("error=")) {
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        const errorCode = params.get("error_code");
        const description = params.get("error_description");
        setTimeout(() => {
          setRecoveryToken("");
          setMode("forgot");
          setError(
            errorCode === "otp_expired"
              ? "Liên kết khôi phục đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu một liên kết mới và chỉ mở liên kết trong email mới nhất."
              : description || "Liên kết khôi phục không hợp lệ. Vui lòng yêu cầu một liên kết mới."
          );
          window.history.replaceState(null, "", "/dang-nhap-noi-bo?mode=forgot");
        }, 0);
        return;
      }
      if (hash && hash.includes("access_token=")) {
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        const token = params.get("access_token");
        const type = params.get("type");
        if (token && (type === "recovery" || type === "invite")) {
          setTimeout(() => {
            setRecoveryToken(token);
            setMode("reset");
          }, 0);
        }
      }
    }
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Không thể đăng nhập.");
      }
      const requestedNext = searchParams.get("next");
      const nextUrl =
        requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
          ? requestedNext
          : "/quanly";
      router.replace(nextUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
      setLoading(false);
    }
  }

  async function handleForgot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Không thể gửi yêu cầu đặt lại mật khẩu.");
      }
      setMessage(result.message || "Vui lòng kiểm tra hộp thư email để lấy liên kết khôi phục.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xử lý yêu cầu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (password.length < 8) {
      setError("Mật khẩu mới phải có tối thiểu 8 ký tự.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, token: recoveryToken || undefined }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Không thể đặt lại mật khẩu.");
      }
      setMessage("Mật khẩu đã được cập nhật thành công! Anh/chị có thể đăng nhập ngay.");
      setTimeout(() => {
        setMode("login");
        setMessage("");
        window.history.replaceState(null, "", "/dang-nhap-noi-bo?next=%2Fquanly");
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "min(440px, 100%)",
        background: "#171c27",
        border: "1px solid #303744",
        borderRadius: 24,
        padding: 36,
        color: "white",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <Image src="/logo_sgm.png" alt="Saigon Motor" width={84} height={84} priority />
        <h1 style={{ color: "#d8aa55", marginTop: 12, fontSize: "1.45rem", fontWeight: 800 }}>
          {mode === "login" && "Cổng nội bộ SGM"}
          {mode === "forgot" && "Quên mật khẩu"}
          {mode === "reset" && "Thiết lập mật khẩu mới"}
        </h1>
        <p style={{ color: "#9aa4b2", marginTop: 6, fontSize: "0.88rem" }}>
          {mode === "login" && "Dành riêng cho nhân sự được phân quyền quản lý."}
          {mode === "forgot" && "Nhập email tài khoản để nhận liên kết khôi phục."}
          {mode === "reset" && "Nhập mật khẩu mới cho tài khoản nội bộ."}
        </p>
      </div>

      {mode === "login" && (
        <form onSubmit={handleLogin} noValidate>
          <label style={{ display: "grid", gap: 6, marginBottom: 16, fontSize: "0.88rem" }}>
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="nhanvien@saigonmotor.vn"
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #3d4656",
                background: "#0d1117",
                color: "white",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, marginBottom: 12, fontSize: "0.88rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Mật khẩu</span>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setMessage("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#d8aa55",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                Quên mật khẩu?
              </button>
            </div>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #3d4656",
                background: "#0d1117",
                color: "white",
              }}
            />
          </label>

          {error ? (
            <p role="alert" style={{ color: "#ff7b86", fontSize: "0.86rem", marginBottom: 14 }}>
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 13,
              border: 0,
              borderRadius: 10,
              background: "#d8aa55",
              color: "#151515",
              fontWeight: 800,
              cursor: loading ? "wait" : "pointer",
              marginTop: 8,
            }}
          >
            {loading ? "Đang xác thực..." : "Đăng nhập"}
          </button>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={handleForgot} noValidate>
          <label style={{ display: "grid", gap: 6, marginBottom: 18, fontSize: "0.88rem" }}>
            Email tài khoản
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nhanvien@saigonmotor.vn"
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #3d4656",
                background: "#0d1117",
                color: "white",
              }}
            />
          </label>

          {error ? (
            <p role="alert" style={{ color: "#ff7b86", fontSize: "0.86rem", marginBottom: 14 }}>
              {error}
            </p>
          ) : null}
          {message ? (
            <p role="status" style={{ color: "#69d8c3", fontSize: "0.86rem", marginBottom: 14 }}>
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 13,
              border: 0,
              borderRadius: 10,
              background: "#d8aa55",
              color: "#151515",
              fontWeight: 800,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Đang gửi..." : "Gửi liên kết khôi phục"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
            style={{
              width: "100%",
              marginTop: 12,
              padding: 10,
              background: "transparent",
              border: "1px solid #3d4656",
              borderRadius: 10,
              color: "#9aa4b2",
              cursor: "pointer",
              fontSize: "0.86rem",
            }}
          >
            ← Quay lại đăng nhập
          </button>
        </form>
      )}

      {mode === "reset" && (
        <form onSubmit={handleReset} noValidate>
          <label style={{ display: "grid", gap: 6, marginBottom: 14, fontSize: "0.88rem" }}>
            Mật khẩu mới (tối thiểu 8 ký tự)
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #3d4656",
                background: "#0d1117",
                color: "white",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, marginBottom: 16, fontSize: "0.88rem" }}>
            Xác nhận mật khẩu mới
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #3d4656",
                background: "#0d1117",
                color: "white",
              }}
            />
          </label>

          {error ? (
            <p role="alert" style={{ color: "#ff7b86", fontSize: "0.86rem", marginBottom: 14 }}>
              {error}
            </p>
          ) : null}
          {message ? (
            <p role="status" style={{ color: "#69d8c3", fontSize: "0.86rem", marginBottom: 14 }}>
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 13,
              border: 0,
              borderRadius: 10,
              background: "#d8aa55",
              color: "#151515",
              fontWeight: 800,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Đang lưu..." : "Cập nhật mật khẩu"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
            style={{
              width: "100%",
              marginTop: 12,
              padding: 10,
              background: "transparent",
              border: "1px solid #3d4656",
              borderRadius: 10,
              color: "#9aa4b2",
              cursor: "pointer",
              fontSize: "0.86rem",
            }}
          >
            ← Quay lại đăng nhập
          </button>
        </form>
      )}

      <div style={{ textAlign: "center", marginTop: 24, fontSize: "0.78rem", color: "#6c7687" }}>
        <Link href="/" style={{ color: "#9aa4b2", textDecoration: "underline" }}>
          Về trang chủ Saigon Motor
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0d1117",
        padding: 20,
      }}
    >
      <Suspense fallback={<div style={{ color: "white" }}>Đang tải...</div>}>
        <AuthForm />
      </Suspense>
    </main>
  );
}
