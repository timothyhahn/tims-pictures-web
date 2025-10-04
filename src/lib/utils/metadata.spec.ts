import { describe, it, expect } from 'vitest';
import { formatMetadata } from './metadata';

describe('formatMetadata', () => {
	it('returns empty array for empty metadata', () => {
		const result = formatMetadata({});
		expect(result).toEqual([]);
	});

	describe('time formatting', () => {
		it('formats DateTime field', () => {
			const result = formatMetadata({ DateTime: '2024-01-15 14:30:00' });
			expect(result).toHaveLength(1);
			expect(result[0]!.label).toBe('Time');
			expect(result[0]!.value).toBe('2024-01-15 14:30:00');
		});

		it('formats ISO timestamp from FileCreatedAt', () => {
			const result = formatMetadata({ FileCreatedAt: '2024-01-15T14:30:00Z' });
			expect(result).toHaveLength(1);
			expect(result[0]!.label).toBe('Time');
			expect(result[0]!.value).toContain('2024');
		});

		it('prefers DateTime over other date fields', () => {
			const result = formatMetadata({
				DateTime: '2024-01-15 14:30:00',
				DateTimeDigitized: '2024-01-14 12:00:00',
				FileCreatedAt: '2024-01-13T10:00:00Z'
			});
			expect(result[0]!.value).toBe('2024-01-15 14:30:00');
		});
	});

	describe('shutter speed formatting', () => {
		it('formats ExposureTime directly', () => {
			const result = formatMetadata({ ExposureTime: '1/250' });
			expect(result).toHaveLength(1);
			expect(result[0]!.label).toBe('Shutter Speed');
			expect(result[0]!.value).toBe('1/250');
		});

		it('calculates shutter speed from ShutterSpeedValue', () => {
			const result = formatMetadata({ ShutterSpeedValue: '8' });
			expect(result).toHaveLength(1);
			expect(result[0]!.label).toBe('Shutter Speed');
			expect(result[0]!.value).toMatch(/1\/\d+/);
		});

		it('prefers ExposureTime over ShutterSpeedValue', () => {
			const result = formatMetadata({
				ExposureTime: '1/250',
				ShutterSpeedValue: '8'
			});
			expect(result[0]!.value).toBe('1/250');
		});
	});

	describe('aperture formatting', () => {
		it('formats FNumber', () => {
			const result = formatMetadata({ FNumber: '2.8' });
			expect(result).toHaveLength(1);
			expect(result[0]!.label).toBe('Aperture');
			expect(result[0]!.value).toBe('f/2.8');
		});

		it('formats ApertureValue', () => {
			const result = formatMetadata({ ApertureValue: '4.0' });
			expect(result).toHaveLength(1);
			expect(result[0]!.label).toBe('Aperture');
			expect(result[0]!.value).toBe('f/4.0');
		});

		it('rounds aperture to one decimal place', () => {
			const result = formatMetadata({ FNumber: '2.83333' });
			expect(result[0]!.value).toBe('f/2.8');
		});
	});

	describe('ISO formatting', () => {
		it('formats PhotographicSensitivity', () => {
			const result = formatMetadata({ PhotographicSensitivity: '800' });
			expect(result).toHaveLength(1);
			expect(result[0]!.label).toBe('ISO');
			expect(result[0]!.value).toBe('800');
		});
	});

	describe('focal length formatting', () => {
		it('formats FocalLength', () => {
			const result = formatMetadata({ FocalLength: '50' });
			expect(result).toHaveLength(1);
			expect(result[0]!.label).toBe('Focal Length');
			expect(result[0]!.value).toBe('50mm');
		});

		it('formats FocalLengthIn35mmFilm', () => {
			const result = formatMetadata({ FocalLengthIn35mmFilm: '75' });
			expect(result).toHaveLength(1);
			expect(result[0]!.label).toBe('Focal Length');
			expect(result[0]!.value).toBe('75mm');
		});

		it('prefers FocalLengthIn35mmFilm over FocalLength', () => {
			const result = formatMetadata({
				FocalLengthIn35mmFilm: '75',
				FocalLength: '50'
			});
			expect(result[0]!.value).toBe('75mm');
		});
	});

	describe('camera formatting', () => {
		it('combines Make and Model', () => {
			const result = formatMetadata({
				Make: 'Canon',
				Model: 'EOS R5'
			});
			expect(result).toHaveLength(1);
			expect(result[0]!.label).toBe('Camera');
			expect(result[0]!.value).toBe('Canon EOS R5');
		});

		it('shows only Make if Model is missing', () => {
			const result = formatMetadata({ Make: 'Canon' });
			expect(result[0]!.value).toBe('Canon');
		});

		it('shows only Model if Make is missing', () => {
			const result = formatMetadata({ Model: 'EOS R5' });
			expect(result[0]!.value).toBe('EOS R5');
		});

		it('removes quotes from Make and Model', () => {
			const result = formatMetadata({
				Make: '"Canon"',
				Model: '"EOS R5"'
			});
			expect(result[0]!.value).toBe('Canon EOS R5');
		});
	});

	describe('lens formatting', () => {
		it('combines LensMake and LensModel', () => {
			const result = formatMetadata({
				LensMake: 'Canon',
				LensModel: 'RF 24-70mm f/2.8L IS USM'
			});
			expect(result).toHaveLength(1);
			expect(result[0]!.label).toBe('Lens');
			expect(result[0]!.value).toBe('Canon RF 24-70mm f/2.8L IS USM');
		});

		it('shows only LensModel if LensMake is missing', () => {
			const result = formatMetadata({ LensModel: 'RF 24-70mm f/2.8L IS USM' });
			expect(result[0]!.value).toBe('RF 24-70mm f/2.8L IS USM');
		});

		it('does not show lens if only LensMake is present', () => {
			const result = formatMetadata({ LensMake: 'Canon' });
			expect(result).toHaveLength(0);
		});

		it('removes quotes from LensMake and LensModel', () => {
			const result = formatMetadata({
				LensMake: '"Canon"',
				LensModel: '"RF 24-70mm"'
			});
			expect(result[0]!.value).toBe('Canon RF 24-70mm');
		});
	});

	describe('complete metadata', () => {
		it('formats all fields correctly', () => {
			const result = formatMetadata({
				DateTime: '2024-01-15 14:30:00',
				ExposureTime: '1/250',
				FNumber: '2.8',
				PhotographicSensitivity: '800',
				FocalLengthIn35mmFilm: '50',
				Make: 'Canon',
				Model: 'EOS R5',
				LensMake: 'Canon',
				LensModel: 'RF 50mm f/1.2L USM'
			});

			expect(result).toHaveLength(7);
			expect(result[0]!).toEqual({ label: 'Time', value: '2024-01-15 14:30:00' });
			expect(result[1]!).toEqual({ label: 'Shutter Speed', value: '1/250' });
			expect(result[2]!).toEqual({ label: 'Aperture', value: 'f/2.8' });
			expect(result[3]!).toEqual({ label: 'ISO', value: '800' });
			expect(result[4]!).toEqual({ label: 'Focal Length', value: '50mm' });
			expect(result[5]!).toEqual({ label: 'Camera', value: 'Canon EOS R5' });
			expect(result[6]!).toEqual({ label: 'Lens', value: 'Canon RF 50mm f/1.2L USM' });
		});
	});
});
