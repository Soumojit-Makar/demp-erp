import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeAPI } from '../../api';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Support', 'Management'];
const STATUSES = ['active', 'inactive', 'on-leave'];

const defaultForm = {
  name: '', email: '', phone: '', department: 'Engineering',
  designation: '', salary: '', joiningDate: '', status: 'active',
};

export default function EmployeeForm() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      employeeAPI.getOne(id)
        .then((res) => {
          const e = res.data.employee;
          setForm({
            name: e.name, email: e.email, phone: e.phone,
            department: e.department, designation: e.designation,
            salary: e.salary, joiningDate: e.joiningDate?.split('T')[0],
            status: e.status,
          });
        })
        .catch(() => toast.error('Failed to load employee'))
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['name', 'email', 'phone', 'department', 'designation', 'salary', 'joiningDate'];
    for (const field of required) {
      if (!form[field]) return toast.error(`Please fill in ${field}`);
    }
    setLoading(true);
    try {
      if (isEdit) {
        await employeeAPI.update(id, form);
        toast.success('Employee updated successfully');
      } else {
        await employeeAPI.create(form);
        toast.success('Employee added successfully');
      }
      navigate('/employees');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="page-header">
        <button onClick={() => navigate('/employees')} className="text-sm text-slate-500 hover:text-slate-300 transition-colors mb-3 flex items-center gap-1">
          ← Back to Employees
        </button>
        <h1 className="page-title">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>
        <p className="page-subtitle">{isEdit ? 'Update employee information' : 'Fill in the details to add a new employee'}</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="form-input" />
          </div>
          <div>
            <label className="form-label">Email Address *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@company.com" className="form-input" />
          </div>
          <div>
            <label className="form-label">Phone Number *</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1-555-000-0000" className="form-input" />
          </div>
          <div>
            <label className="form-label">Department *</label>
            <select name="department" value={form.department} onChange={handleChange} className="form-select">
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Designation *</label>
            <input name="designation" value={form.designation} onChange={handleChange} placeholder="Senior Engineer" className="form-input" />
          </div>
          <div>
            <label className="form-label">Monthly Salary ($) *</label>
            <input name="salary" type="number" value={form.salary} onChange={handleChange} placeholder="75000" className="form-input" min="0" />
          </div>
          <div>
            <label className="form-label">Joining Date *</label>
            <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">Status *</label>
            <select name="status" value={form.status} onChange={handleChange} className="form-select">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : isEdit ? 'Update Employee' : 'Add Employee'}
          </button>
          <button type="button" onClick={() => navigate('/employees')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
