import axios from "axios";

// API Gateway URL
const apiURL = "/v1/hello";

/**
 * Cognito認証を伴うAPI Gatewayの実行
 */
export const callAPI = async (idToken: string) => {
  try {
    const res = await axios.get(apiURL, {
      headers: {
        Authorization: idToken,
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return {};
  }
};
