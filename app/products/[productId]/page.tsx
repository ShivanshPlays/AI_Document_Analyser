import { ProductForm } from "./components/product-form";
import { getProductById } from "@/actions/Products";
import toast, { Toaster } from "react-hot-toast";

export type Params = Promise<{
  productId: string;
}>;

const ProductPage = async ({ params }: { params: Params }) => {
  const { productId } = await params;
  // console.log(productId)

  if (productId === "new") {
    return (
      <div className="flex-col">
        <Toaster />
        <div className="flex-1 space-y-4 p-8 pt-6">
          <ProductForm initialData={null} />
        </div>
      </div>
    );
  } else {
    const { success, data, error } = await getProductById(productId);

    if (!success && error) {
      toast.error(error);
    }

    return (
      <div className="flex-col">
        <Toaster />
        <div className="flex-1 space-y-4 p-8 pt-6">
          <ProductForm initialData={data} />
        </div>
      </div>
    );
  }
};

export default ProductPage;
