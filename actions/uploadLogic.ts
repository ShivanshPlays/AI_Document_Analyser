"use server";

import { processDocument } from "@/actions/documentProcessing";
import { processImage } from "@/actions/imageProcessing";
import { writeFile } from "fs/promises";
import { join } from "path";
import { read, utils } from "xlsx";
import { launch } from "puppeteer";

export async function upload(data: FormData): Promise<{ success?: string; error?: string }> {
  try {
    const file: File | null = data.get("file") as unknown as File;

    if (!file || file.size === 0) {
      return {
        error: "No file uploaded",
      };
    }

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    const currentDirectory = process.cwd();
    let path;

    if (file.name.endsWith(".xlsx")) {
      const workbook = read(buffer);

      // Get the first sheet data
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
    
      // Convert sheet to HTML 
      const html = utils.sheet_to_html(sheet);

      // Launch Puppeteer to convert HTML to PDF
      const browser = await launch();
      const page = await browser.newPage();
      await page.setContent(html);

      // Create the PDF from the HTML content
      const num = Math.random();
      path = currentDirectory + "/tmp" + "/converted_" + num + ".pdf";
      await page.pdf({ path: path, format: "A4" });

      // Close the browser instance
      await browser.close();
    } else {
      // Handle non-XLSX files by saving them directly
      path = join(currentDirectory + "/tmp", file.name);
      await writeFile(path, buffer);
    }

    // Check the file type and process accordingly
    if (path.endsWith(".pdf")) {
      await processDocument(path);
    } else if (path.endsWith(".jpg")) {
      await processImage(path);
    }

    console.log(`File uploaded successfully at: ${path}`);

    // Return success message
    return {
      success: `File uploaded successfully to: ${path}`,
    };
  } catch (error: unknown) {
    // Type narrowing to check if the error is an instance of Error
    if (error instanceof Error) {
      console.error("Error parsing file", error.message);

      return {
        error: error.message || "Failed parsing file",
      };
    } else {
      console.error("Unexpected error:", error);

      return {
        error: "An unexpected error occurred",
      };
    }
  }
}
