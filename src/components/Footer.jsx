import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-stone-600">
        © {new Date().getFullYear()} Mana Edla Pandalu. All rights reserved.
      </div>
    </footer>
  );
}

