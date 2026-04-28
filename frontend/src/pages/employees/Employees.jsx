import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../api';
import Table from '../../components/common/Table';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const deptColors = {
  Engineering: 'badge-blue',
  Sales: 'badge-green',
  Marketing: 'badge-purple',
  HR: 'badge-yellow',
  Finance: 'badge-amber',
  Operations: 'badge-gray',
  Support: 'badge-red',
  Management: 'badge-brand',
};

const statusBadge = {
  active: 'badge-green',
  inactive: 'badge-red',
  'on-leave': 'badge-yellow',
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin, canManage } = useAuth();
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.getAll({ search, department: deptFilter });
      setEmployees(res.data.employees);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [search, deptFilter]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeAPI.delete(deleteTarget._id);
      toast.success('Employee deleted successfully');
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">{val?.charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium text-slate-100">{val}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (val) => <span className={`badge ${deptColors[val] || 'badge-gray'}`}>{val}</span>,
    },
    { key: 'designation', label: 'Designation' },
    {
      key: 'salary',
      label: 'Salary',
      render: (val) => <span className="font-mono text-slate-300">${val?.toLocaleString()}</span>,
    },
    {
      key: 'joiningDate',
      label: 'Joined',
      render: (val) => <span className="text-slate-400">{new Date(val).toLocaleDateString()}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <span className={statusBadge[val]}>{val}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={() => navigate(`/employees/${row._id}/edit`)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/40 transition-all"
            >
              Edit
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setDeleteTarget(row)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 transition-all"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">HR & Employees</h1>
          <p className="page-subtitle">{employees.length} employees found</p>
        </div>
        {canManage && (
          <button onClick={() => navigate('/employees/new')} className="btn-primary">
            <span>+</span> Add Employee
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, email, designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input max-w-sm"
        />
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="form-select max-w-xs"
        >
          <option value="">All Departments</option>
          {['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Support', 'Management'].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {(search || deptFilter) && (
          <button onClick={() => { setSearch(''); setDeptFilter(''); }} className="btn-secondary">
            Clear Filters
          </button>
        )}
      </div>

      <Table columns={columns} data={employees} loading={loading} emptyMessage="No employees found" />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete Employee"
      />
    </div>
  );
}
