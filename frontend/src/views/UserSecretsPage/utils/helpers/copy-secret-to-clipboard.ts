import { createNotification } from "@app/components/notifications";

export const handleCopySecretToClipboard = (value: string) => {
  if (value) {
    try {
      window.navigator.clipboard.writeText(value);
      createNotification({ type: "success", text: "Copied secret to clipboard" });
    } catch (error) {
      console.log(error);
      createNotification({ type: "error", text: "Failed to copy secret to clipboard" });
    }
  }
};
