type SearchRecord = {
  id: string;
  content: string;
  embedding: number[];
};

export async function uploadToSearch(records: SearchRecord[]) {
  // Placeholder: send records to Azure AI Search.
  return { uploaded: records.length };
}
