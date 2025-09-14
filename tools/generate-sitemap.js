#!/usr/bin/env node
/**
 * Generate sitemap.xml dynamically from Supabase content.
 * - Programs: /programs/:id-slug
 * - Lessons: /library/:id-slug
 * Fallbacks gracefully if Supabase is unreachable.
 */
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const DOMAIN = 'https://entrenaconvalka.com';
const OUTPUT_PATH = path.resolve('public', 'sitemap.xml');

// Use env vars if present, fallback to hardcoded (but recommend env)
const supabaseUrl = process.env.SUPABASE_URL || 'https://fpjabzhhwwlhgrnhmnby.supabase.co';
// Prefer service role key ONLY at build time (never expose to client bundle)
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // set in CI/CD environment
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwamFiemhod3dsaGdybmhtbmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjcxNzgsImV4cCI6MjA3MjA0MzE3OH0.m5i-rU7D46cJnmZAaXV6DzSL3LSKgTyZ0aTwxlGh65w';
const activeKey = serviceKey || supabaseAnonKey;
if (serviceKey) {
  console.log('Usando SUPABASE_SERVICE_ROLE_KEY para generar sitemap (solo build).');
} else {
  console.log('Usando clave anon para sitemap (considera políticas RLS públicas o proporcionar SERVICE_ROLE en CI).');
}

const supabase = createClient(supabaseUrl, activeKey);

function slugify(str = '') {
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

async function fetchPrograms() {
  // Strategy cascade:
  // 1) Direct table with timestamps
  // 2) RPC get_programs_with_details (used in app) if direct fails/empty
  // 3) Direct minimal select
  try {
    const { data, error } = await supabase.from('programs').select('id, name, updated_at, created_at');
    if (error) throw error;
    if (data && data.length) {
      return data.map(p => ({ ...p, _lastmod: p.updated_at || p.created_at || null }));
    }
  } catch (e) {
    console.warn('Program select detallado falló:', e.message);
  }
  try {
    const { data, error } = await supabase.rpc('get_programs_with_details');
    if (error) throw error;
    if (data && data.length) {
      return data.map(p => ({ ...p, _lastmod: p.updated_at || p.created_at || null }));
    }
  } catch (e) {
    console.warn('RPC get_programs_with_details falló:', e.message);
  }
  try {
    const { data, error } = await supabase.from('programs').select('id, name');
    if (error) throw error;
    return (data || []).map(p => ({ ...p, _lastmod: null }));
  } catch (e) {
    console.warn('Select mínimo de programs también falló:', e.message);
    return [];
  }
}

async function fetchLessons() {
  // Strategy cascade:
  // 1) Direct lessons with timestamps
  // 2) Category join to gather nested lessons
  // 3) Direct minimal select
  try {
    const { data, error } = await supabase.from('lessons').select('id, title, updated_at, created_at');
    if (error) throw error;
    if (data && data.length) {
      return data.map(l => ({ ...l, _lastmod: l.updated_at || l.created_at || null }));
    }
  } catch (e) {
    console.warn('Select detallado lessons falló:', e.message);
  }
  try {
    const { data, error } = await supabase
      .from('lesson_categories')
      .select('id, lessons(id, title, updated_at, created_at)');
    if (error) throw error;
    const flattened = (data || [])
      .flatMap(cat => (cat.lessons || []).map(l => ({ ...l, _lastmod: l.updated_at || l.created_at || null })));
    if (flattened.length) return flattened;
  } catch (e) {
    console.warn('Join categories->lessons falló:', e.message);
  }
  try {
    const { data, error } = await supabase.from('lessons').select('id, title');
    if (error) throw error;
    return (data || []).map(l => ({ ...l, _lastmod: null }));
  } catch (e) {
    console.warn('Select mínimo lessons también falló:', e.message);
    return [];
  }
}

function formatDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  return new Date(dateStr).toISOString().split('T')[0];
}

function urlEntry(loc, { lastmod, changefreq = 'monthly', priority = 0.5 }) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function build() {
  const today = new Date().toISOString().split('T')[0];

  const staticEntries = [
    { loc: `${DOMAIN}/`, changefreq: 'daily', priority: 1.0 },
    { loc: `${DOMAIN}/programs`, changefreq: 'weekly', priority: 0.9 },
    { loc: `${DOMAIN}/library`, changefreq: 'weekly', priority: 0.85 },
    { loc: `${DOMAIN}/calistenia-durazno`, changefreq: 'monthly', priority: 0.7 },
    { loc: `${DOMAIN}/calistenia-uruguay`, changefreq: 'monthly', priority: 0.75 }
  ];

  const [programs, lessons] = await Promise.all([fetchPrograms(), fetchLessons()]);
  console.log(`Debug sitemap: programs=${programs.length}, lessons=${lessons.length}`);

  const programEntries = programs.map(p => urlEntry(`${DOMAIN}/programs/${p.id}-${slugify(p.name || '')}`, {
    lastmod: formatDate(p._lastmod),
    changefreq: 'weekly',
    priority: 0.75
  }));

  const lessonEntries = lessons.map(l => urlEntry(`${DOMAIN}/library/${l.id}-${slugify(l.title || '')}`, {
    lastmod: formatDate(l._lastmod),
    changefreq: 'monthly',
    priority: 0.6
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticEntries.map(e => urlEntry(e.loc, { lastmod: today, changefreq: e.changefreq, priority: e.priority })).join('\n')}\n${programEntries.join('\n')}\n${lessonEntries.join('\n')}\n</urlset>\n`;

  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
  console.log(`Sitemap generado: ${OUTPUT_PATH}`);
  console.log(`Incluye ${staticEntries.length} rutas estáticas, ${programEntries.length} programs y ${lessonEntries.length} lessons.`);
}

build();
