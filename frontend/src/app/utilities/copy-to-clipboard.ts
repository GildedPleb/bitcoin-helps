const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Copying to clipboard was successful!");
      return true;
    })
    .catch((error) => {
      console.error("Could not copy text:", error);
    });
};

export default copyToClipboard;
