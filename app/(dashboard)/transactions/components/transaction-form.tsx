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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Transaction, TransactionStatus, ServiceType } from "@/lib/types";

//  Definisi layanan tambahan yang tersedia
const availableServices = [
  { id: "pewangi-khusus", label: "Pewangi Khusus" },
  { id: "antar-jemput", label: "Layanan Antar Jemput" },
  { id: "anti-noda", label: "Deterjen Anti Noda" },
  { id: "setrika-ekstra", label: "Setrika Ekstra" },
];

const formSchema = z.object({
  customerName: z.string().min(3, "Nama harus minimal 3 karakter"),
  gender: z.enum(["male", "female"], {
    required_error: "Jenis kelamin wajib diisi",
  }),
  serviceType: z.enum(["reguler", "express", "super-express"]).optional(),
  additionalServices: z.array(z.string()).optional(),
  itemType: z.string().min(1, "Jenis barang wajib diisi"),
  phoneNumber: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(13, "Nomor telepon maksimal 13 digit"),
  weight: z.coerce
    .number()
    .positive("Berat harus angka positif")
    .min(0.1, "Berat minimal 0.1 kg"),
  price: z.coerce
    .number()
    .positive("Harga harus angka positif")
    .min(1000, "Harga minimal Rp 1.000"),
  status: z.enum(["pending", "processing", "completed"]),
});

export function TransactionForm({
  transaction,
}: {
  transaction?: Transaction;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: transaction?.customerName || "",
      gender: transaction?.gender,
      serviceType: transaction?.serviceType || "reguler",
      additionalServices: transaction?.additionalServices || [],
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
        return parts.join("");
      });
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);   //S1
    try {
      const response = await fetch(    //S7
        transaction
          ? `/api/transactions/${transaction.id}`   //S2
          : "/api/transactions",   //S3
        {
          method: transaction ? "PUT" : "POST",   //S4 & S5
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            phoneNumber: data.phoneNumber.replace(/[^\d+]/g, ""),   //S6
          }),
        }
      );

      if (!response.ok) {   //S8
        throw new Error("Request failed");   //S9
      }

      router.refresh();  //S10
      router.push("/transactions");  //S11
      toast({          //S14
        title: "Success!",
        description: transaction
          ? "Transaction updated"    //S12
          : "Transaction created",   //S13
      });
    } catch (error) {
      toast({           //S15
        title: "Error",
        description: "Failed to save transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);           //S16
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6 space-y-8">
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

            {/* --- [TAMBAHAN] Input Jenis Kelamin --- */}
            <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <RadioGroup
                defaultValue={transaction?.gender}
                onValueChange={(value) => {
                  setValue("gender", value as "male" | "female", {
                    shouldValidate: true,
                  });
                }}
                className="flex items-center space-x-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="font-normal">
                    Laki-laki
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="font-normal">
                    Perempuan
                  </Label>
                </div>
              </RadioGroup>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>

            {/* --- [BARU] Input Paket Layanan --- */}
            <div className="space-y-2">
              <Label>Paket Layanan</Label>
              <RadioGroup
                defaultValue={transaction?.serviceType || "reguler"}
                onValueChange={(value) => {
                  setValue("serviceType", value as ServiceType, {
                    shouldValidate: true,
                  });
                }}
                className="flex items-center space-x-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reguler" id="reguler" />
                  <Label htmlFor="reguler" className="font-normal">
                    Reguler
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="express" id="express" />
                  <Label htmlFor="express" className="font-normal">
                    Express
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="super-express" id="super-express" />
                  <Label htmlFor="super-express" className="font-normal">
                    Super Express
                  </Label>
                </div>
              </RadioGroup>
              {errors.serviceType && (
                <p className="text-sm text-red-500">
                  {errors.serviceType.message}
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
            {/* --- [BARU] Input Layanan Tambahan (Checkbox) --- */}
            <div className="space-y-2">
              <Label>Layanan Tambahan</Label>
              <div className="flex items-center space-x-4 pt-2">
                <Controller
                  control={control}
                  name="additionalServices"
                  render={({ field }) => (
                    <>
                      {availableServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={service.id}
                            checked={field.value?.includes(service.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([
                                    ...(field.value || []),
                                    service.id,
                                  ])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== service.id
                                    )
                                  );
                            }}
                          />
                          <Label
                            htmlFor={service.id}
                            className="font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {service.label}
                          </Label>
                        </div>
                      ))}
                    </>
                  )}
                />
              </div>
              {errors.additionalServices && (
                <p className="text-sm text-red-500">
                  {errors.additionalServices.message}
                </p>
              )}
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
