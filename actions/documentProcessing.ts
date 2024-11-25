import prismadb from "@/lib/prismadb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

// file: File
export async function processDocument(path: string) {
  const API_KEY = process.env.API_KEY;
  // console.log(path);
  if (!API_KEY) {
    return { error: "missing API_KEY from env" };
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const fileManager = new GoogleAIFileManager(API_KEY);

  const model = genAI.getGenerativeModel({
    // Choose a Gemini model.
    model: "gemini-1.5-flash",
  });

  let uploadResponse;

  if (path.endsWith(".pdf")) {
    uploadResponse = await fileManager.uploadFile(path, {
      mimeType: "application/pdf",
      displayName: "Gemini 1.5 PDF",
    });
  } else if (path.endsWith(".txt")) {
    uploadResponse = await fileManager.uploadFile(path, {
      mimeType: "text/plain",
      displayName: "Gemini 1.5 txt",
    });
  } else {
    return { error: "Unsupported file type" };
  }

  console.log(
    `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
  );

  // Define the query to extract product data according to your schema.
  // const query = `
  //     "task": "Extract all product invoice and customer data from the uploaded document and structure it according to the provided schema. Additionally, include the customer information related to each invoice. The extracted data should be in the following format:"

  //     "schema": {
  //       "products": [
  //         {
  //           "id": "<string>",  // Unique identifier for the product (e.g., "12345")
  //           "name": "<string>",  // Name of the product
  //           "quantity": <int>,  // Quantity of the product
  //           "unitprice": <float>,  // Unit price of the product
  //           "tax": <float>,  // Tax for the product
  //           "pricewithtax": <float>  // Total price including tax
  //         }
  //       ],
  //       "invoices": [
  //         {
  //           "id": "<string>",  // Unique identifier for the invoice (e.g., "invoice-12345")
  //           "serialNumber": "<string>",  // Serial Number of the invoice
  //           "customerName": "<string>",  // Customer name associated with the invoice
  //           "productName": "<string>",  // Name of the product on the invoice
  //           "quantity": <int>,  // Quantity of the product in the invoice
  //           "tax": <float>,  // Tax applied on the invoice
  //           "totalAmount": <float>,  // Total amount for the invoice (including tax)
  //           "date": "<string>"  // Date when the invoice was created (ISO 8601 format)
  //         }
  //       ],
  //       "customers": [
  //         {
  //           "id": "<string>",  // Unique identifier for the customer (e.g., "customer-12345")
  //           "customerName": "<string>",  // Name of the customer
  //           "phoneNumber": "<string>",  // Customer's phone number
  //           "totalPurchaseAmt": <float>  // Total purchase amount of the customer
  //         }
  //       ]
  //     },
  //     "request": "Please extract all the product, invoice, and customer data from the uploaded document and format it according to the schema above."
  //   }
  //   RULES OF DATA EXTRACTION:
  //   1.Return the data as a JSON array where each product's data is captured in the above structure.
  //   2.If any table's data (products,invoices or customers) seems missing, then return an empty array and it the response is to be fed to a database.
  //   3.Maintain proper JSON format always, if the response is growing larger than your response capability then terminate gracefully, maintaining a proper json format. There should not be " Unexpected end of JSON input" while parsing the data.

  // `;

  const query = `
  Enhanced Invoice Extraction Specification  
  OUTPUT FORMAT [MUST BE ONLY THIS JSON OUTPUT AND NO OTHER DATA/TEXT]  
  {  
      "products": [  
          {  
              "id": string | null,            // Unique identifier for the product (e.g., "12345"), null if unavailable  
              "name": string | null,          // Name of the product, null if unavailable  
              "quantity": number | 0,         // Quantity of the product, default to 0  
              "unitPrice": number | 0,        // Unit price of the product, default to 0  
              "tax": number | 0,              // Tax for the product, default to 0  
              "priceWithTax": number | 0      // Total price including tax, default to 0  
          }  
      ],  
      "invoices": [  
          {  
              "id": string | null,            // Unique identifier for the invoice, null if unavailable  
              "serialNumber": string | null,  // Serial Number of the invoice, null if unavailable  
              "customerName": string | null,  // Customer name associated with the invoice, null if unavailable  
              "productName": string | null,   // Name of the product on the invoice, null if unavailable  
              "quantity": number | 0,         // Quantity of the product in the invoice, default to 0  
              "tax": number | 0,              // Tax applied on the invoice, default to 0  
              "totalAmount": number | 0,      // Total amount for the invoice (including tax), default to 0  
              "date": string | null           // Date when the invoice was created (ISO 8601 format), null if invalid/missing  
          }  
      ],  
      "customers": [  
          {  
              "id": string | null,            // Unique identifier for the customer, null if unavailable  
              "customerName": string | null,  // Name of the customer, null if unavailable  
              "phoneNumber": string | null,   // Customer's phone number, null if unavailable  
              "totalPurchaseAmt": number | 0  // Total purchase amount of the customer, default to 0  
          }  
      ]  
  }  
  
  EXTRACTION RULES  
  1. **Multi-Entity Handling**  
  
  - **Invoices:**  
    - Ensure every invoice field has a default value ("null" or 0) if data is unavailable.  
    - Support multiple invoices in a single document with consistent field handling.  
  
  - **Products:**  
    - Populate all product fields with defaults for missing values.  
    - Track and summarize product information across invoices.  
  
  - **Customers:**  
    - Assign default values (null or 0) to missing customer information.  
    - Capture customer interaction details even if incomplete.  
  
  2. **Data Types and Processing**  
  
  - **Null Values:**  
    - Explicitly use null or default values for all undefined or missing fields.  
  
  - **Monetary Values:**  
    - Convert all monetary values to numbers.  
    - Remove currency symbols.  
    - Round to 2 decimal places.  
  
  - **Date Handling:**  
    - Standardize dates to ISO 8601 format.  
    - Default to null for invalid or missing dates.  
  
  3. **Validation and Consistency**  
  
  - Cross-check identifiers and ensure consistency.  
  - Validate all calculations for total amounts, taxes, and quantities.  
  
  4. **Advanced Features**  
  
  - Always generate complete JSON structures with placeholders for undefined data.  
  - Adapt to various document types, ensuring data completeness and accuracy.  
  
  EXAMPLE OUTPUT  
  {  
      "products": [  
          {  
              "id": "12345",  
              "name": "Laptop",  
              "quantity": 2,  
              "unitPrice": 750.00,  
              "tax": 75.00,  
              "priceWithTax": 825.00  
          },  
          {  
              "id": null,  
              "name": null,  
              "quantity": 0,  
              "unitPrice": 0,  
              "tax": 0,  
              "priceWithTax": 0  
          }  
      ],  
      "invoices": [  
          {  
              "id": "invoice-12345",  
              "serialNumber": "INV-2024-001",  
              "customerName": "John Doe",  
              "productName": "Laptop",  
              "quantity": 2,  
              "tax": 75.00,  
              "totalAmount": 825.00,  
              "date": "2024-11-26"  
          },  
          {  
              "id": null,  
              "serialNumber": null,  
              "customerName": null,  
              "productName": null,  
              "quantity": 0,  
              "tax": 0,  
              "totalAmount": 0,  
              "date": null  
          }  
      ],  
      "customers": [  
          {  
              "id": "customer-12345",  
              "customerName": "John Doe",  
              "phoneNumber": "1234567890",  
              "totalPurchaseAmt": 825.00  
          },  
          {  
              "id": null,  
              "customerName": null,  
              "phoneNumber": null,  
              "totalPurchaseAmt": 0  
          }  
      ]  
  }  
  
  PROCESSING GUIDELINES  
  
  - Always handle undefined or missing fields with explicit default values.  
  - Maintain strict adherence to schema requirements for data completeness.  
  - Adapt to flexible document structures with robustness.  
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
    console.log("cleanedResponseText", cleanedResponseText);

    // JSON.parse(cleanedResponseText);

    const data = JSON.parse(cleanedResponseText);

    console.log("Valid Data:", JSON.stringify(data, null, 2));

    const { products, invoices, customers } = data;

    // Push the extracted products to the MongoDB database using Prisma
    if (Array.isArray(products)&&products.length) {
      const createdProducts = await prismadb.product.createMany({
        data: products.map((product: any) => ({
          name: product.name,
          quantity: product.quantity,
          unitprice: product.unitprice,
          tax: product.tax,
          pricewithtax: product.pricewithtax,
        })),
      });
    } else {
      console.log(
        "The document did not have enough data to produce a PRODUCT array"
      );
    }

    if (Array.isArray(invoices)&&invoices.length) {
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
    } else {
      console.log(
        "The document did not have enough data to produce a INVOICES array"
      );
    }

    if (Array.isArray(customers)&&customers.length) {
      const createdCustomers = await prismadb.customer.createMany({
        data: customers.map((customer: any) => ({
          customerName: customer.customerName,
          phoneNumber: customer.phoneNumber,
          totalPurchaseAmt: customer.totalPurchaseAmt,
        })),
      });
    } else {
      console.log(
        "The document did not have enough data to produce a INVOICES array"
      );
    }

    return {
      success: true,
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
