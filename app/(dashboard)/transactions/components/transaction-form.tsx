"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Transaction, TransactionStatus } from "@/lib/types";
import { addTransaction, updateTransaction } from "@/lib/data";
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

const formSchema = z.object({
  customerName: z.string().min(3),
  itemType: z.string(),
  phoneNumber: z.string().min(10).max(14),
  weight: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  status: z.enum(["pending", "processing", "completed", "cancelled"]),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  transaction?: Transaction;
}

export function TransactionForm({ transaction }: TransactionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: transaction
      ? {
          customerName: transaction.customerName,
          itemType: transaction.itemType,
          phoneNumber: transaction.phoneNumber,
          weight: transaction.weight,
          price: transaction.price,
          status: transaction.status,
        }
      : {
          customerName: "",
          itemType: "",
          phoneNumber: "",
          weight: 0,
          price: 0,
          status: "pending" as TransactionStatus,
        },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        phoneNumber: data.phoneNumber.replace(/[^\d]/g, ""),
      };

      const url = transaction
        ? `/api/transactions/${transaction.id}`
        : "/api/transactions";

      const method = transaction ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.error ||
          (transaction
            ? "Gagal mengupdate transaksi"
            : "Gagal membuat transaksi");
        throw new Error(errorMessage);
      }

      toast({
        title: "Sukses!",
        description: transaction
          ? "Transaksi berhasil diupdate"
          : "Transaksi baru berhasil dibuat",
      });

      router.push("/transactions");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                {...register("customerName")}
                placeholder="Enter customer name"
              />
              {errors.customerName && (
                <p className="text-sm text-red-500">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                {...register("phoneNumber")}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^\d+]/g, "") // Hanya pertahankan angka dan +
                    .replace(/(\+\d{0,3})(\d{0,15})/, "$1$2"); // Batasi panjang
                  setValue("phoneNumber", value);
                }}
                placeholder="Contoh: 08123456789"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemType">Jenis Barang</Label>
              <Input
                id="itemType"
                {...register("itemType")}
                placeholder="Masukkan jenis barang (e.g. baju)"
              />
              {errors.itemType && (
                <p className="text-sm text-red-500">
                  {errors.itemType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue={transaction?.status || "pending"}
                onValueChange={(value) =>
                  setValue("status", value.toLowerCase() as TransactionStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
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
            <div className="space-y-2">
              <Label htmlFor="weight">Berat (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...register("weight")}
                placeholder="Enter weight in kg"
              />
              {errors.weight && (
                <p className="text-sm text-red-500">{errors.weight.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                type="number"
                {...register("price")}
                placeholder="Enter price"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2 pt-2">
          <Button
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
              "Buat Transaksi"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
