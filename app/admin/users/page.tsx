'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useLang } from '@/app/i18n/LangContext';
import type { AdminUser, Plan } from '@/types';

interface AdminPerm { key: string; label: string; is_enabled: boolean }

const roleVariant: Record<string, 'red' | 'purple' | 'blue'> = {
  admin: 'red', coach: 'purple', client: 'blue',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { t } = useLang();

  const TABS = [
    { value: '', label: t.admin_users_tab_all },
    { value: 'client', label: t.admin_users_tab_clients },
    { value: 'coach', label: t.admin_users_tab_coaches },
    { value: 'admin', label: t.admin_users_tab_admins },
  ];

  const roleLabel: Record<string, string> = {
    admin: t.admin_users_role_admin,
    coach: t.admin_users_role_coach,
    client: t.admin_users_role_client,
  };

  // create
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', full_name: '', password: '', role: 'client', is_super_admin: false, plan_id: '' as number | '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // edit
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editPlanId, setEditPlanId] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  // reset password
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');

  // admin perms
  const [permUser, setPermUser] = useState<AdminUser | null>(null);
  const [adminPerms, setAdminPerms] = useState<AdminPerm[]>([]);
  const [permIsSuperAdmin, setPermIsSuperAdmin] = useState(false);
  const [permLoading, setPermLoading] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);

  useEffect(() => {
    apiFetch<{ id: number; is_super_admin: boolean }>('/auth/me')
      .then(d => setIsSuperAdmin(!!d.is_super_admin))
      .catch(() => {});
    apiFetch<{ plans: Plan[] }>('/admin/plans')
      .then(d => setPlans(d.plans ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchUsers(roleFilter); }, [roleFilter]);

  const fetchUsers = (role = '') => {
    setLoading(true);
    apiFetch<{ users: AdminUser[]; total: number }>(`/admin/users${role ? `?role=${role}` : ''}`)
      .then(d => { setUsers(d.users); setTotal(d.total); })
      .finally(() => setLoading(false));
  };

  const createUser = async () => {
    setCreateError('');
    setCreating(true);
    try {
      const body: Record<string, unknown> = {
        email: createForm.email, full_name: createForm.full_name || undefined,
        password: createForm.password, role: createForm.role,
      };
      if (createForm.role === 'admin') body.is_super_admin = createForm.is_super_admin;
      if (createForm.plan_id !== '') body.plan_id = createForm.plan_id;
      await apiFetch('/admin/users/create', { method: 'POST', body });
      setShowCreate(false);
      setCreateForm({ email: '', full_name: '', password: '', role: 'client', is_super_admin: false, plan_id: '' });
      fetchUsers(roleFilter);
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : t.error_generic);
    } finally {
      setCreating(false);
    }
  };

  const saveUser = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await apiFetch(`/admin/users/${editUser.id}`, {
        method: 'PATCH',
        body: { role: editUser.role, is_active: editUser.is_active, full_name: editUser.full_name },
      });
      if (editPlanId !== '' && editPlanId !== editUser.plan_id) {
        await apiFetch(`/admin/users/${editUser.id}/subscription`, {
          method: 'POST', body: { plan_id: editPlanId },
        });
      }
      setEditUser(null);
      fetchUsers(roleFilter);
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async () => {
    if (!resetUser) return;
    setResetError('');
    setResetting(true);
    try {
      await apiFetch(`/admin/users/${resetUser.id}/reset-password`, {
        method: 'POST', body: { new_password: newPassword },
      });
      setResetUser(null);
      setNewPassword('');
    } catch (e: unknown) {
      setResetError(e instanceof Error ? e.message : t.error_generic);
    } finally {
      setResetting(false);
    }
  };

  const openPerms = (user: AdminUser) => {
    setPermUser(user);
    setPermLoading(true);
    apiFetch<{ permissions: AdminPerm[]; is_super_admin: boolean }>(`/admin/users/${user.id}/admin-permissions`)
      .then(d => { setAdminPerms(d.permissions ?? []); setPermIsSuperAdmin(d.is_super_admin); })
      .finally(() => setPermLoading(false));
  };

  const savePerms = async () => {
    if (!permUser) return;
    setSavingPerms(true);
    try {
      await apiFetch(`/admin/users/${permUser.id}/admin-permissions`, {
        method: 'PATCH',
        body: { is_super_admin: permIsSuperAdmin, permissions: adminPerms.map(p => ({ key: p.key, is_enabled: p.is_enabled })) },
      });
      setPermUser(null);
      fetchUsers(roleFilter);
    } finally {
      setSavingPerms(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t.admin_users_title}</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.admin_users_total(total)}</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setCreateError(''); }}>{t.admin_users_add}</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[var(--color-deep)] border border-[var(--color-border)] rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setRoleFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              roleFilter === tab.value
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-[#020510] font-bold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-deep)] text-[var(--color-text-muted)]">
                <th className="px-4 py-3 text-right">{t.admin_users_col_user}</th>
                <th className="px-4 py-3 text-center">{t.admin_users_col_role}</th>
                <th className="px-4 py-3 text-center">{t.admin_users_col_plan}</th>
                <th className="px-4 py-3 text-center">{t.admin_users_col_status}</th>
                <th className="px-4 py-3 text-center">{t.admin_users_col_date}</th>
                <th className="px-4 py-3 text-center">{t.admin_users_col_actions}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t border-[var(--color-border)] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {user.full_name || '—'}
                      {user.is_super_admin && (
                        <Badge variant="yellow" className="mr-2 text-[10px]">{t.admin_users_super_badge}</Badge>
                      )}
                    </p>
                    <p className="text-[var(--color-text-muted)] text-xs mt-0.5">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={roleVariant[user.role]}>{roleLabel[user.role]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.plan_name ? (
                      <span className="text-xs font-bold text-[var(--color-cyan)]">{user.plan_name}</span>
                    ) : (
                      <span className="text-[var(--color-text-muted)] text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={user.is_active ? 'green' : 'red'} dot>
                      {user.is_active ? t.active : t.inactive}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--color-text-muted)] text-xs">
                    {new Date(user.created_at).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <Button variant="ghost" size="icon-sm" onClick={() => { setEditUser({ ...user }); setEditPlanId(user.plan_id ?? ''); }}>✏️</Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => { setResetUser(user); setNewPassword(''); setResetError(''); }}>🔑</Button>
                      {isSuperAdmin && user.role === 'admin' && (
                        <Button variant="ghost" size="icon-sm" onClick={() => openPerms(user)}>🛡️</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{t.admin_users_create_title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input label={t.email} type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} placeholder="example@email.com" dir="ltr" />
            <Input label={t.admin_users_full_name_optional} value={createForm.full_name} onChange={e => setCreateForm({ ...createForm, full_name: e.target.value })} />
            <Input label={t.password} type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} placeholder={t.password_min} />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-muted)]">{t.admin_users_role_label}</label>
              <Select value={createForm.role} onValueChange={v => setCreateForm({ ...createForm, role: v, is_super_admin: false })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">{t.admin_users_role_client}</SelectItem>
                  <SelectItem value="coach">{t.admin_users_role_coach}</SelectItem>
                  <SelectItem value="admin">{t.admin_users_role_admin}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {createForm.role === 'admin' && isSuperAdmin && (
              <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3">
                <span className="text-sm text-[var(--color-text-secondary)]">{t.admin_users_role_super_admin}</span>
                <Switch checked={createForm.is_super_admin} onCheckedChange={v => setCreateForm({ ...createForm, is_super_admin: v })} />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-muted)]">{t.admin_users_plan_sub_optional}</label>
              <Select value={String(createForm.plan_id)} onValueChange={v => setCreateForm({ ...createForm, plan_id: v === '' ? '' : Number(v) })}>
                <SelectTrigger><SelectValue placeholder={t.admin_users_no_plan} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t.admin_users_no_plan}</SelectItem>
                  {plans.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {createError && <p className="text-xs text-[var(--color-danger)]">{createError}</p>}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>{t.cancel}</Button>
            <Button onClick={createUser} loading={creating}>{t.admin_users_create_btn}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editUser} onOpenChange={open => { if (!open) setEditUser(null); }}>
        <DialogContent size="md">
          <DialogHeader><DialogTitle>{t.admin_users_edit_title}</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <Input label={t.admin_users_full_name} value={editUser.full_name || ''} onChange={e => setEditUser({ ...editUser, full_name: e.target.value })} />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-text-muted)]">{t.admin_users_role_label}</label>
                <Select value={editUser.role} onValueChange={v => setEditUser({ ...editUser, role: v as AdminUser['role'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">{t.admin_users_role_client}</SelectItem>
                    <SelectItem value="coach">{t.admin_users_role_coach}</SelectItem>
                    <SelectItem value="admin">{t.admin_users_role_admin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-text-muted)]">{t.admin_users_plan_sub}</label>
                <Select value={String(editPlanId)} onValueChange={v => setEditPlanId(v === '' ? '' : Number(v))}>
                  <SelectTrigger><SelectValue placeholder={t.admin_users_no_change} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t.admin_users_no_change}</SelectItem>
                    {plans.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {editUser.plan_name && <p className="text-xs text-[var(--color-text-muted)]">{t.admin_users_current_plan(editUser.plan_name)}</p>}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3">
                <span className="text-sm text-[var(--color-text-secondary)]">{t.admin_users_account_status}</span>
                <Switch checked={editUser.is_active} onCheckedChange={v => setEditUser({ ...editUser, is_active: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditUser(null)}>{t.cancel}</Button>
            <Button onClick={saveUser} loading={saving}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={!!resetUser} onOpenChange={open => { if (!open) setResetUser(null); }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{t.admin_users_reset_pw_title}</DialogTitle>
          </DialogHeader>
          {resetUser && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-text-muted)]">{resetUser.email}</p>
              <Input label={t.admin_users_new_password} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t.password_min} />
              {resetError && <p className="text-xs text-[var(--color-danger)]">{resetError}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setResetUser(null)}>{t.cancel}</Button>
            <Button variant="danger" onClick={resetPassword} loading={resetting}>{t.admin_users_reset_pw_btn}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Permissions Modal */}
      <Dialog open={!!permUser} onOpenChange={open => { if (!open) setPermUser(null); }}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{t.admin_users_perms_title}</DialogTitle>
          </DialogHeader>
          {permUser && (
            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-5">{permUser.email}</p>
              {permLoading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-[var(--color-warning)]">{t.admin_users_role_super_admin}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t.admin_users_super_desc}</p>
                    </div>
                    <Switch checked={permIsSuperAdmin} onCheckedChange={setPermIsSuperAdmin} />
                  </div>
                  {!permIsSuperAdmin && adminPerms.map(p => (
                    <div key={p.key} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3">
                      <p className="text-sm text-[var(--color-text-secondary)]">{p.label}</p>
                      <Switch
                        checked={p.is_enabled}
                        onCheckedChange={v => setAdminPerms(prev => prev.map(x => x.key === p.key ? { ...x, is_enabled: v } : x))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPermUser(null)}>{t.cancel}</Button>
            <Button onClick={savePerms} loading={savingPerms}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
