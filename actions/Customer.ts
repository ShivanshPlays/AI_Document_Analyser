"use server"
import prismadb from "@/lib/prismadb";

interface CustomerInput {
  customerName: string;
  phoneNumber: string;
  totalPurchaseAmt: number;
}

type ResponseFormat = {
  success: boolean;
  data?: any;
  error?: string;
};

// Get all customers
export async function getAllCustomers() {
  try {
    const customers = await prismadb.customer.findMany();
    console.log(customers)
    return customers;
  } catch (error) {
    console.log(error)
  }
}

// Get customer by ID
export async function getCustomerById(id: string): Promise<ResponseFormat> {
  try {
    if (!id) {
      return {
        success: true,
        data: null,
      };
    }

    const customer = await prismadb.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return {
        success: false,
        error: "Customer not found",
      };
    }

    return {
      success: true,
      data: customer,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Error fetching customer",
    };
  }
}

// Create a new customer
export async function createCustomer(
  input: CustomerInput
): Promise<ResponseFormat> {
  try {
    const { customerName, phoneNumber, totalPurchaseAmt } = input;
    const newCustomer = await prismadb.customer.create({
      data: {
        customerName,
        phoneNumber,
        totalPurchaseAmt,
      },
    });
    return {
      success: true,
      data: newCustomer,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Error creating customer",
    };
  }
}

// Update customer details
export async function updateCustomer(
  id: string,
  input: Partial<CustomerInput>
): Promise<ResponseFormat> {
  try {
    const { customerName, phoneNumber, totalPurchaseAmt } = input;
    const updatedCustomer = await prismadb.customer.update({
      where: { id },
      data: {
        ...(customerName && { customerName }),
        ...(phoneNumber && { phoneNumber }),
        ...(totalPurchaseAmt !== undefined && { totalPurchaseAmt }),
      },
    });
    return {
      success: true,
      data: updatedCustomer,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Error updating customer",
    };
  }
}

// Delete a customer
export async function deleteCustomer(id: string): Promise<ResponseFormat> {
  try {
    await prismadb.customer.delete({
      where: { id },
    });
    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Error deleting customer",
    };
  }
}
