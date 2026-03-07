import type { Metadata } from "next";
import Link from "next/link";

/** ISR: 24時間ごとに再検証（静的コンテンツ） */
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "利用規約",
  description:
    "Menpass の利用規約。サービスのご利用条件について定めています。",
  openGraph: {
    title: "利用規約 | Menpass",
    description:
      "Menpass の利用規約。サービスのご利用条件について定めています。",
    url: "https://menpass.jp/legal/terms",
  },
};

const sections = [
  { id: "general", label: "第1条 総則" },
  { id: "account", label: "第2条 アカウント" },
  { id: "service", label: "第3条 サービス内容" },
  { id: "pricing", label: "第4条 利用料金・支払い" },
  { id: "prohibited", label: "第5条 禁止事項" },
  { id: "disclaimer", label: "第6条 AIフィードバックの免責事項" },
  { id: "ai-content-rights", label: "第7条 AI生成コンテンツの権利帰属" },
  { id: "data-ownership", label: "第8条 面接データの所有権" },
  { id: "intellectual-property", label: "第9条 知的財産権" },
  { id: "data-handling", label: "第10条 データの取り扱い" },
  { id: "account-deletion", label: "第11条 アカウント削除時のデータ取り扱い" },
  { id: "service-change", label: "第12条 サービスの変更・停止" },
  { id: "cancellation", label: "第13条 解約・返金" },
  { id: "liability", label: "第14条 損害賠償の制限" },
  { id: "governing-law", label: "第15条 準拠法・管轄裁判所" },
  { id: "supplementary", label: "附則" },
] as const;

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* ページタイトル */}
      <h1 className="mb-2 text-3xl font-bold tracking-tight">利用規約</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        制定日: 2026年3月1日 / 最終更新日: 2026年3月1日
      </p>

      {/* 注記 */}
      <div className="mb-8 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
        ※ 本規約は弁護士によるレビューを受けていません。正式な法的文書として使用する前に、専門家の確認を受けることを推奨します。
      </div>

      {/* 目次 */}
      <nav className="mb-12 rounded-lg border bg-muted/40 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          目次
        </h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 本文 */}
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed [&_h2]:scroll-mt-20">
        {/* 第1条 総則 */}
        <section id="general">
          <h2 className="text-xl font-semibold">第1条 総則</h2>
          <p>
            本利用規約（以下「本規約」）は、Menpass（以下「本サービス」）の利用に関する条件を定めるものです。本サービスは、就職活動中の大学生を主な対象とした AI
            面接フィードバックサービスであり、面接練習の音声スクリプトを AI
            が分析し、改善点やアドバイスをフィードバックとして提供します。
          </p>
          <p>
            ユーザーは、本規約に同意のうえ本サービスを利用するものとします。本サービスを利用した時点で、本規約に同意したものとみなします。
          </p>
        </section>

        {/* 第2条 アカウント */}
        <section id="account">
          <h2 className="text-xl font-semibold">第2条 アカウント</h2>

          <h3 className="mt-4 text-base font-medium">2-1. 登録</h3>
          <p>
            本サービスの利用にはアカウント登録が必要です。登録にあたっては、正確かつ最新の情報を提供してください。虚偽の情報を登録した場合、アカウントを停止または削除することがあります。
          </p>

          <h3 className="mt-4 text-base font-medium">2-2. アカウント管理</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              ユーザーは、自身のアカウント（メールアドレス・パスワード）を適切に管理する責任を負います
            </li>
            <li>
              アカウントの利用は登録者本人に限られ、第三者への貸与・譲渡はできません
            </li>
            <li>一人につき一つのアカウントのみ登録可能です</li>
            <li>
              アカウントの不正利用が判明した場合は、速やかに運営事務局までご連絡ください
            </li>
          </ul>

          <h3 className="mt-4 text-base font-medium">2-3. 利用資格</h3>
          <p>
            本サービスは18歳以上の方を対象としています。18歳未満の方が利用する場合は、保護者の同意が必要です。
          </p>

          <h3 className="mt-4 text-base font-medium">2-4. 同意事項</h3>
          <p>
            アカウント登録時に、本規約および{" "}
            <Link
              href="/legal/privacy"
              className="text-primary underline underline-offset-4"
            >
              プライバシーポリシー
            </Link>{" "}
            への同意が必要です。同意なくアカウントを作成することはできません。
          </p>
        </section>

        {/* 第3条 サービス内容 */}
        <section id="service">
          <h2 className="text-xl font-semibold">第3条 サービス内容</h2>
          <p>本サービスは、以下の機能を提供します。</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">音声文字起こし:</span>{" "}
              面接練習の音声ファイルをアップロードし、テキストに変換する機能
            </li>
            <li>
              <span className="font-medium">AI フィードバック:</span>{" "}
              文字起こしされたスクリプトを AI（Anthropic Claude
              API）が分析し、回答内容・構成・話し方に関するフィードバックを生成する機能
            </li>
            <li>
              <span className="font-medium">面接履歴管理:</span>{" "}
              過去の面接練習とフィードバックを一覧で管理・閲覧する機能
            </li>
            <li>
              <span className="font-medium">進捗トラッキング:</span>{" "}
              フィードバックスコアの推移を確認する機能
            </li>
          </ul>
          <p className="mt-3">
            サービスの具体的な機能・内容は、改善のため予告なく変更されることがあります。重大な変更がある場合は、事前にお知らせします。
          </p>
        </section>

        {/* 第4条 利用料金・支払い */}
        <section id="pricing">
          <h2 className="text-xl font-semibold">第4条 利用料金・支払い</h2>

          <h3 className="mt-4 text-base font-medium">4-1. プラン内容</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">無料プラン:</span>{" "}
              月3回までの面接フィードバックを利用できます
            </li>
            <li>
              <span className="font-medium">Pro プラン:</span>{" "}
              月額料金で面接フィードバックを無制限に利用できます
            </li>
          </ul>

          <h3 className="mt-4 text-base font-medium">4-2. 支払い方法</h3>
          <p>
            Pro プランの料金は、Stripe, Inc.
            が提供する決済システムを通じて、クレジットカードにより支払うものとします。利用可能なカードブランドは
            Stripe の対応範囲に準じます。
          </p>

          <h3 className="mt-4 text-base font-medium">4-3. 自動更新</h3>
          <p>
            Pro
            プランは月額の自動更新制です。更新日の前日までに解約手続きが行われない限り、翌月も自動的に更新され、料金が請求されます。
          </p>
        </section>

        {/* 第5条 禁止事項 */}
        <section id="prohibited">
          <h2 className="text-xl font-semibold">第5条 禁止事項</h2>
          <p>
            ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>虚偽の情報を登録する行為</li>
            <li>
              他人の面接内容を無断でアップロードする行為（本人の同意がない第三者の音声・スクリプトの登録）
            </li>
            <li>他人のアカウントを無断で使用する行為</li>
            <li>
              <span className="font-medium">秘密保持義務に違反する情報の投稿:</span>{" "}
              就職活動中に知り得た企業の秘密情報、NDA（秘密保持契約）で保護された情報、採用選考の具体的な質問内容等、秘密保持義務の対象となる情報を本サービスにアップロードする行為
            </li>
            <li>
              本サービスの逆アセンブル、リバースエンジニアリング、逆コンパイルを行う行為
            </li>
            <li>
              本サービスへの不正アクセス、サーバーやネットワークへの攻撃行為
            </li>
            <li>
              本サービスが提供するフィードバック内容を、営利目的で無断転載・再配布する行為
            </li>
            <li>本サービスの運営を妨害する行為</li>
            <li>法令または公序良俗に違反する行為</li>
            <li>その他、運営が不適切と判断する行為</li>
          </ul>
          <p className="mt-3">
            禁止事項に該当する行為が確認された場合、事前の通知なくアカウントの利用停止または削除を行うことがあります。
          </p>
          <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
            <span className="font-medium">ご注意:</span>{" "}
            面接練習の音声やスクリプトをアップロードする際は、企業から開示された秘密情報や、秘密保持義務の対象となる情報が含まれていないことをご確認ください。秘密保持義務違反の責任はユーザーに帰属します。
          </div>
        </section>

        {/* 第6条 AIフィードバックの免責事項 */}
        <section id="disclaimer">
          <h2 className="text-xl font-semibold">
            第6条 AIフィードバックの免責事項
          </h2>
          <p>本サービスが提供する AI フィードバックについて、以下をご理解ください。</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              AI フィードバックは面接スキル向上のための{" "}
              <span className="font-medium">参考情報</span>{" "}
              であり、<span className="font-medium">面接の合否や採用結果を保証するものではありません</span>
            </li>
            <li>
              フィードバック内容は AI
              の分析に基づくものであり、その正確性・完全性・有用性について保証するものではありません
            </li>
            <li>
              AI フィードバックは法的助言、キャリアカウンセリング、その他の専門的助言に該当するものではありません
            </li>
            <li>
              利用する AI
              モデルの更新・変更により、同じスクリプトに対するフィードバック内容が変わることがあります
            </li>
            <li>
              AI
              フィードバックに基づく行動によって生じた結果について、本サービスは一切の責任を負いません
            </li>
            <li>
              AI が生成するフィードバックには誤りや偏りが含まれる可能性があります。フィードバック内容を鵜呑みにせず、あくまで参考としてご活用ください
            </li>
          </ul>
        </section>

        {/* 第7条 AI生成コンテンツの権利帰属 */}
        <section id="ai-content-rights">
          <h2 className="text-xl font-semibold">第7条 AI生成コンテンツの権利帰属</h2>
          <p>
            本サービスが AI を用いて生成したフィードバック等のコンテンツについて、以下のとおり定めます。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              AI が生成したフィードバックは、ユーザーの面接スクリプトに基づき自動生成されたものであり、特定の著作者に帰属するものではありません
            </li>
            <li>
              ユーザーは、AI が生成したフィードバックを個人の学習・就職活動の目的で自由に利用・保存・共有できます
            </li>
            <li>
              AI が生成したフィードバックを商業目的で複製・再配布・販売することは禁止します
            </li>
            <li>
              本サービスは、AI 生成コンテンツの正確性・独自性・適法性について保証しません
            </li>
          </ul>
        </section>

        {/* 第8条 面接データの所有権 */}
        <section id="data-ownership">
          <h2 className="text-xl font-semibold">第8条 面接データの所有権</h2>
          <p>
            ユーザーがアップロードした面接音声スクリプトおよび関連データの所有権は、ユーザー本人に帰属します。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              本サービスは、フィードバック生成のためにユーザーの面接データを AI API
              に送信しますが、データの所有権を取得するものではありません
            </li>
            <li>
              ユーザーは、自身の面接データをいつでもダウンロード・削除する権利を有します
            </li>
            <li>
              本サービスは、統計・分析目的に限り、個人を特定できない形で匿名化したデータを利用することがあります。この場合、事前にユーザーの同意を取得します
            </li>
          </ul>
        </section>

        {/* 第9条 知的財産権 */}
        <section id="intellectual-property">
          <h2 className="text-xl font-semibold">第9条 知的財産権</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              本サービスの UI、デザイン、ロゴ、ソフトウェア、およびこれらに関連する知的財産権は、本サービスの運営者に帰属します
            </li>
            <li>
              AI が生成したフィードバックのコンテンツについては、ユーザーが個人の学習・就職活動目的で自由に利用できます
            </li>
            <li>
              ただし、フィードバック内容を商業目的で無断で複製・再配布することは禁止します
            </li>
          </ul>
        </section>

        {/* 第10条 データの取り扱い */}
        <section id="data-handling">
          <h2 className="text-xl font-semibold">第10条 データの取り扱い</h2>
          <p>
            個人情報を含むデータの取り扱いについては、別途定める{" "}
            <Link
              href="/legal/privacy"
              className="text-primary underline underline-offset-4"
            >
              プライバシーポリシー
            </Link>{" "}
            に従います。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              面接音声ファイルは、文字起こし処理のために AssemblyAI API に送信され、処理完了後に削除されます
            </li>
            <li>
              面接スクリプトは、フィードバック生成のために Anthropic Claude API
              に送信されます
            </li>
            <li>
              決済情報は Stripe, Inc.
              が管理し、本サービスのサーバーにはクレジットカード番号等は保存されません
            </li>
            <li>
              ユーザーデータは Supabase
              のクラウドデータベースに暗号化して保存されます
            </li>
          </ul>
        </section>

        {/* 第11条 アカウント削除時のデータ取り扱い */}
        <section id="account-deletion">
          <h2 className="text-xl font-semibold">第11条 アカウント削除時のデータ取り扱い</h2>
          <p>
            ユーザーがアカウントを削除した場合、以下のとおりデータを取り扱います。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">即時削除:</span>{" "}
              アカウント認証情報（メールアドレス・パスワードハッシュ）はアカウント削除と同時に無効化されます
            </li>
            <li>
              <span className="font-medium">30日以内に完全削除:</span>{" "}
              プロフィール情報、面接スクリプト、AI フィードバック、面接履歴等のユーザーデータは、アカウント削除から30日以内に完全に削除されます
            </li>
            <li>
              <span className="font-medium">復元不可:</span>{" "}
              削除されたデータの復元はできません。必要なデータは事前にエクスポートしてください
            </li>
            <li>
              <span className="font-medium">例外:</span>{" "}
              法令により保管が義務付けられている決済関連の記録は、法定期間経過後に削除します
            </li>
          </ul>
          <p className="mt-3">
            有料プラン利用中のアカウント削除については、第13条（解約・返金）も併せてご確認ください。
          </p>
        </section>

        {/* 第12条 サービスの変更・停止 */}
        <section id="service-change">
          <h2 className="text-xl font-semibold">第12条 サービスの変更・停止</h2>
          <p>
            本サービスは、以下の場合にサービスの全部または一部を変更・中断・停止・終了することがあります。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>システムの保守・点検・更新を行う場合</li>
            <li>天災、停電、通信障害等の不可抗力が生じた場合</li>
            <li>
              利用する外部サービス（AI API、決済サービス等）が停止した場合
            </li>
            <li>その他、運営が必要と判断した場合</li>
          </ul>
          <p className="mt-3">
            サービスを終了する場合は、原則として30日前までにアプリ内通知またはメールにてお知らせします。サービス終了時には、ユーザーが自身のデータをエクスポートできる期間を設けます。
          </p>
        </section>

        {/* 第13条 解約・返金 */}
        <section id="cancellation">
          <h2 className="text-xl font-semibold">第13条 解約・返金</h2>

          <h3 className="mt-4 text-base font-medium">13-1. 解約</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              無料プランのユーザーは、いつでもアカウントを削除することで解約できます
            </li>
            <li>
              Pro
              プランのユーザーは、設定画面からいつでも次回更新の停止（解約）が可能です
            </li>
            <li>
              解約後も、現在の請求期間の終了日まで Pro
              プランの機能を引き続きご利用いただけます
            </li>
          </ul>

          <h3 className="mt-4 text-base font-medium">13-2. 返金</h3>
          <p>
            月途中での解約の場合、日割りでの返金は行いません。ただし、サービスに重大な不具合が生じ、相当期間利用できなかった場合は、個別に対応を検討します。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>初回サブスクリプション開始から7日以内にサポートへご連絡いただいた場合、全額返金に対応します</li>
            <li>7日経過後の返金は原則として行いません</li>
            <li>返金のお手続きは support@menpass.jp までご連絡ください</li>
          </ul>
        </section>

        {/* 第14条 損害賠償の制限 */}
        <section id="liability">
          <h2 className="text-xl font-semibold">第14条 損害賠償の制限</h2>
          <p>
            本サービスの利用により生じた損害について、本サービスの運営者は以下の範囲で責任を負います。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              運営者の故意または重大な過失による場合を除き、間接損害、特別損害、逸失利益について責任を負いません
            </li>
            <li>
              損害賠償の上限額は、損害が発生した月にユーザーが支払った利用料金の1か月分を上限とします
            </li>
            <li>
              無料プランのユーザーについては、運営者の故意または重大な過失がある場合を除き、損害賠償責任を負いません
            </li>
          </ul>
        </section>

        {/* 第15条 準拠法・管轄裁判所 */}
        <section id="governing-law">
          <h2 className="text-xl font-semibold">第15条 準拠法・管轄裁判所</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>本規約の解釈および適用は、日本法に準拠するものとします</li>
            <li>
              本サービスに関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします
            </li>
          </ul>
        </section>

        {/* 附則 */}
        <section id="supplementary">
          <h2 className="text-xl font-semibold">附則</h2>

          <h3 className="mt-4 text-base font-medium">規約の改定</h3>
          <p>
            本規約は、法令の変更、サービス内容の変更、その他の事由により改定することがあります。重要な変更がある場合は、改定の30日前までにアプリ内通知またはメールにてお知らせします。改定後も本サービスを継続して利用した場合、改定後の規約に同意したものとみなします。
          </p>

          <h3 className="mt-4 text-base font-medium">施行日</h3>
          <p>本規約は、2026年3月1日より施行します。</p>

          <h3 className="mt-4 text-base font-medium">お問い合わせ</h3>
          <div className="mt-2 rounded-lg border bg-muted/40 p-4">
            <p className="font-medium">Menpass 運営事務局</p>
            <p className="mt-1">
              メール:{" "}
              <a
                href="mailto:support@menpass.jp"
                className="text-primary underline underline-offset-4"
              >
                support@menpass.jp
              </a>
            </p>
          </div>
        </section>
      </div>

      {/* フッターリンク */}
      <div className="mt-16 border-t pt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/"
          className="text-primary underline-offset-4 hover:underline"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
