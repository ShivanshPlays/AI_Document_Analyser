"use client";

import * as z from "zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { Invoice } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createInvoice, deleteInvoice, updateInvoice } from "@/actions/Invoice";
import { AlertModal } from "@/components/alert-modal";

const formSchema = z.object({
  serialNumber: z.string().min(1, "Serial Number is required"), // Unique string
  customerName: z.string().min(1, "Customer Name is required"), // Required string
  productName: z.string().min(1, "Product Name is required"), // Required string
  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be a positive integer"), // Required positive integer
  tax: z.coerce.number().min(0, "Tax must be at least 0"), // Required float (non-negative)
  totalAmount: z.coerce.number().min(0, "Total Amount must be at least 0"), // Required float (non-negative)
  date: z.string().min(1, "Date is required"),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  initialData: Invoice | null;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit Invoice" : "Create Invoice";
  const description = initialData ? "Edit an Invoice" : "Create a new Invoice";
  const toastMessage = initialData ? "Invoice updated." : "Invoice created.";
  const action = initialData ? "Save Changes" : "Create";

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          serialNumber: initialData.serialNumber ?? "",
          customerName: initialData.customerName ?? "",
          productName: initialData.productName ?? "",
          quantity: initialData.quantity ?? 0,
          tax: initialData.tax ?? 0,
          totalAmount: initialData.totalAmount ?? 0,
          date: initialData.date ?? "",
        }
      : {
          serialNumber: "",
          customerName: "",
          productName: "",
          quantity: 0,
          tax: 0,
          totalAmount: 0,
          date: "",
        },
  });

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      setLoading(true);

      const formattedData = {
        ...data,
        quantity: Number(data.quantity),
        tax: Number(data.tax),
        totalAmount: Number(data.totalAmount),
      };

      if (!initialData) {
        await createInvoice(formattedData);
      } else {
        await updateInvoice(initialData.id, formattedData);
      }

      router.refresh();
      router.push(`/invoices`);
      toast.success(toastMessage);
    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      if (initialData) {
        await deleteInvoice(initialData.id);
        router.push(`/invoices`);
        toast.success("Invoice deleted.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            {/* Serial Number */}
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Serial Number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Name */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Customer Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Name */}
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="Quantity"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tax */}
            <FormField
              control={form.control}
              name="tax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="Tax"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Amount */}
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="Total Amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  );
};
