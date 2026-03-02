import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiUsers, FiPlus, FiEdit, FiTrash2, FiUserX, FiUserCheck } from 'react-icons/fi';

const roleMap = { ADMIN: 'مدير النظام', BRANCH_MANAGER: 'مدير فرع', CASHIER: 'كاشير', WAREHOUSE: 'موظف مخزن', VIEWER: 'مشاهد' };
const roleClass = { ADMIN: 'badge-danger', BRANCH_MANAGER: 'badge-info', CASHIER: 'badge-success', WAREHOUSE: 'badge-warning', VIEWER: 'badge-gray' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'VIEWER', branchId: '' });

  useEffect(() => { loadUsers(); loadBranches(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try { const { data } = await api.get('/users'); setUsers(data.data || []); }
    catch (err) { toast.error('خطأ في التحميل'); }
    finally { setLoading(false); }
  };

  const loadBranches = async () => {
    try { const { data } = await api.get('/branches'); setBranches(data.data || []); } catch (_) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password;
        await api.put(`/users/${editId}`, updateData);
        toast.success('تم تحديث المستخدم');
      } else {
        await api.post('/auth/register', form);
        toast.success('تم إنشاء المستخدم');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', email: '', password: '', phone: '', role: 'VIEWER', branchId: '' });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ');
    }
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setForm({ name: user.name, email: user.email, password: '', phone: user.phone || '', role: user.role, branchId: user.branch?.id || '' });
    setShowForm(true);
  };

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { isActive: !user.isActive });
      toast.success(user.isActive ? 'تم تعطيل المستخدم' : 'تم تفعيل المستخدم');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FiUsers /> المستخدمين</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', email: '', password: '', phone: '', role: 'VIEWER', branchId: '' }); }} className="btn-primary flex items-center gap-2"><FiPlus /> مستخدم جديد</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-bold">{editId ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">الاسم *</label><input type="text" className="input-field" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1">البريد الإلكتروني *</label><input type="email" className="input-field" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1">كلمة المرور {editId ? '(اتركها فارغة إن لم ترد التغيير)' : '*'}</label><input type="password" className="input-field" required={!editId} minLength="6" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1">الهاتف</label><input type="text" className="input-field" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1">الدور *</label>
              <select className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="ADMIN">مدير النظام</option><option value="BRANCH_MANAGER">مدير فرع</option><option value="CASHIER">كاشير</option><option value="WAREHOUSE">موظف مخزن</option><option value="VIEWER">مشاهد</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">الفرع</label>
              <select className="input-field" value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))}>
                <option value="">بدون فرع</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editId ? 'تحديث' : 'إنشاء'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary">إلغاء</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">البريد الإلكتروني</th>
              <th className="p-3 text-right">الدور</th>
              <th className="p-3 text-right">الفرع</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-400">جاري التحميل...</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3 text-sm text-gray-500">{user.email}</td>
                <td className="p-3"><span className={`badge ${roleClass[user.role]}`}>{roleMap[user.role]}</span></td>
                <td className="p-3">{user.branch?.name || '-'}</td>
                <td className="p-3"><span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>{user.isActive ? 'نشط' : 'معطل'}</span></td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(user)} className="text-primary-600 hover:text-primary-800"><FiEdit size={16} /></button>
                    <button onClick={() => handleToggleActive(user)} className={user.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}>
                      {user.isActive ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
