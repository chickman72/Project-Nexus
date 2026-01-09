# 📘 Azure LiteLLM: Model Update Procedure

**Project:** UAB AI Gateway
**Goal:** Add a new model (e.g., `gpt-5.2`, `gpt-4.1-nano`) to the gateway and ensure apps connect successfully.

---

### Phase 1: Update the Gateway (Azure)

You cannot simply restart the Azure Web App. You must **version up** the Docker image to force Azure to recognize the change.

#### **1. Update Configuration Locally**

Edit `litellm_config.yaml`. Add the new model block to the `model_list`. The file is in C:\Docker\uab-ai-gateway

```yaml
model_list:
  # ... existing models ...

  - model_name: gpt-5.2  # The name your apps will use
    litellm_params:
      model: azure/gpt-5.2  # MUST match the Deployment Name in Azure OpenAI
      api_base: "https://uabopenai.openai.azure.com"
      api_key: "YOUR_AZURE_OPENAI_KEY"
      api_version: "2024-05-01-preview"

```

#### **2. Build with a New Tag (Increment Version)**

**CRITICAL:** Do not overwrite the existing tag (e.g., `v1`). Azure caches aggressively. Always increment the number (`v2`, `v3`, etc.).

```powershell
# Example: Moving from v3 to v4
az acr build --registry uabaiacr --image uab-ai-gateway:v4 .

```

#### **3. Point Azure to the New Version**

This command updates the Web App configuration and triggers a restart.

```powershell
az webapp config container set --name uabailitellm --resource-group Web_App_Development --docker-custom-image-name uabaiacr.azurecr.io/uab-ai-gateway:v4

```

#### **4. Verify Connectivity**

Wait 60 seconds. Run this curl command using the **Master Key** to confirm the new model is active.

```powershell
curl --location "https://uabailitellm-che5esandmd8fwaf.centralus-01.azurewebsites.net/chat/completions" ^
  --header "Authorization: Bearer sk-uab-secure-key-123" ^
  --header "Content-Type: application/json" ^
  --data "{ \"model\": \"gpt-5.2\", \"messages\": [{\"role\": \"user\", \"content\": \"System Check\"}] }"

```

---

### Phase 2: Client App Connectivity (Project Nexus)

If your app (Project Nexus) fails with **`"error": "No connected db"`**, it means the app is sending the **wrong API Key**.

#### **1. Check the `.env` Formatting**

Ensure your `.env` file has **no spaces** around the equals sign and **no quotes** around the value.

* ❌ **BAD:** `LITELLM_API_KEY = "sk-uab-secure-key-123"`
* ✅ **GOOD:** `LITELLM_API_KEY=sk-uab-secure-key-123`

#### **2. Check for "Zombie" System Variables (Windows)**

If updating `.env` doesn't work, Windows might be overriding it with a stale system variable. Run this in PowerShell to check:

```powershell
# Check if a zombie variable exists
$env:LITELLM_API_KEY

```

**If it returns an old key:**

1. **Delete it:** `Remove-Item Env:\LITELLM_API_KEY`
2. **Restart Terminal:** Close VS Code completely and reopen it.

#### **3. Restart the Dev Server**

Environment variables are often loaded only on startup.

```bash
# Stop server (Ctrl + C)
npm run dev

```

---

### 🛑 Troubleshooting Checklist

| Error | Cause | Fix |
| --- | --- | --- |
| **"Invalid model name"** | Azure is still running the old Docker image. | **Phase 1, Step 2:** Build a NEW tag (e.g., `v5`) and update the Web App. |
| **"No connected db"** | The Client App is sending a non-Master key. | **Phase 2:** Check `.env` for typos, spaces, or "Zombie" system variables. |
| **"Application Error"** | Startup command conflict or port mismatch. | Ensure `WEBSITES_PORT=4000` and `Startup Command` is empty (`""`). |