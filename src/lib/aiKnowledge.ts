/**
 * Braj Nidhi - Spiritual Concierge Knowledge Base
 * This file contains the complete, authoritative knowledge graph for the Braj Nidhi AI Agent.
 * It is dynamically injected into the AI's prompt to ensure highly accurate, contextual,
 * and spiritually resonant responses.
 */

export const BRAJ_NIDHI_KNOWLEDGE = {
  guesthouse: {
    name: "Braj Nidhi",
    tagline: "Luxury Spiritual Dwelling in Vrindavan",
    description: "Braj Nidhi is an ultra-luxury spiritual guesthouse and sanctuary designed for seekers, pilgrims, and families seeking absolute tranquility, luxury, and spiritual elevation in the holy land of Vrindavan.",
    address: "Braj Nidhi Guest House, Vrindavan Chandrodaya Mandir, Bhaktivedanata Swami Marg, Vrindavan, Uttar Pradesh, PIN CODE- 281121",
    phone: "+91 70377 94300",
    email: "support@thebrajnidhi.com",
    checkInTime: "12:00 PM",
    checkOutTime: "11:00 AM",
  },
  rooms: [
    {
      id: "deluxe-2",
      name: "Deluxe 2 – Twin Bedded Room",
      price: 3500,
      description: "Ideal for 2 Adults. Elegant spiritual aesthetics combined with state-of-the-art modern comforts.",
      features: [
        "1 Ultra-comfortable King Bed",
        "Private Balcony overlooking internal Vrindavan Gardens",
        "High-Speed Meraki Guest Wi-Fi",
        "Curated collection of spiritual books",
        "Premium organic herbal tea bar",
        "Complimentary mineral spring water",
        "Soundproof windows for tranquil meditation"
      ]
    },
    {
      id: "deluxe-3",
      name: "Deluxe 3 – 3 Bedded Room",
      price: 4500,
      description: "Ideal for 2 Adults + 1 Child OR 3 Adults. Spacious layout with a dedicated reading alcove, perfect for small families or close spiritual companions.",
      features: [
        "1 King Bed + 1 Premium Single Daybed",
        "Lush view of Vrindavan heritage trees",
        "Divine Radha-Krishna gold-embossed paintings",
        "High-Speed Meraki Guest Wi-Fi",
        "Premium organic toiletries and cotton bathrobes",
        "In-room Vedic air purification system",
        "Organic herbal tea bar and organic coffee maker"
      ]
    },
    {
      id: "deluxe-4",
      name: "Deluxe 4 – 4 Bedded Room",
      price: 5500,
      description: "Ideal for 3 Adults + 1 Child OR 4 Adults. The ultimate family suite offering palatial space, luxurious furnishings, and a panoramic view of local temple domes.",
      features: [
        "2 Ultra-comfortable King Beds in distinct partitioned areas",
        "Panoramic view of Prem Mandir domes",
        "VIP Darshan assistance at Bankey Bihari & Prem Mandir",
        "High-Speed Meraki Guest Wi-Fi",
        "Vedic incense diffuser system",
        "Smart climate control and air purification",
        "Personal spiritual concierge service available 24/7"
      ]
    }
  ],
  dining: {
    type: "Sattvic Divine Prasad",
    philosophy: "We serve pure vegetarian, Sattvic food cooked with absolute hygiene and pure devotion. Our ingredients are locally sourced from organic farms, and everything is cooked using pure A2 Gir Cow Ghee.",
    guidelines: [
      "Strictly 100% Vegetarian",
      "Strictly NO ONION and NO GARLIC used in any preparation",
      "Cooked in pure, certified organic A2 Gir Cow Ghee",
      "All meals are first offered to the Lord as Prasad before serving",
      "Includes clean, refreshing holy basil (Tulsi) herbal tea"
    ],
    timings: {
      breakfast: "8:00 AM - 10:00 AM",
      lunch: "1:00 PM - 3:00 PM",
      eveningTea: "5:30 PM - 6:30 PM",
      dinner: "8:00 PM - 10:00 PM"
    }
  },
  temples: [
    {
      name: "Shri Bankey Bihari Ji Temple",
      distance: "7.7 km away (20 min ride)",
      description: "The heart of Vrindavan, housing the self-manifested deity of Thakur Bankey Bihari Ji, originally worshiped by Swami Haridas.",
      timings: {
        summer: {
          morning: "7:45 AM - 12:00 PM",
          evening: "5:30 PM - 9:30 PM"
        },
        winter: {
          morning: "8:45 AM - 1:00 PM",
          evening: "4:30 PM - 8:30 PM"
        }
      },
      darshanTip: "Highly crowded during holidays. We offer VIP escort service for seniors and families."
    },
    {
      name: "Prem Mandir (Temple of Divine Love)",
      distance: "2.5 km away",
      description: "A spectacular 54-acre temple built entirely of premium Italian Carrara marble, established by Jagadguru Shri Kripalu Ji Maharaj.",
      timings: {
        allYear: {
          morning: "8:30 AM - 12:00 PM",
          evening: "4:30 PM - 8:30 PM"
        }
      },
      highlights: [
        "Spectacular musical light fountain show: 7:00 PM - 7:30 PM",
        "Life-sized hand-carved dioramas of Govardhan Leela and Jhulan Leela"
      ]
    },
    {
      name: "Sri Krishna Balaram Mandir (ISKCON)",
      distance: "2.1 km away",
      description: "The magnificent ISKCON center founded by Srila Prabhupada. Known for ecstatic 24-hour continuous congregational chanting (Kirtan).",
      timings: {
        allYear: {
          morning: "4:30 AM (Mangala Arati) - 12:45 PM",
          evening: "4:30 PM - 8:30 PM"
        }
      },
      highlights: [
        "Ecstatic continuous Harinama Kirtan",
        "Govinda's Pure Vegetarian restaurant inside the complex"
      ]
    },
    {
      name: "Radha Raman Temple",
      distance: "0.8 km away",
      description: "An ancient, highly powerful temple holding the self-manifested deity of Sri Radha Raman Ji from a sacred Shaligram Sila in 1542.",
      timings: {
        allYear: {
          morning: "8:00 AM - 12:30 PM",
          evening: "6:00 PM - 9:00 PM"
        }
      },
      highlights: [
        "Deity never leaves the temple",
        "The temple fire in the kitchen has been burning continuously for over 480 years"
      ]
    }
  ],
  yatraTours: {
    description: "Braj Nidhi arranges custom luxury vehicles and guides for holy parikrama and sightseeing tours.",
    tours: [
      {
        name: "Govardhan Parikrama & Heritage Tour",
        duration: "Full Day (8 Hours)",
        stops: ["Manasi Ganga", "Kusum Sarovar", "Haridev Temple", "Radha Kund", "Shyam Kund"],
        includes: "Luxury AC SUV, qualified local Brajvasi guide, pack of Sattvic picnic prasad."
      },
      {
        name: "Barsana & Nandgaon Divine Leela Tour",
        duration: "Full Day (9 Hours)",
        stops: ["Shreeji Temple Barsana", "Kirti Mandir", "Nanda Bhavan Nandgaon"],
        includes: "Luxury AC SUV, expert guide, customized temple entry guidance."
      },
      {
        name: "Vrindavan Heritage Walk",
        duration: "Half Day (4 Hours)",
        stops: ["Madan Mohan Temple", "Seva Kunj", "Nidhivan", "Yamuna River Evening Aarti"],
        includes: "Walk led by local heritage expert, traditional Braj flower garlands, boat ride during Yamuna Aarti."
      }
    ]
  },
  events: {
    weddings: "Braj Nidhi provides majestic spiritual wedding arrangements, including traditional Vedic marriage rituals, flower-infused setups, divine bhajan singers, and multi-course royal Sattvic catering.",
    corporate: "Spiritual corporate retreats and wellness seminars, complete with state-of-the-art audiovisual setups, meditation workshops, and relaxing yoga breaks."
  },
  houseRules: [
    "No alcohol, smoking, or non-vegetarian food is allowed anywhere in the premises.",
    "Footwear must be removed before entering the indoor meditation hall and dining areas.",
    "Please maintain high volume control for music and respect fellow pilgrims' silence.",
    "Traditional, modest dress is encouraged for temple visits."
  ]
};
