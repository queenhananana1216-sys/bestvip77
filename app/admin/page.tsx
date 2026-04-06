import AdminClient from "@/components/admin/AdminClient";
import { fetchPortalPayload } from "@/lib/portal/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { content, posts } = await fetchPortalPayload();

  return <AdminClient initialContent={content} initialPosts={posts} />;
}
