import axios from "axios";
import qs from "query-string";
import { buildAuthUrl } from "./axios";
import { CLIENT_ID, CLIENT_SECRET, ENDPOINTS } from "@/utils/constants";
import type { LoginRequest, LoginResponse } from "@/types";

function basicAuthHeader(): string {
  const encoder =
    typeof btoa === "function"
      ? btoa
      : (s: string) => Buffer.from(s).toString("base64");
  return `Basic ${encoder(`${CLIENT_ID}:${CLIENT_SECRET}`)}`;
}

export async function requestToken({
  username,
  password,
}: LoginRequest): Promise<LoginResponse> {
  const body = qs.stringify({
    username,
    password,
    grant_type: "password",
  });

  const res = await axios.post<LoginResponse>(
    buildAuthUrl(ENDPOINTS.token),
    body,
    {
      headers: {
        Authorization: basicAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  return res.data;
}