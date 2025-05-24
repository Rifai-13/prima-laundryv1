import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prima Laundry",
  description: "LaundryPro - Your laundry management solution",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="min-h-screen">{children}</div>
  );
}