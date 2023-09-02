import { isRtl } from "../../../providers/language";
import { TextBlock, TextParagraph } from "../../components";
import createGenerateUniqueKey from "../../utilities/key-generator";

const generateUniqueKey = createGenerateUniqueKey();

/**
 *
 * @param root0 - props
 */
function Argument({
  inputPair,
  language,
}: {
  inputPair: { arguments: Array<{ content: string }> };
  language: string;
}) {
  const direction = isRtl(language);

  return (
    <TextBlock>
      <div>
        {inputPair.arguments.map((essay) => (
          <TextParagraph
            isRtl={direction}
            key={generateUniqueKey(JSON.stringify(essay))}
          >
            {essay.content.split(/\n+/).map((paragraph) => (
              <p key={generateUniqueKey(paragraph)}>{paragraph}</p>
            ))}
          </TextParagraph>
        ))}
      </div>
    </TextBlock>
  );
}

export default Argument;
