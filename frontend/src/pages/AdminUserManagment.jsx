import React from "react";
import { Search, Filter, UserPlus, ShieldCheck, ShieldAlert } from "lucide-react";
import PageHeader from "../components/PageHeader";
import DashboardCard from "../components/DashboardCard";

const AdminUserManagement = () => {
  const users = [
    { name: "Alice Johnson", email: "alice.johnson@example.com", role: "Administrator", mfa: "Enabled", last: "2023-10-26 14:30" },
    { name: "Bob Smith", email: "bob.smith@example.com", role: "Support Staff", mfa: "Disabled", last: "2023-10-25 09:15" },
    { name: "Charlie Brown", email: "charlie.brown@example.com", role: "Standard User", mfa: "Pending", last: "2023-10-26 10:00" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        eyebrowClassName="bg-primary-100 text-primary-700"
        title="Admin User & Role Management"
        subtitle="Manage system users, assign roles, and monitor MFA status."
        actions={
          <button className="btn-primary inline-flex items-center gap-2 text-xs font-semibold">
            <UserPlus size={18} /> Add New User
          </button>
        }
      />

      <DashboardCard>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:bg-white focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-600 hover:bg-neutral-50">
            <Filter size={16} /> Filter by Role
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-neutral-50">
              <tr className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <th className="p-4">Name & Email</th>
                <th className="p-4">Roles</th>
                <th className="p-4">MFA Status</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((user, idx) => (
                <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-neutral-800">{user.name}</div>
                    <div className="text-xs text-neutral-500">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${user.mfa === "Enabled" ? "text-success-600" : user.mfa === "Disabled" ? "text-danger-600" : "text-warning-600"}`}>
                      {user.mfa === "Enabled" ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                      {user.mfa}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-neutral-500 font-mono">{user.last}</td>
                  <td className="p-4 text-center">
                    <button className="text-primary-600 text-xs font-semibold hover:text-primary-700">
                      Edit Account
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-neutral-500">
          <span>Page 1 of 5</span>
          <div className="flex gap-2">
            <button className="rounded-md border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50">
              Previous
            </button>
            <button className="rounded-md border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
              Next
            </button>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};
export default AdminUserManagement;