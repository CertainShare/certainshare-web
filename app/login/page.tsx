"use client";

import { useState } from "react";
import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // IMPORTANT: we need to confirm the backend response structure
      const token = res.token;

      if (!token) {
        throw new Error("No token returned from server");
      }

      localStorage.setItem("token", token);

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 30, maxWidth: 400 }}>
      <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Login</h1>

      <form onSubmit={handleLogin} style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 5 }}
            type="email"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 5 }}
            type="password"
          />
        </div>

        {error && (
          <p style={{ color: "red", marginBottom: 12 }}>Error: {error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            width: "100%",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}