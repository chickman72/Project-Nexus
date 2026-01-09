import { Suspense } from "react";
import AdminClient from "./AdminClient";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AdminClient />
    </Suspense>
  );
}
