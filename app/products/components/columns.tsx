"use client"

import { ColumnDef } from "@tanstack/react-table"
import CellAction from "./cell-action"
import { Product } from "@prisma/client"



export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    // cell:({row})=>row.original.billboardLabel
  },

  {
    accessorKey: "unitprice",
    header: "Unit Price",
  },
  {
    accessorKey: "tax",
    header: "Tax",
  },
  {
    accessorKey: "pricewithtax",
    header: "Price With Tax",
  },
  // {
  //   accessorKey: "discount",
  //   header: "Discount",
  // },
  {
    id:"actions",
    cell:({row})=><CellAction data={row.original}/>
  }
]


// Name, Quantity, Unit Price,
// Tax, Price with Tax (all required). The Discount column is optional but can be included for
// added detail.