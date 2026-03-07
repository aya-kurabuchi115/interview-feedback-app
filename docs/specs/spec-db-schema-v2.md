# DBスキーマ最新版 仕様書
> Status: Approved
> Last Updated: 2026-03-07

## 概要
InterviewCoach の Supabase PostgreSQL スキーマ。12回のマイグレーションを経た最新のテーブル定義、ENUM型、RLS ポリシー、インデックスの全体像。

## マイグレーション履歴

| # | ファイル | 概要 |
|---|---------|------|
| 00001 | initial_schema | interviews, transcripts, feedbacks, Storage |
| 00002 | schema_extension | profiles, companies, subscriptions, ENUM型, interviews/feedbacks拡張 |
| 00003 | security_fixes | subscriptions の書き込みポリシー削除, interviews ステータス制限 |
| 00004 | onboarding | profiles.onboarding_completed 追加 |
| 00005 | tags_and_notes | tags, interview_tags, interviews.notes 追加 |
| 00006 | shared_results | shared_results テーブル追加 |
| 00007 | annotations | feedbacks.annotations JSONB 追加 |
| 00008 | mock_interviews | mock_interviews テーブル追加 |
| 00009 | personality_type | profiles.personality_type 追加 |
| 00010 | es_reviews | es_reviews テーブル追加 |
| 00011 | interview_archive_delete | interviews.archived_at, deleted_at 追加 |
| 00012 | contact_requests | contact_requests テーブル追加 |

## ENUM型

### interview_category
`arubaito` / `intern` / `new_grad` / `other`

### interview_round
`first` / `second` / `third` / `final` / `gd` / `case` / `other`

### subscription_plan
`free` / `pro` / `enterprise` (※ `premium` はアプリ層で追加運用)

### subscription_status
`active` / `canceled` / `past_due` / `unpaid` / `trialing` / `incomplete` / `incomplete_expired` / `paused`

### job_hunting_status
`not_started` / `preparing` / `active` / `offered` / `decided` / `other`

## テーブル定義

### interviews
| カラム | 型 | 備考 |
|--------|-----|------|
| id | UUID PK | |
| user_id | UUID FK(auth.users) | NOT NULL, CASCADE |
| title | TEXT | NOT NULL |
| audio_url | TEXT | nullable |
| duration_seconds | INT | nullable |
| status | TEXT | uploaded/transcribing/analyzing/completed/error |
| company_id | UUID FK(companies) | SET NULL |
| company_name_snapshot | TEXT | NOT NULL DEFAULT '' |
| interview_category | interview_category | DEFAULT 'other' |
| interview_round | interview_round | nullable |
| interview_date | DATE | nullable |
| transcript | TEXT | 最大50,000文字 |
| transcript_char_count | INT | DEFAULT 0 |
| notes | TEXT | nullable |
| archived_at | TIMESTAMPTZ | nullable |
| deleted_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL, トリガー自動更新 |

### feedbacks
| カラム | 型 | 備考 |
|--------|-----|------|
| id | UUID PK | |
| interview_id | UUID FK(interviews) | CASCADE |
| user_id | UUID FK(auth.users) | CASCADE, nullable |
| overall_score | INT | 0-100 |
| summary | TEXT | NOT NULL |
| good_points | JSONB | DEFAULT '[]' |
| improvement_points | JSONB | DEFAULT '[]' |
| overall_comment | TEXT | nullable |
| category_scores | JSONB | DEFAULT '{}' |
| filler_words | JSONB | DEFAULT '[]' |
| suggestions | JSONB | DEFAULT '[]' |
| strengths | JSONB | DEFAULT '[]' |
| improvements | JSONB | DEFAULT '[]' |
| annotations | JSONB | DEFAULT '[]' |
| raw_response | JSONB | nullable |
| model_version | TEXT | nullable |
| created_at | TIMESTAMPTZ | NOT NULL |

### profiles
| カラム | 型 | 備考 |
|--------|-----|------|
| id | UUID PK | |
| user_id | UUID FK UNIQUE | NOT NULL, CASCADE |
| display_name | TEXT | nullable |
| university, faculty | TEXT | nullable |
| graduation_year | INT | nullable |
| graduation_month | INT | 1-12 |
| target_industry | TEXT[] | DEFAULT '{}' |
| target_job_type | TEXT[] | DEFAULT '{}' |
| job_hunting_status | job_hunting_status | DEFAULT 'not_started' |
| job_hunting_start_date | DATE | nullable |
| preferred_work_location | TEXT[] | DEFAULT '{}' |
| onboarding_completed | BOOLEAN | DEFAULT FALSE |
| personality_type | TEXT | 16タイプ CHECK制約 |
| created_at, updated_at | TIMESTAMPTZ | トリガー自動更新 |

### subscriptions
| カラム | 型 | 備考 |
|--------|-----|------|
| id | UUID PK | |
| user_id | UUID FK UNIQUE | NOT NULL, CASCADE |
| stripe_customer_id | TEXT | nullable |
| stripe_subscription_id | TEXT | nullable |
| plan | subscription_plan | DEFAULT 'free' |
| status | subscription_status | DEFAULT 'active' |
| current_period_start/end | TIMESTAMPTZ | nullable |
| cancel_at, canceled_at | TIMESTAMPTZ | nullable |
| created_at, updated_at | TIMESTAMPTZ | トリガー自動更新 |

### mock_interviews
| カラム | 型 | 備考 |
|--------|-----|------|
| id | UUID PK | |
| user_id | UUID FK | NOT NULL, CASCADE |
| company_name | TEXT | nullable |
| industry | TEXT | nullable |
| category | TEXT | DEFAULT 'general' |
| round | TEXT | DEFAULT 'first' |
| duration_minutes | INT | DEFAULT 15 (実質max_questions) |
| difficulty | TEXT | DEFAULT 'normal' |
| messages | JSONB | DEFAULT '[]' |
| status | TEXT | DEFAULT 'in_progress' |
| total_questions | INT | DEFAULT 0 |
| started_at | TIMESTAMPTZ | DEFAULT now() |
| completed_at | TIMESTAMPTZ | nullable |
| feedback_id | UUID FK(feedbacks) | SET NULL |
| created_at | TIMESTAMPTZ | |

### es_reviews
| カラム | 型 | 備考 |
|--------|-----|------|
| id | UUID PK | |
| user_id | UUID FK | NOT NULL, CASCADE |
| question | TEXT | NOT NULL |
| answer | TEXT | NOT NULL |
| char_count | INT | DEFAULT 0 |
| feedback | JSONB | nullable |
| score | INT | 0-100, nullable |
| status | TEXT | pending/analyzing/completed/error |
| model_version | TEXT | nullable |
| created_at, updated_at | TIMESTAMPTZ | トリガー自動更新 |

### その他テーブル
- **transcripts**: interview_id FK, speaker(interviewer/interviewee), content, start_time, end_time
- **companies**: name, industry, normalized_name (UNIQUE)
- **tags**: user_id FK, name (UNIQUE per user), color
- **interview_tags**: interview_id + tag_id 複合PK
- **shared_results**: interview_id FK, share_token (UNIQUE), is_active, expires_at
- **contact_requests**: user_id FK(SET NULL), name, email, category, message, status

## RLS ポリシー一覧

| テーブル | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| interviews | user_id | user_id | user_id (status制限あり) | user_id |
| feedbacks | user_id or interview所有者 | user_id or interview所有者 | 同左 | 同左 |
| profiles | user_id | user_id | user_id | user_id |
| subscriptions | user_id | service_role のみ | service_role のみ | service_role のみ |
| mock_interviews | user_id (FOR ALL) | 同左 | 同左 | 同左 |
| es_reviews | user_id | user_id | user_id | user_id |
| companies | authenticated | authenticated | service_role | service_role |
| tags | user_id | user_id | user_id | user_id |
| interview_tags | interview所有者 | interview所有者 | - | interview所有者 |
| shared_results | user_id or トークン公開 | user_id | user_id | user_id |
| contact_requests | user_id | 全員(true) | - | - |

## インデックス
- interviews: (user_id, interview_date), (user_id, company_id), (deleted_at), (archived_at), (user_id, deleted_at)
- feedbacks: (user_id), (interview_id)
- subscriptions: (stripe_customer_id), (stripe_subscription_id)
- mock_interviews: (user_id), (status)
- es_reviews: (user_id), (created_at DESC), (user_id, created_at DESC)
- tags: (user_id)
- interview_tags: (interview_id), (tag_id)
- shared_results: (share_token UNIQUE), (interview_id, user_id)

## トリガー
- `handle_updated_at()`: profiles, interviews, subscriptions の updated_at を自動更新
- `update_es_reviews_updated_at()`: es_reviews の updated_at を自動更新
