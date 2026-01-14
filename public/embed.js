(function () {
  if (window.__nexusChatEmbedLoaded) return;
  window.__nexusChatEmbedLoaded = true;

  var scriptTag = document.currentScript;
  if (!scriptTag) {
    var scripts = document.getElementsByTagName("script");
    scriptTag = scripts[scripts.length - 1];
  }

  var defaultConfig = {
    apiKey: scriptTag && scriptTag.getAttribute("data-api-key"),
    apiUrl: (scriptTag && scriptTag.getAttribute("data-api-url")) || "/api/chat",
    mode: (scriptTag && scriptTag.getAttribute("data-mode")) || "floating",
    header: (scriptTag && scriptTag.getAttribute("data-header")) || "Ask SON AI",
    buttonLabel:
      (scriptTag && scriptTag.getAttribute("data-button-label")) ||
      "Nursing School Chat",
    placeholder:
      (scriptTag && scriptTag.getAttribute("data-placeholder")) ||
      "Ask about policies or tools...",
    intro:
      (scriptTag && scriptTag.getAttribute("data-intro")) ||
      "Hi! Ask me about SON tools, policies, or next steps."
  };

  function getConfigForElement(element) {
    return {
      apiKey: element.getAttribute("data-api-key") || defaultConfig.apiKey,
      apiUrl: element.getAttribute("data-api-url") || defaultConfig.apiUrl,
      mode: element.getAttribute("data-mode") || defaultConfig.mode,
      header: element.getAttribute("data-header") || defaultConfig.header,
      buttonLabel:
        element.getAttribute("data-button-label") || defaultConfig.buttonLabel,
      placeholder:
        element.getAttribute("data-placeholder") || defaultConfig.placeholder,
      intro: element.getAttribute("data-intro") || defaultConfig.intro
    };
  }

  function renderChatWidget(shadow, config) {
    var style = document.createElement("style");
    style.textContent = [
      ":host{all:initial}",
      ".nexus-root{position:fixed;right:24px;bottom:24px;z-index:999999;font-family:'Georgia',serif;color:#1b2a4a}",
      ".nexus-root.inline{position:relative;right:auto;bottom:auto;display:block;width:100%}",
      ".nexus-button{display:flex;align-items:center;gap:10px;border:none;border-radius:999px;padding:14px 18px;background:#102a43;color:#fff;font-size:14px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;box-shadow:0 18px 40px rgba(16,42,67,0.28)}",
      ".nexus-root.inline .nexus-button{display:none}",
      ".nexus-panel{position:absolute;right:0;bottom:64px;width:320px;max-height:440px;background:#f9f6f1;border-radius:24px;box-shadow:0 20px 50px rgba(16,42,67,0.24);display:none;flex-direction:column;overflow:hidden;border:1px solid rgba(16,42,67,0.1)}",
      ".nexus-root.inline .nexus-panel{position:relative;right:auto;bottom:auto;display:flex;width:100%;max-height:480px}",
      ".nexus-panel.open{display:flex}",
      ".nexus-header{padding:16px 18px;background:#d3e2f4;color:#102a43;font-weight:700;font-size:14px;letter-spacing:0.14em;text-transform:uppercase}",
      ".nexus-messages{padding:16px 18px;display:flex;flex-direction:column;gap:10px;overflow:auto;background:#f9f6f1}",
      ".nexus-bubble{padding:10px 12px;border-radius:16px;font-size:14px;line-height:1.4;max-width:80%}",
      ".nexus-bubble.user{align-self:flex-end;background:#102a43;color:#fff}",
      ".nexus-bubble.bot{align-self:flex-start;background:#fff;color:#1b2a4a;border:1px solid rgba(16,42,67,0.08)}",
      ".nexus-footer{display:flex;gap:8px;padding:12px 14px;background:#f1ede6;border-top:1px solid rgba(16,42,67,0.08)}",
      ".nexus-input{flex:1;border-radius:999px;border:1px solid rgba(16,42,67,0.2);padding:10px 12px;font-size:13px;background:#fff;outline:none}",
      ".nexus-send{border:none;border-radius:999px;padding:10px 14px;background:#c68434;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer}",
      ".nexus-send:disabled{opacity:0.6;cursor:not-allowed}",
      ".nexus-error{padding:8px 12px;margin:0 14px 12px;border-radius:12px;background:#fff3f2;color:#a2362a;font-size:12px;border:1px solid rgba(162,54,42,0.2)}"
    ].join("");
    shadow.appendChild(style);

    var root = document.createElement("div");
    root.className = "nexus-root";
    if (config.mode === "inline") {
      root.classList.add("inline");
    }

    var button = document.createElement("button");
    button.className = "nexus-button";
    button.type = "button";
    button.textContent = config.buttonLabel;

    var panel = document.createElement("div");
    panel.className = "nexus-panel";
    if (config.mode === "inline") {
      panel.classList.add("open");
    }

    var header = document.createElement("div");
    header.className = "nexus-header";
    header.textContent = config.header;

    var messages = document.createElement("div");
    messages.className = "nexus-messages";

    var footer = document.createElement("div");
    footer.className = "nexus-footer";

    var input = document.createElement("input");
    input.className = "nexus-input";
    input.type = "text";
    input.placeholder = config.placeholder;

    var sendButton = document.createElement("button");
    sendButton.className = "nexus-send";
    sendButton.type = "button";
    sendButton.textContent = "Send";

    footer.appendChild(input);
    footer.appendChild(sendButton);

    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(footer);

    root.appendChild(button);
    root.appendChild(panel);
    shadow.appendChild(root);

    function addMessage(content, role) {
      var bubble = document.createElement("div");
      bubble.className = "nexus-bubble " + role;
      bubble.textContent = content;
      messages.appendChild(bubble);
      messages.scrollTop = messages.scrollHeight;
    }

    function setError(message) {
      var existing = panel.querySelector(".nexus-error");
      if (existing) existing.remove();
      if (!message) return;
      var error = document.createElement("div");
      error.className = "nexus-error";
      error.textContent = message;
      panel.insertBefore(error, footer);
    }

    function setLoading(isLoading) {
      sendButton.disabled = isLoading;
      input.disabled = isLoading;
      sendButton.textContent = isLoading ? "..." : "Send";
    }

    var conversationId = null;

    async function sendMessage() {
      var text = input.value.trim();
      if (!text || !config.apiKey) return;
      setError("");
      addMessage(text, "user");
      input.value = "";
      setLoading(true);

      try {
        var response = await fetch(config.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey
          },
          body: JSON.stringify({
            message: text,
            conversationId: conversationId || undefined
          })
        });

        var data = await response.json();
        if (!response.ok) {
          throw new Error(data && data.error ? data.error : "Chat failed.");
        }

        if (data && data.conversationId) {
          conversationId = data.conversationId;
        }
        addMessage(data.reply || "No response received.", "bot");
      } catch (err) {
        setError(err && err.message ? err.message : "Chat failed.");
      } finally {
        setLoading(false);
      }
    }

    addMessage(config.intro, "bot");

    if (!config.apiKey) {
      setError("Missing API key for chat widget.");
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });

    sendButton.addEventListener("click", sendMessage);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });
  }

  if (!customElements.get("nexus-chat-widget")) {
    customElements.define(
      "nexus-chat-widget",
      class extends HTMLElement {
        connectedCallback() {
          if (this._mounted) return;
          this._mounted = true;
          var shadow = this.attachShadow({ mode: "open" });
          var config = getConfigForElement(this);
          renderChatWidget(shadow, config);
        }
      }
    );
  }

  var existingWidgets = document.querySelectorAll("nexus-chat-widget");
  if (existingWidgets.length === 0) {
    var autoMount =
      !scriptTag || scriptTag.getAttribute("data-auto-mount") !== "false";
    if (autoMount) {
      var widget = document.createElement("nexus-chat-widget");
      document.body.appendChild(widget);
    }
  }
})();
