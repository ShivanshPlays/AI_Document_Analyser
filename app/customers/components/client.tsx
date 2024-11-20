"use client"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Customer } from "@prisma/client"
import { columns } from "./columns"

interface CustomerCLientProps{
    data:Customer[]
}
export const CustomerCLient:React.FC<CustomerCLientProps> = ({
    data
})=>{

    const router=useRouter()
    return(
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title= {`${data.length} Customers`}
                    description="Here are all your Customers"
                />
                <Button onClick={()=>{
                    router.push(`/customers/new`)
                }}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Add new
                </Button>
            </div>
            <Separator/>
            <DataTable columns={columns} data={data} searchKey={"customerName"}/>
        </>
    )
}