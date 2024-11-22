import prismadb from "@/lib/prismadb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

// file: File
export async function processDocument(path: string) {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    return { error: "missing API_KEY from env" };
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const fileManager = new GoogleAIFileManager(API_KEY);

  const model = genAI.getGenerativeModel({
    // Choose a Gemini model.
    model: "gemini-1.5-flash",
  });

  // Upload the file and specify a display name.
  const uploadResponse = await fileManager.uploadFile(path, {
    mimeType: "application/pdf",
    displayName: "Gemini 1.5 PDF",
  });

  console.log(
    `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
  );

  // Define the query to extract product data according to your schema.
  const query = `
    Extract all the product data from the uploaded document in the following format:

      {
      "task": "Extract all product and invoice data from the uploaded document and structure it according to the provided schema. Additionally, include the customer information related to each invoice. The extracted data should be in the following format:",
      "schema": {
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
      },
      "request": "Please extract all the product, invoice, and customer data from the uploaded document and format it according to the schema above."
    }

    Return the data as a JSON array where each product's data is captured in the above structure.
  `;

  // Generate content using text and the URI reference for the uploaded file.
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
  // console.log("Extracted Data: ", responseText);

  try {
    // Remove the code block markers (```) and parse the JSON
    const cleanedResponseText = responseText
      .replace(/```json|\n```/g, "")
      .trim();

    if (!cleanedResponseText) {
      throw new Error("No data extracted from the document");
    }

    const data = JSON.parse(cleanedResponseText);
    console.log(data)
    // Validate if the required sections (products, invoices, customers) exist
    if (
      !Array.isArray(data.products) ||
      !Array.isArray(data.invoices) ||
      !Array.isArray(data.customers)
    ) {
      throw new Error(
        "Extracted data is not in the expected format or is incomplete"
      );
    }

    // Extract the individual sections
    const { products, invoices, customers } = data;

    // Push the extracted products to the MongoDB database using Prisma
    const createdProducts = await prismadb.product.createMany({
      data: products.map((product: any) => ({
        name: product.name,
        quantity: product.quantity,
        unitprice: product.unitprice,
        tax: product.tax,
        pricewithtax: product.pricewithtax,
      })),
    });

    // Push the extracted invoices to the MongoDB database using Prisma
    const createdInvoices = await prismadb.invoice.createMany({
      data: invoices.map((invoice: any) => ({
        serialNumber: invoice.serialNumber,
        customerName: invoice.customerName,
        productName: invoice.productName,
        quantity: invoice.quantity,
        tax: invoice.tax,
        totalAmount: invoice.totalAmount,
        date: invoice.date,
      })),
    });

    // Push the extracted customers to the MongoDB database using Prisma
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
    // Type narrowing to check if the error is an instance of Error
    if (error instanceof Error) {
      console.error("Error parsing or saving extracted data:", error.message);

      return {
        success: false,
        error: error.message || "Failed to extract or save data",
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
