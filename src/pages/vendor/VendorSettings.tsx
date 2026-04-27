import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { vendorDashApi, authApi } from "@/lib/api";
import { toast } from "sonner";

export default function VendorSettings() {
  const { user, setUserData } = useStore();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    vendorDashApi.store().then((d: any) => {
      setProfile(d.profile);
      setName(user?.name || "");
      setPhone(user?.phone || "");
    }).catch(() => {});
  }, [user]);

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
      toast.success("Password changed!"); setCurPw(""); setNewPw("");
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Store settings</h1>
      <div className="card-surface p-6"><h2 className="font-bold mb-5">Store information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Store name" value={profile?.storeName || ""} disabled />
          <Field label="Store slug" value={profile?.slug || ""} disabled />
          <Field label="Owner name" value={name} onChange={setName} />
          <Field label="Email" value={user?.email || ""} disabled />
          <Field label="Phone" value={phone} onChange={setPhone} />
        </div>
        <button onClick={saveProfile} disabled={busy} className="mt-4 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background disabled:opacity-50">Save changes</button>
      </div>
      <div className="card-surface p-6"><h2 className="font-bold mb-5">Security</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current password" type="password" value={curPw} onChange={setCurPw} />
          <Field label="New password" type="password" value={newPw} onChange={setNewPw} />
        </div>
        <button onClick={changePw} disabled={busy} className="mt-4 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background disabled:opacity-50">Update password</button>
      </div>
    </div>
  );
}
function Field({ label, value, onChange, type = "text", disabled }: { label: string; value?: string; onChange?: (v: string) => void; type?: string; disabled?: boolean }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span><input type={type} value={value || ""} onChange={e => onChange?.(e.target.value)} disabled={disabled} className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-foreground disabled:opacity-50" /></label>;
}
