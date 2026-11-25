import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { Building2, Plus, Users, BookOpen, Trash2 } from 'lucide-react';

const DepartmentManagement = () => {
  const { isAdmin } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '', head_name: '' });
  const [saving, setSaving] = useState(false);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await departmentService.getAll();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to load departments.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await departmentService.create(form);
      setBanner({ type: 'success', message: 'Department created successfully.' });
      setIsModalOpen(false);
      setForm({ code: '', name: '', description: '', head_name: '' });
      loadDepartments();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to create department.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await departmentService.delete(id);
      setBanner({ type: 'success', message: 'Department deleted.' });
      loadDepartments();
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to delete department.' });
    }
  };

  return (
    <div>
      {banner && <AlertBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
            Academic Departments
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--slate-500)', marginTop: '4px' }}>
            Manage institutional faculties, department codes, and department leadership
          </p>
        </div>

        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading departments..." />
      ) : (
        <div className="grid-3" style={{ gap: '20px' }}>
          {departments.map((d) => (
            <div key={d.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#eef2ff',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '13px'
                }}>
                  {d.code}
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(d.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{d.name}</h3>
                <span style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
                  Head: <strong>{d.head_name || 'Dr. Department Chair'}</strong>
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--slate-600)', lineHeight: 1.5, flex: 1 }}>
                {d.description || 'Offers undergraduate and postgraduate degree specializations.'}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9',
                fontSize: '12.5px',
                color: 'var(--slate-600)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Users size={14} color="var(--primary)" />
                  <strong>{d.student_count || 0}</strong> Students
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <BookOpen size={14} color="#059669" />
                  <strong>{d.course_count || 0}</strong> Courses
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add Academic Department"
        maxWidth="500px"
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Department Code *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. CSE" 
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Computer Science & Engineering" 
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Head of Department (Chair)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Dr. Alan Turing" 
              value={form.head_name}
              onChange={(e) => setForm({ ...form, head_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea" 
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Add Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
