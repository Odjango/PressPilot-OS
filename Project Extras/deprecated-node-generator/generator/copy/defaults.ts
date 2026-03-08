
export const RestaurantCopy = {
    home: {
        headline: "Authentic Flavors, Unforgettable Moments.",
        subheadline: "Experience the best local dining in town.",
        cta: "Book a Table"
    },
    about: {
        title: "Our Story",
        content: "Founded with a passion for culinary excellence, we bring traditional recipes to life with a modern twist. Our ingredients are locally sourced, identifying the freshest flavors for every season."
    },
    contact: {
        title: "Visit Us",
        schedule: "Open Daily: 11am - 10pm"
    },
    menu: {
        title: "Our Menu",
        sub: "Handcrafted dishes made with love."
    }
};

export const SmartCopyRegistry: Record<string, any> = {
    restaurant: RestaurantCopy,
    // Add others later
};

export function getSmartCopy(industry: string) {
    return SmartCopyRegistry[industry] || {};
}
