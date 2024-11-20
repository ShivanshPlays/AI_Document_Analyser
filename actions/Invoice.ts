"use server";
import prismadb from "@/lib/prismadb";

interface InvoiceInput {
  serialNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  tax: number;
  totalAmount: number;
}

type ResponseFormat = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function getAllInvoices() {
  try {
    const invoices = await prismadb.invoice.findMany();
    return invoices
  } catch (error) {
    throw new Error("Failed to fetch invoices");
  }
}

export async function getInvoiceById(id: string): Promise<ResponseFormat> {
  try {
    if (!id) {
      return {
        success: true,
        data: null,
      };
    }

    const invoice = await prismadb.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return {
        success: false,
        error: "Invoice not found",
      };
    }

    return {
      success: true,
      data: invoice,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Error fetching invoice",
    };
  }
}

export async function createInvoice(
  input: InvoiceInput
): Promise<ResponseFormat> {
  try {
    const { serialNumber, customerName, productName, quantity, tax, totalAmount } =
      input;

      const date = new Date().toISOString()
    const newInvoice = await prismadb.invoice.create({
      data: {
        serialNumber,
        customerName,
        productName,
        quantity,
        tax,
        totalAmount,
        date
      },
    });
    return {
      success: true,
      data: newInvoice,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Error creating invoice",
    };
  }
}

export async function updateInvoice(
  id: string,
  input: Partial<InvoiceInput>
): Promise<ResponseFormat> {
  try {
    const { serialNumber, customerName, productName, quantity, tax, totalAmount } =
      input;
    const updatedInvoice = await prismadb.invoice.update({
      where: { id },
      data: {
        ...(serialNumber && { serialNumber }),
        ...(customerName && { customerName }),
        ...(productName && { productName }),
        ...(quantity !== undefined && { quantity }),
        ...(tax !== undefined && { tax }),
        ...(totalAmount !== undefined && { totalAmount }),
      },
    });
    return {
      success: true,
      data: updatedInvoice,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Error updating invoice",
    };
  }
}

export async function deleteInvoice(id: string): Promise<ResponseFormat> {
  try {
    await prismadb.invoice.delete({
      where: { id },
    });
    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Error deleting invoice",
    };
  }
}
