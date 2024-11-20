
import { getCustomerById } from "@/actions/Customer";
import toast, { Toaster } from "react-hot-toast";
import { CustomerForm } from "./components/customer-form";

export type Params = Promise<{
  customerId: string;
}>;

const customerPage = async ({ params }: { params: Params }) => {
  const { customerId } = await params;
  // console.log(customerId)

  if (customerId === "new") {
    return (
      <div className="flex-col">
        <Toaster />
        <div className="flex-1 space-y-4 p-8 pt-6">
          <CustomerForm initialData={null} />
        </div>
      </div>
    );
  } else {
    const { success, data, error } = await getCustomerById(customerId);

    if (!success && error) {
      toast.error(error);
    }

    return (
      <div className="flex-col">
        <Toaster />
        <div className="flex-1 space-y-4 p-8 pt-6">
          <CustomerForm initialData={data} />
        </div>
      </div>
    );
  }
};

export default customerPage;
