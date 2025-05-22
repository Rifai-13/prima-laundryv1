import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LaundryPro",
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