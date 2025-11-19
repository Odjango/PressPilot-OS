export interface CopySchema {
  id: string;
  hero: {
    title: string;
    subtitle: string;
    primaryCta: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
  sections: Record<
    string,
    {
      heading: string;
      body?: string;
      items?: Array<{ title: string; description?: string; icon?: string }>;
    }
  >;
  contact: {
    headline: string;
    body: string;
    primaryCta: { label: string; href: string };
  };
}

