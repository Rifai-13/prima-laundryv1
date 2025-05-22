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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  customerName: z.string().min(3, { message: "Customer name must be at least 3 characters" }),
  itemType: z.string().min(2, { message: "Item type must be at least 2 characters" }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  weight: z.coerce.number().positive({ message: "Weight must be a positive number" }),
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
  status: z.enum(["pending", "processing", "completed", "cancelled"] as const),
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
      if (transaction) {
        await updateTransaction(transaction.id, data);
        toast({
          title: "Transaction updated",
          description: "Transaction has been updated successfully.",
        });
      } else {
        await addTransaction(data);
        toast({
          title: "Transaction created",
          description: "Transaction has been created successfully.",
        });
      }
      
      router.push("/transactions");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: transaction
          ? "Failed to update the transaction."
          : "Failed to create the transaction.",
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
                <p className="text-sm text-red-500">{errors.customerName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                {...register("phoneNumber")}
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemType">Item Type</Label>
              <Input
                id="itemType"
                {...register("itemType")}
                placeholder="Type of laundry items"
              />
              {errors.itemType && (
                <p className="text-sm text-red-500">{errors.itemType.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue={transaction?.status || "pending"}
                onValueChange={(value) => setValue("status", value as TransactionStatus)}
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
              <Label htmlFor="weight">Weight (kg)</Label>
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
              <Label htmlFor="price">Price (Rp)</Label>
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
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {transaction ? "Updating..." : "Creating..."}
              </>
            ) : transaction ? (
              "Update Transaction"
            ) : (
              "Create Transaction"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}