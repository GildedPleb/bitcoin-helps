import { Argument, InputPair, Language } from "@prisma/client";
import prisma from "./context";

type Event = Argument & {
  inputPair: InputPair & {
    arguments: Argument[];
    language: Language;
  };
};

export const handler = async ({ inputPair }: Event) =>
  prisma.inputPair.update({
    where: { id: inputPair.id },
    data: { hits: inputPair.hits + 1 },
    include: { arguments: true, language: true },
  });

export default handler;
