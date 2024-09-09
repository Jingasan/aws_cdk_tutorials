export const handler = async () => {
  const responseBody = { message: `ENV_VALUE: ${process.env.ENV_VALUE}` };
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(responseBody),
  };

  return response;
};
