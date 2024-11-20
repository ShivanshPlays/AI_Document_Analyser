"use client"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { ProductColumn, columns } from "./columns"

interface ProductCLientProps{
    data:ProductColumn[]
}
export const ProductCLient:React.FC<ProductCLientProps> = ({
    data
})=>{

    const router=useRouter()
    return(
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title= {`${data.length} Products`}
                    description="Here are all your products"
                />
                <Button onClick={()=>{
                    router.push(`/products/new`)
                }}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Add new
                </Button>
            </div>
            <Separator/>
            <DataTable columns={columns} data={data} searchKey={"name"}/>
        </>
    )
}