import { inPlaceSort } from "fast-sort";

export function sortBy<T>(
	direction: "asc" | "desc" = "asc",
	key: keyof T,
	array: T[]
) {
	direction === "desc"
		? inPlaceSort(array).desc((a) => a[key as keyof T])
		: inPlaceSort(array).asc((a) => a[key as keyof T]);

	return array;
}
