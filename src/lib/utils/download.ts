/**
 * Downloads an image by fetching it as a blob and triggering a browser download
 * Falls back to opening in a new tab if the download fails
 */
export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
	try {
		const response = await fetch(`${imageUrl}?class=download`);
		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	} catch (err) {
		console.error('Failed to download image:', err);
		// Fallback: open in new tab
		window.open(`${imageUrl}?class=download`, '_blank');
	}
}
