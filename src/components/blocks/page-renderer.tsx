import type { BlockType } from "@/lib/cms/blocks";

interface RawBlock {
  id: string;
  type: string;
  data: unknown;
}

interface HeroData {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  imageUrl: string;
  align: "left" | "center";
}

interface RichTextData {
  html: string;
}

interface CardItem {
  title: string;
  description: string;
  icon: string;
}

interface CardsData {
  title: string;
  columns: 2 | 3 | 4;
  items: CardItem[];
}

interface ImageData {
  imageUrl: string;
  altText: string;
  caption: string;
  width: "contain" | "wide" | "full";
}

interface CtaData {
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonUrl: string;
}

interface PersonaItem {
  role: string;
  benefit: string;
  description: string;
  imageUrl: string;
  bullets: string[];
}

interface PersonasData {
  title: string;
  items: PersonaItem[];
}

function HeroBlock({ data }: { data: HeroData }) {
  const align = data.align === "left" ? "text-left items-start" : "text-center items-center";
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {data.imageUrl ? (
        <div className="absolute inset-0 -z-10">
          <img src={data.imageUrl} alt="" className="w-full h-full object-cover opacity-10" />
        </div>
      ) : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-50 via-white to-orange-50" />
      <div className={`max-w-5xl mx-auto px-6 flex flex-col gap-6 ${align}`}>
        {data.title ? (
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent leading-tight">
            {data.title}
          </h1>
        ) : null}
        {data.subtitle ? (
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl leading-relaxed">{data.subtitle}</p>
        ) : null}
        {data.ctaLabel && data.ctaUrl ? (
          <a
            href={data.ctaUrl}
            className="inline-block mt-4 px-8 py-4 rounded-full text-white font-semibold bg-gradient-to-r from-pink-600 to-orange-500 shadow-lg hover:shadow-xl transition"
          >
            {data.ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}

function RichTextBlock({ data }: { data: RichTextData }) {
  if (!data.html) return null;
  return (
    <section className="py-12 md:py-16">
      <div
        className="max-w-3xl mx-auto px-6 prose prose-pink prose-headings:font-bold prose-headings:bg-gradient-to-r prose-headings:from-pink-600 prose-headings:to-orange-500 prose-headings:bg-clip-text prose-headings:text-transparent"
        dangerouslySetInnerHTML={{ __html: data.html }}
      />
    </section>
  );
}

function CardsBlock({ data }: { data: CardsData }) {
  const colsClass = data.columns === 2 ? "md:grid-cols-2" : data.columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        {data.title ? (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
            {data.title}
          </h2>
        ) : null}
        <div className={`grid grid-cols-1 gap-6 ${colsClass}`}>
          {data.items.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white"
            >
              {item.icon ? <div className="text-3xl mb-3">{item.icon}</div> : null}
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImageBlock({ data }: { data: ImageData }) {
  if (!data.imageUrl) return null;
  const widthClass =
    data.width === "full" ? "w-full" : data.width === "wide" ? "max-w-6xl mx-auto" : "max-w-3xl mx-auto";
  return (
    <section className="py-12">
      <figure className={`${widthClass} px-6`}>
        <img src={data.imageUrl} alt={data.altText} className="w-full h-auto rounded-2xl shadow-lg" />
        {data.caption ? (
          <figcaption className="text-center text-sm text-gray-500 mt-3">{data.caption}</figcaption>
        ) : null}
      </figure>
    </section>
  );
}

function CtaBlock({ data }: { data: CtaData }) {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6 text-center rounded-3xl bg-gradient-to-br from-pink-600 to-orange-500 p-12 md:p-16 text-white shadow-2xl">
        {data.title ? <h2 className="text-3xl md:text-4xl font-bold mb-4">{data.title}</h2> : null}
        {data.subtitle ? <p className="text-lg md:text-xl opacity-90 mb-8">{data.subtitle}</p> : null}
        {data.buttonLabel && data.buttonUrl ? (
          <a
            href={data.buttonUrl}
            className="inline-block px-8 py-4 rounded-full bg-white text-pink-600 font-semibold shadow-lg hover:scale-105 transition"
          >
            {data.buttonLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}

function PersonasBlock({ data }: { data: PersonasData }) {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        {data.title ? (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
            {data.title}
          </h2>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.items.map((item, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.role} className="w-full h-48 object-cover" />
              ) : null}
              <div className="p-6">
                <div className="text-sm uppercase tracking-wider text-pink-600 font-semibold mb-1">{item.role}</div>
                <div className="text-lg font-bold text-gray-900 mb-2">{item.benefit}</div>
                <p className="text-gray-600 mb-4">{item.description}</p>
                {item.bullets.length > 0 ? (
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    {item.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-pink-600 font-bold">·</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PageRenderer({ blocks }: { blocks: RawBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        const type = block.type as BlockType;
        const data = block.data as Record<string, unknown>;
        switch (type) {
          case "hero":
            return <HeroBlock key={block.id} data={data as unknown as HeroData} />;
          case "richtext":
            return <RichTextBlock key={block.id} data={data as unknown as RichTextData} />;
          case "cards":
            return <CardsBlock key={block.id} data={data as unknown as CardsData} />;
          case "image":
            return <ImageBlock key={block.id} data={data as unknown as ImageData} />;
          case "cta":
            return <CtaBlock key={block.id} data={data as unknown as CtaData} />;
          case "personas":
            return <PersonasBlock key={block.id} data={data as unknown as PersonasData} />;
          default:
            return null;
        }
      })}
    </>
  );
}
