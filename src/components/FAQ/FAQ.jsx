import React, { useState, useRef, useCallback } from 'react';
import faqData from '../../data/faqData';

function FAQItem({ item, isActive, onClick }) {
  const answerRef = useRef(null);

  return (
    <div className={`faq-item${isActive ? ' active' : ''}`}>
      <button
        className="faq-question"
        aria-expanded={isActive}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <span>{item.question}</span>
        <span className="faq-icon">+</span>
      </button>
      <div
        className="faq-answer"
        ref={answerRef}
        style={{
          maxHeight: isActive ? `${answerRef.current?.scrollHeight || 300}px` : '0',
        }}
      >
        <p>{item.answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleClick = useCallback((index) => {
    setActiveIndex((prev) => (prev === index ? -1 : index));
  }, []);

  return (
    <section className="section faq-section" id="faq">
      <div className="container">
        <h2 className="section-title gradient-text shimmer">❓ Frequently Asked Questions</h2>
        <p className="section-subtitle">Everything you need to know about our services</p>
        <div className="faq-accordion">
          {faqData.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              isActive={activeIndex === i}
              onClick={() => handleClick(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
