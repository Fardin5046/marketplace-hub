import { useState } from "react";
import { useStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function Settings() {
  const { user, setUserData } = useStore();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);

  const saveProfile = async () => {
    setBusy(true);
    try {
      const d: any = await authApi.updateProfile({ name, phone });
      setUserData(d.user);
      toast.success("Profile updated!");
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const changePw = async () => {
    if (!curPw || !newPw) { toast.error("Both fields required."); return; }
    setBusy(true);
    try {
      await authApi.changePassword({ currentPassword: curPw, newPassword: newPw });
      toast.success("Password changed!");
      setCurPw(""); setNewPw("");
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
      <Card title="Personal information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={name} onChange={setName} />
          <Field label="Email" value={user?.email || ""} onChange={() => {}} disabled />
          <Field label="Phone" value={phone} onChange={setPhone} />
        </div>
        <button onClick={saveProfile} disabled={busy} className="mt-4 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background disabled:opacity-50">Save changes</button>
      </Card>
      <Card title="Notifications">
        <Toggle label="Order updates" desc="Get notified about shipping and delivery" defaultChecked />
        <Toggle label="Promotions & deals" desc="Weekly digest of sales and new arrivals" defaultChecked />
        <Toggle label="Vendor announcements" desc="When vendors you've bought from post news" />
      </Card>
      <Card title="Security">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current password" type="password" value={curPw} onChange={setCurPw} />
          <Field label="New password" type="password" value={newPw} onChange={setNewPw} />
        </div>
        <button onClick={changePw} disabled={busy} className="mt-4 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background disabled:opacity-50">Update password</button>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="card-surface p-6"><h2 className="font-bold mb-5">{title}</h2>{children}</div>;
}
function Field({ label, value, onChange, type = "text", disabled }: { label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-foreground disabled:opacity-50" />
    </label>
  );
}
function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0 cursor-pointer">
      <div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <input type="checkbox" defaultChecked={defaultChecked} className="h-5 w-9 appearance-none rounded-full bg-muted checked:bg-foreground transition relative before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-background before:transition-transform checked:before:translate-x-4" />
    </label>
  );
}
