"use client";

import { upload } from "@/actions/uploadLogic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function UploadPage() {
  const [loading, setLoading] = useState(false); // Initialize as false

  async function uploader(data: FormData) {
    try {
      if (!data) {
        toast.error("No file present");
        return;
      }
      setLoading(true); // Start loading

      const { success, error } = await upload(data);
      setLoading(false); // Stop loading when upload is complete

      if (success) {
        toast.success("File received");
      } else {
        toast.error(error || "An error occurred");
      }
    } catch (error) {
      console.error("Error during upload:", error);
      setLoading(false); // Ensure loading stops on error
    }
  }

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
      <Toaster />
      <form
        action={uploader} // Use the uploader function as the form's server action
        className="flex flex-col items-center justify-center gap-6 bg-white shadow-lg rounded-lg p-8 w-full max-w-md border"
      >
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">
          Upload Your File
        </h1>
        <Input
          className="bg-gray-50 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 w-full py-2 px-4 rounded-md"
          type="file"
          name="file"
        />
        <Button
          className="w-full py-2 bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 rounded-md font-medium flex items-center justify-center"
          type="submit"
          disabled={loading}
        >
          {loading ? <Spinner /> : "Upload"}
        </Button>
      </form>
    </main>
  );
}
