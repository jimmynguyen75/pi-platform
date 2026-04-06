import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { patch, post, get } from '../../api/client';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';
import type { AuthUser } from '../../types';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  title?: string;
  avatarUrl?: string;
}

function compressImage(file: File, maxSize = 200, quality = 0.75): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onerror = rej;
    reader.onload = () => {
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        res(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function AccountPage() {
  const { user, setAuth } = useAppStore();
  const qc = useQueryClient();
  const token = useAppStore(s => s.token)!;

  const { data: profile } = useQuery<ProfileData>({
    queryKey: ['me'],
    queryFn: () => get('/auth/me'),
  });

  // Profile form
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileDirty, setProfileDirty] = useState(false);

  // Sync form when profile loads (only once)
  const [synced, setSynced] = useState(false);
  if (profile && !synced) {
    setName(profile.name);
    setTitle(profile.title ?? '');
    setAvatarUrl(profile.avatarUrl ?? '');
    setSynced(true);
  }

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const profileMut = useMutation({
    mutationFn: () => patch<ProfileData>('/auth/me', { name, title, avatarUrl }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['me'] });
      // Update store so header reflects changes immediately
      setAuth({ ...user!, name: data.name, title: data.title, avatarUrl: data.avatarUrl } as AuthUser, token);
      setProfileDirty(false);
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await compressImage(file);
    setAvatarUrl(b64);
    setProfileDirty(true);
  };

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwError, setPwError] = useState('');

  const pwMut = useMutation({
    mutationFn: () => post<{ success: boolean }>('/auth/change-password', {
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
    }),
    onSuccess: () => {
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPwError('');
    },
    onError: (e: any) => {
      setPwError(e?.response?.data?.message ?? 'Failed to change password');
    },
  });

  const handlePwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }
    setPwError('');
    pwMut.mutate();
  };

  const initials = (name || user?.name || '?')[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your profile and security settings</p>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <User size={16} className="text-indigo-500" />
            <h2 className="font-semibold text-gray-800">Profile Information</h2>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Profile Photo</p>
              <p className="text-xs text-gray-400 mt-0.5">Click the avatar to upload a photo</p>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Change photo
              </button>
              {avatarUrl && (
                <button
                  onClick={() => { setAvatarUrl(''); setProfileDirty(true); }}
                  className="mt-2 ml-3 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setProfileDirty(true); }}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label>Job Title</Label>
              <Input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setProfileDirty(true); }}
                placeholder="e.g. Partnership Manager"
              />
            </div>
          </div>

          {/* Read-only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input value={profile?.email ?? ''} disabled className="opacity-60" />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={profile?.role ?? ''} disabled className="opacity-60 capitalize" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => profileMut.mutate()}
              disabled={!profileDirty}
              loading={profileMut.isPending}
            >
              <Save size={14} className="mr-1.5" />Save Changes
            </Button>
          </div>

          {profileMut.isSuccess && (
            <p className="text-sm text-green-600 text-center">Profile updated successfully!</p>
          )}
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} className="text-indigo-500" />
            <h2 className="font-semibold text-gray-800">Change Password</h2>
          </div>

          <form onSubmit={handlePwSubmit} className="space-y-4">
            {[
              { key: 'currentPassword', label: 'Current Password', show: showPw.current, toggle: () => setShowPw(s => ({ ...s, current: !s.current })) },
              { key: 'newPassword',     label: 'New Password',     show: showPw.new,     toggle: () => setShowPw(s => ({ ...s, new: !s.new })) },
              { key: 'confirm',         label: 'Confirm New Password', show: showPw.confirm, toggle: () => setShowPw(s => ({ ...s, confirm: !s.confirm })) },
            ].map(({ key, label, show, toggle }) => (
              <div key={key}>
                <Label>{label}</Label>
                <div className="relative">
                  <Input
                    type={show ? 'text' : 'password'}
                    value={(pwForm as any)[key]}
                    onChange={(e) => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}

            {pwError && <p className="text-sm text-red-500">{pwError}</p>}
            {pwMut.isSuccess && <p className="text-sm text-green-600">Password changed successfully!</p>}

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={pwMut.isPending}
                disabled={!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirm}
              >
                <Lock size={14} className="mr-1.5" />Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
