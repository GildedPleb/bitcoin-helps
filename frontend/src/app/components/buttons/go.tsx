import MyButton from "./styles/base";

interface GoButtonProperties {
  onClick: () => Promise<void>;
  disabled: boolean;
  text: string | undefined;
}

const enoji = { __html: "&#x2753;&#x1F50D;&#x1F4A1;" };

/**
 *
 * @param root0 - Button props
 */
function GoButton({ onClick, disabled, text }: GoButtonProperties) {
  return (
    <MyButton
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={onClick}
      disabled={disabled}
      tooltip={text ?? "?"}
    >
      {text ?? <span dangerouslySetInnerHTML={enoji} />}
    </MyButton>
  );
}

export default GoButton;
