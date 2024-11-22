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
    let path;

    if (file.name.endsWith(".xlsx")) {
      const workbook = read(buffer);

      // Get the first sheet data
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet to HTML
      const html = utils.sheet_to_html(sheet);

      console.log("control1");
      // Launch Puppeteer to convert HTML to PDF
      let browser: Browser | CoreBrowser;
      const isProd = process.env.NODE_ENV === 'production';

      console.log(isProd);
      if (process.env.isProd) {
        const puppeteer = await import("puppeteer-core");
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        });
      } else {
        const puppeteer = await import("puppeteer");
        browser = await puppeteer.launch({
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          headless: true,
        });
      }

      const page = await browser.newPage();
      console.log("control2");

      await page.setContent(html);

      // Create the PDF from the HTML content
      console.log("control3");

      const num = Math.random();
      console.log("control4");

      path = join(tmpDirectory, `converted_${num}.pdf`);
      console.log("control5");

      await page.pdf({ path: path, format: "A4" });
      console.log("control6");
      // Close the browser instance
      console.log(path);
      await browser.close();
    } else {
      // Handle non-XLSX files by saving them directly
      path = join(tmpDirectory, file.name);
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
