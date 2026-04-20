import React from 'react';

export default function LocalBusinessSchema() {
  // Egy tömböt (array) adunk át a Google-nek, ami külön-külön definiálja a két rendelőt
  const schemaData = [
    {
      "@context": "https://schema.org",
      "@type": "Dentist", 
      "name": "Crown Dental Esztergom",
      "image": "https://www.crowndental.hu/logo.webp",
      "@id": "https://www.crowndental.hu/#esztergom",
      "url": "https://www.crowndental.hu/esztergom",
      "telephone": "+36705646837",
      "email": "info@crowndental.hu",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Petőfi Sándor utca 11.",
        "addressLocality": "Esztergom",
        "postalCode": "2500",
        "addressCountry": "HU"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 47.79426, // Esztergomi koordináta
        "longitude": 18.73971
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
        ],
        "opens": "08:00",
        "closes": "20:00"
      },
      "sameAs": [
        "https://www.facebook.com/koronafogaszatesztergom/",
        "https://www.instagram.com/crown_dental93/"
      ],
      "department": {
        "@type": "DentalClinic",
        "name": "Saját Fogtechnikai Laboratórium",
        "description": "Helyben működő fogtechnikai labor 1 napos fogsor javítással."
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Dentist", 
      "name": "Crown Dental Budapest",
      "image": "https://www.crowndental.hu/logo.webp",
      "@id": "https://www.crowndental.hu/#budapest",
      "url": "https://www.crowndental.hu/budapest",
      "telephone": "+36705646837",
      "email": "info@crowndental.hu",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Királyok útja 55.",
        "addressLocality": "Budapest",
        "postalCode": "1039",
        "addressCountry": "HU"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 47.58886, // Budapesti (Római part) koordináta
        "longitude": 19.05834
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
        ],
        "opens": "08:00",
        "closes": "20:00"
      },
      "sameAs": [
        "https://www.facebook.com/koronafogaszatesztergom/",
        "https://www.instagram.com/crown_dental93/"
      ]
    }
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
