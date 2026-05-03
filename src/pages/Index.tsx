import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import appleStyle1 from "@/assets/apple_style1_warm_realistic.jpg";
import oilStyle1 from "@/assets/oil_style1_warm_realistic.jpg";

type ReelItem = {
  id: string;
  keyword: string;
  title: string;
  hook: string;
  body: string;
  summary: string[];
  imageStyle?: string;
  image?: string;
  imagePrompt?: string;
};

const initialReels: ReelItem[] = [
  {
    id: "apple-price",
    keyword: "장바구니 물가 · 사과값 폭등",
    title: "사과 한 알에 5천 원?! 장바구니 물가의 비밀",
    hook: "언니, 어제 마트에서 사과 보고 깜짝 놀라셨죠? 한 알에 5천 원… 이거 진짜 우리 탓 아니에요!",
    body: "요즘 사과 한 봉지가 예전 한우 한 근 값이잖아요. 이게 바로 '장바구니 물가 상승', 어려운 말로 인플레이션이에요. 작년 이상기후로 사과 농사가 반토막 났는데, 수입은 막혀 있으니 가격이 하늘을 뚫는 거죠. 월급은 그대론데 카트만 가벼워지는 느낌, 그게 바로 체감 물가랍니다.",
    summary: [
      "사과값 폭등 = 이상기후 + 수입 제한",
      "체감 물가는 월 10만 원 이상 차이",
      "제철·대체 과일로 장바구니 다이어트!",
    ],
    imageStyle: "따뜻한 실사 (Warm Realistic)",
    image: appleStyle1,
  },
  {
    id: "oil-surge",
    keyword: "유가 폭등 · 기름값 비상",
    title: "주유소 갈 때마다 한숨? 유가 폭등의 진짜 이유",
    hook: "언니, 주말에 주유하다가 깜짝 놀라셨죠? 가득 채우니 10만 원이 훌쩍… 이거 왜 이러는 걸까요?",
    body: "중동에서 분쟁 소식이 들리면 전 세계 기름값이 출렁여요. 기름은 '경제의 혈액'이라, 비싸지면 택배비·배달비·마트 물건값까지 줄줄이 따라 올라요. 결국 차 안 타도 우리 지갑은 같이 가벼워지는 구조랍니다.",
    summary: [
      "중동 리스크 = 국제 유가 급등",
      "기름값 → 물류비 → 장바구니 도미노",
      "대중교통·묶음 외출로 지출 다이어트!",
    ],
    imageStyle: "따뜻한 실사 (Warm Realistic)",
    image: oilStyle1,
  },
];

const Index = () => {
  const [reels, setReels] = useState<ReelItem[]>(initialReels);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const kw = keyword.trim();
    if (!kw) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-reel", {
        body: { keyword: kw },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const newReel: ReelItem = {
        id: `${Date.now()}`,
        keyword: kw,
        title: data.title,
        hook: data.hook,
        body: data.body,
        summary: data.summary,
        imageStyle: "AI 이미지 프롬프트",
        imagePrompt: data.imagePrompt,
      };
      setReels((prev) => [newReel, ...prev]);
      setKeyword("");
      toast.success("새 릴스 스크립트가 도착했어요! ☕");
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "생성에 실패했어요";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-white">
      <header className="mx-auto max-w-5xl px-6 pt-16 pb-10 text-center">
        <p className="text-sm font-medium tracking-widest text-rose-500 uppercase">
          3050 Economy Reels
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold text-stone-800">
          언니의 경제 한 줄 ☕
        </h1>
        <p className="mt-4 text-stone-600 max-w-xl mx-auto leading-relaxed">
          오늘 아침 꼭 챙겨야 할 경제 소식을, 장바구니 언어로 풀어드려요.
          키워드 하나만 던지면 릴스 스크립트가 뚝딱 나와요.
        </p>

        <form
          onSubmit={handleGenerate}
          className="mt-8 mx-auto flex max-w-xl gap-2 rounded-full bg-white p-2 shadow-md shadow-rose-100 ring-1 ring-stone-100"
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예: 환율, 금리 인하, 전세값…"
            disabled={loading}
            className="flex-1 bg-transparent px-4 py-2 text-stone-700 placeholder:text-stone-400 outline-none"
          />
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className="rounded-full bg-rose-500 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-600 disabled:opacity-50"
          >
            {loading ? "만드는 중…" : "스크립트 생성"}
          </button>
        </form>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-8 md:grid-cols-2">
          {reels.map((reel) => (
            <article
              key={reel.id}
              className="group overflow-hidden rounded-3xl bg-white shadow-lg shadow-rose-100/60 ring-1 ring-stone-100 transition hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative aspect-[9/16] overflow-hidden bg-gradient-to-br from-amber-100 to-rose-100">
                {reel.image ? (
                  <img
                    src={reel.image}
                    alt={reel.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-6 text-center">
                    <div>
                      <p className="text-4xl mb-3">🎨</p>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        아래 이미지 프롬프트를 복사해<br />DALL-E·Midjourney에 붙여넣으세요
                      </p>
                    </div>
                  </div>
                )}
                <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-700 backdrop-blur">
                  {reel.imageStyle}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs font-semibold tracking-wide text-rose-500 uppercase">
                  #{reel.keyword}
                </p>
                <h2 className="text-xl font-bold text-stone-800 leading-snug">
                  {reel.title}
                </h2>

                <section className="rounded-2xl bg-amber-50/70 p-4">
                  <p className="text-[11px] font-bold text-amber-700 mb-1">후킹 (0–3초)</p>
                  <p className="text-sm text-stone-700 leading-relaxed">{reel.hook}</p>
                </section>

                <section>
                  <p className="text-[11px] font-bold text-stone-500 mb-1">본문 비유 (4–20초)</p>
                  <p className="text-sm text-stone-700 leading-relaxed">{reel.body}</p>
                </section>

                <section>
                  <p className="text-[11px] font-bold text-stone-500 mb-2">핵심 요약</p>
                  <ul className="space-y-1.5">
                    {reel.summary.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-stone-700">
                        <span className="text-rose-400 font-bold">{i + 1}.</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {reel.imagePrompt && (
                  <section className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-[11px] font-bold text-stone-500 mb-1">🎨 이미지 프롬프트</p>
                    <p className="text-xs text-stone-600 leading-relaxed">{reel.imagePrompt}</p>
                  </section>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="pb-10 text-center text-xs text-stone-400">
        Made with ☕ for 3050 — 오늘도 든든한 하루 보내세요.
      </footer>
    </div>
  );
};

export default Index;
