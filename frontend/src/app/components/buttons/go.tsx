import MyButton from "./styles/base";

interface GoButtonProperties {
  onClick: () => Promise<void>;
  disabled: boolean;
  text: string | undefined;
}

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
      tooltip={text ?? "❓🔍💡"}
    >
      {text ?? "❓🔍💡"}
    </MyButton>
  );
}

export default GoButton;
