import React, { useState, useEffect } from 'react';

interface TypeWriterProps {
  texts: string[];
  delay: number;
  pauseBetweenTexts: number;
}

const TypeWriter: React.FC<TypeWriterProps> = ({ texts, delay, pauseBetweenTexts }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTyping && !isDeleting) {
        const targetText = texts[currentTextIndex];
        if (currentText.length < targetText.length) {
          setCurrentText(targetText.substring(0, currentText.length + 1));
        } else {
          setIsTyping(false);
          setTimeout(() => setIsDeleting(true), pauseBetweenTexts);
        }
      } else if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentText.substring(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((currentTextIndex + 1) % texts.length);
          setIsTyping(true);
        }
      }
    }, isDeleting ? delay / 2 : delay);

    return () => clearTimeout(timer);
  }, [currentText, currentTextIndex, delay, isDeleting, isTyping, pauseBetweenTexts, texts]);

  return (
    <span>
      {currentText}
      <span className="animate-blink">|</span>
    </span>
  );
};

export default TypeWriter;