const createGenerateUniqueKey = () => {
  const encounteredParagraphs: Record<string, number> = {};
  return (rawItem: string | number) => {
    const item = `#${String(rawItem).trim()}~`;
    if (!(item in encounteredParagraphs)) {
      encounteredParagraphs[item] = 0;
      return `${item}-0`;
    }
    const count = encounteredParagraphs[item];
    encounteredParagraphs[item] += 1;
    return `${item}-${count}`;
  };
};

export default createGenerateUniqueKey;
