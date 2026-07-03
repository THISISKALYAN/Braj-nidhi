"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMusic } from "@/lib/MusicContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Send,
  X,
  Bot,
  User,
  CheckCircle,
  Calendar,
  Building2,
  Landmark,
  UtensilsCrossed,
  Car,
  Sparkles,
  ChevronLeft,
  Plus,
  RotateCcw,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Home,
  MessageSquare,
  Compass,
  ArrowRight,
  Mic,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { BRAJ_NIDHI_KNOWLEDGE } from "@/lib/aiKnowledge";

// --- Sub-components for icons ---
const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.004 2c-5.508 0-9.99 4.478-9.99 9.986 0 1.778.468 3.516 1.356 5.05L2 22l5.12-1.342c1.5 1.026 3.266 1.572 5.086 1.572 5.506 0 9.99-4.484 9.99-9.988A9.992 9.992 0 0012.004 2z" fill="white"/>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" fill="#25D366"/>
  </svg>
);

const InstagramIconComp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-white">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const GlowingAvatar = () => (
  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-[#9F7AEA] via-[#EC4899] to-[#3B82F6] shadow-[0_0_12px_rgba(159,122,234,0.4)]">
    <div className="absolute inset-[1.5px] rounded-full bg-white flex items-center justify-center overflow-hidden">
      <img loading="lazy" decoding="async" src="/1200x630wa-removebg-preview.webp"
        alt="Braj Nidhi Avatar"
        className="w-6 h-6 object-contain" />
    </div>
    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 mix-blend-overlay animate-pulse" />
  </div>
);

const WaveformIcon = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20" />
    <path d="M17 5v14" />
    <path d="M22 9v6" />
    <path d="M7 5v14" />
    <path d="M2 9v6" />
  </svg>
);

const DoubleCheckmarks = () => (
  <svg className="w-3.5 h-3.5 inline-block text-white/80 ml-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12l5.25 5 11-11" />
    <path d="M8 12.5l3.25 3 7-7" />
  </svg>
);

const HologramSphere = () => (
  <div className="relative w-40 h-40 mx-auto flex items-center justify-center pointer-events-none mt-2 select-none">
    {/* Ambient shadow glow */}
    <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-[#9F7AEA]/20 via-[#EC4899]/10 to-[#3B82F6]/20 blur-xl animate-pulse" />
    
    {/* Core glowing sphere */}
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-[#9F7AEA] via-[#EC4899] to-[#3B82F6] opacity-35 filter blur-[0.5px] shadow-[inset_-8px_-8px_20px_rgba(255,255,255,0.45),0_8px_24px_rgba(113,55,241,0.2)]"
    />
    
    {/* Inner decorative orbit line 1 */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute w-28 h-14 rounded-full border border-white/20 transform rotate-12"
      style={{ transformStyle: "preserve-3d" }}
    />
    
    {/* Inner decorative orbit line 2 */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute w-14 h-28 rounded-full border border-white/15 transform -rotate-45"
      style={{ transformStyle: "preserve-3d" }}
    />

    {/* Floating dust particles */}
    <motion.div
      animate={{
        y: [-4, 4, -4],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{ duration: 4, repeat: Infinity }}
      className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-purple-300 blur-[0.5px]"
    />
    <motion.div
      animate={{
        y: [4, -4, 4],
        opacity: [0.2, 0.7, 0.2],
      }}
      transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-300 blur-[0.5px]"
    />
  </div>
);

// --- Typings ---
interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isRecommendation?: boolean;
  recommendationData?: {
    roomName: string;
    price: number;
    image: string;
    features: string[];
  };
}

interface QualState {
  step: "idle" | "name" | "guests" | "dates" | "phone" | "completed";
  name: string;
  guests: string;
  checkIn: string;
  phone: string;
}

export default function FloatingWidgets() {
  const { isPlaying, togglePlay } = useMusic();
  const [mounted, setMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "chat" | "explore" | "profile">("home");

  const getFormattedTime = () => {
    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: "Radhe Radhe! 🙏 Welcome to Braj Nidhi. How may I assist you in your holy pilgrimage today?",
      timestamp: "Now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Interactive assistant bubble states
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Record<number, "up" | "down" | undefined>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [qualState, setQualState] = useState<QualState>({
    step: "idle",
    name: "",
    guests: "",
    checkIn: "",
    phone: "",
  });

  useEffect(() => {
    setMounted(true);
    return () => {
      // cancel speech on unmount
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, activeTab]);

  if (!mounted) return null;

  const fetchAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Calls our secure /api/chat proxy — OpenAI key stays on the server
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage }],
          systemPrompt: `You are the AI concierge/guide for Braj Nidhi, a luxury spiritual guesthouse in Vrindavan.
              Answer the user based on the following verified knowledge base:
              ${JSON.stringify(BRAJ_NIDHI_KNOWLEDGE, null, 2)}

              Guidelines:
              1. Keep responses concise, warm, and elegant. Start with a blessed greeting like "Radhe Radhe! 🙏".
              2. Always present details matching the provided knowledge base (e.g. pricing, timings, rules).
              3. Do not invent any facts not present in the knowledge base.
              4. If asked about booking a room, guide them to click the custom Spark AI button or start the Reservation flow.`,
        }),
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      return data.reply || "Blessed seeker, please try again.";
    } catch {
      return "Radhe Radhe! 🙏 For direct room reservations or support, please speak directly to our concierge team at +91 70377 94300.";
    }
  };

  const advanceQualification = (inputVal: string) => {
    const trimmed = inputVal.trim();
    if (!trimmed) { setIsTyping(false); return; }

    if (qualState.step === "name") {
      setQualState(prev => ({ ...prev, step: "guests", name: trimmed }));
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant",
        content: `Radhe Radhe, ${trimmed}! 🙏 How many pilgrims will be staying with us?`,
        timestamp: getFormattedTime(),
      }]);
    } else if (qualState.step === "guests") {
      setQualState(prev => ({ ...prev, step: "dates", guests: trimmed }));
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant",
        content: "Understood. What is your preferred check-in date for the yatra stay?",
        timestamp: getFormattedTime(),
      }]);
    } else if (qualState.step === "dates") {
      setQualState(prev => ({ ...prev, step: "phone", checkIn: trimmed }));
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant",
        content: "Splendid! May I have your WhatsApp mobile number for instant verification and voucher confirmation?",
        timestamp: getFormattedTime(),
      }]);
    } else if (qualState.step === "phone") {
      const guestNum = parseInt(trimmed.match(/\d+/)?.[0] || "2") || 2;
      let roomName = "Deluxe 2 – Twin Bedded Room";
      let price = 3500;
      let image = "DSC05818-HDR.webp";
      let features = ["Twin Beds", "AC & High-Speed WiFi", "Hot Water Access", "Divine Sattvic Breakfast"];

      if (guestNum === 3) {
        roomName = "Deluxe 3 – 3 Bedded Room"; price = 4500; image = "d3.webp";
        features = ["Triple Beds", "Temple View Balcony", "Premium Bath Amenities"];
      } else if (guestNum >= 4) {
        roomName = "Deluxe 4 – 4 Bedded Room"; price = 5500; image = "d31.webp";
        features = ["Grand Suite Lounge", "Spacious Living Room", "Panoramic Views", "VVIP Guest Services"];
      }

      setQualState(prev => ({ ...prev, step: "completed", phone: trimmed }));
      setIsTyping(false);
      setMessages(prev => [...prev,
        { id: Date.now() + 1, role: "assistant", content: `Excellent details, ${qualState.name}! 🙏 Here is our highly recommended spiritual suite for your yatra:`, timestamp: getFormattedTime() },
        { id: Date.now() + 2, role: "assistant", content: "", isRecommendation: true, recommendationData: { roomName, price, image, features }, timestamp: getFormattedTime() },
      ]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now(), role: "user", content: input.trim(), timestamp: getFormattedTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    
    // Switch to active chat thread view immediately on sending message
    setActiveTab("chat");

    if (qualState.step !== "idle" && qualState.step !== "completed") {
      setTimeout(() => advanceQualification(userMsg.content), 600);
      return;
    }

    const q = userMsg.content.toLowerCase();
    if (q.includes("book") || q.includes("room") || q.includes("stay") || q.includes("price") || q.includes("reserve") || q.includes("booking")) {
      setQualState(prev => ({ ...prev, step: "name" }));
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: "assistant",
          content: "I'd be honored to assist with your room booking. 🙏 What is your good name?",
          timestamp: getFormattedTime(),
        }]);
      }, 600);
      return;
    }

    const response = await fetchAIResponse(userMsg.content);
    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: response, timestamp: getFormattedTime() }]);
  };

  const handleQuickAction = async (query: string, label: string) => {
    // If stay is clicked, trigger state yatra qualification directly
    if (label === "Divine Stays" || query.toLowerCase().includes("book")) {
      setActiveTab("chat");
      setQualState(prev => ({ ...prev, step: "name" }));
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: "assistant",
          content: "I'd be honored to assist with your room booking. 🙏 What is your good name?",
          timestamp: getFormattedTime(),
        }]);
      }, 500);
      return;
    }

    const userMsg: ChatMessage = { id: Date.now(), role: "user", content: query, timestamp: getFormattedTime() };
    setMessages(prev => [...prev, userMsg]);
    setActiveTab("chat");
    setIsTyping(true);

    const response = await fetchAIResponse(query);
    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: response, timestamp: getFormattedTime() }]);
  };

  const resetChatSession = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content: "Radhe Radhe! 🙏 Assistant session reset. How can I guide you today?",
        timestamp: getFormattedTime()
      }
    ]);
    setQualState({
      step: "idle",
      name: "",
      guests: "",
      checkIn: "",
      phone: "",
    });
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  };

  // Sound/TTS function
  const handleSpeak = (text: string, id: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    
    window.speechSynthesis.cancel();
    // Strip emojis for cleaner read
    const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingId(id);
  };

  // Clipboard copy function
  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Feedback up/down function
  const handleFeedback = (id: number, type: "up" | "down") => {
    setFeedback(prev => ({
      ...prev,
      [id]: prev[id] === type ? undefined : type
    }));
  };

  const quickActions = [
    { icon: Building2, label: "Divine Stays", query: "I want to reserve a room stay", desc: "Book suites & check rates", color: "from-[#C4B5FD] to-[#8B5CF6]" },
    { icon: Landmark, label: "Temple Yatra", query: "Tell me about nearby temples and their timings", desc: "Bankey Bihari & Prem Mandir guide", color: "from-[#93C5FD] to-[#3B82F6]" },
    { icon: UtensilsCrossed, label: "Sattvic Dining", query: "What sattvic dining options do you offer?", desc: "Divine pure vegetarian prasad", color: "from-[#FDBA74] to-[#F97316]" },
    { icon: Car, label: "Travel Guide", query: "How to reach Braj Nidhi and explore locally?", desc: "Local route directions & maps", color: "from-[#86EFAC] to-[#10B981]" }
  ];

  const localAttractions = [
    { name: "Bankey Bihari Temple", distance: "7.7 km away (20 min ride)", desc: "The ultimate heart of Vrindavan, housing the self-manifested form of Thakur Bankey Bihari Ji.", query: "Tell me about Bankey Bihari Temple daily yatra" },
    { name: "Prem Mandir", distance: "2.5 km away", desc: "A magnificent temple built of Italian white marble, decorated with dynamic musical fountains and beautiful tableaux.", query: "Tell me about Prem Mandir light shows & timings" },
    { name: "Sri Krishna Balaram Mandir (ISKCON)", distance: "2.1 km away", desc: "Spiritual headquarters with non-stop Hare Krishna kirtan, gorgeous deities, and a lovely clean courtyard.", query: "Tell me about ISKCON Vrindavan timings" },
    { name: "Radha Raman Temple", distance: "0.8 km away", desc: "Ancient holy place where the divine deity self-manifested from a sacred saligram sila in 1542.", query: "Tell me about Radha Raman Temple history" }
  ];

  return (
    <>
      {/* WhatsApp - Left */}
      <motion.a
        href="https://wa.me/917037794300"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        className="fixed left-5 bottom-[196px] z-50 w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-[0_0_25px_rgba(37,211,102,0.6)]"
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
      >
        <WhatsAppIcon />
      </motion.a>

      {/* Instagram - Left */}
      <motion.a
        href="https://www.instagram.com/braj.nidhi_/"
        target="_blank" rel="noopener noreferrer"
        title="Follow on Instagram"
        className="fixed left-5 bottom-[138px] z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:shadow-[0_0_25px_rgba(238,42,123,0.6)]"
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
      >
        <InstagramIconComp />
      </motion.a>

      {/* Music - Left */}
      <motion.div
        className="fixed left-5 bottom-[80px] z-50"
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={togglePlay}
          title={isPlaying ? "Pause Music" : "Play Music"}
          className="w-12 h-12 bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg border border-white/10 hover:border-[#D4AF37]/60"
          whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.88 }}
        >
          <div className="w-7 h-7 bg-black rounded-[8px] border border-white/5 flex items-center justify-center">
            {isPlaying
              ? <Pause className="w-3.5 h-3.5 text-white fill-white" />
              : <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />}
          </div>
          {isPlaying && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse border border-black" />}
        </motion.button>
      </motion.div>

      {/* --- Floating AI Trigger Button (Mockup Orb Styled Pulsing Button) --- */}
      <motion.button
        onClick={() => setIsChatOpen(!isChatOpen)}
        title="Smart AI Guide"
        style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}
        className="w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-300"
        whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.93 }}
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
      >
        {/* Glow pulsing ring matching the violet theme of the mockup */}
        <span
          className="absolute inset-0 rounded-full border-[3px] border-[#8B5CF6] opacity-50 animate-ping"
          style={{ animationDuration: "2.4s" }}
        />
        <div
          className="relative w-[58px] h-[58px] rounded-full overflow-hidden border-[2px] border-[#8B5CF6]/40 p-[1.5px] bg-gradient-to-tr from-[#9F7AEA] via-[#EC4899] to-[#3B82F6]"
          style={{ boxShadow: "0 8px 24px rgba(139,92,246,0.35)" }}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
            {isChatOpen ? (
              <X className="w-6 h-6 text-[#7137F1] stroke-[2.5]" />
            ) : (
              <img loading="lazy" decoding="async" src="/1200x630wa-removebg-preview.webp"
                alt="Braj Nidhi AI"
                className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-300" />
            )}
          </div>
        </div>
      </motion.button>

      {/* --- Chat Window Shell (Revamped with Ultra-Premium Soft Purple Mockup Styling) --- */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 35 }}
            transition={{ type: "spring", damping: 26, stiffness: 340 }}
            className="fixed right-2 md:right-6 bottom-[100px] z-[9999] w-[calc(100%-16px)] max-w-[380px] md:w-[380px] h-[610px] max-h-[85vh] rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(113,55,241,0.12)] flex flex-col bg-[#F6F5FA] border border-[#E8E6F0] text-[#332A42]"
          >
            {/* ──────── Header Block ──────── */}
            {activeTab === "home" ? (
              /* Home View Header (Image 2 style) */
              <div className="px-6 pt-5 pb-3 flex justify-between items-center bg-transparent">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-amber-100 flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-purple-700" />
                  </div>
                  <span className="text-xs font-bold bg-white/80 border border-[#E8E6F0] px-2.5 py-1 rounded-full text-stone-600 shadow-sm">
                    Seeker Profile
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-extrabold tracking-wide uppercase text-stone-500">CONCIERGE</span>
                </div>
              </div>
            ) : (
              /* Active View Header (Image 1 style) */
              <div className="px-5 py-4 bg-white/95 backdrop-blur-md flex items-center justify-between border-b border-[#ECEAF3] shadow-sm">
                <motion.button
                  onClick={() => setActiveTab("home")}
                  className="w-9 h-9 rounded-full bg-white shadow-sm border border-[#EBE9F5] flex items-center justify-center text-[#1E1B4B] hover:bg-[#F3F2FA]"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </motion.button>

                <div className="text-center">
                  <h4 className="text-[#1E1B4B] font-extrabold text-[15.5px] tracking-wide">
                    Smart Chat
                  </h4>
                  <p className="text-[10px] text-stone-400 font-bold tracking-wider mt-0.5">
                    ONLINE • BRAJ NIDHI
                  </p>
                </div>

                <motion.button
                  onClick={resetChatSession}
                  title="Reset Chat"
                  className="w-9 h-9 rounded-full bg-white shadow-sm border border-[#EBE9F5] flex items-center justify-center text-[#1E1B4B] hover:bg-[#F3F2FA]"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                </motion.button>
              </div>
            )}

            {/* ──────── Content Panel ──────── */}
            <div className="flex-1 overflow-y-auto flex flex-col justify-start">
              
              {/* TAB 1: Home Dashboard View (Image 2 style) */}
              {activeTab === "home" && (
                <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto scrollbar-none">
                  {/* Greeting Text Area */}
                  <div className="mt-2">
                    <p className="text-stone-500 font-bold text-sm tracking-wide">
                      Hey, {qualState.name || "seeker"} 👋
                    </p>
                    <h2 className="text-[#1E1B4B] font-extrabold text-[32px] tracking-tight leading-tight mt-1">
                      How can I help you today?
                    </h2>
                  </div>

                  {/* Ask anything search capsule */}
                  <div className="my-5 bg-white border border-[#E8E6F0] rounded-full p-1.5 pr-2.5 flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                    <GlowingAvatar />
                    <input
                      type="text"
                      placeholder="Ask me anything..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      className="flex-1 bg-transparent text-sm border-none outline-none text-[#1E1B4B] pl-1 placeholder-stone-400 font-medium"
                    />
                    <motion.button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9F7AEA] to-[#7137F1] text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:scale-100"
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                      <ArrowRight className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>

                  {/* Category cards yatra quick action grid */}
                  <div className="grid grid-cols-2 gap-3.5 mb-2">
                    {quickActions.map((action) => (
                      <motion.button
                        key={action.label}
                        onClick={() => handleQuickAction(action.query, action.label)}
                        className="bg-white border border-[#EBE9F5] p-4 rounded-[24px] text-left shadow-[0_4px_12px_rgba(0,0,0,0.015)] hover:border-[#8B5CF6]/40 hover:bg-[#FAF9FD] transition-all flex flex-col justify-between h-[125px]"
                        whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      >
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${action.color} flex items-center justify-center text-white shadow-sm`}>
                          <action.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="mt-2.5">
                          <h4 className="text-[#1E1B4B] font-extrabold text-[12.5px] leading-tight">
                            {action.label}
                          </h4>
                          <p className="text-[10px] text-stone-400 leading-snug mt-1 font-semibold">
                            {action.desc}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Infinite Orbit Rotating Hologram Sphere (Image 2 style) */}
                  <HologramSphere />
                </div>
              )}

              {/* TAB 2: Smart Chat Conversation View (Image 1 style) */}
              {activeTab === "chat" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#F6F5FA] scrollbar-none flex flex-col justify-start pb-20">
                  
                  {/* Qualification state progress banner */}
                  {qualState.step !== "idle" && qualState.step !== "completed" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-3 flex items-center justify-between text-xs shadow-sm mb-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
                        <span className="font-bold text-purple-800">Booking Concierge flow active</span>
                      </div>
                      <button
                        onClick={resetChatSession}
                        className="text-[10px] bg-purple-100 text-purple-700 font-extrabold px-2.5 py-1 rounded-full hover:bg-purple-200 transition-colors"
                      >
                        Reset Flow
                      </button>
                    </motion.div>
                  )}

                  {messages.map((msg) => {
                    // Recommendation Card Display Revamped
                    if (msg.isRecommendation && msg.recommendationData) {
                      const { roomName, price, image, features } = msg.recommendationData;
                      const waMsg = encodeURIComponent(
                        `Radhe Radhe! 🙏 Book ${roomName} for ${qualState.guests} guests, check-in ${qualState.checkIn}. Guest Name: ${qualState.name}, Mobile: ${qualState.phone}`
                      );
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-[28px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-[#ECEAF3] ml-1.5 mr-1.5"
                        >
                          <div className="relative h-36 overflow-hidden bg-stone-100">
                            <img loading="lazy" decoding="async" src={`/${image}`}
                              alt={roomName}
                              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute top-3 right-3 bg-[#7137F1] text-white text-[9px] font-black px-3 py-1 rounded-full shadow-md tracking-wider">
                              RECOMMENDED SUITE
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h4 className="text-[#1E1B4B] font-extrabold text-sm tracking-wide">{roomName}</h4>
                            <p className="text-[#7137F1] font-black text-[22px] mt-1">
                              ₹{price}
                              <span className="text-stone-400 text-xs font-normal ml-1">/night</span>
                            </p>
                            
                            <div className="flex flex-wrap gap-1.5 mt-3.5">
                              {features.map((f, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-[#F6F5FA] border border-[#EBE9F5] text-stone-600 px-3 py-1 rounded-full font-bold"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-2.5 mt-5">
                              <a
                                href="https://wa.me/917037794300"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Chat on WhatsApp"
                                className="flex-1 bg-[#25D366] hover:bg-[#20ba56] text-white text-xs font-bold py-3 rounded-2xl text-center flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp
                              </a>
                              <a
                                href={`/booking?room=${encodeURIComponent(roomName)}`}
                                className="flex-1 bg-gradient-to-tr from-[#9F7AEA] to-[#7137F1] hover:shadow-[0_4px_12px_rgba(113,55,241,0.25)] text-white text-xs font-bold py-3 rounded-2xl text-center shadow-md transition-all duration-300"
                              >
                                Book Now
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    const isUser = msg.role === "user";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "justify-start"}`}
                      >
                        {/* Avatar */}
                        {!isUser ? (
                          <GlowingAvatar />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#FAF9FD] border border-[#EBE9F5] flex items-center justify-center flex-shrink-0 shadow-sm">
                            <User className="w-4 h-4 text-purple-700" />
                          </div>
                        )}

                        <div className="max-w-[78%] flex flex-col">
                          {/* Message Bubble */}
                          <div
                            className={`px-4 py-3 text-[13.5px] leading-relaxed relative ${
                              isUser
                                ? "bg-gradient-to-r from-[#9F7AEA] to-[#7137F1] text-white rounded-[22px] rounded-br-[4px] font-semibold shadow-[0_5px_15px_rgba(113,55,241,0.18)]"
                                : "bg-white border border-[#EBE9F5] text-[#332A42] rounded-[22px] rounded-bl-[4px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.015)]"
                            }`}
                          >
                            {msg.content}
                            
                            {/* Inner time + status for user message */}
                            {isUser && (
                              <span className="text-[9px] opacity-75 mt-1.5 block text-right font-light leading-none">
                                {msg.timestamp === "Now" ? getFormattedTime() : msg.timestamp}
                                <DoubleCheckmarks />
                              </span>
                            )}
                          </div>

                          {/* Interactive icons bar for Assistant bubbles (Image 1 style) */}
                          {!isUser && msg.content && (
                            <div className="flex items-center gap-3.5 mt-1.5 px-2.5">
                              <button
                                onClick={() => handleCopy(msg.content, msg.id)}
                                title="Copy response"
                                className="text-stone-400 hover:text-[#7137F1] transition-colors"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleFeedback(msg.id, "up")}
                                className={`text-stone-400 hover:text-[#7137F1] transition-colors ${feedback[msg.id] === "up" ? "text-[#7137F1]" : ""}`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleFeedback(msg.id, "down")}
                                className={`text-stone-400 hover:text-[#7137F1] transition-colors ${feedback[msg.id] === "down" ? "text-rose-500" : ""}`}
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleSpeak(msg.content, msg.id)}
                                title="Speak text"
                                className={`text-stone-400 hover:text-[#7137F1] transition-colors ${speakingId === msg.id ? "text-emerald-500 animate-pulse" : ""}`}
                              >
                                {speakingId === msg.id ? (
                                  <VolumeX className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Volume2 className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <span className="text-[9px] text-stone-400 ml-auto font-bold leading-none mt-0.5">
                                {msg.timestamp === "Now" ? getFormattedTime() : msg.timestamp}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Typing Dots Indicator */}
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                      <GlowingAvatar />
                      <div className="bg-white px-4 py-3 rounded-[22px] rounded-bl-[4px] border border-[#EBE9F5] shadow-[0_2px_8px_rgba(0,0,0,0.015)] flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#7137F1] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-[#7137F1] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-[#7137F1] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* TAB 3: Explore Attractions View */}
              {activeTab === "explore" && (
                <div className="flex-1 p-5 flex flex-col justify-start overflow-y-auto scrollbar-none pb-20">
                  <div className="mb-4">
                    <h3 className="text-[#1E1B4B] font-extrabold text-[19px]">Explore Vrindavan</h3>
                    <p className="text-xs text-stone-400 font-semibold tracking-wide mt-1">
                      Divine places nearby Braj Nidhi Guesthouse
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {localAttractions.map((attraction, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white border border-[#EBE9F5] rounded-2xl p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-[#1E1B4B] font-extrabold text-[13.5px]">
                            {attraction.name}
                          </h4>
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-black border border-purple-100 flex items-center gap-1 flex-shrink-0">
                            <MapPin className="w-2.5 h-2.5" />
                            {attraction.distance}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-stone-500 mt-2 font-medium leading-relaxed">
                          {attraction.desc}
                        </p>
                        <button
                          onClick={() => handleQuickAction(attraction.query, attraction.name)}
                          className="mt-3.5 w-full bg-[#FAF9FD] hover:bg-[#7137F1]/5 border border-[#E8E6F0] hover:border-[#7137F1] text-[#7137F1] text-[11px] font-extrabold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Ask AI Guide Details
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Seeker Profile & Voucher Status View */}
              {activeTab === "profile" && (
                <div className="flex-1 p-5 flex flex-col justify-start overflow-y-auto scrollbar-none pb-20">
                  <div className="mb-4">
                    <h3 className="text-[#1E1B4B] font-extrabold text-[19px]">Your Yatra Profile</h3>
                    <p className="text-xs text-stone-400 font-semibold tracking-wide mt-1">
                      Braj Nidhi stay & voucher details
                    </p>
                  </div>

                  {qualState.step === "idle" && (
                    <div className="bg-white border border-[#EBE9F5] rounded-3xl p-6 text-center shadow-sm">
                      <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4 border border-purple-100">
                        <Bot className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="text-[#1E1B4B] font-extrabold text-[14.5px]">No reservation started yet</h4>
                      <p className="text-[11.5px] text-stone-500 mt-2 leading-relaxed font-semibold">
                        Ready to experience high-end spiritual comfort? Start a smart room booking flow now.
                      </p>
                      <button
                        onClick={() => handleQuickAction("I want to book a room", "Divine Stays")}
                        className="mt-5 w-full bg-gradient-to-tr from-[#9F7AEA] to-[#7137F1] text-white text-xs font-bold py-3 rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Start Reservation
                      </button>
                    </div>
                  )}

                  {qualState.step !== "idle" && qualState.step !== "completed" && (
                    <div className="bg-white border border-[#EBE9F5] rounded-3xl p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-[#1E1B4B] font-extrabold text-sm">Yatra Booking In Progress</h4>
                        <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Please complete the chat prompts to finalize your voucher</p>
                      </div>

                      {/* Stepper details */}
                      <div className="space-y-3.5 pt-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${qualState.name ? "bg-emerald-500 text-white" : "bg-purple-100 text-purple-600 font-bold text-xs"}`}>
                            {qualState.name ? <Check className="w-3.5 h-3.5" /> : "1"}
                          </div>
                          <span className="text-[12.5px] font-bold text-stone-600">
                            Name: {qualState.name || <span className="text-purple-400 font-medium italic">Waiting for input...</span>}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${qualState.guests ? "bg-emerald-500 text-white" : "bg-purple-100 text-purple-600 font-bold text-xs"}`}>
                            {qualState.guests ? <Check className="w-3.5 h-3.5" /> : "2"}
                          </div>
                          <span className="text-[12.5px] font-bold text-stone-600">
                            Guests: {qualState.guests || <span className="text-purple-400 font-medium italic">Waiting for input...</span>}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${qualState.checkIn ? "bg-emerald-500 text-white" : "bg-purple-100 text-purple-600 font-bold text-xs"}`}>
                            {qualState.checkIn ? <Check className="w-3.5 h-3.5" /> : "3"}
                          </div>
                          <span className="text-[12.5px] font-bold text-stone-600">
                            Date: {qualState.checkIn || <span className="text-purple-400 font-medium italic">Waiting for input...</span>}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${qualState.phone ? "bg-emerald-500 text-white" : "bg-purple-100 text-purple-600 font-bold text-xs"}`}>
                            {qualState.phone ? <Check className="w-3.5 h-3.5" /> : "4"}
                          </div>
                          <span className="text-[12.5px] font-bold text-stone-600">
                            Contact: {qualState.phone || <span className="text-purple-400 font-medium italic">Waiting for input...</span>}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab("chat")}
                        className="mt-4 w-full bg-gradient-to-tr from-[#9F7AEA] to-[#7137F1] text-white text-xs font-bold py-3 rounded-2xl shadow-sm hover:scale-[1.02] transition-all"
                      >
                        Continue Concierge Chat
                      </button>
                    </div>
                  )}

                  {qualState.step === "completed" && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative overflow-hidden bg-gradient-to-tr from-[#FCD34D]/25 to-[#F59E0B]/5 rounded-3xl border border-amber-300 p-5 shadow-md flex flex-col gap-4.5 bg-white"
                    >
                      {/* Ticket Header */}
                      <div className="flex justify-between items-start border-b border-amber-200/60 pb-3">
                        <div>
                          <span className="text-[8px] bg-amber-500 text-white font-extrabold px-2.5 py-0.5 rounded-full tracking-widest uppercase">OFFICIAL VOUCHER</span>
                          <h4 className="text-[#1E1B4B] font-extrabold text-[14.5px] mt-1">Braj Nidhi Vrindavan</h4>
                        </div>
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      </div>

                      {/* Ticket Fields Grid */}
                      <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 pt-1">
                        <div>
                          <span className="text-[9px] text-stone-400 uppercase font-black tracking-wide">DEVOTEE</span>
                          <p className="text-xs font-bold text-[#1E1B4B]">{qualState.name}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-stone-400 uppercase font-black tracking-wide">PILGRIMS</span>
                          <p className="text-xs font-bold text-[#1E1B4B]">{qualState.guests}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-stone-400 uppercase font-black tracking-wide">YATRA DATE</span>
                          <p className="text-xs font-bold text-[#1E1B4B]">{qualState.checkIn}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-stone-400 uppercase font-black tracking-wide">CONTACT</span>
                          <p className="text-xs font-bold text-[#1E1B4B]">{qualState.phone}</p>
                        </div>
                      </div>

                      {/* Barcode representation */}
                      <div className="bg-white border border-stone-100 p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 mt-2.5">
                        <div className="flex items-center gap-0.5 justify-center w-full opacity-75">
                          {[2,1,3,1,4,1,2,3,1,2,4,1,2,1,3,1,4,1,2,3,1,2,4,1,2,1,3,1,2].map((w, idx) => (
                            <div key={idx} className="h-6 bg-stone-800" style={{ width: `${w}px` }} />
                          ))}
                        </div>
                        <span className="text-[8px] text-stone-400 font-extrabold tracking-widest font-mono uppercase">BN-{qualState.name.substring(0,3)}-YATRA</span>
                      </div>

                      <a
                        href="tel:+917037794300"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 rounded-xl text-center shadow-md transition-all block mt-2"
                      >
                        Call VIP Desk Support
                      </a>
                    </motion.div>
                  )}
                </div>
              )}

            </div>

            {/* ──────── TAB SELECTION NAVIGATION BAR (Image 2 style curved tab selection) ──────── */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#ECEAF3] py-2 px-5 flex justify-between items-center rounded-b-[32px] z-50">
              {/* Home Tab */}
              <button
                onClick={() => setActiveTab("home")}
                className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === "home" ? "text-[#7137F1] scale-105" : "text-stone-400 hover:text-stone-600"}`}
              >
                <Home className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[9px] font-bold">Home</span>
              </button>

              {/* Active Conversation Tab */}
              <button
                onClick={() => setActiveTab("chat")}
                className={`relative flex flex-col items-center justify-center gap-1 transition-all ${activeTab === "chat" ? "text-[#7137F1] scale-105" : "text-stone-400 hover:text-stone-600"}`}
              >
                <MessageSquare className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[9px] font-bold">Chat</span>
                {messages.length > 1 && activeTab !== "chat" && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full border border-white" />
                )}
              </button>

              {/* Large Elevated Spark AI/Booking Tab (Image 2 Center style) */}
              <button
                onClick={() => handleQuickAction("I want to book a room", "Divine Stays")}
                title="Direct Reservation Spark"
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#9F7AEA] to-[#7137F1] text-white -mt-6 flex items-center justify-center shadow-[0_6px_20px_rgba(113,55,241,0.35)] hover:scale-110 active:scale-95 transition-all"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </button>

              {/* Explore Attractions Tab */}
              <button
                onClick={() => setActiveTab("explore")}
                className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === "explore" ? "text-[#7137F1] scale-105" : "text-stone-400 hover:text-stone-600"}`}
              >
                <Compass className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[9px] font-bold">Explore</span>
              </button>

              {/* User Profile / Status Voucher Tab */}
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === "profile" ? "text-[#7137F1] scale-105" : "text-stone-400 hover:text-stone-600"}`}
              >
                <User className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[9px] font-bold">Profile</span>
              </button>
            </div>

            {/* ──────── Chat Unified Capsule Pill Input Bar (Image 1 Style) ──────── */}
            {activeTab === "chat" && (
              <div className="absolute bottom-[60px] left-0 right-0 px-4 py-3 bg-gradient-to-t from-[#F6F5FA] via-[#F6F5FA]/90 to-transparent z-40">
                <div className="bg-white border border-[#EBE9F5] rounded-full p-1 flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
                  {/* Left attachment Plus action */}
                  <motion.button
                    onClick={resetChatSession}
                    title="Reset chat"
                    className="w-9 h-9 rounded-full bg-white border border-[#EBE9F5] flex items-center justify-center hover:bg-[#F3F2FA] text-stone-500 shadow-sm flex-shrink-0"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                  </motion.button>
                  
                  {/* Text Input */}
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-transparent text-[13px] outline-none text-[#1E1B4B] pl-1.5 placeholder-[#9E9AA8] font-semibold"
                  />

                  {/* Right interactive Dynamic Send / Waveform button */}
                  <motion.button
                    onClick={handleSend}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9F7AEA] to-[#7137F1] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  >
                    {input.trim() ? (
                      <Send className="w-4 h-4 text-white fill-white ml-0.5" />
                    ) : (
                      <WaveformIcon />
                    )}
                  </motion.button>
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}