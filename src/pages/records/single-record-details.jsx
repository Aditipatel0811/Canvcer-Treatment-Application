import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  IconChevronRight,
  IconFileUpload,
  IconProgress,
} from "@tabler/icons-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../context/index";
import FileUploadModal from "./components/file-upload-modal";
import RecordDetailsHeader from "./components/record-details-header";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

function SingleRecordDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [filetype, setFileType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(state.analysisResult || "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { updateRecord } = useStateContext();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected || !selected.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    setFile(selected);
    setFilename(selected.name);
    setFileType(selected.type);
  };

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async () => {
    setUploading(true);
    setUploadSuccess(false);

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    try {
      const base64Data = await readFileAsBase64(file);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const result = await model.generateContent([
        `You are an expert in analyzing medical reports (especially for cancer and major diseases). 
        Review the following uploaded report and generate a clear, paragraph-formatted, easy-to-understand treatment plan tailored for the patient. Avoid jargon and make it readable.`,
        {
          inlineData: {
            data: base64Data,
            mimeType: filetype,
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      setAnalysisResult(text);
      await updateRecord({
        documentID: state.id,
        analysisResult: text,
        kanbanRecords: "",
      });

      setUploadSuccess(true);
      setIsModalOpen(false);
      setFile(null);
      setFilename("");
      setFileType("");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload and analyze the report. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const processTreatmentPlan = async () => {
    setIsProcessing(true);

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
Use the following treatment plan to generate a structured kanban task board. Divide it into:
•⁠  ⁠Todo: Tasks not started
•⁠  ⁠Doing: Tasks in progress
•⁠  ⁠Done: Completed tasks

Each task should be a brief actionable step. Output should be JSON in the structure below (no markdown or extra explanation):

{
  "columns": [
    { "id": "todo", "title": "Todo" },
    { "id": "doing", "title": "Work in progress" },
    { "id": "done", "title": "Done" }
  ],
  "tasks": [
    { "id": "1", "columnId": "todo", "content": "Initial consultation with oncologist" },
    { "id": "2", "columnId": "doing", "content": "Radiation therapy session" },
    { "id": "3", "columnId": "done", "content": "Blood test completed" }
  ]
}

Treatment plan: ${analysisResult}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        console.error("JSON parse error:", err);
        alert("Error parsing treatment plan. Please try again.");
        return;
      }

      await updateRecord({
        documentID: state.id,
        kanbanRecords: text,
      });

      navigate("/screening-schedules", { state: parsed });
    } catch (err) {
      console.error("Processing error:", err);
      alert("Failed to process treatment plan.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-[26px]">
      <button
        type="button"
        onClick={handleOpenModal}
        className="mt-6 inline-flex items-center gap-x-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 dark:border-neutral-700 dark:bg-[#13131a] dark:text-white dark:hover:bg-neutral-800"
      >
        <IconFileUpload />
        Upload Reports
      </button>

      <FileUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFileChange={handleFileChange}
        onFileUpload={handleFileUpload}
        uploading={uploading}
        uploadSuccess={uploadSuccess}
        filename={filename}
      />

      <RecordDetailsHeader recordName={state.recordName} />

      <div className="w-full">
        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="inline-block min-w-full p-1.5 align-middle">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-[#13131a]">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-neutral-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">
                    Personalized AI-Driven Treatment Plan
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    A tailored medical strategy leveraging advanced AI insights.
                  </p>
                </div>

                <div className="flex w-full flex-col px-6 py-4 text-white">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Analysis Result
                    </h2>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                      {analysisResult ? (
                        <ReactMarkdown>{analysisResult}</ReactMarkdown>
                      ) : (
                        <p className="italic">No analysis available. Upload a report first.</p>
                      )}
                    </div>
                  </div>

                  {analysisResult && (
                    <div className="mt-5 grid gap-2 sm:flex">
                      <button
                        type="button"
                        onClick={processTreatmentPlan}
                        disabled={processing}
                        className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                      >
                        View Treatment plan
                        {processing ? (
                          <IconProgress size={20} className="ml-2 animate-spin" />
                        ) : (
                          <IconChevronRight size={20} />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 px-6 py-4 dark:border-neutral-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleRecordDetails;