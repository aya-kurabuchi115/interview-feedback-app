/**
 * 日本語メッセージ定数
 *
 * 名前空間ごとにUI テキストを定義する。
 * テンプレート変数は {variable} 形式で埋め込み、t() ヘルパーで置換する。
 */
export const ja = {
  // ============================================================
  // 共通
  // ============================================================
  common: {
    loading: "読み込み中...",
    error: "エラーが発生しました",
    save: "保存",
    cancel: "キャンセル",
    delete: "削除",
    back: "戻る",
    next: "次へ",
    submit: "送信",
    close: "閉じる",
    search: "検索",
    noData: "データがありません",
    retry: "もう一度試す",
    home: "ホームに戻る",
    networkError: "サーバーとの通信に失敗しました。時間を置いて再度お試しください。",
    perMonth: "/月",
  },

  // ============================================================
  // メタデータ
  // ============================================================
  metadata: {
    siteTitle: "InterviewCoach",
    siteDescription:
      "面接練習の録音をAIが分析し、回答内容・話し方の両面からフィードバックを自動生成。新卒就活を成功に導くAI面接コーチ。",
    ogAlt: "InterviewCoach - AI面接フィードバック",
    lpTitle:
      "InterviewCoach - 面接練習を録音するだけ。AIが即座に分析・フィードバック",
    lpDescription:
      "面接練習を録音するだけで、回答内容・話し方をAIが即座に分析。スコア表示と成長トラッキングで、確実に面接力を伸ばせる就活支援アプリ。無料プランあり。",
    dashboardTitle: "ダッシュボード",
    pricingTitle: "料金プラン | InterviewCoach",
  },

  // ============================================================
  // 認証
  // ============================================================
  auth: {
    login: "ログイン",
    loginLoading: "ログイン中...",
    signup: "サインアップ",
    signupLoading: "登録中...",
    logout: "ログアウト",
    email: "メールアドレス",
    password: "パスワード",
    passwordPlaceholder: "8文字以上",
    loginDescription: "メールアドレスとパスワードでログイン",
    signupTitle: "アカウント作成",
    signupDescription: "メールアドレスとパスワードで登録",
    forgotPassword: "パスワードを忘れた方",
    noAccount: "アカウントをお持ちでないですか？",
    hasAccount: "すでにアカウントをお持ちですか？",
    agreeTerms: "に同意します",
    termsOfService: "利用規約",
    privacyPolicy: "プライバシーポリシー",
    emailNotConfirmed:
      "メールアドレスの確認が完了していません。受信トレイの確認メールからアカウントを有効化してください。",
    invalidCredentials:
      "メールアドレスまたはパスワードが正しくありません。入力内容をご確認ください。",
    alreadyRegistered:
      "このメールアドレスは既に登録されています。ログインページからお試しください。",
    signupFailed:
      "アカウント作成に失敗しました。入力内容を確認して再度お試しください。",
    termsRequired: "利用規約とプライバシーポリシーへの同意が必要です",
    passwordMinLength: "パスワードは8文字以上で入力してください",
    confirmEmail: "メールを確認してください",
    confirmEmailSent: "に確認メールを送信しました。",
    confirmEmailInstruction:
      "メール内のリンクをクリックして、アカウントの登録を完了してください。",
    confirmEmailSpam:
      "メールが届かない場合は、迷惑メールフォルダもご確認ください。",
    useAnotherEmail: "別のメールアドレスで登録する",
    sessionExpired:
      "セッションの有効期限が切れました。再度ログインしてください。",
    closeNotification: "通知を閉じる",
    freeTrialCta: "3分で無料体験",
    noCreditCard: "クレジットカード不要・30秒で登録完了",
  },

  // ============================================================
  // ダッシュボード
  // ============================================================
  dashboard: {
    title: "面接履歴",
    newInterview: "新規面接を記録",
    mockInterview: "AI模擬面接",
    backToDashboard: "ダッシュボードに戻る",
  },

  // ============================================================
  // 面接
  // ============================================================
  interview: {
    scriptRegistration: "面接スクリプト登録",
    companyName: "企業名",
    companyNamePlaceholder: "例: 株式会社サンプル",
    companyNameRequired: "企業名を入力してください",
    companyNameMaxLength:
      "企業名は{max}文字以内で入力してください",
    category: "面接カテゴリ",
    categoryRequired: "面接カテゴリを選択してください",
    categoryPlaceholder: "カテゴリを選択",
    round: "面接ラウンド",
    roundRequired: "面接ラウンドを選択してください",
    roundPlaceholder: "ラウンドを選択",
    interviewDate: "面接日",
    interviewDateFuture: "面接日は今日以前の日付を指定してください",
    transcript: "音声スクリプト",
    transcriptRequired: "音声スクリプトを入力してください",
    transcriptMinLength:
      "音声スクリプトは{min}文字以上入力してください（現在: {current}文字）",
    transcriptMaxLength:
      "音声スクリプトは{max}文字以内で入力してください（現在: {current}文字）",
    transcriptMinNote: "（最低{min}文字）",
    transcriptPastePlaceholder:
      "テキストを直接貼り付けることもできます",
    transcriptTextareaPlaceholder:
      "音声文字起こし結果をここに貼り付けてください...",
    chars: "文字",
    register: "登録する",
    saving: "保存中...",
    saveFailed: "保存に失敗しました",
    networkError:
      "ネットワークエラーが発生しました。接続を確認してもう一度お試しください。",
    fileUploadLabel: "テキストファイルをアップロード",
    fileDragDrop: ".txt ファイルをドラッグ&ドロップ、または",
    fileSelect: "ファイルを選択",
    fileMaxSize: "最大 1MB / UTF-8 テキストファイル",
    fileClear: "ファイルをクリア",
    fileTxtOnly: ".txt ファイルのみアップロードできます",
    fileSizeLimit: "ファイルサイズは1MB以内にしてください",
    fileEncodingError:
      "ファイルのエンコーディングが正しくない可能性があります。UTF-8 のテキストファイルを使用してください。",
    fileReadError: "ファイルの読み込みに失敗しました",
    // カテゴリラベル
    categoryArubaito: "アルバイト",
    categoryIntern: "インターン",
    categoryNewGrad: "新卒",
    categoryOther: "その他",
    // ラウンドラベル
    roundFirst: "一次面接",
    roundSecond: "二次面接",
    roundThird: "三次面接",
    roundFinal: "最終面接",
    roundGD: "GD（グループディスカッション）",
    roundCase: "ケース面接",
    roundOther: "その他",
  },

  // ============================================================
  // 面接結果
  // ============================================================
  result: {
    overallScore: "総合スコア",
    categoryScore: "カテゴリ別スコア",
    noCategoryScore: "カテゴリ別スコアはありません",
    goodPoints: "良い点",
    improvementPoints: "改善点",
    detailedFeedback: "詳細フィードバック",
    advice: "次回へのアドバイス",
    summary: "要約",
    interviewSummary: "面接の要約",
    transcription: "文字起こし",
    suggestions: "改善提案",
    filler: "フィラー",
    noSuggestions: "改善提案はありません",
    noTranscript: "文字起こしデータがありません",
    noFeedbackYet: "フィードバックはまだ生成されていません",
    waitForProcessing: "処理が完了するまでお待ちください",
    checkProcessing: "処理状況を確認する",
    compareWithPrevious: "前回と比較",
    original: "元の回答",
    improved: "改善案",
    reason: "理由",
    interviewer: "面接官",
    candidate: "候補者",
    // フィラー分析
    totalFillers: "総フィラー数",
    fillerRate: "フィラー率",
    fillerTypes: "種類数",
    fillerBreakdown: "フィラー表現の内訳",
    noFillers: "フィラー表現は検出されませんでした",
    times: "回",
    types: "種類",
    points: "点",
  },

  // ============================================================
  // エラーページ
  // ============================================================
  error: {
    title: "エラーが発生しました",
    description: "申し訳ございません。予期しないエラーが発生しました。",
    suggestion: "時間をおいて再度お試しいただくか、ホームに戻ってください。",
    errorId: "エラーID:",
    copyErrorId: "エラーIDをコピー",
    retry: "もう一度試す",
    goHome: "ホームに戻る",
    supportGuide: "問題が解決しない場合は、エラーIDを添えてお問い合わせください。",
  },

  // ============================================================
  // 404 ページ
  // ============================================================
  notFound: {
    title: "404",
    description: "ページが見つかりません",
    suggestion: "お探しのページは移動または削除された可能性があります。",
    goHome: "ホームに戻る",
    dashboard: "ダッシュボード",
    suggestTitle: "お探しの内容はこちらかもしれません",
    interviewAnalysis: "面接分析",
    esReview: "ES添削",
    mockInterview: "模擬面接",
  },

  // ============================================================
  // ナビゲーション
  // ============================================================
  nav: {
    questions: "質問集",
    personality: "16パーソナリティ",
    dashboard: "ダッシュボード",
    mockInterview: "模擬面接",
    esReview: "ES添削",
    growthRecord: "成長記録",
    profile: "プロフィール",
    planManagement: "プラン管理",
  },

  // ============================================================
  // フッター
  // ============================================================
  footer: {
    termsOfService: "利用規約",
    privacyPolicy: "プライバシーポリシー",
    cookiePolicy: "Cookie ポリシー",
    tokushoho: "特定商取引法に基づく表記",
    help: "ヘルプ",
  },

  // ============================================================
  // 料金
  // ============================================================
  pricing: {
    title: "料金プラン",
    subtitle: "まずは無料プランでお試しください",
    currentPlan: "現在のプラン",
    startFree: "無料で始める",
    upgradeToProLabel: "Pro にアップグレード",
    upgradeToPremiumLabel: "Premium にアップグレード",
    startWithPro: "Pro で始める",
    startWithPremium: "Premium で始める",
    recommended: "おすすめ",
    freeTrialCta: "無料ではじめる",
    compareAll: "Premium プランなど、すべてのプランを比較する",
    freePlanAlso: "無料プランだけでも、面接力は変わります。",
    choosePlan: "あなたに合ったプランを",
  },
} as const;
