export const CATEGORY_ITEMS = {
  headphones: [
    {
      id: "xx99-mark-ii",
      feature: "new product",
      product: "XX99 Mark II Headphones",
      detail:
        "The new XX99 Mark II headphones is the pinnacle of pristine audio. It redefines your premium headphone experience by reproducing the balanced depth and precision of studio-quality sound.",
      src: "category-headphones/desktop/image-xx99-mark-two.jpg"
    },
    {
      id: "xx99-mark-i",
      feature: "",
      product: "XX99 Mark I Headphones",
      detail:
        "As the gold standard for headphones, the classic XX99 Mark I offers detailed and accurate audio reproduction for audiophiles, mixing engineers, and music aficionados alike in studios and on the go.",
      src: "category-headphones/desktop/image-xx99-mark-one.jpg"
    },
    {
      id: "xx59",
      feature: "",
      product: "XX59 Headphones",
      detail:
        "Enjoy your audio almost anywhere and customize it to your specific tastes with the XX59 headphones. The stylish yet durable versatile wireless headset is a brilliant companion at home or on the move.",
      src: "category-headphones/desktop/image-xx59.jpg"
    },
    {
      id: "airpulse-h1",
      feature: "demo product",
      product: "AirPulse H1 Headphones",
      detail:
        "A demo wireless model with balanced sound, fast charging, and lightweight comfort, added for richer storefront and cart testing.",
      src: "category-headphones/desktop/image-airpulse-h1.jpg"
    }
  ],
  speakers: [
    {
      id: "zx9",
      feature: "new product",
      product: "ZX9 Speaker",
      detail:
        "Upgrade your sound system with the all new ZX9 active speaker. It is a bookshelf speaker system that offers truly wireless connectivity creating new possibilities for more pleasing and practical audio setups.",
      src: "category-speakers/desktop/image-zx9.jpg"
    },
    {
      id: "zx7",
      feature: "",
      product: "ZX7 Speaker",
      detail:
        "Stream high quality sound wirelessly with minimal to no loss. The ZX7 speaker uses high-end audiophile components that represents the top of the line powered speakers for home or studio use.",
      src: "category-speakers/desktop/image-zx7.jpg"
    },
    {
      id: "echoframe-s2",
      feature: "demo product",
      product: "EchoFrame S2 Speaker",
      detail:
        "A compact smart speaker concept with clear mids, practical connectivity, and realistic demo copy for browsing and checkout flows.",
      src: "category-speakers/desktop/image-echoframe-s2.jpg"
    }
  ],
  earphones: [
    {
      id: "yx1",
      feature: "new product",
      product: "YX1 Wireless Earphones",
      detail:
        "Tailor your listening experience with bespoke dynamic drivers from the new YX1 Wireless Earphones. Enjoy incredible high-fidelity sound even in noisy environments with its active noise cancellation feature.",
      src: "category-earphones/desktop/image-yx1-earphones.jpg"
    },
    {
      id: "aerobuds-lite",
      feature: "demo product",
      product: "AeroBuds Lite",
      detail:
        "Lightweight true-wireless earbuds with stable fit, dependable battery life, and clear calls for day-to-day listening demos.",
      src: "category-earphones/desktop/image-aerobuds-lite.jpg"
    }
  ]
};

export async function loadProducts() {
  const response = await fetch("/data/product-data.json");
  if (!response.ok) throw new Error("Failed to load product data");
  return response.json();
}

export function getProductById(products, id) {
  return products.find((product) => product.id === id);
}
