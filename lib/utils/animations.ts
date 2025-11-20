/**
 * Animation utilities using GSAP and CSS animations
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Animate text reveal effect using GSAP
 * 
 * @param element Element to animate
 * @param delay Delay before animation starts (in seconds)
 */
export function animateTextReveal(
  element: HTMLElement,
  delay = 0
): gsap.core.Tween {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay,
      ease: 'power2.out',
    }
  );
}

/**
 * Animate text typing effect (character by character)
 * 
 * @param element Element containing text to animate
 * @param text Text to type
 * @param speed Typing speed in seconds per character
 */
export function animateTypingText(
  element: HTMLElement,
  text: string,
  speed = 0.05
): gsap.core.Timeline {
  const chars = text.split('');
  const timeline = gsap.timeline();
  
  element.textContent = '';
  
  chars.forEach((char, index) => {
    timeline.to(
      {},
      {
        duration: speed,
        onComplete: () => {
          element.textContent += char;
        },
      },
      index * speed
    );
  });
  
  return timeline;
}

/**
 * Animate fade in effect
 * 
 * @param element Element to fade in
 * @param duration Animation duration (in seconds)
 */
export function animateFadeIn(
  element: HTMLElement,
  duration = 0.3
): gsap.core.Tween {
  return gsap.fromTo(
    element,
    { opacity: 0 },
    {
      opacity: 1,
      duration,
      ease: 'power2.out',
    }
  );
}

/**
 * Animate fade out effect
 * 
 * @param element Element to fade out
 * @param duration Animation duration (in seconds)
 */
export function animateFadeOut(
  element: HTMLElement,
  duration = 0.3
): gsap.core.Tween {
  return gsap.to(element, {
    opacity: 0,
    duration,
    ease: 'power2.in',
  });
}

/**
 * Create scroll-triggered animation
 * 
 * @param element Element to animate
 * @param animation Animation configuration
 */
export function createScrollTriggerAnimation(
  element: HTMLElement,
  animation: {
    from?: gsap.TweenVars;
    to: gsap.TweenVars;
    start?: string;
    end?: string;
  }
): ScrollTrigger {
  return gsap.fromTo(
    element,
    animation.from || {},
    {
      ...animation.to,
      scrollTrigger: {
        trigger: element,
        start: animation.start || 'top 80%',
        end: animation.end || 'top 20%',
        toggleActions: 'play none none reverse',
      },
    }
  );
}

/**
 * Animate number counting effect
 * 
 * @param element Element containing number
 * @param targetValue Target number to count to
 * @param duration Animation duration (in seconds)
 */
export function animateNumberCount(
  element: HTMLElement,
  targetValue: number,
  duration = 1
): gsap.core.Tween {
  const obj = { value: 0 };
  
  return gsap.to(obj, {
    value: targetValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toString();
    },
  });
}

