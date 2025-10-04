export interface MetadataItem {
	label: string;
	value: string;
}

/**
 * Formats EXIF metadata into display-friendly key-value pairs.
 *
 * Handles various EXIF fields and converts them to human-readable formats:
 * - Time: Prefers DateTime fields, falls back to FileCreatedAt, converts ISO format to locale string
 * - Shutter Speed: Uses ExposureTime or calculates from ShutterSpeedValue (2^value formula)
 * - Aperture: Extracts f-stop from FNumber or ApertureValue
 * - ISO: From PhotographicSensitivity field
 * - Focal Length: Prefers 35mm equivalent, adds 'mm' suffix
 * - Camera: Combines Make and Model, strips quotes
 * - Lens: Combines LensMake and LensModel, strips quotes
 *
 * @param metadata - Raw EXIF metadata as key-value string pairs
 * @returns Array of formatted metadata items for display
 */
export function formatMetadata(metadata: Record<string, string>): MetadataItem[] {
	const items: MetadataItem[] = [];

	// Time
	const time =
		metadata.DateTime ||
		metadata.DateTimeDigitized ||
		metadata.DateTimeOriginal ||
		metadata.FileCreatedAt;
	if (time) {
		let formattedTime = time;
		// FileCreatedAt is ISO format, others are "YYYY-MM-DD HH:MM:SS"
		if (time.includes('T') && time.includes('Z')) {
			formattedTime = new Date(time).toLocaleString();
		}
		items.push({ label: 'Time', value: formattedTime });
	}

	// Shutter Speed
	if (metadata.ExposureTime) {
		items.push({ label: 'Shutter Speed', value: metadata.ExposureTime });
	} else if (metadata.ShutterSpeedValue) {
		const speed = Math.pow(2, parseFloat(metadata.ShutterSpeedValue));
		items.push({ label: 'Shutter Speed', value: `1/${Math.round(speed)}` });
	}

	// Aperture
	const aperture = metadata.FNumber || metadata.ApertureValue;
	if (aperture) {
		const fValue = parseFloat(aperture);
		items.push({ label: 'Aperture', value: `f/${fValue.toFixed(1)}` });
	}

	// ISO
	if (metadata.PhotographicSensitivity) {
		items.push({ label: 'ISO', value: metadata.PhotographicSensitivity });
	}

	// Focal Length
	const focalLength = metadata.FocalLengthIn35mmFilm || metadata.FocalLength;
	if (focalLength) {
		items.push({ label: 'Focal Length', value: `${focalLength}mm` });
	}

	// Camera
	const make = metadata.Make?.replace(/"/g, '');
	const model = metadata.Model?.replace(/"/g, '');
	if (make && model) {
		items.push({ label: 'Camera', value: `${make} ${model}` });
	} else if (make || model) {
		items.push({ label: 'Camera', value: make || model || '' });
	}

	// Lens
	const lensMake = metadata.LensMake?.replace(/"/g, '');
	const lensModel = metadata.LensModel?.replace(/"/g, '');
	if (lensMake && lensModel) {
		items.push({ label: 'Lens', value: `${lensMake} ${lensModel}` });
	} else if (lensModel) {
		items.push({ label: 'Lens', value: lensModel });
	}

	return items;
}
