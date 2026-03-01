// ============================================================
// 16パーソナリティタイプ定義
// ============================================================

export const PERSONALITY_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

export type PersonalityType = (typeof PERSONALITY_TYPES)[number];

export type PersonalityGroup = "analyst" | "diplomat" | "sentinel" | "explorer";

export interface PersonalityInfo {
  type: PersonalityType;
  name: string;
  nameEn: string;
  group: PersonalityGroup;
  animal: string;
  animalEmoji: string;
  color: string;
  colorLight: string;
  tagline: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  interviewStrengths: string[];
  interviewWeaknesses: string[];
  compatibleIndustries: string[];
  compatibleCultures: string[];
  talkStyle: string;
  adviceTip: string;
}

export interface PersonalityGroupInfo {
  id: PersonalityGroup;
  name: string;
  nameEn: string;
  color: string;
  colorLight: string;
  description: string;
  types: PersonalityType[];
}

// ============================================================
// グループ定義
// ============================================================

export const PERSONALITY_GROUPS: Record<PersonalityGroup, PersonalityGroupInfo> = {
  analyst: {
    id: "analyst",
    name: "分析家",
    nameEn: "Analysts",
    color: "#7E57C2",
    colorLight: "#EDE7F6",
    description: "論理的思考と知的好奇心で物事を分析するタイプ",
    types: ["INTJ", "INTP", "ENTJ", "ENTP"],
  },
  diplomat: {
    id: "diplomat",
    name: "外交官",
    nameEn: "Diplomats",
    color: "#4CAF50",
    colorLight: "#E8F5E9",
    description: "共感力と理想を大切にし、人とのつながりを重視するタイプ",
    types: ["INFJ", "INFP", "ENFJ", "ENFP"],
  },
  sentinel: {
    id: "sentinel",
    name: "番人",
    nameEn: "Sentinels",
    color: "#1E88E5",
    colorLight: "#E3F2FD",
    description: "責任感が強く、秩序と安定を大切にするタイプ",
    types: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  },
  explorer: {
    id: "explorer",
    name: "探検家",
    nameEn: "Explorers",
    color: "#F4511E",
    colorLight: "#FBE9E7",
    description: "柔軟性と行動力で、新しい体験を求めるタイプ",
    types: ["ISTP", "ISFP", "ESTP", "ESFP"],
  },
};

// ============================================================
// 16タイプ詳細定義
// ============================================================

export const PERSONALITY_DATA: Record<PersonalityType, PersonalityInfo> = {
  // ── 分析家グループ ──
  INTJ: {
    type: "INTJ",
    name: "戦略プランナー",
    nameEn: "Strategic Planner",
    group: "analyst",
    animal: "フクロウ",
    animalEmoji: "🦉",
    color: "#9B72CF",
    colorLight: "#F3E5F5",
    tagline: "戦略的なビジョンで未来を設計する",
    description: "独立心が強く、長期的なビジョンを持って物事を戦略的に考えるタイプ。知的好奇心が高く、効率性を追求します。",
    strengths: ["戦略的思考", "独立心", "高い目標設定", "論理的分析力"],
    weaknesses: ["完璧主義", "感情表現が苦手", "他者への厳しさ"],
    interviewStrengths: ["論理的で一貫した回答", "具体的な計画を示せる", "深い企業研究"],
    interviewWeaknesses: ["表情が硬くなりやすい", "雑談が苦手", "柔軟性が低く見られる"],
    compatibleIndustries: ["コンサルティング", "IT・テクノロジー", "研究開発", "金融"],
    compatibleCultures: ["実力主義", "裁量が大きい", "専門性を評価する"],
    talkStyle: "論理的で簡潔。結論から話し、根拠を明確にする",
    adviceTip: "論理は強みです。面接では少し笑顔を意識して、人間味のある表現を加えると好印象になります",
  },
  INTP: {
    type: "INTP",
    name: "知的エクスプローラー",
    nameEn: "Intellectual Explorer",
    group: "analyst",
    animal: "ネコ",
    animalEmoji: "🐱",
    color: "#A78BDA",
    colorLight: "#F3E5F5",
    tagline: "好奇心の赴くまま、真理を探究する",
    description: "好奇心旺盛で、複雑な問題を解き明かすことに喜びを感じるタイプ。独創的なアイデアと深い分析力が持ち味です。",
    strengths: ["分析力", "独創性", "知的好奇心", "客観的思考"],
    weaknesses: ["決断の遅さ", "実行力不足", "社交が苦手"],
    interviewStrengths: ["ユニークな視点", "深い思考力", "専門知識の豊富さ"],
    interviewWeaknesses: ["話がまとまりにくい", "熱意が伝わりにくい", "具体的なエピソードが薄い"],
    compatibleIndustries: ["IT・テクノロジー", "研究機関", "データ分析", "ゲーム開発"],
    compatibleCultures: ["自由な発想を尊重", "技術力重視", "フラットな組織"],
    talkStyle: "理論的で正確。思考過程を丁寧に説明しようとする",
    adviceTip: "深い思考は魅力です。面接では結論を先に述べてから理由を説明し、具体的な行動エピソードを加えましょう",
  },
  ENTJ: {
    type: "ENTJ",
    name: "ビジョンリーダー",
    nameEn: "Vision Leader",
    group: "analyst",
    animal: "ライオン",
    animalEmoji: "🦁",
    color: "#7E57C2",
    colorLight: "#EDE7F6",
    tagline: "大胆な決断力でチームを導く",
    description: "天性のリーダーシップを持ち、目標達成に向けて周囲を巻き込む力があるタイプ。効率と成果を重視します。",
    strengths: ["リーダーシップ", "決断力", "効率性追求", "自信"],
    weaknesses: ["支配的になりやすい", "感情に鈍感", "せっかちさ"],
    interviewStrengths: ["自信のある態度", "リーダー経験の豊富さ", "明確なキャリアビジョン"],
    interviewWeaknesses: ["圧が強く見える", "協調性が疑われやすい", "謙虚さの不足"],
    compatibleIndustries: ["総合商社", "コンサルティング", "金融", "経営企画"],
    compatibleCultures: ["成果主義", "スピード重視", "チャレンジを奨励"],
    talkStyle: "力強く断定的。結論ファーストで効率的に伝える",
    adviceTip: "リーダーシップは面接で強い武器です。ただし、チームメンバーの声を聴いた経験も交えると、より魅力的に映ります",
  },
  ENTP: {
    type: "ENTP",
    name: "アイデアメイカー",
    nameEn: "Idea Maker",
    group: "analyst",
    animal: "キツネ",
    animalEmoji: "🦊",
    color: "#B39DDB",
    colorLight: "#EDE7F6",
    tagline: "機知とひらめきで常識を覆す",
    description: "知的好奇心が旺盛で、既存の概念に挑戦するのが好きなタイプ。議論を楽しみ、新しいアイデアを生み出します。",
    strengths: ["発想力", "議論力", "適応力", "知的好奇心"],
    weaknesses: ["飽きっぽさ", "議論好きが過ぎる", "計画の不安定さ"],
    interviewStrengths: ["臨機応変な対応", "面白い視点の提示", "会話の盛り上げ"],
    interviewWeaknesses: ["話が脱線しやすい", "一貫性に欠ける印象", "真剣さが伝わりにくい"],
    compatibleIndustries: ["広告・マーケティング", "スタートアップ", "メディア", "企画職"],
    compatibleCultures: ["イノベーション重視", "自由な議論", "変化の激しい環境"],
    talkStyle: "テンポが良く多角的。比喩やユーモアを交えて話す",
    adviceTip: "発想の豊かさは面接官を惹きつけます。ただし1つのエピソードを深掘りして「やり切った経験」を見せると信頼感がUPします",
  },

  // ── 外交官グループ ──
  INFJ: {
    type: "INFJ",
    name: "静かなビジョナリー",
    nameEn: "Quiet Visionary",
    group: "diplomat",
    animal: "シカ",
    animalEmoji: "🦌",
    color: "#66BB6A",
    colorLight: "#E8F5E9",
    tagline: "静かな情熱で理想の世界を描く",
    description: "直感力と共感力に優れ、理想を追求するタイプ。他者の感情に敏感で、深い洞察力を持っています。",
    strengths: ["洞察力", "共感力", "理想主義", "計画性"],
    weaknesses: ["理想が高すぎる", "自己犠牲", "決断の遅さ"],
    interviewStrengths: ["誠実で深い回答", "共感を示せる", "企業理念への共感表現"],
    interviewWeaknesses: ["自己アピールが苦手", "声が小さくなりやすい", "緊張しやすい"],
    compatibleIndustries: ["教育", "NPO・NGO", "カウンセリング", "HR・人事"],
    compatibleCultures: ["人を大切にする", "社会的意義のある事業", "穏やかな社風"],
    talkStyle: "丁寧で思慮深い。相手の反応を見ながら話す",
    adviceTip: "深い共感力と誠実さは面接で光ります。自己アピールが苦手でも、「自分がどう貢献したか」を事実ベースで伝えましょう",
  },
  INFP: {
    type: "INFP",
    name: "共感クリエイター",
    nameEn: "Empathy Creator",
    group: "diplomat",
    animal: "ウサギ",
    animalEmoji: "🐰",
    color: "#81C784",
    colorLight: "#E8F5E9",
    tagline: "豊かな内面世界で人々をつなぐ",
    description: "感受性が豊かで、自分の価値観を大切にするタイプ。創造性に富み、他者の気持ちに寄り添うことができます。",
    strengths: ["共感力", "創造性", "誠実さ", "柔軟な思考"],
    weaknesses: ["理想と現実のギャップ", "批判に弱い", "優柔不断"],
    interviewStrengths: ["感情を込めた話し方", "価値観の一貫性", "人間味のある回答"],
    interviewWeaknesses: ["具体性が不足しがち", "自信なさげに見える", "数字やデータが弱い"],
    compatibleIndustries: ["出版・メディア", "デザイン", "福祉", "ライター・コンテンツ"],
    compatibleCultures: ["個性を尊重", "クリエイティブ", "ワークライフバランス重視"],
    talkStyle: "感受性豊かで物語的。経験を感情を交えて伝える",
    adviceTip: "あなたの感受性と誠実さは面接官の心に響きます。具体的な数字（人数、期間、成果）を加えると説得力が格段にUPします",
  },
  ENFJ: {
    type: "ENFJ",
    name: "チームメンター",
    nameEn: "Team Mentor",
    group: "diplomat",
    animal: "イルカ",
    animalEmoji: "🐬",
    color: "#4CAF50",
    colorLight: "#E8F5E9",
    tagline: "カリスマ性で周囲を明るく照らす",
    description: "自然なカリスマ性を持ち、他者の成長を応援するタイプ。コミュニケーション能力が高く、人を惹きつけます。",
    strengths: ["カリスマ性", "共感力", "コミュニケーション力", "リーダーシップ"],
    weaknesses: ["他者を優先しすぎる", "批判への過敏さ", "理想主義"],
    interviewStrengths: ["好印象を与える", "チームワークのエピソードが豊富", "熱意が伝わる"],
    interviewWeaknesses: ["他人の話が多くなる", "自分の成果を控えめにする", "理想論に偏る"],
    compatibleIndustries: ["人材", "教育", "営業", "広報・PR"],
    compatibleCultures: ["チームワーク重視", "人材育成に注力", "社会貢献"],
    talkStyle: "明るく説得力がある。相手を巻き込む話し方をする",
    adviceTip: "コミュニケーション力は最大の武器です。「自分が」どう行動して成果を出したかを具体的に伝えることを意識しましょう",
  },
  ENFP: {
    type: "ENFP",
    name: "パッションスターター",
    nameEn: "Passion Starter",
    group: "diplomat",
    animal: "コアラ",
    animalEmoji: "🐨",
    color: "#A5D6A7",
    colorLight: "#E8F5E9",
    tagline: "無限の好奇心で可能性を広げる",
    description: "エネルギッシュで想像力豊かなタイプ。新しい可能性を見つけることに情熱を持ち、人とのつながりを楽しみます。",
    strengths: ["創造性", "社交性", "熱意", "柔軟性"],
    weaknesses: ["集中力の持続", "計画性の不足", "感情的になりやすい"],
    interviewStrengths: ["明るい印象", "豊富な経験談", "熱意の表現"],
    interviewWeaknesses: ["話が広がりすぎる", "具体的な計画が弱い", "一貫性の不足"],
    compatibleIndustries: ["エンターテインメント", "マーケティング", "旅行", "イベント企画"],
    compatibleCultures: ["自由な雰囲気", "チャレンジを歓迎", "クリエイティブ"],
    talkStyle: "明るくテンポが良い。感情豊かに話し、聞く人を楽しませる",
    adviceTip: "あなたの熱意は面接の最大の武器です。データや数字で裏付けると「やりっぱなしではない」印象を与えられます",
  },

  // ── 番人グループ ──
  ISTJ: {
    type: "ISTJ",
    name: "堅実キーパー",
    nameEn: "Steady Keeper",
    group: "sentinel",
    animal: "クマ",
    animalEmoji: "🐻",
    color: "#42A5F5",
    colorLight: "#E3F2FD",
    tagline: "堅実さと誠実さで信頼を築く",
    description: "責任感が強く、約束を確実に守るタイプ。事実に基づいた判断を好み、秩序を大切にします。",
    strengths: ["責任感", "正確さ", "忍耐力", "信頼性"],
    weaknesses: ["柔軟性の不足", "変化への抵抗", "感情表現が苦手"],
    interviewStrengths: ["信頼感のある態度", "具体的なエピソード", "継続的な取り組み"],
    interviewWeaknesses: ["堅い印象", "創造性のアピールが弱い", "柔軟性の不足"],
    compatibleIndustries: ["金融・銀行", "公務員", "メーカー", "経理・事務"],
    compatibleCultures: ["安定した組織", "ルールが明確", "歴史と伝統がある"],
    talkStyle: "正確で事実ベース。順序立てて丁寧に説明する",
    adviceTip: "堅実さは面接で高く評価されます。「変化への対応力」を示すエピソードも1つ用意すると、幅の広さが伝わります",
  },
  ISFJ: {
    type: "ISFJ",
    name: "サイレントサポーター",
    nameEn: "Silent Supporter",
    group: "sentinel",
    animal: "ペンギン",
    animalEmoji: "🐧",
    color: "#64B5F6",
    colorLight: "#E3F2FD",
    tagline: "優しさと献身で人々を支える",
    description: "温かく思いやりがあり、周囲の人を支えることに喜びを感じるタイプ。責任感が強く、細やかな配慮ができます。",
    strengths: ["思いやり", "責任感", "観察力", "忍耐力"],
    weaknesses: ["自己主張の弱さ", "変化への抵抗", "ストレスを溜めやすい"],
    interviewStrengths: ["誠実な印象", "チームへの貢献エピソード", "丁寧な受け答え"],
    interviewWeaknesses: ["自己アピールが苦手", "リーダー経験が少なく見える", "声が小さくなる"],
    compatibleIndustries: ["医療・福祉", "教育", "事務・秘書", "接客・サービス"],
    compatibleCultures: ["チームワーク重視", "穏やかな社風", "人を大切にする"],
    talkStyle: "丁寧で控えめ。相手を気遣いながら話す",
    adviceTip: "思いやりと責任感は面接官に安心感を与えます。自分の貢献をもっと堂々と伝えてOKです！「私がやりました」と言い切る練習をしましょう",
  },
  ESTJ: {
    type: "ESTJ",
    name: "組織キャプテン",
    nameEn: "Organization Captain",
    group: "sentinel",
    animal: "イヌ",
    animalEmoji: "🐕",
    color: "#1E88E5",
    colorLight: "#E3F2FD",
    tagline: "秩序と責任感でチームを率いる",
    description: "組織力に優れ、ルールと秩序を重視するタイプ。リーダーシップを発揮し、チームをまとめる力があります。",
    strengths: ["組織力", "責任感", "実行力", "リーダーシップ"],
    weaknesses: ["頑固さ", "柔軟性の不足", "感情への配慮不足"],
    interviewStrengths: ["ハキハキした受け答え", "組織運営の経験", "具体的な成果の提示"],
    interviewWeaknesses: ["柔軟性が低く見える", "一方的に話しがち", "創造性のアピール不足"],
    compatibleIndustries: ["メーカー", "商社", "金融", "行政"],
    compatibleCultures: ["組織力を重視", "成果主義", "歴史のある企業"],
    talkStyle: "明確で断定的。効率よく要点をまとめて伝える",
    adviceTip: "明確な受け答えと実行力は高評価です。相手の話を聴く姿勢（傾聴力）も見せると、より魅力的なリーダー像が伝わります",
  },
  ESFJ: {
    type: "ESFJ",
    name: "ムードコネクター",
    nameEn: "Mood Connector",
    group: "sentinel",
    animal: "ハムスター",
    animalEmoji: "🐹",
    color: "#90CAF9",
    colorLight: "#E3F2FD",
    tagline: "周囲への配慮で調和を生み出す",
    description: "社交的で思いやりがあり、周囲の調和を大切にするタイプ。人の役に立つことに喜びを感じ、チームの潤滑油になります。",
    strengths: ["社交性", "配慮", "協調性", "責任感"],
    weaknesses: ["他者の評価を気にしすぎる", "批判に弱い", "自己犠牲"],
    interviewStrengths: ["好印象を与える", "チーム貢献のエピソード", "コミュニケーション力"],
    interviewWeaknesses: ["自分の意見が弱い", "周りに合わせすぎる", "リーダーシップ不足"],
    compatibleIndustries: ["接客・サービス", "HR・人事", "営業", "イベント運営"],
    compatibleCultures: ["チームワーク重視", "人間関係が良好", "社員を大切にする"],
    talkStyle: "明るく親しみやすい。相手を気遣う言葉が自然に出る",
    adviceTip: "コミュニケーション力と協調性は大きな強みです。面接では「自分の考え」もしっかり伝える練習をすると、さらに評価が上がります",
  },

  // ── 探検家グループ ──
  ISTP: {
    type: "ISTP",
    name: "冷静テクニシャン",
    nameEn: "Cool Technician",
    group: "explorer",
    animal: "タカ",
    animalEmoji: "🦅",
    color: "#FF7043",
    colorLight: "#FBE9E7",
    tagline: "冷静な観察眼で問題を解決する",
    description: "冷静沈着で、手を動かして問題を解決するのが得意なタイプ。実践的なスキルと鋭い観察力を持っています。",
    strengths: ["問題解決力", "冷静さ", "器用さ", "適応力"],
    weaknesses: ["感情表現が苦手", "コミットメントの不足", "退屈しやすい"],
    interviewStrengths: ["落ち着いた態度", "具体的なスキルの提示", "問題解決エピソード"],
    interviewWeaknesses: ["熱意が伝わりにくい", "長期目標が曖昧", "チームワークが弱い"],
    compatibleIndustries: ["エンジニアリング", "IT", "製造業", "技術職"],
    compatibleCultures: ["実力主義", "自由度が高い", "技術力を評価"],
    talkStyle: "簡潔で実用的。必要なことだけを的確に伝える",
    adviceTip: "技術力と冷静さは頼もしい印象を与えます。「なぜこの会社か」の熱意をしっかり伝えると、バランスの良い印象になります",
  },
  ISFP: {
    type: "ISFP",
    name: "感性アーティスト",
    nameEn: "Sensory Artist",
    group: "explorer",
    animal: "チョウ",
    animalEmoji: "🦋",
    color: "#FFAB91",
    colorLight: "#FBE9E7",
    tagline: "美的感覚と自由な心で世界を彩る",
    description: "芸術的で感受性が豊かなタイプ。自由を愛し、自分だけの表現を大切にします。穏やかで優しい性格です。",
    strengths: ["芸術性", "感受性", "柔軟性", "思いやり"],
    weaknesses: ["計画性の不足", "自己主張の弱さ", "ストレスに弱い"],
    interviewStrengths: ["穏やかな印象", "感性を活かしたエピソード", "柔軟な対応力"],
    interviewWeaknesses: ["自己アピールが苦手", "具体的な目標が曖昧", "声が小さい"],
    compatibleIndustries: ["デザイン", "ファッション", "美容", "飲食・サービス"],
    compatibleCultures: ["個性を尊重", "クリエイティブ", "自由な雰囲気"],
    talkStyle: "穏やかで自然体。飾らない言葉で正直に伝える",
    adviceTip: "あなたの感性と柔軟性はユニークな強みです。面接では声のボリュームを意識し、1つのエピソードを深く掘り下げて話しましょう",
  },
  ESTP: {
    type: "ESTP",
    name: "突破パイオニア",
    nameEn: "Breakthrough Pioneer",
    group: "explorer",
    animal: "チーター",
    animalEmoji: "🐆",
    color: "#F4511E",
    colorLight: "#FBE9E7",
    tagline: "大胆な行動力で道を切り拓く",
    description: "行動力に溢れ、リスクを恐れないタイプ。現実的で実践的、その場の状況に素早く対応する力があります。",
    strengths: ["行動力", "適応力", "交渉力", "現実的思考"],
    weaknesses: ["衝動的", "長期計画が苦手", "飽きっぽさ"],
    interviewStrengths: ["エネルギッシュな印象", "豊富な経験談", "対人力の強さ"],
    interviewWeaknesses: ["話が浅くなりがち", "計画性が疑われる", "落ち着きがない印象"],
    compatibleIndustries: ["営業", "起業・スタートアップ", "イベント", "スポーツ"],
    compatibleCultures: ["チャレンジ精神重視", "スピード感", "結果で評価"],
    talkStyle: "テンポが良くエネルギッシュ。具体的な経験を生き生きと語る",
    adviceTip: "行動力と対人力は最大の武器です。面接では少しペースを落として「計画→実行→成果」の流れで話すと信頼感が増します",
  },
  ESFP: {
    type: "ESFP",
    name: "ステージライター",
    nameEn: "Stage Lighter",
    group: "explorer",
    animal: "インコ",
    animalEmoji: "🦜",
    color: "#FFB74D",
    colorLight: "#FFF3E0",
    tagline: "明るさと情熱で場を盛り上げる",
    description: "明るく社交的で、人を楽しませるのが大好きなタイプ。今この瞬間を大切にし、周囲にエネルギーを与えます。",
    strengths: ["社交性", "ポジティブさ", "適応力", "実行力"],
    weaknesses: ["計画性の不足", "飽きっぽさ", "深い分析が苦手"],
    interviewStrengths: ["明るく好印象", "コミュニケーション力", "場の雰囲気作り"],
    interviewWeaknesses: ["軽く見られやすい", "論理性が弱い", "長期目標が不明確"],
    compatibleIndustries: ["エンターテインメント", "接客", "営業", "広報"],
    compatibleCultures: ["明るい社風", "チーム活動が多い", "挑戦を歓迎"],
    talkStyle: "明るく感情豊か。聞いている人を楽しませる語り口",
    adviceTip: "明るさは面接で最強の武器になります。STAR法（状況→課題→行動→結果）で話を構造化すると、頼もしさもアピールできます",
  },
};

// ============================================================
// ヘルパー関数
// ============================================================

/** タイプ文字列を PersonalityType に変換（バリデーション付き） */
export function isValidPersonalityType(type: string): type is PersonalityType {
  return PERSONALITY_TYPES.includes(type.toUpperCase() as PersonalityType);
}

/** タイプからグループ情報を取得 */
export function getGroupForType(type: PersonalityType): PersonalityGroupInfo {
  const group = PERSONALITY_DATA[type].group;
  return PERSONALITY_GROUPS[group];
}

/** 全グループをリストで返す */
export function getAllGroups(): PersonalityGroupInfo[] {
  return Object.values(PERSONALITY_GROUPS);
}
