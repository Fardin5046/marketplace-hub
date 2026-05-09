import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Shield, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export default function AdminLogin() {
  const { signIn, signOut } = useStore();
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("admin@marketly.com");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) { toast.error("Please enter credentials."); return; }
    setBusy(true);
    try {
      const data = await signIn(email, pw);
      if (data.user?.role !== "admin") {
        toast.error("Not an admin account.");
        await signOut();
        return;
      }
      toast.success("Welcome, Admin!");
      nav("/admin");
    } catch (err: any) { toast.error(err.message || "Login failed."); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-foreground p-6">
      <div className="w-full max-w-md card-surface bg-card p-8 sm:p-10">
        <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-accent" /><span className="text-sm font-bold uppercase tracking-wider">Admin portal</span></div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Sign in to console</h1>
        <p className="mt-2 text-sm text-muted-foreground">Authorized personnel only. All sessions are logged.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-foreground" /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</span>
            <div className="relative"><input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Enter admin password" className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 text-sm outline-none focus:border-foreground" />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-4 top-3.5 text-muted-foreground">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-accent-foreground disabled:opacity-50">{busy ? "Signing in…" : "Sign in"} <ArrowRight className="h-4 w-4" /></button>
        </form>
        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground hover:text-foreground">← Back to marketplace</Link>
      </div>
    </div>
  );
}
