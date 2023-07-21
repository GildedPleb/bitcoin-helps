import {
  InvokeCommand,
  type InvokeCommandOutput,
  LambdaClient,
} from "@aws-sdk/client-lambda";
import { mockClient } from "aws-sdk-client-mock";

import awsInvoke from "./invoke";

// eslint-disable-next-line functional/no-classes
class MockUint8ArrayBlobAdapter extends Uint8Array {
  // eslint-disable-next-line functional/no-this-expressions
  transformToString = () => new TextDecoder().decode(this);
}

const lambdaMock = mockClient(LambdaClient);

describe("awsInvoke", () => {
  afterEach(() => {
    lambdaMock.reset();
  });

  it("should successfully invoke the function and return a payload", async () => {
    const mockPayload = new MockUint8ArrayBlobAdapter(
      Buffer.from(JSON.stringify({ message: "Hello, world!" }))
    );
    const expectedResponse: InvokeCommandOutput = {
      Payload: mockPayload,
      $metadata: {
        httpStatusCode: 200,
        requestId: "mockRequestId",
        extendedRequestId: "mockExtendedRequestId",
        cfId: "mockCfId",
        attempts: 1,
        totalRetryDelay: 0,
      },
    };

    lambdaMock
      .on(InvokeCommand, {
        FunctionName: "myFunction",
        InvocationType: "RequestResponse",
        Payload: new TextEncoder().encode(JSON.stringify({})),
      })
      .resolves(expectedResponse);

    const result = await awsInvoke<{ message: string }>(
      "myFunction",
      "RequestResponse",
      {}
    );
    expect(result).toEqual({ message: "Hello, world!" });
  });

  it("should throw an error if the function name is not provided", async () => {
    await expect(
      awsInvoke<{ message: string }>(undefined, "RequestResponse", {})
    ).rejects.toThrow(
      "A function name must be provided for an invoke call. Check your ENVs."
    );
  });

  it("should throw an error if no payload is returned from the invoked function with RequestResponse type", async () => {
    lambdaMock
      .on(InvokeCommand, {
        FunctionName: "myFunction",
        InvocationType: "RequestResponse",
        Payload: new TextEncoder().encode(JSON.stringify({})),
      })
      .resolves({
        $metadata: {
          httpStatusCode: 200,
          requestId: "mockRequestId",
          extendedRequestId: "mockExtendedRequestId",
          cfId: "mockCfId",
          attempts: 1,
          totalRetryDelay: 0,
        },
      });

    await expect(
      awsInvoke<{ message: string }>("myFunction", "RequestResponse", {})
      // eslint-disable-next-line sonarjs/no-duplicate-string
    ).rejects.toThrow("Error in myFunction");
  });

  it("should throw an error if the payload received from the invoked function is not a string", async () => {
    const unexpectedPayload = new MockUint8ArrayBlobAdapter(
      Buffer.from("Non-JSON string") // This is not a valid JSON string
    );

    const unexpectedResponse: InvokeCommandOutput = {
      Payload: unexpectedPayload,
      $metadata: {
        httpStatusCode: 200,
        requestId: "mockRequestId",
        extendedRequestId: "mockExtendedRequestId",
        cfId: "mockCfId",
        attempts: 1,
        totalRetryDelay: 0,
      },
    };

    lambdaMock
      .on(InvokeCommand, {
        FunctionName: "myFunction",
        InvocationType: "RequestResponse",
        Payload: new TextEncoder().encode(JSON.stringify({})),
      })
      .resolves(unexpectedResponse);

    await expect(
      awsInvoke<{ message: string }>("myFunction", "RequestResponse", {})
    ).rejects.toThrow("Error in myFunction");
  });

  it("should return undefined if no payload is returned from the invoked function with Event type", async () => {
    lambdaMock
      .on(InvokeCommand, {
        FunctionName: "myFunction",
        InvocationType: "Event",
        Payload: new TextEncoder().encode(JSON.stringify({})),
      })
      .resolves({
        $metadata: {
          httpStatusCode: 200,
          requestId: "mockRequestId",
          extendedRequestId: "mockExtendedRequestId",
          cfId: "mockCfId",
          attempts: 1,
          totalRetryDelay: 0,
        },
      });

    const result = await awsInvoke<{ message: string }>(
      "myFunction",
      "Event",
      {}
    );
    expect(result).toBeUndefined();
  });

  it("should return undefined if the payload received from the invoked function is 'null', 'undefined' or an empty string", async () => {
    // Test for each possible value separately
    const unexpectedPayloads = ["null", "undefined", ""];

    for await (const unexpectedPayload of unexpectedPayloads) {
      const mockPayload = new MockUint8ArrayBlobAdapter(
        Buffer.from(unexpectedPayload)
      );

      const unexpectedResponse: InvokeCommandOutput = {
        Payload: mockPayload,
        $metadata: {
          httpStatusCode: 200,
          requestId: "mockRequestId",
          extendedRequestId: "mockExtendedRequestId",
          cfId: "mockCfId",
          attempts: 1,
          totalRetryDelay: 0,
        },
      };

      lambdaMock
        .on(InvokeCommand, {
          FunctionName: "myFunction",
          InvocationType: "RequestResponse",
          Payload: new TextEncoder().encode(JSON.stringify({})),
        })
        .resolves(unexpectedResponse);

      const result = await awsInvoke<{ message: string }>(
        "myFunction",
        "RequestResponse",
        {}
      );
      expect(result).toBeUndefined();
    }
  });

  it("should throw an error if lambda invocation fails", async () => {
    lambdaMock
      .on(InvokeCommand, {
        FunctionName: "myFunction",
        InvocationType: "RequestResponse",
        Payload: new TextEncoder().encode(JSON.stringify({})),
      })
      .rejects(new Error("Lambda invocation failed"));

    await expect(
      awsInvoke<{ message: string }>("myFunction", "RequestResponse", {})
    ).rejects.toThrow("Error in myFunction");
  });

  it("should return the parsed payload even when it cannot be cast to the expected type", async () => {
    const mockPayload = new MockUint8ArrayBlobAdapter(
      Buffer.from(JSON.stringify({ data: "Not expected message" }))
    );

    const unexpectedResponse: InvokeCommandOutput = {
      Payload: mockPayload,
      $metadata: {
        httpStatusCode: 200,
        requestId: "mockRequestId",
        extendedRequestId: "mockExtendedRequestId",
        cfId: "mockCfId",
        attempts: 1,
        totalRetryDelay: 0,
      },
    };

    lambdaMock
      .on(InvokeCommand, {
        FunctionName: "myFunction",
        InvocationType: "RequestResponse",
        Payload: new TextEncoder().encode(JSON.stringify({})),
      })
      .resolves(unexpectedResponse);

    const result = await awsInvoke<{ message: string }>(
      "myFunction",
      "RequestResponse",
      {}
    );

    expect(result).toEqual({ data: "Not expected message" });
  });

  it("should throw an error if the payload received from the invoked function is neither a string nor a Uint8Array", async () => {
    const unexpectedPayload = 12_345; // This is a number, not a string or a Uint8Array.

    const unexpectedResponse: InvokeCommandOutput = {
      // @ts-expect-error we are using this to get 100% coverage on the file
      Payload: unexpectedPayload,
      $metadata: {
        httpStatusCode: 200,
        requestId: "mockRequestId",
        extendedRequestId: "mockExtendedRequestId",
        cfId: "mockCfId",
        attempts: 1,
        totalRetryDelay: 0,
      },
    };

    lambdaMock
      .on(InvokeCommand, {
        FunctionName: "myFunction",
        InvocationType: "RequestResponse",
        Payload: new TextEncoder().encode(JSON.stringify({})),
      })
      .resolves(unexpectedResponse);

    await expect(
      awsInvoke<{ message: string }>("myFunction", "RequestResponse", {})
    ).rejects.toThrow("Error in myFunction");
  });
});
