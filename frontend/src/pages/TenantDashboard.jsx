import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import API from "../services/api";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const maintenanceSchema = z.object({
  description: z.string().min(10, "Please describe the issue in detail"),
  urgency: z.enum(["Low", "Medium", "High", "Emergency"]),
});

export default function TenantDashboard() {
  const { user } = useAuthStore();
  const [lease, setLease] = useState(null);
  const [payments, setPayments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: { urgency: "Medium" },
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leaseRes, paymentRes] = await Promise.all([
        API.get(`/leases/by-tenant/${user._id}`),
        API.get(`/payments/by-tenant/${user._id}`),
      ]);

      setLease(leaseRes.data?.[0] || null);
      setPayments(paymentRes.data || []);

      // Mocked until APIs exist
      setRequests([
        { id: 1, title: "Leaky Faucet", status: "In Progress", date: "June 20, 2024" },
        { id: 2, title: "AC Not Cooling", status: "Submitted", date: "June 25, 2024" },
      ]);

      setDocuments([
        "Lease Agreement 2024.pdf",
        "Property Rules and Regulations.pdf",
        "Move-In Checklist.pdf",
      ]);

      setNotifications([
        {
          message: "Your rent payment for July is due soon.",
          date: "June 25, 2024, 10:00 AM",
        },
        {
          message: "Maintenance request M001 is now in progress.",
          date: "June 20, 2024, 02:30 PM",
        },
      ]);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data) => {
    toast.success("Maintenance request submitted");
    reset();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Tenant Dashboard</h1>

      {/* Row 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Lease Details">
          <Info label="Property" value="123 Main Street, Apt 4B, Anytown, CA" />
          <Info label="Lease Term" value="Jan 1, 2024 – Dec 31, 2024" />
          <Info label="Monthly Rent" value="$1,500 / month" highlight />
          <Info label="Next Payment Due" value="July 1, 2024" />
          <Button>View Lease Agreement</Button>
        </Card>

        <Card title="Digital Payment Options">
          <PrimaryButton>Pay with Card</PrimaryButton>
          <Button>Bank Transfer</Button>
        </Card>

        <Card title="Manual Payment Proof">
          <p className="text-sm text-gray-600 mb-4">
            Upload bank transfer receipt or proof of payment
          </p>
          <Button>Upload Proof</Button>
        </Card>
      </div>

      {/* Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Payment History">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map((p) => (
                  <tr key={p._id} className="border-b">
                    <td>{new Date(p.transactionDate).toLocaleDateString()}</td>
                    <td>${p.amountEtb}</td>
                    <td>
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                        Paid
                      </span>
                    </td>
                    <td className="text-gray-500">
                      {p.externalTransactionId || "TXN123456789"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <Card title="Submit Maintenance Request">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <textarea
              {...register("description")}
              placeholder="Describe the issue in detail..."
              className="w-full rounded border p-3"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
            <select {...register("urgency")} className="w-full rounded border p-3">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Emergency</option>
            </select>
            <PrimaryButton type="submit">Submit Request</PrimaryButton>
          </form>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Request Status Tracking">
          {requests.map((r) => (
            <div key={r.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-gray-500">Submitted: {r.date}</p>
              </div>
              <span className="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-700">
                {r.status}
              </span>
            </div>
          ))}
        </Card>

        <Card title="Document Downloads">
          {documents.map((d) => (
            <div key={d} className="flex justify-between text-sm">
              <span>{d}</span>
              <button className="text-indigo-600">Download</button>
            </div>
          ))}
        </Card>

        <Card title="Notifications Feed">
          {notifications.map((n, i) => (
            <div key={i} className="text-sm">
              <p>{n.message}</p>
              <p className="text-xs text-gray-500">{n.date}</p>
            </div>
          ))}
        </Card>
      </div>

      {/* Profile */}
      <Card title="Profile & Security">
        <Button>Manage Profile</Button>
        <Button>Security Settings</Button>
      </Card>
    </div>
  );
}

/* Helper Components */

const Card = ({ title, children }) => (
  <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
    <h2 className="text-lg font-semibold">{title}</h2>
    {children}
  </div>
);

const Info = ({ label, value, highlight }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className={highlight ? "text-xl font-bold text-indigo-600" : "font-medium"}>
      {value}
    </p>
  </div>
);

const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="w-full rounded-lg bg-gray-100 py-3 font-medium hover:bg-gray-200"
  >
    {children}
  </button>
);

const PrimaryButton = ({ children, ...props }) => (
  <button
    {...props}
    className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
  >
    {children}
  </button>
);
