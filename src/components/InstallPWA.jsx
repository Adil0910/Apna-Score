import { useEffect, useState } from "react";

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen install event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detect install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  // ❌ Already installed → kuch show mat karo
  if (isInstalled || !deferredPrompt) return null;

  return (      <button
  id="installBtn"
  style={{
    padding: "10px 15px",
    background: "#fbfdff",
    color: "#0d47a1",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
   Install App
</button>

  );
};

export default InstallPWA;