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
	const idPart = idSlug.split('-')[0];
	return idPart;
}