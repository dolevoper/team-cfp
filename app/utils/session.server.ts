export type UserData = Record<"principalId" | "name" | "preferred_username", string>;

export function getUserData(request: Request) {
    const principalId = request.headers.get("x-ms-client-principal-id") ?? process.env.PRINCIPAL_ID;
    const idToken = request.headers.get("x-ms-token-aad-id-token") ?? process.env.ID_TOKEN;

    if (!principalId || !idToken) {
        throw new Response("Unauthorized", { status: 401 });
    }

    const [, encodedTokenString] = idToken.split(".");

    return {
        ...JSON.parse(Buffer.from(encodedTokenString, "base64").toString()) as UserData,
        principalId
    };
}
