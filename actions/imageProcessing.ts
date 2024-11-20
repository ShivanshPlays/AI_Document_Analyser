'use server'

import prismadb from "@/lib/prismadb";  // Import Prisma DB handler
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";



// file: File
export async function processImage(path: string) {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    return { error: "missing API_KEY from env" };
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const fileManager = new GoogleAIFileManager(API_KEY);

  // Select the appropriate model for generative AI (Gemini 1.5)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  // Upload the image and specify a display name
  const uploadResponse = await fileManager.uploadFile(path, {
    mimeType: "image/jpeg",  // Assuming the image is a JPEG
    displayName: "testCase2Image",
  });

  console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

  // Define the query to generate content based on the uploaded image
  const query = `
    Process the image and extract the product, invoice, and customer data from it. 
    Return the data in a structured JSON format based on the following schema:

    {
      "products": [
        {
          "id": "<string>",  // Unique identifier for the product (e.g., "12345")
          "name": "<string>",  // Name of the product
          "quantity": <int>,  // Quantity of the product
          "unitprice": <float>,  // Unit price of the product
          "tax": <float>,  // Tax for the product
          "pricewithtax": <float>  // Total price including tax
        }
      ],
      "invoices": [
        {
          "id": "<string>",  // Unique identifier for the invoice (e.g., "invoice-12345")
          "serialNumber": "<string>",  // Serial Number of the invoice
          "customerName": "<string>",  // Customer name associated with the invoice
          "productName": "<string>",  // Name of the product on the invoice
          "quantity": <int>,  // Quantity of the product in the invoice
          "tax": <float>,  // Tax applied on the invoice
          "totalAmount": <float>,  // Total amount for the invoice (including tax)
          "date": "<string>"  // Date when the invoice was created (ISO 8601 format)
        }
      ],
      "customers": [
        {
          "id": "<string>",  // Unique identifier for the customer (e.g., "customer-12345")
          "customerName": "<string>",  // Name of the customer
          "phoneNumber": "<string>",  // Customer's phone number
          "totalPurchaseAmt": <float>  // Total purchase amount of the customer
        }
      ]
    }

    Ensure the extracted data is returned as a JSON array, where the fields are in the above format.
  `;

  // Generate content using the text query and image URI reference
  const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri,
      },
    },
    { text: query },
  ]);

  const responseText = result.response.text();
  console.log("Extracted Data: ", responseText);

  try {
    // Clean the response text and parse the JSON
    const cleanedResponseText = responseText.replace(/```json|\n```/g, '').trim();

    if (!cleanedResponseText) {
      throw new Error("No data extracted from the image");
    }

    const data = JSON.parse(cleanedResponseText);

    // Validate if the required sections (products, invoices, customers) exist
    if (
      !Array.isArray(data.products) ||
      !Array.isArray(data.invoices) ||
      !Array.isArray(data.customers)
    ) {
      throw new Error("Extracted data is not in the expected format or is incomplete");
    }

    // Extract the individual sections
    const { products, invoices, customers } = data;

    // Insert the extracted products into the database
    const createdProducts = await prismadb.product.createMany({
      data: products.map((product: any) => ({
        name: product.name,
        quantity: product.quantity,
        unitprice: product.unitprice,
        tax: product.tax,
        pricewithtax: product.pricewithtax,
      })),
    });

    // Insert the extracted invoices into the database
    const createdInvoices = await prismadb.invoice.createMany({
      data: invoices.map((invoice: any) => ({
        serialNumber: invoice.serialNumber,
        customerName: invoice.customerName,
        productName: invoice.productName,
        quantity: invoice.quantity,
        tax: invoice.tax,
        totalAmount: invoice.totalAmount,
        date: new Date(invoice.date),
      })),
    });

    // Insert the extracted customers into the database
    const createdCustomers = await prismadb.customer.createMany({
      data: customers.map((customer: any) => ({
        customerName: customer.customerName,
        phoneNumber: customer.phoneNumber,
        totalPurchaseAmt: customer.totalPurchaseAmt,
      })),
    });

    return {
      success: true,
      data: {
        products: createdProducts,
        invoices: createdInvoices,
        customers: createdCustomers,
      }, // Optionally return the inserted data
    };
  } catch (error: unknown) {
    // Handle errors and narrow down the error type
    if (error instanceof Error) {
      console.error("Error parsing or saving extracted data:", error.message);
      return {
        success: false,
        error: error.message || "Failed to extract or save product, invoice, or customer data",
      };
    } else {
      console.error("Unexpected error:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  }
}
