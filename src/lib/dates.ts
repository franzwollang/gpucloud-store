import { SupportedLocale, localesByCode } from "@/i18n";
import {
	addYears,
	differenceInCalendarYears,
	format,
	isAfter,
	isBefore,
	startOfYear
} from "date-fns";

export function localeMonths(
	localeName: SupportedLocale = "de",
	monthFormat: "long" | "short" = "long"
) {
	const locale = localesByCode[localeName];
	const formattingString =
		monthFormat === "long" ? "MMMM" : "short" ? "MMM" : "";

	return [
		...Array.from({ length: 12 }, (val, idx) =>
			format(new Date(Date.UTC(2020, idx % 12)), formattingString, {
				locale: locale.localizer
			})
		)
	];
}

export function localeYearsFromRange(
	minDate: Date,
	maxDate: Date,
	localeName: SupportedLocale = "de"
) {
	const locale = localesByCode[localeName];

	if (isBefore(new Date(), minDate)) {
		minDate = new Date();
	}

	if (isAfter(new Date(), maxDate)) {
		maxDate = new Date();
	}

	const diff = differenceInCalendarYears(maxDate, minDate);
	const earliest = startOfYear(minDate);

	return [
		...Array.from({ length: diff + 1 }, (val, idx) =>
			format(addYears(earliest, idx), "y", {
				locale: locale.localizer
			})
		)
	];
}
