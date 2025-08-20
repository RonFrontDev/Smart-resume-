import type { Handler } from "@netlify/functions";

const handler: Handler = async () => {
  return {
    statusCode: 410, // Gone
    body: JSON.stringify({ message: "This function has been removed." }),
  };
};

export { handler };
