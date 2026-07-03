"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Bed, Square } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface RoomCardProps {
  title: string;
  description: string;
  image: string;
  price: string;
  size: string;
  guests: string;
  bed: string;
}

const RoomCard: React.FC<RoomCardProps> = ({ title, description, image, price, size, guests, bed }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-border/50"
    >
      <div className="relative h-80 overflow-hidden">
        <Image src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
          <span className="text-primary font-bold">{price}</span>
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider"> / Night</span>
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-2xl font-serif text-royal mb-3 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          {description}
        </p>

        <div className="flex items-center justify-between py-6 border-y border-border/50 mb-8">
          <div className="flex flex-col items-center gap-1">
            <Square size={16} className="text-gold" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{size}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users size={16} className="text-gold" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{guests} Guests</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Bed size={16} className="text-gold" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{bed}</span>
          </div>
        </div>

        <Link
          href={`/rooms/${title.toLowerCase().replace(/\s+/g, "-")}`}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-primary/20 text-primary font-bold uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all"
        >
          View Details
          <ArrowRight size={18} />
        </Link>
      </div>
    </motion.div>
  );
};

export default RoomCard;
