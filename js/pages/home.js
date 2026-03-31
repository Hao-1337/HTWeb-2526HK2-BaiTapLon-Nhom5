import { cloneTemplateContent } from "../render.js";

export async function initHome() {
  const root = document.querySelector("[data-page-content]");
  root.replaceChildren(cloneTemplateContent("home-page-template"));
}
