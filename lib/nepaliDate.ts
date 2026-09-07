// npm install nepali-date-converter
import NepaliDate from "nepali-date-converter";

/** Today's date formatted as BS, e.g. "2083-05-09" */
export function todayBS(format = "YYYY-MM-DD"): string {
  return NepaliDate.now().format(format);
}

/** Convert a JS Date (AD) to a formatted BS string. */
export function adToBs(date: Date, format = "YYYY-MM-DD"): string {
  return new NepaliDate(date).format(format);
}

/** Convert a formatted BS string ("YYYY-MM-DD" etc.) to a JS Date (AD). */
export function bsToAd(bsDateString: string): Date {
  return new NepaliDate(bsDateString).toJsDate();
}

/** Nepali-numeral, long-form BS date — "आइतबार ०९, भदौ २०८३" */
export function adToBsNepali(date: Date): string {
  return new NepaliDate(date).format("ddd DD, MMMM YYYY", "np");
}

export { NepaliDate };