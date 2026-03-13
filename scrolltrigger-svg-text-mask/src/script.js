gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Initial state
gsap.set('.ui-layer', { y: 0 });

// Parallax Timeline
gsap.timeline({
  scrollTrigger: {
    trigger: '.scrollDist',
    start: '0 0',
    end: '100% 100%',
    scrub: 1
  }
})
  .fromTo('.mountBg', { y: 0 }, { y: -100 }, 0)
  .fromTo('.mountMg', { y: 0 }, { y: -250 }, 0)
  .fromTo('.mountFg', { y: 0 }, { y: -400 }, 0)
  .fromTo('.maskText', { scale: 1 }, { scale: 15, transformOrigin: 'center center', ease: 'power1.in' }, 0) // Zoom through the text
  .fromTo('.overlayText', { opacity: 1 }, { opacity: 0 }, 0)
  .fromTo('.ui-layer', { y: 0, opacity: 0 }, { y: -600, opacity: 1 }, 0.5); // Bring up the UI cards

// Button Interaction
document.querySelector('.btn-neon').addEventListener('mouseenter', () => {
  gsap.to('.btn-neon', { boxShadow: '0 0 30px rgba(0, 243, 255, 0.6)', duration: 0.3 });
});

document.querySelector('.btn-neon').addEventListener('mouseleave', () => {
  gsap.to('.btn-neon', { boxShadow: '0 0 10px rgba(0, 243, 255, 0.1)', duration: 0.3 });
});