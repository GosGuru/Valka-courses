import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

// SEO helpers
export function slugify(str = '') {
	return str
		.toString()
		.normalize('NFD')
		.replace(/['"()]/g, '')
		.replace(/[\u0300-\u036f]/g, '') // remove diacritics
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.substring(0, 80);
}

export function buildIdSlug(id, name) {
	return `${id}-${slugify(name || '')}`;
}

export function extractIdFromIdSlug(idSlug) {
	if (!idSlug) return null;
	
	// UUID format: 8-4-4-4-12 characters (separated by hyphens)
	// So we need to match the pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
	const uuidRegex = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
	const match = idSlug.match(uuidRegex);
	
	if (match) {
		return match[1];
	}
	
	// Fallback for non-UUID IDs (if any exist)
	const idPart = idSlug.split('-')[0];
	return idPart;
}