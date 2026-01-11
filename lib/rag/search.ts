import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

// 1. Load Environment Variables
const endpoint = process.env.AZURE_SEARCH_ENDPOINT || "";
const apiKey = process.env.AZURE_SEARCH_KEY || "";
const indexName = process.env.AZURE_SEARCH_INDEX || "uab-nursing-index";

type SearchResultDocument = {
  title?: string;
  chunk?: string;
};

// 2. Define the "Retrieval" Function
export async function getContext(query: string): Promise<string> {
  if (!endpoint || !apiKey) {
    console.error("❌ Azure Search credentials missing in Environment Variables.");
    return "";
  }

  try {
    const client = new SearchClient<SearchResultDocument>(
      endpoint,
      indexName,
      new AzureKeyCredential(apiKey)
    );

    console.log(`🔍 Querying Azure Search for: "${query}"`);

    // 3. Execute the Search
    const searchResults = await client.search(query, {
      top: 3,
      // FIX: Select the fields that ACTUALLY exist in your index
      select: ["chunk", "title"], 
    });

    // 4. Format the Results
    let context = "";
    for await (const result of searchResults.results) {
      // FIX: Use .title and .chunk properties
      const sourceName = result.document.title || "Unknown Document";
      const textContent = result.document.chunk || "";

      context += `\n--- SOURCE: ${sourceName} ---\n`;
      context += `${textContent}\n`;
    }

    if (!context) {
      console.log("⚠️ No relevant documents found in index.");
    } else {
      console.log("✅ Found context.");
    }

    return context;

  } catch (error) {
    console.error("❌ RAG Search Error:", error);
    return "";
  }
}
