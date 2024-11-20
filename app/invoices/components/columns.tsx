"use client";

import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { Invoice } from "@prisma/client";

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "serialNumber",
    header: "Serial Number",
  },
  {
    accessorKey: "customerName",
    header: "Customer Name",
  }, 
  {
    accessorKey: "productName",
    header: "Product Name",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "tax",
    header: "Tax",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
