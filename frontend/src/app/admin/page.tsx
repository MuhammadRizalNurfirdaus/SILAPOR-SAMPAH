import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  // ponytail: rute /admin langsung mengarahkan ke halaman armada
  redirect('/admin/armada');
}
