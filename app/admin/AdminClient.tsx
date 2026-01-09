"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter, useSearchParams } from "next/navigation";

type UploadStatus = "Processing" | "Indexed" | "Failed";

type UploadItem = {
  id: string;
  filename: string;
  status: UploadStatus;
  detail?: string;
};

const statusClasses: Record<UploadStatus, string> = {
  Processing: "bg-amber-100 text-amber-700",
  Indexed: "bg-emerald-100 text-emerald-700",
  Failed: "bg-rose-100 text-rose-700"
};

export default function AdminClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("admin") !== "true") {
      router.replace("/");
    }
  }, [router, searchParams]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    const uploadId = `${file.name}-${Date.now()}`;

    setUploads((prev) => [
      {
        id: uploadId,
        filename: file.name,
        status: "Processing"
      },
      ...prev
    ]);
    setErrorMessage("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Upload failed.");
      }

      setUploads((prev) =>
        prev.map((item) =>
          item.id === uploadId ? { ...item, status: "Indexed" } : item
        )
      );
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "Upload failed.";
      setErrorMessage(detail);
      setUploads((prev) =>
        prev.map((item) =>
          item.id === uploadId
            ? { ...item, status: "Failed", detail }
            : item
        )
      );
    } finally {
      setIsUploading(false);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    open
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"]
    },
    multiple: false,
    noClick: true
  });

  const dropzoneMessage = useMemo(() => {
    if (isDragReject) return "Only PDF or TXT files are accepted.";
    if (isDragActive) return "Drop the file to start ingestion.";
    return "Drag a PDF or TXT here, or use the browse button.";
  }, [isDragActive, isDragReject]);

  return (
    <main className="min-h-screen bg-[color:var(--nexus-sand)] px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin Portal
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[color:var(--nexus-blue)] md:text-4xl">
            Knowledge Base Ingestion
          </h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            Upload PDFs or TXT files to expand Project Nexus context for RAG.
          </p>
        </header>

        <section className="rounded-3xl border border-dashed border-slate-300 bg-white/90 p-8 shadow-card">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center rounded-2xl border border-transparent px-6 py-10 text-center transition ${
              isDragActive
                ? "bg-[color:var(--nexus-ice)] text-[color:var(--nexus-blue)]"
                : "bg-white"
            } ${isDragReject ? "border-rose-300 text-rose-600" : ""}`}
          >
            <input {...getInputProps()} />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Drag & Drop Upload
            </p>
            <p className="mt-4 text-base font-medium text-slate-700">
              {dropzoneMessage}
            </p>
            <button
              type="button"
              onClick={open}
              className="mt-6 rounded-full bg-[color:var(--nexus-blue)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--nexus-blue-light)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Browse files"}
            </button>
          </div>
          {errorMessage ? (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-slate-800">
              Recent Uploads
            </h2>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {uploads.length} total
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {uploads.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                No uploads yet. Drag a file above to begin.
              </p>
            ) : (
              uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200 px-4 py-4 text-sm md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-700">
                      {upload.filename}
                    </p>
                    {upload.detail ? (
                      <p className="mt-1 text-xs text-rose-600">
                        {upload.detail}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[upload.status]}`}
                  >
                    {upload.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
