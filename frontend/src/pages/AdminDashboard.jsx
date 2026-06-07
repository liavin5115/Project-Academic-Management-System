import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../lib/api';
import { Users, Shield, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  if (!user || !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            {t('admin.title')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{t('admin.users')} & System Management</p>
        </div>
      </div>

      {/* User Table */}
      <div className="glass-card overflow-hidden border border-slate-700/50">
        <div className="p-6 border-b border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            {t('admin.users')}
          </h2>
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-medium rounded-full border border-indigo-500/20">
            {users.length} Total
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">{t('admin.table.username')}</th>
                  <th className="p-4 font-medium">{t('admin.table.email')}</th>
                  <th className="p-4 font-medium">{t('admin.table.role')}</th>
                  <th className="p-4 font-medium">{t('admin.table.joined')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                          <span className="text-sm font-medium text-slate-300">
                            {u.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-white">{u.username}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">{u.email}</td>
                    <td className="p-4">
                      {u.is_admin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                          <Shield className="w-3.5 h-3.5" />
                          {t('admin.role.admin')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t('admin.role.user')}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {users.length === 0 && !loading && (
             <div className="p-8 text-center text-slate-400">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
