import { motion } from "motion/react";

const Header = () => {
  return (
    <header className="relative w-full h-[400px] overflow-hidden text-white shadow-lg">
      <img
        src="/assets/background.webp"
        alt="Header background"
        width="1440"
        height="400"
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-linear-to-r from-orange-100/50 to-orange-300/80" />

      <div className="relative container mx-auto px-4 py-6 z-10">
        <div className="flex items-center justify-center space-x-4 md:space-x-12 mt-10">
          <motion.div
            className="w-11 h-11 sm:w-10 sm:h-10 md:w-16 md:h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-lg"
            animate={{ y: ["-10px", "10px", "-10px"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src="/assets/bull1.webp"
              alt="Bull icon left"
              loading="eager"
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-full"
            />
          </motion.div>

          <div className="text-center">
            <motion.h1
              className="text-2xl sm:text-3xl md:text-7xl font-bold tracking-wide bg-linear-to-r from-amber-900 via-amber-600 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]"
              style={{ backgroundSize: "220% 220%" }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                textShadow: [
                  "0 0 6px rgba(251,191,36,0.30), 0 0 14px rgba(251,191,36,0.18)",
                  "0 0 10px rgba(251,191,36,0.50), 0 0 24px rgba(251,191,36,0.30)",
                  "0 0 6px rgba(251,191,36,0.30), 0 0 14px rgba(251,191,36,0.18)",
                ],
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              Mana Edla Pandalu
            </motion.h1>
          </div>

          <motion.div
            className="w-11 h-11 sm:w-10 sm:h-10 md:w-16 md:h-16 bg-amber-800 rounded-full flex items-center justify-center shadow-lg"
            animate={{ y: ["-10px", "10px", "-10px"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src="/assets/bull2center.webp"
              alt="Bull icon right"
              loading="eager"
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-full"
            />
          </motion.div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-amber-700 font-semibold text-sm md:text-xl mt-1 bg-amber-200 px-4 py-2 rounded-full inline-block shadow-lg">
            ఎడ్ల పందాలు మన పల్లె గౌరవం, మన తెలుగు శౌర్యం
          </p>

          <div className="mt-6 flex justify-center gap-6 items-center">
            <div className="border-b-4 rounded-full border-amber-500 w-32" />
            <div className="w-11 h-11 sm:w-10 sm:h-10 md:w-16 md:h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
              <img
                src="/assets/logo.webp"
                alt="Mana Edla Pandalu logo"
                loading="eager"
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-full"
              />
            </div>
            <div className="border-b-4 rounded-full border-amber-500 w-32" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
