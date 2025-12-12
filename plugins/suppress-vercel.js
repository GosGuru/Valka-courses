/**
 * Vite Plugin: Suppress Vercel Analytics in Development
 * Evita errores de Vercel Insights cuando no está configurado
 */

export default function suppressVercelAnalytics() {
  return {
    name: 'suppress-vercel-analytics',
    transformIndexHtml(html) {
      // Solo en desarrollo
      if (process.env.NODE_ENV === 'development') {
        return html.replace(
          '</head>',
          `<script>
            // Suprimir errores de Vercel Analytics en desarrollo
            window._vercel_insights = window._vercel_insights || {};
            window._vercel_insights.track = () => {};
          </script></head>`
        );
      }
      return html;
    },
  };
}
