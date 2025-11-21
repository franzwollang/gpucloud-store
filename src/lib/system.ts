import getConfig from "next/config";
import { Socket } from "node:net";
import path from "path";

export function makePathAbsolute(subpath: string) {
  return path.join(process.cwd() + path.resolve(subpath));
}

export function parseIp(headers: Headers, socket?: Socket) {
  return headers.get("x-forwarded-for")?.split(",").shift() || socket
    ? socket?.remoteAddress
    : "";
}
