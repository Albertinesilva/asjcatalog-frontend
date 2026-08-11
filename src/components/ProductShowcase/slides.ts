import techMain from "@/assets/showcase/tech-main.jpg";
import techDetail from "@/assets/showcase/tech-detail.jpg";
import booksMain from "@/assets/showcase/books-main.jpg";
import booksDetail from "@/assets/showcase/books-detail.jpg";
import autoMain from "@/assets/showcase/auto-main.jpg";
import autoDetail from "@/assets/showcase/auto-detail.jpg";
import homeMain from "@/assets/showcase/home-main.jpg";
import homeDetail from "@/assets/showcase/home-detail.jpg";
import fashionMain from "@/assets/showcase/fashion-main.jpg";
import fashionDetail from "@/assets/showcase/fashion-detail.jpg";
import sportsMain from "@/assets/showcase/sports-main.jpg";
import sportsDetail from "@/assets/showcase/sports-detail.jpg";

/**
 * Showcase slides — data only.
 *
 * Assets are plain ES6 imports so real product photography can be swapped
 * later without touching the carousel component architecture.
 */
export type ShowcaseSlide = {
  /** i18n key suffix under `home:showcase.categories.*`. */
  key: string;
  main: string;
  detail: string;
};

export const showcaseSlides: ShowcaseSlide[] = [
  { key: "technology", main: techMain, detail: techDetail },
  { key: "books", main: booksMain, detail: booksDetail },
  { key: "automotive", main: autoMain, detail: autoDetail },
  { key: "home", main: homeMain, detail: homeDetail },
  { key: "fashion", main: fashionMain, detail: fashionDetail },
  { key: "sports", main: sportsMain, detail: sportsDetail },
];