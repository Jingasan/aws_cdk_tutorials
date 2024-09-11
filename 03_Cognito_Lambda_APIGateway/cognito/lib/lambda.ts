import { randomUUID } from "crypto";

export const handler = async () => {
  const responseBody = {
    message: `ENV_VALUE: ${process.env.ENV_VALUE}`,
    uuid: randomUUID(),
  };
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      // CORS
      // "Access-Control-Allow-Origin": "*",
      // "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE,PATCH",
    },
    body: JSON.stringify(responseBody),
  };

  return response;
};
