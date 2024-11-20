"use client";

import { deleteProduct } from "@/actions/Products";
import { AlertModal } from "@/components/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ProductColumn } from "./columns";

interface CellActionProps {
  data: ProductColumn;
}

const CellAction: React.FC<CellActionProps> = ({ data }) => {
 
  const router = useRouter();
  const pathname = usePathname(); 
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onDelete = async () => {
    try {
      setLoading(true);

      const {success,error}=await deleteProduct(data.id)

      if(!success&&error){
        toast.error(error)
      }else{
        toast.success("Product deleted.");
        router.replace(pathname);
      }
    } catch {
      toast.error("error deleting product");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={()=>setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} className="h-8 w-8 p-0">
              {/* screen reader only */}
              <span className="sr-only">Open Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/products/${data.id}`)
              }
            >
              <Edit className="h-4 w-4 mr-2" />
              Update
            </DropdownMenuItem>
            <DropdownMenuItem onClick={()=>setOpen(true)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    </>
  );
};

export default CellAction;