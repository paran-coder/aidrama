const SUPPORTED_HOSTS = [
  "youtube.com",
  "youtu.be",
  "instagram.com",
  "tiktok.com",
  "vimeo.com",
  "x.com",
  "twitter.com",
  "facebook.com",
  "threads.net",
];

export function inspectSubmissionUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { valid: false, verified: false, host: "" };
    }
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const verified = SUPPORTED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
    return { valid: true, verified, host };
  } catch {
    return { valid: false, verified: false, host: "" };
  }
}
