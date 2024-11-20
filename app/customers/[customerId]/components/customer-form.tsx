"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Customer } from "@prisma/client";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "@/actions/Customer";
import { AlertModal } from "@/components/alert-modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Adjust schema to match the Customer model
const formSchema = z.object({
  customerName: z.string().min(1),
  phoneNumber: z.coerce.string().min(10),
  totalPurchaseAmt: z.coerce.number().min(0),
});

type customerFormValues = z.infer<typeof formSchema>;

interface customerFormProps {
  initialData: Customer | null;
}

export const CustomerForm: React.FC<customerFormProps> = ({ initialData }) => {
  
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit customer" : "Create customer";
  const description = initialData ? "Edit a customer" : "Create a customer";
  const toastMessage = initialData ? "customer updated." : "customer created.";
  const action = initialData ? "save changes" : "Create";

  const form = useForm<customerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          customerName: initialData.customerName,
          phoneNumber: initialData.phoneNumber,
          totalPurchaseAmt: initialData.totalPurchaseAmt,
        }
      : {
          customerName: "",
          phoneNumber: "1234567890",
          totalPurchaseAmt: 0,
        },
  });

  const onSubmit = async (data: customerFormValues) => {
    try {
      setLoading(true);
      if (!initialData) {
        await createCustomer(data);
      } else {
        await updateCustomer(initialData.id, data);
      }

      router.refresh();
      router.push(`/customers`);
      toast.success(toastMessage);
      console.log(data);
    } catch (err) {
      toast.error("Something went wrong");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      if (initialData) {
        await deleteCustomer(initialData.id);
        router.push(`/customers`);
        router.refresh();
        toast.success("Customer deleted.");
      }
    } catch {
      toast.error("Something went wrong");
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
            variant={"destructive"}
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            {/* Customer Name */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Customer name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Customer phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Total Purchase Amount */}
            <FormField
              control={form.control}
              name="totalPurchaseAmt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Purchase Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="Total purchase amount"
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
