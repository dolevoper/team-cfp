export type UserData = Record<"name" | "preferred_username", string>;

export function getUserToken(request: Request) {
    const idToken = request.headers.get("x-ms-token-aad-id-token") ?? process.env.ID_TOKEN;

  if (!idToken) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const [, encodedTokenString] = idToken.split(".");

  return JSON.parse(Buffer.from(encodedTokenString, "base64").toString()) as UserData;
}
