export function isValueBetween({
	value,
	min,
	max,
}: {
  value: number;
  min: number;
  max: number;
}) {
	return min <= value && value <= max;
}
