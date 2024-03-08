import { BACKEND_URL } from "./constants";

export function stringifyNumber(input: number) {
  const num = input.toString().replace(/[^0-9.]/g, "");

  if (input < 1000) return num;

  const si = [
    { v: 1000, s: "K" },
    { v: 1000000, s: "M" },
    { v: 1000000000, s: "B" },
    { v: 1000000000000, s: "T" },
    { v: 1000000000000000, s: "P" },
    { v: 1000000000000000000, s: "E" },
  ];

  let index;
  for (index = si.length - 1; index > 0; index--) {
    if (input >= si[index].v) {
      break;
    }
  }
  return (input / si[index].v).toFixed(1).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[index].s;
}

export function toTitleCase(str: string = "") {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

export function extractIDFromUrl(full_url: string): string | null {
  try {
    const url = new URL(full_url);
    if (url.pathname != "/watch") return null;

    const id = url.searchParams.get("v");

    if (id != null && id.length > 0) return "https://www.youtube.com/watch?v=" + id;
  } catch {}

  return null;
}

function _trigger_download(url: string) {
  const a = document.createElement("a");

  a.href = url;
  a.download = "";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function download(
  id: string,
  videoFrom: Format | "none" = "none",
  audioFrom: Format | "none" = "none",
  downloadSubs: boolean,
  subLanguage: string,
  subFormat: string
) {
  let url = getDownloadLink(id, videoFrom, audioFrom);

  if (downloadSubs) {
    if (subLanguage == "live_chat") subFormat = "json";

    if (subFormat == "embed") url += `&sl=${subLanguage}`;
    else _trigger_download(getSubLink(id, subLanguage, subFormat));
  }

  _trigger_download(url);
}

export function getDownloadLink(id: string, videoFrom: Format | "none" = "none", audioFrom: Format | "none" = "none"): string {
  let link = `${BACKEND_URL}/dl/${id}?f=`;

  // only download video
  if (audioFrom == "none") link += (videoFrom as Format).id;
  // no video, only audio, no need to add +
  else if (videoFrom == "none") link += audioFrom.id;
  // download with + since there is a specific video and specific audio
  else link += videoFrom.id + "%2B" + audioFrom.id;

  return link;
}

export function getSubLink(id: string, subLang: string, subFormat: string): string {
  return `${BACKEND_URL}/sub/${id}?l=${subLang}&f=${subFormat}`;
}

export interface VideoURL {
  raw: string;
  id: string;
}
const WATCHV_REGEX = /^((www\.|music\.))?youtube.com$/;
const HTTP_REGEX = /^(https?):\/\//;

export function parseVideoURL(input: string): VideoURL {
  let url;

  try {
    if (!HTTP_REGEX.test(input)) {
      input = "https://" + input;
    }
    url = new URL(input);
  } catch {
    // silent error
    throw "";
  }

  let id = "";

  console.log(input, url.host);

  if (WATCHV_REGEX.test(url.host)) {
    // throw "Your URL must be from www.youtube.com!";
    const params = url.searchParams;

    if (!params.has("v")) {
      throw "Your URL must contain the watch?v part!";
    }

    id = params.get("v")!;
  } else if (url.host == "youtu.be") {
    if (url.pathname.length <= 1) {
      throw "Your URL must contain the video ID at the end!";
    }

    id = url.pathname.substring(1);
  } else {
    throw "Your URL must be from YouTube or from YouTube Music!";
  }

  return {
    raw: url.toString(),
    id: id,
  };
}

export interface VideoMeta {
  title: string;
  author: Author;
  thumbnail: string;
  likes: number;
  views: number;
  formats: Array<Format>;
  subs: Record<string, string>;
}

export interface Author {
  name: string;
  subscribers: number;
}

export interface Format {
  id: string;
  note: string;
  audio?: AudioSourceMeta;
  video?: VideoSourceMeta;
}

export interface AudioSourceMeta {
  samples: number;
  rate: number;
  codec: string;
}

export interface VideoSourceMeta {
  width: number;
  height: number;
  fps: number;
  codec: string;
}
