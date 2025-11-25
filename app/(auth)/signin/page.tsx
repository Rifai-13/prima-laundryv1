"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Pastikan menggunakan useToast yang konsisten
import { Eye, EyeOff } from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const { toast } = useToast(); // Menggunakan useToast yang sama dengan signup
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Validasi email real-time
  const validateEmail = (email: string) => {
    if (email && !email.endsWith("@gmail.com")) {
      setErrors((prev) => ({
        ...prev,
        email: "Email harus menggunakan @gmail.com",
      }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();                   //S1
    // Validasi client-side
    if (!formData.email.endsWith("@gmail.com")) {     //S2
      setErrors((prev) => ({                      //S3
        ...prev,
        email: "Email harus menggunakan @gmail.com",
      }));
      toast({
        title: "Error",
        description: "Email harus menggunakan @gmail.com",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);                     //S4
    try {
      const response = await fetch("/api/auth/signin", {    //S5
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
        credentials: "include",
      });
      const data = await response.json();         //S6
      if (!response.ok) {                   //S7
        // Menampilkan pesan error yang spesifik dari server
        throw new Error(data.error || "Login gagal");         //S8
      }
      // Login berhasil
      toast({                         //S9
        title: "Berhasil",
        description: "Login berhasil",
      });
      // Redirect setelah login berhasil
      setTimeout(() => {                   //S10
        router.push("/dashboard");
      }, 100);
    } catch (error: any) {             //S11
      // Menampilkan pesan error yang spesifik
      let errorMessage = "Terjadi kesalahan saat login";
      if (error.message.includes("Email tidak terdaftar")) {            //S12
        errorMessage = "Email tidak terdaftar. Silakan daftar terlebih dahulu.";
      } else if (error.message.includes("Password tidak valid")) {       //S13
        errorMessage = "Password tidak valid. Silakan coba lagi.";
      } else if (error.message.includes("Email tidak valid")) {       //S14
        errorMessage = "Email harus menggunakan @gmail.com";
      } else {                          //S15
        errorMessage = error.message;
      }
      toast({                       //S16
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);               //S17
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Validasi real-time untuk email
    if (id === "email") {
      validateEmail(value);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-blue-600"
            >
              <path d="M14 3.45v9.95" />
              <path d="M18.15 4.75A9.33 9.33 0 0 0 14 3.5" />
              <path d="M11.85 20.5a9 9 0 0 1-8.38-5.62" />
              <path d="M7 16.9a9.02 9.02 0 0 0 6.85 2.9" />
              <path d="M10.32 19.1a1.8 1.8 0 0 0 2.56.8 1.77 1.77 0 0 0 .6-2.1L11.72 14" />
              <path d="M14 12.46l6.28 2.84c.65.3.86 1.13.56 1.77a1.33 1.33 0 0 1-1.82.5l-6.28-2.84" />
              <path d="M4.1 8.44l3.2 7.06" />
              <path d="M10.9 4.06A1.8 1.8 0 0 0 8.9 7.51" />
              <path d="M6.75 5.3A1.17 1.17 0 0 1 8 7.04" />
            </svg>
          </div>
          <CardTitle className="text-2xl text-center">Prima Laundry</CardTitle>
          <CardTitle className="text-xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-700"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
