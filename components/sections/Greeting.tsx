"use client";

import { motion } from "framer-motion";

import { config } from "@/invitation.config";

export function Greeting() {
  return (
    <section className="flex flex-col items-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px 0px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        {config.greeting.title && (
          <h2 className="text-secondary font-serif text-2xl font-light tracking-wide">
            {config.greeting.title}
          </h2>
        )}
        <p className="text-text mt-8 leading-loose whitespace-pre-line">
          {config.greeting.message}
        </p>
      </motion.div>
    </section>
  );
}
