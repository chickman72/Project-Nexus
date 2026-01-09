import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { status: "error", message: "File is required." },
      { status: 400 }
    );
  }

  // Step 1 (Mock): Log the filename for now.
  console.log(`[ingest] received file: ${file.name}`);

  // Step 2 (Structure): PDF/Text parsing will go here.
  // TODO: Parse PDF/TXT into raw text (lib/rag/parser.ts).

  // Step 2 (Structure): Embedding generation will go here.
  // TODO: Create embeddings for chunks (lib/rag/embeddings.ts).

  // Step 2 (Structure): Azure AI Search upload will go here.
  // TODO: Upload vectors + metadata into Azure Search (lib/rag/search.ts).

  return NextResponse.json({
    status: "success",
    message: "File received"
  });
}
