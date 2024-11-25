//

"use server";
import { tmpdir } from "os";
import { processDocument } from "@/actions/documentProcessing";
import { processImage } from "@/actions/imageProcessing";
import { writeFile } from "fs/promises";
import { join } from "path";
import { read, utils } from "xlsx";
import { Browser as CoreBrowser } from "puppeteer-core";
import { Browser } from "puppeteer";
import chromium from "@sparticuz/chromium-min";

export async function upload(
  data: FormData
): Promise<{ success?: string; error?: string }> {
  const tmpDirectory = tmpdir();
  try {
    const file: File | null = data.get("file") as unknown as File;
    // console.log(tmpDirectory);

    if (!file || file.size === 0) {
      return {
        error: "No file uploaded",
      };
    }

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // const currentDirectory = process.cwd();
    let path = "";

    if (file.name.endsWith(".xlsx")) {
      const workbook = read(buffer);

      // Get the first sheet data
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet to HTML
      const json = utils.sheet_to_json(sheet);
      // console.log(json);

      const jsonText = JSON.stringify(json, null, 2); // Pretty print JSON with 2 spaces

      // Define the path for saving the text file
      path = join(tmpDirectory, file.name.replace(".xlsx", ".txt"));

      // Save the JSON as a text file
      await writeFile(path, jsonText, "utf-8");
      console.log(`Saved as text file: ${path}`);
    } else {
      // Handle non-XLSX files by saving them directly
      path = join(tmpDirectory, file.name);
      await writeFile(path, buffer);
    }

    // Check the file type and process accordingly
    if (path.endsWith(".pdf")) {
      console.log("control");
      await processDocument(path);
    } else if (path.endsWith(".jpg")) {
      await processImage(path);
    } else if (path.endsWith(".txt")) {
      await processDocument(path);
    }

    // console.log(`File uploaded successfully at: ${path}`);

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
