export type BannerIntegrationMethod =
  | "html"
  | "gtm"
  | "wordpress"
  | "shopify"
  | "nextjs"
  | "react"
  | "wix";

export interface IntegrationMethodMeta {
  id: BannerIntegrationMethod;
  label: string;
  description: string;
  platform?: string;
}

export const BANNER_INTEGRATION_METHODS: IntegrationMethodMeta[] = [
  {
    id: "html",
    label: "HTML / Manual",
    description: "Paste a script tag in your site header or before </body>",
  },
  {
    id: "gtm",
    label: "Google Tag Manager",
    description: "Deploy via a Custom HTML tag in GTM",
    platform: "GTM",
  },
  {
    id: "wordpress",
    label: "WordPress",
    description: "Theme, plugin, or functions.php",
    platform: "WordPress",
  },
  {
    id: "shopify",
    label: "Shopify",
    description: "Add to theme.liquid in Online Store",
    platform: "Shopify",
  },
  {
    id: "nextjs",
    label: "Next.js",
    description: "Use next/script in your root layout",
    platform: "Next.js",
  },
  {
    id: "react",
    label: "React / SPA",
    description: "Load dynamically in index.html or App",
    platform: "React",
  },
  {
    id: "wix",
    label: "Wix / Squarespace",
    description: "Custom code embed in site settings",
    platform: "No-code CMS",
  },
];

export function resolveBannerWebsiteId(selectedWebsiteId: string): string {
  return selectedWebsiteId === "all" ? "GLOBAL_ID" : selectedWebsiteId;
}

export function getBannerScriptUrl(origin: string, selectedWebsiteId: string): string {
  const id = resolveBannerWebsiteId(selectedWebsiteId);
  return `${origin}/api/v1/public/cookies/banner-script/${id}`;
}

export function getBannerScriptTag(origin: string, selectedWebsiteId: string): string {
  const url = getBannerScriptUrl(origin, selectedWebsiteId);
  return `<script src="${url}" defer></script>`;
}

export function getIntegrationSnippet(
  method: BannerIntegrationMethod,
  origin: string,
  selectedWebsiteId: string,
): { code: string; steps: string[] } {
  const scriptUrl = getBannerScriptUrl(origin, selectedWebsiteId);
  const scriptTag = getBannerScriptTag(origin, selectedWebsiteId);

  switch (method) {
    case "html":
      return {
        steps: [
          "Open your website template or CMS header/footer editor.",
          "Paste the script in the <head> section, or just before </body>.",
          "Save and publish. The banner loads on every page automatically.",
        ],
        code: scriptTag,
      };

    case "gtm":
      return {
        steps: [
          "In Google Tag Manager, create a new Tag → Custom HTML.",
          "Paste the code below. Set Trigger to Consent Initialization or All Pages.",
          "Publish the GTM container. Use Preview mode to confirm the banner appears.",
        ],
        code: `<script>
(function(w,d,s,u){
  if(d.getElementById('proteccio-cookie-banner-loader')) return;
  var el=d.createElement(s);
  el.id='proteccio-cookie-banner-loader';
  el.async=true;
  el.defer=true;
  el.src=u;
  d.head.appendChild(el);
})(window,document,'script','${scriptUrl}');
</script>`,
      };

    case "wordpress":
      return {
        steps: [
          "Option A: Install a header/footer plugin (e.g. WPCode, Insert Headers and Footers).",
          "Paste the script in Site Header or Before </body>.",
          "Option B: Add to your child theme functions.php using wp_enqueue_script (advanced).",
        ],
        code: `${scriptTag}

<!-- Option B: functions.php -->
<?php
add_action('wp_enqueue_scripts', function() {
  wp_enqueue_script(
    'proteccio-cookie-banner',
    '${scriptUrl}',
    array(),
    null,
    false
  );
  wp_script_add_data('proteccio-cookie-banner', 'defer', true);
});
?>`,
      };

    case "shopify":
      return {
        steps: [
          "Go to Online Store → Themes → Edit code.",
          "Open layout/theme.liquid.",
          "Paste the script just before </head> or before </body>, then Save.",
        ],
        code: `{%- comment -%} Proteccio Cookie Banner {%- endcomment -%}
${scriptTag}`,
      };

    case "nextjs":
      return {
        steps: [
          "Open app/layout.tsx (App Router) or pages/_document.tsx (Pages Router).",
          "Import Script from next/script and add the component below inside <body>.",
          "Deploy. Use beforeInteractive for earliest load on consent-critical pages.",
        ],
        code: `import Script from "next/script";

// app/layout.tsx — inside <body>
<Script
  id="proteccio-cookie-banner"
  src="${scriptUrl}"
  strategy="beforeInteractive"
/>`,
      };

    case "react":
      return {
        steps: [
          "Add to public/index.html before </body> for Create React App / Vite static hosting.",
          "Or use the useEffect hook below in your root App component for SPAs.",
        ],
        code: `// public/index.html (before </body>)
${scriptTag}

// — OR — App.tsx / main layout (SPA)
import { useEffect } from "react";

const BANNER_SCRIPT_URL = "${scriptUrl}";

export function ProteccioCookieBanner() {
  useEffect(() => {
    if (document.querySelector(\`script[src="\${BANNER_SCRIPT_URL}"]\`)) return;
    const s = document.createElement("script");
    s.src = BANNER_SCRIPT_URL;
    s.defer = true;
    s.id = "proteccio-cookie-banner";
    document.head.appendChild(s);
    return () => { s.remove(); };
  }, []);
  return null;
}`,
      };

    case "wix":
      return {
        steps: [
          "Wix: Settings → Custom Code → + Add Code → Head.",
          "Squarespace: Settings → Advanced → Code Injection → Header.",
          "Paste the script, apply to All Pages, then Publish.",
        ],
        code: scriptTag,
      };

    default:
      return { steps: [], code: scriptTag };
  }
}
