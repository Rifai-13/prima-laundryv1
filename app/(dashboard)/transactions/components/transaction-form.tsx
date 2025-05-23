
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Transaction, TransactionStatus } from "@/lib/types";

// export interface Transaction {
//   id: string;
//   customerName: string;
//   itemType: string;
//   phoneNumber: string;
//   weight: number;
//   price: number;
//   status: TransactionStatus;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

const formSchema = z.object({
  customerName: z.string().min(3, "Nama harus minimal 3 karakter"),
  itemType: z.string().min(1, "Jenis barang wajib diisi"),
  phoneNumber: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(14, "Nomor telepon maksimal 14 digit"),
  weight: z.coerce
    .number()
    .positive("Berat harus angka positif")
    .min(0.1, "Berat minimal 0.1 kg"),
  price: z.coerce
    .number()
    .positive("Harga harus angka positif")
    .min(1000, "Harga minimal Rp 1.000"),
  status: z.enum(["pending", "processing", "completed", "cancelled"]),
});

// type FormValues = z.infer<typeof formSchema>;

// interface TransactionFormProps {
//   transaction?: Transaction;
// }

export function TransactionForm({ transaction }: { transaction?: Transaction }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: transaction?.customerName || "",
      itemType: transaction?.itemType || "",
      phoneNumber: transaction?.phoneNumber || "",
      weight: transaction?.weight || 0,
      price: transaction?.price || 0,
      status: transaction?.status || "pending",
    },
  });

  const formatPhoneNumber = (value: string) => {
    return value
      .replace(/[^\d+]/g, "")
      .replace(/(\+?\d{0,3})(\d{0,4})(\d{0,4})/, (_, p1, p2, p3) => {
        let parts = [];
        if (p1) parts.push(p1);
        if (p2) parts.push(p2);
        if (p3) parts.push(p3);
        return parts.join("-");
      });
  };

 const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        transaction ? `/api/transactions/${transaction.id}` : "/api/transactions",
        {
          method: transaction ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            phoneNumber: data.phoneNumber.replace(/[^\d+]/g, ""),
          }),
        }
      );

      if (!response.ok) throw new Error("Request failed");

      router.refresh();
      router.push("/transactions");
      toast({
        title: "Success!",
        description: transaction ? "Transaction updated" : "Transaction created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName">Nama Pelanggan</Label>
              <Input
                id="customerName"
                {...register("customerName")}
                placeholder="Nama lengkap pelanggan"
                className="w-full"
              />
              {errors.customerName && (
                <p className="text-sm text-red-500">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Nomor Telepon</Label>
              <Input
                id="phoneNumber"
                {...register("phoneNumber")}
                value={formatPhoneNumber(watch("phoneNumber") || "")}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^\d+]/g, "");
                  setValue("phoneNumber", rawValue);
                }}
                placeholder="Contoh: +628123456789"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item Type */}
            <div className="space-y-2">
              <Label htmlFor="itemType">Jenis Barang</Label>
              <Input
                id="itemType"
                {...register("itemType")}
                placeholder="Contoh: Pakaian, Elektronik"
              />
              {errors.itemType && (
                <p className="text-sm text-red-500">
                  {errors.itemType.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status Transaksi</Label>
              <Select
                defaultValue={transaction?.status || "pending"}
                onValueChange={(value) =>
                  setValue("status", value as TransactionStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">Berat (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...register("weight")}
                placeholder="0.0"
              />
              {errors.weight && (
                <p className="text-sm text-red-500">{errors.weight.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                type="number"
                {...register("price")}
                placeholder="0"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {transaction ? "Menyimpan..." : "Membuat..."}
              </>
            ) : transaction ? (
              "Simpan Perubahan"
            ) : (
              "Buat Transaksi Baru"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
