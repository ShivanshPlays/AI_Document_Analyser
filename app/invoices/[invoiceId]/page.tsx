
import { getInvoiceById } from "@/actions/Invoice";
import toast, { Toaster } from "react-hot-toast";
import { InvoiceForm } from "./components/invoice-form";

export type Params = Promise<{
  invoiceId: string;
}>;

const InvoicePage = async ({ params }: { params: Params }) => {
  const { invoiceId } = await params;

  if (invoiceId === "new") {
    return (
      <div className="flex-col">
        <Toaster />
        <div className="flex-1 space-y-4 p-8 pt-6">
          <InvoiceForm initialData={null} />
        </div>
      </div>
    );
  } else {
    const { success, data, error } = await getInvoiceById(invoiceId);

    if (!success && error) {
      toast.error(error);
    }

    return (
      <div className="flex-col">
        <Toaster />
        <div className="flex-1 space-y-4 p-8 pt-6">
          <InvoiceForm initialData={data} />
        </div>
      </div>
    );
  }
};

export default InvoicePage;
