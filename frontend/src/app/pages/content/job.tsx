import { Invoice as AlbyInvoice } from "@getalby/lightning-tools";
import React, { useEffect, useState } from "react";

import {
  useGetSpeedUpInvoiceQuery,
  useSubscribeToArgumentSubscription,
  useSubscribeToInvoiceSubscription,
} from "../../../graphql/generated";
import { useLanguage } from "../../../providers/language";
import { useLoading } from "../../../providers/loading";
import { FADE_IN_OUT } from "../../../utilities/constants";
import {
  Countdown,
  Invoice,
  LoadingDots,
  TextBlock,
  TextParagraph,
} from "../../components";

/**
 *
 * @param root0 - props
 */
function Job({
  job: { jobId, scheduledFor },
  setShowLikeUnlike,
}: {
  job: { jobId: string; scheduledFor: string };
  setShowLikeUnlike: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [startSubscription, setStartSubscription] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ message: string; sequence: number }>
  >([]);
  const [willUnmountInvoice, setWillunmountInvoice] = useState(false);
  const [mountInvoice, setMountInvoice] = useState(true);

  const { language } = useLanguage();
  const { direction, value, translations } = language;
  const { setIsLoading } = useLoading();

  const scheduled = new Date(Number(scheduledFor)).getTime();
  const skip = scheduled < Date.now();

  const { data: invoiceData, refetch: invoiceRefetch } =
    useGetSpeedUpInvoiceQuery({ variables: { jobId }, skip });

  const { data: invoiceSubscriptionData } = useSubscribeToInvoiceSubscription({
    variables: { jobId },
    skip,
  });

  const { data: subscriptionData } = useSubscribeToArgumentSubscription({
    variables: { jobId },
    skip: !startSubscription,
  });

  useEffect(() => {
    const expiresAt = invoiceData?.getSpeedUpInvoice?.expiresAt;
    if (expiresAt !== undefined && expiresAt !== "") {
      const timeoutDuration = new Date(expiresAt).getTime() - Date.now();

      // Check if the invoice has already expired
      if (timeoutDuration < 0) {
        invoiceRefetch().catch((error) => {
          throw error;
        });
        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined;
      }

      // Set a timer to refetch the data once the expiration time is reached
      const timerId = setTimeout(() => {
        invoiceRefetch().catch((error) => {
          throw error;
        });
      }, timeoutDuration);

      // check if webLN exists and use it if it does
      void (async () => {
        try {
          if (!window.webln)
            throw new Error(
              "WebLN not supported or installed in this browser. For detials, see: https://www.webln.guide/introduction/readme"
            );
          const pr = invoiceData?.getSpeedUpInvoice?.paymentRequest ?? "";
          await window.webln.enable();
          const { preimage } = await window.webln.sendPayment(pr);
          const albyInvoice = new AlbyInvoice({ pr, preimage });
          if (await albyInvoice.isPaid()) setStartSubscription(true);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(
            typeof error === "object" && error !== null && "message" in error
              ? error.message
              : error
          );
        }
      })();

      return () => {
        clearTimeout(timerId);
      };
    }
    return () => {};
  }, [invoiceData, invoiceRefetch]);

  useEffect(() => {
    if (startSubscription) {
      setWillunmountInvoice(true);
      setTimeout(() => {
        setShowLikeUnlike(true);
        setMountInvoice(false);
      }, FADE_IN_OUT);
    }
  }, [setIsLoading, setShowLikeUnlike, startSubscription]);

  useEffect(() => {
    const timeUntilScheduledFor = scheduled - Date.now();

    if (timeUntilScheduledFor > 0) {
      setIsLoading(false);
      const timerId = setTimeout(() => {
        setStartSubscription(true);
      }, timeUntilScheduledFor - FADE_IN_OUT);

      return () => {
        clearTimeout(timerId);
      };
    }
    setStartSubscription(true);

    return () => {};
  }, [jobId, scheduled, setIsLoading]);

  useEffect(() => {
    const invoiceSub = invoiceSubscriptionData?.subscribeToInvoice;
    if (invoiceSub) {
      const { message, type } = invoiceSub;
      if (message === jobId && type === "paid") setStartSubscription(true);
    }
  }, [invoiceSubscriptionData?.subscribeToInvoice, jobId]);

  useEffect(() => {
    const frame = subscriptionData?.subscribeToArgument;
    if (frame?.message !== undefined && frame.message !== "") {
      const { message, sequence } = frame;
      setIsLoading(false);
      setMessages((previous) => [...previous, { message, sequence }]);
    }
  }, [setIsLoading, subscriptionData?.subscribeToArgument]);

  return (
    <>
      {!mountInvoice &&
        (messages.length > 0 ? (
          <TextBlock>
            <TextParagraph isRtl={direction}>
              {messages.map(({ sequence, message }) => (
                <React.Fragment key={sequence}>
                  {message.includes("\n") ? (
                    message.split("\n").flatMap((item, index, array) => {
                      const key = `${sequence}-${index}`;
                      const base = <span key={key}>{item}</span>;
                      return array.length - 1 === index
                        ? base
                        : [item !== "" && base, <br key={`${key}br`} />];
                    })
                  ) : (
                    <span>{message}</span>
                  )}
                </React.Fragment>
              ))}
            </TextParagraph>
          </TextBlock>
        ) : (
          <LoadingDots rightToLeft={direction} />
        ))}
      {mountInvoice && (
        <Countdown
          targetDate={scheduledFor}
          locale={value}
          willUnmount={willUnmountInvoice}
        />
      )}
      {mountInvoice && invoiceData && (
        <Invoice
          invoice={invoiceData}
          willUnmount={willUnmountInvoice}
          // direction={direction}
          readNow={translations?.readNow ?? ""}
        />
      )}
      {mountInvoice && <div />}
    </>
  );
}

export default Job;
