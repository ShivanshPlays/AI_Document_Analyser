"use server"
import prismadb from '@/lib/prismadb';

interface ProductInput {
  name: string;
  quantity: number;
  unitprice: number;
  tax: number;
}

type ResponseFormat = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function getAllProducts() {
    try {
      const products = await prismadb.product.findMany();
      return products; // Return plain JSON
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  }

export async function getProductById(id: string):Promise<ResponseFormat> {
  try {
    if(!id){
      return {
        success:true,
        data:null
      }
    }
    const product = await prismadb.product.findUnique({
      where: { id },
    });
    if (!product) {
      return {
        success:false,
        error:"product not found"
      }
    }
    return {
      success:true,
      data:product
    }
  } catch (error) {
    console.log(error)
    return {
      success:false,
      error:"error fetching product"
    }
  }
}

export async function createProduct(input: ProductInput) {
  try {
    const { name, quantity, unitprice, tax } = input;
    const pricewithtax = unitprice + tax;
    const newProduct = await prismadb.product.create({
      data: {
        name,
        quantity,
        unitprice,
        tax,
        pricewithtax,
      },
    });
    return {
      success:true,
      data:newProduct
    }
  } catch (error) {
    console.log(error)
    return {
      success:false,
      error:"error creating product"
    }
  }
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  try {
    const { name, quantity, unitprice, tax } = input;
    const updatedProduct = await prismadb.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(quantity !== undefined && { quantity }),
        ...(unitprice !== undefined && { unitprice }),
        ...(tax !== undefined && { tax }),
        ...(unitprice !== undefined && tax !== undefined && { pricewithtax: unitprice + tax }),
      },
    });
    return {
      success:true,
      data:updatedProduct
    }
  } catch (error) {
    console.log(error)
    return {
      success:false,
      error:"error updating product"
    }
  }
}

export async function deleteProduct(id: string) {
  try {
    await prismadb.product.delete({
      where: { id },
    });
    return {
      success:true,
    }
  } catch (error) {
    console.log(error)
    return {
      success:false,
      error:"error updating product"
    }
  }
}
