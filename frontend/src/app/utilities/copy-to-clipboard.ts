const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch((error) => {
      console.error("Could not copy text:", error);
    });
};

export default copyToClipboard;
