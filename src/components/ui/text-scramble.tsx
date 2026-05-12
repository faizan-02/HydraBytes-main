"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

interface TextScrambleProps {
  text: string;
  className?: string;
  trigger?: boolean;
  speed?: number;
  characterSet?: string;
}

export function TextScramble({
  text,
  className = "",
  trigger,
  speed = 30,
  characterSet = DEFAULT_CHARS,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);
  const prevTrigger = useRef(trigger);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const scramble = useCallback(() => {
    frameRef.current = 0;
    const duration = text.length * 3;
    stop();

    intervalRef.current = setInterval(() => {
      frameRef.current++;
      const progress = frameRef.current / duration;
      const revealedLength = Math.floor(progress * text.length);

      setDisplayText(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealedLength) return text[i];
            return characterSet[Math.floor(Math.random() * characterSet.length)];
          })
          .join("")
      );

      if (frameRef.current >= duration) {
        stop();
        setDisplayText(text);
      }
    }, speed);
  }, [text, speed, characterSet, stop]);

  useEffect(() => {
    if (trigger && !prevTrigger.current) {
      scramble();
    } else if (!trigger && prevTrigger.current) {
      stop();
      setDisplayText(text);
    }
    prevTrigger.current = trigger;
  }, [trigger, scramble, stop, text]);

  const handleMouseEnter = () => {
    if (trigger === undefined) scramble();
  };

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  useEffect(() => stop, [stop]);

  return (
    <span className={className} onMouseEnter={handleMouseEnter}>
      {displayText}
    </span>
  );
}
