import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../hooks/use-outside-click";
import { useCart } from "../context/CartContext";
import './ExpandableCard.css';

export interface ProductCardData {
  id: string;
  badge: string;
  title: string;
  description: string;
  price: string;
  src: string;
  specs: React.ReactNode;
}

export function ExpandableCardGrid({ products }: { products: ProductCardData[] }) {
  const [active, setActive] = useState<ProductCardData | null>(null);
  const { addToCart } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ec-overlay"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="ec-modal-container">
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="ec-modal-card"
            >
              <motion.button
                key={`button-${active.title}-${id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="ec-close-btn"
                onClick={() => setActive(null)}
              >
                <CloseIcon />
              </motion.button>
              
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <img
                  src={active.src}
                  alt={active.title}
                  className="ec-modal-image"
                />
              </motion.div>

              <div className="ec-modal-content">
                <div className="ec-modal-header">
                  <div>
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-heading ec-modal-title"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="ec-modal-price text-accent"
                    >
                      {active.price}
                    </motion.p>
                  </div>

                  <motion.button
                    layoutId={`button-${active.title}-${id}`}
                    className="btn-solid ec-modal-buy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        id: active.id,
                        title: active.title,
                        price: active.price,
                        src: active.src
                      });
                      setActive(null); // Optional: close modal on add to cart, or we could just show a toast
                    }}
                  >
                    ADD TO CART
                  </motion.button>
                </div>
                <div className="ec-modal-body">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ec-modal-specs"
                  >
                    {React.isValidElement(active.specs) ? (
                      active.specs
                    ) : Array.isArray(active.specs) ? (
                      active.specs.map((spec: any, idx: number) => (
                        <div key={idx} className="spec-row">
                          <span className="spec-label">{spec.label}</span>
                          <span className="spec-value">{spec.value}</span>
                        </div>
                      ))
                    ) : typeof active.specs === 'object' && active.specs !== null ? (
                      Object.entries(active.specs).map(([label, value]: any, idx: number) => (
                        <div key={idx} className="spec-row">
                          <span className="spec-label">{label}</span>
                          <span className="spec-value">{String(value)}</span>
                        </div>
                      ))
                    ) : null}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      
      <div className="products-grid">
        {products.map((card) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={`card-${card.title}-${id}`}
            onClick={() => setActive(card)}
            className="product-card cursor-pointer"
          >
            <div className="product-badge">{card.badge}</div>
            <motion.div layoutId={`image-${card.title}-${id}`}>
              <img src={card.src} alt={card.title} className="product-img" />
            </motion.div>
            <div className="product-details">
              <motion.h3
                layoutId={`title-${card.title}-${id}`}
                className="font-heading"
              >
                {card.title}
              </motion.h3>
              <motion.p
                layoutId={`description-${card.description}-${id}`}
                className="product-price text-accent"
                style={{ marginBottom: '20px' }}
              >
                {card.price}
              </motion.p>
              
              {/* Fake button layoutId to trigger layout animation smoothly */}
              <motion.div layoutId={`button-${card.title}-${id}`} className="ec-mock-btn">
                <div className="arrow-btn" style={{ width: '100%' }}>
                  <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                  </svg>
                  <span className="text">VIEW SPECS</span>
                  <span className="circle" />
                  <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                  </svg>
                </div>
              </motion.div>
              
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
