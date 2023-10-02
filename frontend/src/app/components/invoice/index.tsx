import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { decode } from "@holepunch/light-bolt11-decoder";
import { useCallback, useState } from "react";
import QRCode from "react-qr-code";

import { type GetSpeedUpInvoiceQuery } from "../../../graphql/generated";
import fadeIn from "../../../styles/fade-in";
import fadeOut from "../../../styles/fade-out";
// import { type LeftToRightOrRightToLeft } from "../../../types";
import { FADE_IN_OUT } from "../../../utilities/constants";
import copyToClipboard from "../../utilities/copy-to-clipboard";

const Container = styled.div<{ willUnmount: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: clamp(1.1rem, 3.5vw, 2rem);
  text-align: center;
  line-height: 1.5;
  min-height: 2em;
  max-width: 500px;

  ${(properties) =>
    properties.willUnmount
      ? css`
          animation: ${fadeOut} ${FADE_IN_OUT / 1000}s 0s forwards;
        `
      : css`
          animation: ${fadeIn} ${FADE_IN_OUT / 1000}s 0s forwards;
        `}
`;

const PaymentRequest = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

const Address = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: ltr;
  max-width: 250px;
  font-size: 1.1rem;
`;

const sharedButtonStyles = css`
  border-radius: 50%;
  border: 2px solid white;
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  background-color: transparent;
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    border: 2px solid orange;
  }
  &:focus {
    outline: none;
    border: 2px solid #2684ff;
  }
`;

const StyledCopyButton = styled.button`
  ${sharedButtonStyles}
`;

const QRCodeStyles = { width: "100%" };

/**
 *
 * @param root0 - props
 */
function Invoice({
  invoice,
  willUnmount,
  readNow = "",
}: {
  invoice: GetSpeedUpInvoiceQuery;
  willUnmount: boolean;
  readNow: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    setCopied(true);
    copyToClipboard(invoice.getSpeedUpInvoice?.paymentRequest ?? "");
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }, [invoice]);

  const satoshiAmount =
    Number(
      (
        decode(invoice.getSpeedUpInvoice?.paymentRequest ?? "").sections.find(
          (section) => section.name === "amount"
        ) ?? { value: "0" }
      ).value
    ) / 1000;

  return (
    <Container willUnmount={willUnmount}>
      <div>
        {readNow} <i className="fak fa-satoshisymbol-solidcirtilt" />{" "}
        {satoshiAmount}
      </div>
      <QRCode
        value={invoice.getSpeedUpInvoice?.paymentRequest ?? ""}
        size={Math.min(window.innerWidth - 40, 250)}
        style={QRCodeStyles}
      />
      <PaymentRequest>
        <StyledCopyButton onClick={handleCopy}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            strokeWidth="3"
            width="32"
            height="32"
          >
            <circle cx="32" cy="32" r="31" fill="white" />
            <rect
              x="15"
              y="12"
              width="24"
              height="32"
              fill={copied ? "orange" : "black"}
              stroke="white"
            />
            <rect
              x="22"
              y="18"
              width="24"
              height="32"
              fill={copied ? "orange" : "black"}
              stroke="white"
            />
          </svg>
        </StyledCopyButton>
        <Address>{invoice.getSpeedUpInvoice?.paymentRequest}</Address>
      </PaymentRequest>
    </Container>
  );
}

export default Invoice;
