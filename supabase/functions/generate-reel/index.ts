import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `너는 3050 여성을 위한 경제 뉴스 큐레이터이자 릴스 스크립트 작가야.
어려운 경제 용어를 '장바구니 물가', '커피 한 잔' 같은 일상 비유로 풀어줘.

[톤앤매너]
- 다정하고 신뢰감 있는 ("언니, 그거 알아요?" 같은 친근한 말투)
- 명쾌하고 군더더기 없음
- 희망적이고 가이드 제시형 ("그래서 우리는 이렇게 준비하면 돼요")

[규칙]
- 후킹 헤드라인(0~3초): 멈출 수밖에 없는 질문/놀라운 사실
- 본문(4~20초): 전문용어 금지, 일상 비유로 설명
- 결론(21~30초): 핵심 3줄 요약
- 이미지 프롬프트: DALL-E용 따뜻한 실사 9:16 세로 구도 묘사

반드시 generate_reel 함수를 호출해서 결과를 반환할 것.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { keyword } = await req.json();
    if (!keyword) throw new Error("keyword required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `오늘의 경제 키워드: "${keyword}"\n이 키워드로 릴스 스크립트와 이미지 프롬프트를 만들어줘.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_reel",
            description: "릴스 스크립트와 이미지 프롬프트를 반환",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "릴스 제목 (한 줄)" },
                hook: { type: "string", description: "후킹 헤드라인 (0-3초, 친근한 말투)" },
                body: { type: "string", description: "본문 비유 설명 (4-20초, 전문용어 금지)" },
                summary: {
                  type: "array",
                  items: { type: "string" },
                  description: "핵심 요약 3줄",
                },
                imagePrompt: { type: "string", description: "DALL-E용 따뜻한 실사 9:16 이미지 프롬프트 (영문)" },
              },
              required: ["title", "hook", "body", "summary", "imagePrompt"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_reel" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 너무 많아요. 잠시 후 다시 시도해주세요." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 크레딧이 소진되었어요. 워크스페이스에서 충전해주세요." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned");
    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-reel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
