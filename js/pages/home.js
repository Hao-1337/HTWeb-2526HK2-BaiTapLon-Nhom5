import { cloneTemplateContent } from "../render.js";

export async function initHome() {
  const root = document.querySelector("[data-page-content]");
  root.replaceChildren(cloneTemplateContent("home-page-template"));

  const hero = root.querySelector(".hero");
  const seeMore = root.querySelector(".hero-see-more");
  if (!seeMore || !hero) return;

  const isHeroFullscreen = () => {
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const heroHeight = hero.getBoundingClientRect().height;
    return heroHeight >= viewportHeight * 0.98;
  };

  const toggleSeeMore = () => {
    const shouldHide = window.scrollY > 24 || !isHeroFullscreen();
    seeMore.classList.toggle("is-hidden", shouldHide);
  };

  toggleSeeMore();
  window.addEventListener("scroll", toggleSeeMore, { passive: true });
  window.addEventListener("resize", toggleSeeMore, { passive: true });
}
