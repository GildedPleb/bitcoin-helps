import {
  type ApolloLink,
  type FetchResult,
  Observable,
  type Observer,
  type Operation,
  type RequestHandler,
} from "@apollo/client";

import { type Subscription } from "../generated";

const createBatchLink = (
  wsLink: ApolloLink,
  batchInterval = 100
): RequestHandler => {
  let incomingQueue: Array<FetchResult<Subscription>> = [];
  let currentSequence = 0;
  let outputSequence = 0;

  const sendBatch = (observer: Observer<FetchResult<Subscription>>) => {
    if (incomingQueue.length === 0) return;

    incomingQueue.sort(
      (a, b) =>
        (a.data?.subscribeToArgument?.sequence ?? 0) -
        (b.data?.subscribeToArgument?.sequence ?? 0)
    );

    let message = "";

    while (incomingQueue.length > 0) {
      const item = incomingQueue[0];
      if (!item.data?.subscribeToArgument) break;
      const {
        type,
        sequence,
        message: itemMessage,
      } = item.data.subscribeToArgument;

      if (type === "Finish") {
        console.log("Finished");
        observer.next?.({
          ...item,
          errors: [],
          extensions: undefined,
        });
        incomingQueue.shift();
        currentSequence += 1;
        return;
      }

      if (sequence === currentSequence) {
        message += itemMessage;
        currentSequence += 1;
        incomingQueue.shift();
      } else {
        console.log("Out of sequence", sequence, currentSequence);
        break;
      }
    }

    if (message.length > 0) {
      const batchedMessage: FetchResult<Subscription> = {
        data: {
          subscribeToArgument: {
            type: "Update",
            message,
            sequence: outputSequence,
          },
        },
        errors: [],
        extensions: undefined,
        context: {},
      };
      observer.next?.(batchedMessage);
      outputSequence += 1;
    }
  };

  const requestHandler: RequestHandler = (operation: Operation) =>
    new Observable<FetchResult>((observer) => {
      const interval = setInterval(() => {
        sendBatch(observer);
      }, batchInterval);

      const sub = wsLink.request(operation)?.subscribe({
        next: (data: FetchResult) => {
          incomingQueue.push(data);
        },
        error: observer.error.bind(observer),
        complete: () => {
          Promise.resolve()
            // eslint-disable-next-line promise/always-return
            .then(() => {
              console.log("Calling complete");
              clearInterval(interval);
              sendBatch(observer);
              observer.complete();
              incomingQueue = [];
              currentSequence = 0;
              outputSequence = 0;
            })
            .catch((error) => {
              console.error(error);
            });
        },
      });

      return () => {
        if (sub) sub.unsubscribe();
        clearInterval(interval);
        console.log("Calling return");
        Promise.resolve()
          // eslint-disable-next-line promise/always-return
          .then(() => {
            sendBatch(observer);
            incomingQueue = [];
            currentSequence = 0;
            outputSequence = 0;
          })
          .catch((error) => {
            console.error(error);
          });
      };
    });

  return requestHandler;
};

export default createBatchLink;
