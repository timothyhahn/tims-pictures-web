export interface MetadataItem {
	label: string;
	value: string;
}

interface FilmStock {
	brand: string;
	name: string;
	pattern: RegExp;
	displayName?: string;
}

const FILM_STOCKS: FilmStock[] = [
	// Kodak
	{ brand: 'Kodak', name: 'Ektar', pattern: /\bektar\b/i },
	{ brand: 'Kodak', name: 'Ektachrome', pattern: /\bektachrome\b/i },
	{ brand: 'Kodak', name: 'Vision', pattern: /\bkodak\s+vision\b/i },
	{ brand: 'Kodak', name: 'Gold', pattern: /\bkodak\s+gold\b/i },
	{ brand: 'Kodak', name: 'Ultramax', pattern: /\bultramax\b/i },
	{ brand: 'Kodak', name: 'Colorplus', pattern: /\bcolorplus\b/i },
	{ brand: 'Kodak', name: 'Portra', pattern: /\bportra\b/i },
	{ brand: 'Kodak', name: 'Tri-X', pattern: /\btri-?x\b/i },
	{ brand: 'Kodak', name: 'T-Max', pattern: /\bt-?max\b/i },
	// Fujifilm
	{ brand: 'Fujifilm', name: 'Velvia', pattern: /\bvelvia\b/i },
	{ brand: 'Fujifilm', name: 'Provia', pattern: /\bprovia\b/i },
	{ brand: 'Fujifilm', name: 'Fujicolor', pattern: /\bfujicolor\b/i },
	{
		brand: 'Fujifilm',
		name: '200',
		pattern: /fujifilm\s+\d+\s*color\s*negative/i,
		displayName: 'Fujifilm 200'
	},
	// Cinestill
	{ brand: 'Cinestill', name: '800T', pattern: /\bcinestill\s+800\s*t\b/i },
	{ brand: 'Cinestill', name: '500T', pattern: /\bcinestill\s+500\s*t\b/i },
	{ brand: 'Cinestill', name: '400D', pattern: /\bcinestill\s+400\s*d\b/i },
	{ brand: 'Cinestill', name: '50D', pattern: /\bcinestill\s+50\s*d\b/i },
	// Ilford
	{ brand: 'Ilford', name: 'Delta', pattern: /\bdelta\b/i },
	{ brand: 'Ilford', name: 'Kentmere', pattern: /\bkentmere\b/i },
	{ brand: 'Ilford', name: 'HP5', pattern: /\bhp5\b/i },
	{ brand: 'Ilford', name: 'FP4', pattern: /\bfp4\b/i }
];

function detectFilmStock(raw: string): { filmStock: string; format: string | null } | null {
	const cleaned = raw.replace(/"/g, '');

	// Extract format from trailing parenthetical e.g. (FF), (6x6)
	let format: string | null = null;
	const formatMatch = cleaned.match(/\(([^)]+)\)\s*$/);
	if (formatMatch) {
		format = /^ff$/i.test(formatMatch[1]) ? '35mm' : formatMatch[1];
	}

	// Remove the parenthetical for matching
	const withoutFormat = cleaned.replace(/\s*\([^)]+\)\s*$/, '').trim();

	for (const stock of FILM_STOCKS) {
		if (stock.pattern.test(withoutFormat)) {
			if (stock.displayName) {
				return { filmStock: stock.displayName, format };
			}

			// Construct display: brand + name + suffix (ISO, push/pull, etc.)
			const namePattern = new RegExp(stock.name.replace(/-/g, '-?'), 'i');
			const nameMatch = withoutFormat.match(namePattern);
			if (nameMatch) {
				const afterName = withoutFormat.slice(nameMatch.index! + nameMatch[0].length);
				return {
					filmStock: `${stock.brand} ${nameMatch[0]}${afterName}`,
					format
				};
			}

			return { filmStock: `${stock.brand} ${stock.name}`, format };
		}
	}

	return null;
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
 * - Film Stock: Detected from ImageDescription by matching known film stock names
 * - Format: Extracted from ImageDescription parenthetical (FF→35mm, 6x6, 6x9, etc.)
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

	// Film Stock & Format
	const imageDescription = metadata.ImageDescription;
	if (imageDescription) {
		const detected = detectFilmStock(imageDescription);
		if (detected) {
			items.push({ label: 'Film Stock', value: detected.filmStock });
			if (detected.format) {
				items.push({ label: 'Format', value: detected.format });
			}
		}
	}

	return items;
}
