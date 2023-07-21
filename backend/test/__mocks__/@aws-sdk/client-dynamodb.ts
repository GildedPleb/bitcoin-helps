interface PutItemCommandParameters {
  Item: unknown;
  TableName: string;
}

export const PutItemCommand = jest
  .fn()
  .mockImplementation((parameters: PutItemCommandParameters) => ({
    input: parameters,
  }));

interface DeleteItemCommandParameters {
  Key: unknown;
  TableName: string;
}

export const DeleteItemCommand = jest
  .fn()
  .mockImplementation((parameters: DeleteItemCommandParameters) => ({
    input: parameters,
  }));

export const mockSend = jest.fn();

export const DynamoDBClient = jest.fn().mockImplementation(() => ({
  send: mockSend,
}));

interface GetItemCommandParameters {
  Key: unknown;
  TableName: string;
}

export const GetItemCommand = jest
  .fn()
  .mockImplementation((parameters: GetItemCommandParameters) => ({
    input: parameters,
  }));

interface QueryCommandParameters {
  KeyConditionExpression: string;
  ExpressionAttributeValues: unknown;
  TableName: string;
}

export const QueryCommand = jest
  .fn()
  .mockImplementation((parameters: QueryCommandParameters) => ({
    input: parameters,
  }));
