import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  IndianRupee, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Skeleton from '../components/UI/Skeleton';
import authFetch from '../utils/authFetch';

const API_URL = process.env.REACT_APP_API_URL || "https://vastuzone-backend.onrender.com";

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await authFetch(`${API_URL}/api/admin/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    }
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await authFetch(`${API_URL}/api/admin/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      const res = await authFetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-stats']);
      toast.success("User role updated successfully");
    },
    onError: () => toast.error("Failed to update user role")
  });

  if (statsLoading || usersLoading) {
    return (
      <div className="admin-page">
        <Navbar />
        <div className="container section-padding">
          <Skeleton className="h-12 w-1/4 mb-12" />
          <div className="stats-grid mb-12">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Navbar />
      <main className="container section-padding">
        <header className="admin-header mb-12">
          <h1 className="serif">System Administration</h1>
          <p className="text-muted">Global overview and user management control panel.</p>
        </header>

        <section className="stats-grid mb-12">
          <div className="stat-card-lux">
            <div className="icon-box"><Users size={24} /></div>
            <div className="stat-info">
              <label>Total Users</label>
              <h3>{stats?.users}</h3>
            </div>
          </div>
          <div className="stat-card-lux">
            <div className="icon-box"><UserCheck size={24} /></div>
            <div className="stat-info">
              <label>Active Experts</label>
              <h3>{stats?.experts}</h3>
            </div>
          </div>
          <div className="stat-card-lux">
            <div className="icon-box"><Calendar size={24} /></div>
            <div className="stat-info">
              <label>Total Consultations</label>
              <h3>{stats?.appointments}</h3>
            </div>
          </div>
          <div className="stat-card-lux highlight">
            <div className="icon-box"><IndianRupee size={24} /></div>
            <div className="stat-info">
              <label>Total Revenue</label>
              <h3>₹{stats?.revenue?.toLocaleString()}</h3>
            </div>
          </div>
        </section>

        <section className="user-management-section">
          <div className="section-header mb-6">
            <h2 className="serif">User Directory</h2>
          </div>
          <div className="table-container-lux">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Joined Date</th>
                  <th>Current Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`role-tag ${user.role}`}>{user.role}</span>
                    </td>
                    <td>
                      <div className="action-row">
                        <select 
                          value={user.role} 
                          onChange={(e) => updateRoleMutation.mutate({ userId: user._id, newRole: e.target.value })}
                          className="role-select"
                        >
                          <option value="user">User</option>
                          <option value="expert">Expert</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <style>{`
        .admin-page { background: var(--paper); min-height: 100vh; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 30px; }
        .stat-card-lux { background: white; padding: 30px; border: 1px solid var(--stone); border-radius: 4px; display: flex; align-items: center; gap: 20px; }
        .stat-card-lux.highlight { background: var(--ink); color: var(--paper); border: none; }
        .stat-card-lux.highlight .icon-box { background: rgba(255,255,255,0.1); color: var(--brass); }
        .stat-card-lux.highlight .stat-info label { color: rgba(255,255,255,0.6); }
        
        .icon-box { width: 50px; height: 50px; background: var(--stone); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--brass); }
        .stat-info label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 700; }
        .stat-info h3 { font-size: 2rem; margin: 0; font-family: 'Instrument Serif', serif; }

        .table-container-lux { background: white; border: 1px solid var(--stone); border-radius: 4px; overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { padding: 20px; background: var(--stone); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
        .admin-table td { padding: 20px; border-bottom: 1px solid var(--stone); vertical-align: middle; }
        
        .user-cell { display: flex; flex-direction: column; }
        .user-name { font-weight: 600; color: var(--ink); }
        .user-email { font-size: 0.85rem; color: var(--text-muted); }
        
        .role-tag { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; }
        .role-tag.user { background: #E3F2FD; color: #1976D2; }
        .role-tag.expert { background: #E8F5E9; color: #2E7D32; }
        .role-tag.admin { background: #FFF3E0; color: #E65100; }
        
        .role-select { padding: 8px 12px; border: 1px solid var(--stone); border-radius: 4px; font-size: 0.85rem; font-family: inherit; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
