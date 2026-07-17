'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface Tag {
  id: string;
  label: string | null;
  isActive: boolean;
  registeredAt: Date;
  lastUsedAt: Date | null;
}

interface NfcManagerProps {
  branchId: string;
  branchName: string;
  restaurantName: string;
  nfcEnabled: boolean;
  tags: Tag[];
}

export function NfcManager({ branchId, branchName, restaurantName, nfcEnabled, tags: initialTags }: NfcManagerProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [uid, setUid] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function registerTag() {
    if (!uid.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/checkin/nfc-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId, uid: uid.trim(), label: label.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Registration failed.');
      } else {
        setSuccess(`Tag registered (ID: ${data.tagId})`);
        setUid('');
        setLabel('');
        // Add placeholder to list (full list refreshes on next page load)
        setTags((prev) => [...prev, { id: data.tagId, label: label || null, isActive: true, registeredAt: new Date(), lastUsedAt: null }]);
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  async function deactivateTag(tagId: string) {
    try {
      await fetch(`/api/checkin/nfc-tags?tagId=${tagId}`, { method: 'DELETE' });
      setTags((prev) => prev.map((t) => (t.id === tagId ? { ...t, isActive: false } : t)));
    } catch {
      /* ignore */
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{branchName}</p>
          <p className="text-xs text-gray-400">{restaurantName}</p>
        </div>
        {!nfcEnabled && (
          <Badge variant="yellow">NFC disabled in settings</Badge>
        )}
      </div>

      {/* Registration form */}
      <div className="space-y-3 border-t border-gray-100 pt-4">
        <p className="text-sm font-medium text-gray-700">Register New Tag</p>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-40">
            <Input
              placeholder="NFC UID (e.g. 04A3B2C1)"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-32">
            <Input
              placeholder="Label (optional)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={registerTag} isLoading={loading} disabled={!uid.trim()}>
            Register
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
      </div>

      {/* Tags list */}
      {tags.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-700">Registered Tags ({tags.length})</p>
          {tags.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{t.label ?? t.id.slice(0, 8) + '…'}</p>
                <p className="text-xs text-gray-400">
                  Registered: {new Date(t.registeredAt).toLocaleDateString()}
                  {t.lastUsedAt && ` · Last used: ${new Date(t.lastUsedAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={t.isActive ? 'green' : 'gray'}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
                {t.isActive && (
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => deactivateTag(t.id)}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
