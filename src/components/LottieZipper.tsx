"use client";
import Lottie from "lottie-react";
import { useEffect, useRef } from "react";
import animationData from "../../public/lotties/zipper.json";

const LottieScrollClassic = () => {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    let animationFrameId = 0;

    const handleScroll = () => {
      // Cancela o frame anterior se um novo scroll acontecer antes do repaint
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const lottieInstance = lottieRef.current;
        if (!lottieInstance) return;

        // Descubra o número total de frames da sua animação
        const totalFrames = lottieInstance.getDuration(true);

        // 1. Calcula a porcentagem de scroll (mesma lógica de antes)
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const maxScrollY = docHeight - windowHeight;

        if (maxScrollY === 0) return;

        const scrollPercentage = scrollY / maxScrollY;

        console.log(scrollPercentage);

        // 2. Calcula o frame correspondente à porcentagem de scroll
        const frameToGo = totalFrames * scrollPercentage + 21;

        // 3. Define o frame da animação
        lottieInstance.goToAndStop(frameToGo, true);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div style={{ height: "450vh" }}>
      <div style={{ position: "sticky", top: 0 }}>
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          autoplay={false}
          loop={false}
          onDOMLoaded={() => {
            if (lottieRef.current) {
              lottieRef.current.goToAndStop(21, true);
            }
          }}
        />
      </div>
    </div>
  );
};

export default LottieScrollClassic;
