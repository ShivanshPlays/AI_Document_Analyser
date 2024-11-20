"use client"

import { ColumnDef } from "@tanstack/react-table"
import CellAction from "./cell-action"
import { Customer } from "@prisma/client"



export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "customerName",
    header: "Customer Name ",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },

  {
    accessorKey: "totalPurchaseAmt",
    header: "Total Purchase Amount",
  },
  {
    id:"actions",
    cell:({row})=><CellAction data={row.original}/>
  }
]

