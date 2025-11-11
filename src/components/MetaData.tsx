// components/MetaData.tsx
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const MetaData = () => {
  const location = useLocation();
  const { pathname } = location;

  // Kenya-specific configuration
  const baseUrl = "https://plasmawaterafrica.com";
  const siteName = "Plasma Water Africa";
  const email = "plasmawaterafrica@gmail.com";
  const phone = "+254-700-000000";
  const defaultImage = "/images/plasma-water-africa-borehole-drilling-kenya.jpg";

  // Kenya counties and major areas for SEO
  const kenyaCounties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Machakos", "Meru",
    "Nyeri", "Garissa", "Kakamega", "Malindi", "Kitale", "Lamu", "Naivasha", "Narok",
    "Kisii", "Kericho", "Embu", "Isiolo", "Nanyuki", "Kiambu", "Kitui", "Marsabit",
    "Homa Bay", "Bungoma", "Busia", "Siaya", "Kilifi", "Kwale", "Taita Taveta", "Tana River"
  ];

  const kenyaAreas = [
    "Westlands", "Karen", "Runda", "Lavington", "Kilimani", "Upper Hill", "South B", "South C",
    "Embakasi", "Kasarani", "Roysambu", "Dagoretti", "Langata", "Donholm", "Umoja", "Buruburu",
    "Eastleigh", "Parklands", "Adams Arcade", "Ngong Road", "Thika Road", "Mombasa Road", "Waiyaki Way"
  ];

  // Services keywords for Kenya
  const servicesKeywords = [
    "borehole drilling", "solar water systems", "water tower construction", 
    "water pump installation", "water treatment", "groundwater exploration",
    "well drilling", "water storage solutions", "irrigation systems", "water piping"
  ];

  // Generate dynamic keywords for each page
  const generateKeywords = (pageSpecific: string[]) => {
    const baseKeywords = [
      ...pageSpecific,
      ...servicesKeywords,
      "Plasma Water Africa",
      "water solutions Kenya",
      "borehole companies Kenya",
      "water experts Africa"
    ];
    
    // Add county-specific keywords (first 5 counties for length)
    const countyKeywords = kenyaCounties.slice(0, 5).map(county => 
      `borehole drilling ${county}`
    );
    
    return [...baseKeywords, ...countyKeywords].join(", ");
  };

  // Page-specific configurations
  const pageConfigs = {
    '/': {
      title: "Plasma Water Africa - #1 Borehole Drilling Company in Kenya | Solar Water Systems & Water Towers",
      description: "Plasma Water Africa - Leading borehole drilling experts in Kenya. Professional solar water installation, water tower construction across all 47 counties. 500+ boreholes drilled, 100+ solar installations. Free site survey. Email: plasmawaterafrica@gmail.com",
      keywords: generateKeywords(["borehole drilling Kenya", "solar water systems Nairobi", "water tower construction Kenya", "water solutions Africa"]),
      image: "/images/plasma-water-africa-borehole-drilling-kenya.jpg",
      type: "website",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Plasma Water Africa",
        "url": baseUrl,
        "logo": `${baseUrl}/images/plasma-water-africa-logo.png`,
        "description": "Professional borehole drilling, solar water systems, and water tower construction services across Kenya",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Nairobi, Kenya",
          "addressLocality": "Nairobi",
          "addressRegion": "Nairobi County",
          "postalCode": "00100",
          "addressCountry": "KE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "-1.286389",
          "longitude": "36.817223"
        },
        "areaServed": kenyaCounties,
        "serviceArea": {
          "@type": "Place",
          "name": "Kenya"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": phone,
          "email": email,
          "contactType": "customer service",
          "areaServed": "KE",
          "availableLanguage": ["en", "sw"]
        },
        "openingHours": "Mo-Fr 08:00-17:00, Sa 08:00-13:00",
        "priceRange": "$$",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "127"
        }
      }
    },
    '/about': {
      title: "About Plasma Water Africa - Kenya's Leading Water Solutions Experts | Borehole & Solar Specialists",
      description: "Learn about Plasma Water Africa - Kenya's trusted water solutions company. Expert team specializing in borehole drilling, solar water systems, and water tower construction across all Kenyan counties. Email: plasmawaterafrica@gmail.com",
      keywords: generateKeywords(["about Plasma Water Africa", "water experts Kenya", "borehole specialists Nairobi", "Kenyan water company", "water solutions Africa"]),
      image: "/images/about-plasma-water-africa-kenya-team.jpg",
      type: "website",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About Plasma Water Africa",
        "description": "Kenya's leading water solutions company specializing in borehole drilling and solar water systems",
        "publisher": {
          "@type": "Organization",
          "name": "Plasma Water Africa",
          "email": email
        }
      }
    },
    '/services': {
      title: "Water Services Kenya - Borehole Drilling, Solar Systems & Water Towers | Plasma Water Africa",
      description: "Professional water services in Kenya by Plasma Water Africa: Borehole drilling Nairobi & all counties, solar water installation, water tower construction, water pump installation. Complete water solutions. Email: plasmawaterafrica@gmail.com for free quote.",
      keywords: generateKeywords(["borehole drilling services Kenya", "solar water installation Nairobi", "water tower construction Kenya", "water pump installation", "well drilling services"]),
      image: "/images/plasma-water-africa-services-kenya.jpg",
      type: "website",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "Water Infrastructure Services Kenya",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Plasma Water Africa",
          "email": email,
          "telephone": phone
        },
        "areaServed": kenyaCounties.map(county => ({
          "@type": "Place",
          "name": county
        })),
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Water Solutions Services Kenya",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Borehole Drilling Kenya",
                "description": "Professional borehole drilling services across all 47 Kenyan counties"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Solar Water Systems Kenya",
                "description": "Solar-powered water pumping and distribution systems throughout Kenya"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Water Tower Construction Kenya",
                "description": "Water storage towers and elevated tank construction across Kenya"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Water Pump Installation",
                "description": "Professional water pump installation and maintenance services"
              }
            }
          ]
        }
      }
    },
    '/projects': {
      title: "Water Projects Kenya - Plasma Water Africa Completed Borehole & Solar Installations",
      description: "View Plasma Water Africa's completed water projects across Kenya: Borehole drilling in Nairobi, solar installations in Mombasa, water towers in Kisumu, Nakuru, Eldoret. Case studies and success stories. Email: plasmawaterafrica@gmail.com",
      keywords: generateKeywords(["water projects Kenya", "completed borehole drilling", "solar installation projects", "water tower construction", "Kenya water projects"]),
      image: "/images/plasma-water-africa-projects-kenya.jpg",
      type: "website",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Water Projects - Plasma Water Africa Kenya",
        "description": "Completed borehole drilling, solar installation, and water tower projects across Kenya",
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": "50",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Borehole Drilling Projects Kenya"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Solar Water Installation Projects"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Water Tower Construction Projects"
            }
          ]
        }
      }
    },
    '/contact': {
      title: "Contact Plasma Water Africa Kenya - Free Borehole Drilling Quote | Email: plasmawaterafrica@gmail.com",
      description: "Contact Plasma Water Africa for professional water solutions in Kenya. Get free borehole drilling consultation, solar installation quotes, water tower construction estimates. Serving all 47 counties. Email: plasmawaterafrica@gmail.com | Call: +254-700-000000",
      keywords: generateKeywords(["contact Plasma Water Africa", "borehole drilling quote", "solar installation Kenya", "water tower construction", "free consultation Kenya"]),
      image: "/images/contact-plasma-water-africa-kenya.png",
      type: "website",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact Plasma Water Africa Kenya",
        "description": "Contact for borehole drilling, solar installation, and water tower services across Kenya",
        "mainEntity": {
          "@type": "Organization",
          "name": "Plasma Water Africa",
          "email": email,
          "telephone": phone,
          "areaServed": "KE",
          "serviceArea": {
            "@type": "Place",
            "name": "Kenya"
          }
        }
      }
    }
  };

  // Get current page config or use default
  const currentConfig = pageConfigs[pathname as keyof typeof pageConfigs] || pageConfigs['/'];
  
  const fullCanonical = `${baseUrl}${pathname}`;
  const fullImage = currentConfig.image.startsWith('http') ? currentConfig.image : `${baseUrl}${currentConfig.image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{currentConfig.title}</title>
      <meta name="description" content={currentConfig.description} />
      <meta name="keywords" content={currentConfig.keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Plasma Water Africa" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={currentConfig.title} />
      <meta property="og:description" content={currentConfig.description} />
      <meta property="og:type" content={currentConfig.type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_KE" />
      <meta property="og:email" content={email} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={currentConfig.title} />
      <meta name="twitter:description" content={currentConfig.description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@PlasmaWaterAfrica" />
      <meta name="twitter:creator" content="@PlasmaWaterAfrica" />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#0066cc" />
      <meta name="msapplication-TileColor" content="#0066cc" />
      
      {/* Structured Data - Critical for Google */}
      <script type="application/ld+json">
        {JSON.stringify(currentConfig.structuredData)}
      </script>
      
      {/* Favicon Links */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Kenya-Specific Geo Tags */}
      <meta name="geo.region" content="KE" />
      <meta name="geo.placename" content="Kenya" />
      <meta name="geo.position" content="-1.286389;36.817223" />
      <meta name="ICBM" content="-1.286389, 36.817223" />
      
      {/* Business-specific meta tags for Kenya */}
      <meta name="business:service_area:country" content="KE" />
      <meta name="business:service_area:region" content={kenyaCounties.join(", ")} />
      <meta name="business:contact:email" content={email} />
      <meta name="business:contact:phone" content={phone} />
      
      {/* Dublin Core Metadata */}
      <meta name="DC.title" content={currentConfig.title} />
      <meta name="DC.description" content={currentConfig.description} />
      <meta name="DC.creator" content="Plasma Water Africa" />
      <meta name="DC.language" content="en" />
      <meta name="DC.coverage" content="Kenya" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="classification" content="Water Solutions, Borehole Drilling, Solar Installation, Kenya" />
      <meta name="reply-to" content={email} />
      <meta name="contact" content={email} />
      
      {/* Mobile Specific */}
      <meta name="format-detection" content="telephone=yes" />
      
      {/* Content Language */}
      <meta httpEquiv="content-language" content="en" />
      
      {/* Distribution */}
      <meta name="distribution" content="global" />
      
      {/* Rating */}
      <meta name="rating" content="general" />
      
      {/* Revisit */}
      <meta name="revisit-after" content="7 days" />
    </Helmet>
  );
};

export default MetaData;