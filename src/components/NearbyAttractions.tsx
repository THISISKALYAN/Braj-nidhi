"use client";

import React from "react";
import { motion } from "framer-motion";

const KrishnaFeatherDefs = () => (
  <svg style={{ display: "none" }} aria-hidden="true">
    <defs>
      <g id="peacock-feather">
        <path d="M50,80 C10,80 0,20 50,0 C100,20 90,80 50,80 Z" fill="#008000" opacity="0.9" />
        <path d="M50,70 C20,70 15,25 50,10 C85,25 80,70 50,70 Z" fill="#32CD32" />
        <ellipse cx="50" cy="30" rx="14" ry="20" fill="#00CED1" />
        <ellipse cx="50" cy="30" rx="8" ry="12" fill="#000080" />
        <path d="M50,0 L50,95" stroke="#006400" strokeWidth="2" />
      </g>
      <g id="krishna-flute-feather">
        <path d="M10,75 L90,45" stroke="#DAA520" strokeWidth="12" strokeLinecap="round" />
        <path d="M12,73 L88,44" stroke="#F0E68C" strokeWidth="6" strokeLinecap="round" />
        <line x1="20" y1="76" x2="25" y2="63" stroke="#DC143C" strokeWidth="3" />
        <line x1="23" y1="75" x2="28" y2="62" stroke="#DC143C" strokeWidth="3" />
        <line x1="75" y1="56" x2="80" y2="43" stroke="#DC143C" strokeWidth="3" />
        <line x1="78" y1="55" x2="83" y2="42" stroke="#DC143C" strokeWidth="3" />
        <circle cx="40" cy="62" r="2.5" fill="#3e2723" />
        <circle cx="50" cy="59" r="2.5" fill="#3e2723" />
        <circle cx="60" cy="56" r="2.5" fill="#3e2723" />
        <circle cx="70" cy="53" r="2.5" fill="#3e2723" />
        <path d="M23,75 Q15,90 30,95" fill="none" stroke="#FFD700" strokeWidth="2" />
        <path d="M27,74 Q35,90 30,95" fill="none" stroke="#FFD700" strokeWidth="2" />
        <g transform="translate(55, 10) rotate(15) scale(0.4)">
          <use href="#peacock-feather" />
        </g>
      </g>
    </defs>
  </svg>
);

type Attraction = {
  title: string;
  rating: string;
  location: string;
  distance: string;
  image: string;
  mapSrc: string;
  alt: string;
};

const attractions: Attraction[] = [
  {
    title: "Radha Vallabh Temple",
    rating: "4.9",
    location: "Gotam Nagar, Vrindavan",
    distance: "3.69 km",
    image: "/Radha Vallabh Dwar.webp",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6974793!3d27.5815647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39736fc201c10711%3A0xbcc1c54b2ce8f41e!2sShri%20Bankey%20Bihari%20Ji%20Temple%2C%20Vrindavan!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin",
    alt: "Radha Vallabh Temple",
  },
  {
    title: "Prem Mandir",
    rating: "5.0",
    location: "Chattikara Road, Vrindavan",
    distance: "0.69 km",
    image: "/Prem Mandir.webp",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6774793!3d27.5615647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sPrem%20Mandir!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin",
    alt: "Prem Mandir",
  },
  {
    title: "Keshi Ghat",
    rating: "4.8",
    location: "Banks of Yamuna, Vrindavan",
    distance: "1.20 km",
    image: "/keshi ghat.webp",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6874793!3d27.5715647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sISKCON%20Vrindavan!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin",
    alt: "Keshi Ghat",
  },
  {
    title: "Nidhivan",
    rating: "4.7",
    location: "Goshala Nagar, Vrindavan",
    distance: "3.55 km",
    image: "/nidhivan.webp",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6984793!3d27.5825647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNidhivan!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin",
    alt: "Nidhivan",
  },
  {
    title: "Radha Raman Temple",
    rating: "4.9",
    location: "Pancayatana, Vrindavan",
    distance: "3.45 km",
    image: "/radha-raman-temple.webp",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6994793!3d27.5835647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sRadha%20Raman%20Temple!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin",
    alt: "Radha Raman Temple",
  },
  {
    title: "Neem Karoli Ashram",
    rating: "4.9",
    location: "Mathura Road, Vrindavan",
    distance: "2.72 km",
    image: "/neem-karoli-baba.webp",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6914793!3d27.5845647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNeem%20Karoli%20Baba%20Ashram!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin",
    alt: "Neem Karoli Ashram",
  },
  {
    title: "Raman Reti",
    rating: "4.8",
    location: "Gokul, Uttar Pradesh",
    distance: "15.39 km",
    image: "/raman-reti.webp",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.7214793!3d27.4845647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sRaman%20Reti!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin",
    alt: "Raman Reti",
  },
  {
    title: "Shri Nand Baba Temple",
    rating: "4.9",
    location: "Nandgaon, Mathura",
    distance: "31.64 km",
    image: "/nandgaon-holi.webp",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.4214793!3d27.7845647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sShri%20Nand%20Baba%20Temple!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin",
    alt: "Shri Nand Baba Temple",
  },
  {
    title: "Vishram Ghat Mathura",
    rating: "4.9",
    location: "Mathura",
    distance: "12.5 km",
    image: "/vishram-ghat.webp",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6814793!3d27.5045647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sVishram%20Ghat!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin",
    alt: "Vishram Ghat Mathura",
  },
  {
    title: "Shri Banke Bihari Mandir",
    rating: "5.0",
    location: "Bihari Pura, Vrindavan",
    distance: "7.7 km (20 min ride)",
    image: "/banke-bihari-mandir.webp",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6974793!3d27.5815647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39736fc201c10711%3A0xbcc1c54b2ce8f41e!2sShri%20Bankey%20Bihari%20Ji%20Temple%2C%20Vrindavan!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin",
    alt: "Shri Banke Bihari Mandir",
  },
];

export default function NearbyAttractions() {
  const toggleFlip = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.classList.toggle("flipped");
  };

  return (
    <>
      <KrishnaFeatherDefs />
      <section className="attractions-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="divine-header">
            <span className="krishna-feather">
              <svg viewBox="0 0 100 100">
                <use href="#krishna-flute-feather" />
              </svg>
            </span>
            <span className="divine-text">Nearby Attractions</span>
            <span className="krishna-feather right-feather">
              <svg viewBox="0 0 100 100">
                <use href="#krishna-flute-feather" />
              </svg>
            </span>
          </h2>
          <p>
            Discover the divine landmarks and heritage sites around Braj Nidhi.{" "}
            <span className="click-hint">(Click any card to flip for location)</span>
          </p>
        </motion.div>
        <div className="attractions-grid">
          {attractions.map((item, idx) => (
            <motion.div
              key={item.title}
              className="attraction-card"
              onClick={toggleFlip}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
              whileHover={{ y: -8 }}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <img loading="lazy" decoding="async" src={item.image} alt={item.alt} className="attraction-bg" />
                  <div className="card-overlay-gradient" />
                  <div className="distance-pill">{item.distance}</div>
                  <div className="attraction-content">
                    <div className="title-row">
                      <h3>{item.title}</h3>
                      <span className="rating-pill">
                        <i className="fas fa-star" style={{ color: "#ffd700" }} /> {item.rating}
                      </span>
                    </div>
                    <div className="location-line">
                      <i className="fas fa-map-marker-alt" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flip-hint-text">
                      <i className="fas fa-sync-alt" /> Click for Map
                    </div>
                  </div>
                </div>
                <div className="flip-card-back">
                  <iframe
                    src={item.mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map — ${item.title}`}
                  />
                  <div className="flip-back-hint">
                    <i className="fas fa-undo" /> Click to flip back
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
