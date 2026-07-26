import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminApp from '../admin/AdminApp';

export default function AdminPage() {
  return (
    <ProtectedRoute role="admin">
      <AdminApp />
    </ProtectedRoute>
  );
}
