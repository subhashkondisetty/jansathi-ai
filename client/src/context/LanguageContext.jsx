/**
 * @fileoverview Multilingual UI localization context supporting English, Telugu,
 * Hindi, and Tamil with native script rendering and profile synchronization.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { tokenStorage } from '../utils/tokenStorage.js';

const translations = {
  en: {
    // Brand & General
    brand_title: 'JanSathi AI',
    brand_tagline: 'Government Information Assistant',
    brand_theme: 'Civic Pulse',
    non_ai_notice: 'Non-AI Foundation Active',

    // Navigation
    nav_assistant: 'Assistant',
    nav_eligibility: 'Eligibility',
    nav_explainer: 'Explainer',
    nav_verify: 'Verify Claim',
    nav_documents: 'Documents',
    nav_upload: 'Upload',
    nav_admin: 'Admin',
    sign_in: 'Sign In',
    register: 'Register',
    sign_out: 'Sign Out',
    my_profile: 'Profile',
    citizen: 'Citizen',

    // Hero Section
    hero_badge: "FORGE '26 • Theme 1: Civic Pulse • National Civic Assistant",
    hero_title_prefix: 'Empowering Every Citizen with ',
    hero_title_highlight: 'Verified Public Information',
    hero_subtitle:
      'JanSathi AI bridges the gap between Indian citizens and government welfare schemes, gazette notifications, and civic rights — built on an honest, verifiable MERN foundation.',
    search_placeholder: 'Search official gazettes, schemes, or circulars...',
    search_btn: 'Search',
    nav_examples: 'Navigation examples:',
    nav_examples_hint: '(Click to filter catalog)',
    explore_catalog: 'Explore Document Catalog',
    view_profile: 'View Profile',
    register_citizen: 'Register as Citizen',
    citizen_sign_in: 'Citizen Sign In',

    // Topic Pills
    topic_agriculture: 'Agriculture & Farming',
    topic_healthcare: 'Healthcare & Wellness',
    topic_education: 'Education & Scholarships',
    topic_pension: 'Social Security & Pensions',
    topic_employment: 'Labor & Employment',
    topic_gazettes: 'Gazettes & Circulars',

    // Trust Badges
    trust_non_ai: 'Non-AI Foundation (Zero fake outputs)',
    trust_pipeline: 'Curated Official Source Pipeline',
    trust_indic: 'Indic & Multilingual Typography',
    trust_security: 'Role-Based Authentication Security',

    // AI Disclosure
    ai_disclosure_title: 'Architectural Integrity: Why AI Endpoints Return HTTP 501',
    ai_disclosure_body:
      'Because government schemes directly affect citizen livelihoods, JanSathi AI strictly refuses to produce synthetic or hallucinated AI advice. Conversational and generative endpoints (/api/ai/*) are deliberately locked with authenticated 501 NOT_IMPLEMENTED until full document ingestion, OCR parsing, and verified citation pipelines are satisfied.',
    inspect_ai_status: 'Inspect AI Hook Status →',

    // Service Modules
    modules_heading: 'Citizen Service Modules',
    modules_subheading: 'Explore available platform capabilities and scheduled roadmap milestones',
    module_count: '6 Civic Modules',

    mod_assistant_title: 'Civic Assistant',
    mod_assistant_desc:
      'Conversational guidance answering citizen inquiries with direct citations to government gazettes.',
    mod_assistant_badge: 'AI Architecture (501)',

    mod_eligibility_title: 'Eligibility Evaluator',
    mod_eligibility_desc:
      'Deterministic evaluation matching citizen criteria against verified statutory scheme rules.',
    mod_eligibility_badge: 'AI Architecture (501)',

    mod_explainer_title: 'Document Explainer',
    mod_explainer_desc:
      'Demystifies legal gazette notifications and administrative circulars into plain citizen language.',
    mod_explainer_badge: 'AI Architecture (501)',

    mod_verify_title: 'Claim Verification',
    mod_verify_desc:
      'Cross-checks public notices and viral claims against official government press releases and gazettes.',
    mod_verify_badge: 'AI Architecture (501)',

    mod_documents_title: 'Official Document Library',
    mod_documents_desc:
      'Full-text retrieval across ingested government policies with issuing department and metadata filters.',
    mod_documents_badge: 'Catalog Ready',

    mod_upload_title: 'Citizen PDF Upload',
    mod_upload_desc:
      'Upload gazettes and circulars with SHA-256 deduplication, magic-byte checks, and granular access.',
    mod_upload_badge: 'Storage Ready',

    // Pipeline
    pipeline_heading: 'How JanSathi Processes Civic Information',
    pipeline_subheading:
      'Our multi-stage verification architecture clearly delineates active backend services from upcoming capabilities',
    stage1_title: 'Source Curation & Ingestion',
    stage1_status: 'Implemented in Phase 5 & 6',
    stage1_desc:
      'Connects to curated official source URLs with SSRF protection, SHA-256 deduplication, and %PDF- magic-byte validation.',
    stage2_title: 'Text Normalization & Chunking',
    stage2_status: 'Implemented in Phase 6',
    stage2_desc:
      'Unicode NFC normalization preserving Indic scripts, Latin de-hyphenation, and deterministic sentence chunking with overlap.',
    stage3_title: 'Document Library & Search',
    stage3_status: 'Scheduled for Phase 9',
    stage3_desc:
      'Keyword indexing and faceted search allowing citizens to browse and filter official notifications by department and state.',
    stage4_title: 'Citation-Grounded AI Guidance',
    stage4_status: 'Scheduled for Phase 10',
    stage4_desc:
      'Conversational synthesis with strict paragraph citations. Deliberately returns HTTP 501 until full safety guardrails are live.',

    // FAQ
    faq_heading: 'Frequently Asked Questions',
    faq_subheading:
      'Answers to common questions regarding architecture, privacy, and roadmap features',
    faq1_q: 'Why do AI features currently return HTTP 501 Not Implemented?',
    faq1_a:
      'This is an intentional architectural safeguard. In civic welfare, generating ungrounded or hallucinated scheme details can mislead citizens. All conversational and generative endpoints deliberately return HTTP 501 until data ingestion, document indexing, and verifiable citation pipelines are fully established.',
    faq2_q: 'How does the platform ensure uploaded documents are legitimate?',
    faq2_a:
      'The server verifies uploaded files using binary magic bytes (%PDF-), computes SHA-256 cryptographic hashes to eliminate duplicate uploads, and uses an isolated text extraction pipeline.',
    faq3_q: 'Are the topic pills live government schemes?',
    faq3_a:
      'No. The topic pills are search navigation examples to help you explore civic domains (such as agriculture, health, or education). They do not represent live scheme recommendations, pre-approved benefits, or official application filings.',
    faq4_q: 'Is my personal citizen profile data kept private?',
    faq4_a:
      'Yes. Profile information is stored securely in an authenticated database, protected by bcrypt password hashing and JWT access controls. Demographic fields (state, category, occupation) are used solely for relevant eligibility evaluation.',

    // CTA
    cta_title: 'Ready to Explore Verified Public Information?',
    cta_desc:
      'Access indexed civic documents, configure citizen demographic preferences, or test authenticated administrative features.',
    cta_browse: 'Browse Documents',
    cta_register: 'Register Account',

    // Phase 9 — Documents & Uploads
    doc_library_title: 'Official Document Library',
    doc_library_subtitle:
      'Search and explore verified government notifications, statutory schemes, circulars, and private citizen uploads.',
    doc_scope_public: 'Official Public Library',
    doc_scope_mine: 'My Uploaded Documents',
    doc_search_placeholder: 'Search by document title or issuing ministry...',
    doc_search_btn: 'Search',
    doc_upload_btn: 'Upload Document',
    doc_refresh_btn: 'Refresh',
    doc_filter_category: 'Category',
    doc_filter_all_categories: 'All Categories',
    doc_filter_doctype: 'Document Type',
    doc_filter_all_types: 'All Types',
    doc_filter_language: 'Language',
    doc_filter_all_languages: 'All Languages',
    doc_filter_status: 'Processing Status',
    doc_filter_all_statuses: 'All Statuses',
    doc_filter_sort: 'Sort Order',
    doc_sort_newest: 'Newest First',
    doc_sort_oldest: 'Oldest First',
    doc_sort_title_asc: 'Title (A–Z)',
    doc_sort_title_desc: 'Title (Z–A)',
    doc_sort_published: 'Publication Date',
    doc_reset_filters: 'Reset Filters',
    doc_open_reader: 'Open Reader',
    doc_pages_count: 'pages',
    doc_chunks_count: 'chunks',
    doc_no_matching: 'No matching documents found',
    doc_no_matching_desc: 'Try modifying your search terms or clearing selected category filters.',
    doc_empty_personal: 'No uploaded documents yet',
    doc_empty_personal_desc:
      'Upload personal scheme notices or gazettes to begin private text extraction.',
    doc_empty_library: 'No official documents available',
    doc_empty_library_desc:
      'The official document library is currently empty. Check back as new official sources are crawled.',
    doc_prev_page: 'Previous',
    doc_next_page: 'Next',
    doc_page_of: 'of',
    doc_showing: 'Showing',

    // Status Badges
    status_ready: 'Ready',
    status_processing: 'Processing',
    status_pending: 'Queued',
    status_needs_ocr: 'Needs OCR',
    status_failed: 'Failed',

    // Document Reader
    reader_back_to_library: 'Document Library',
    reader_official_portal: 'Official Source Portal',
    reader_delete_btn: 'Delete Document',
    reader_refresh_status: 'Refresh Status',
    reader_extracted_text: 'Extracted Text Content',
    reader_integrity_title: 'Document Integrity & Provenance',
    reader_integrity_subtitle: 'Recorded storage parameters and cryptographic checksum',
    reader_recorded_sha256: 'Recorded SHA-256 Checksum',
    reader_checksum_desc:
      'Calculated by the backend upload service at file ingestion to detect duplicates and prevent uncorrupted storage.',
    reader_checksum_copied: 'Checksum copied to clipboard',
    reader_file_type: 'File Type',
    reader_file_size: 'File Size',
    reader_scope: 'Access Scope',
    reader_uploaded_date: 'Uploaded Date',
    reader_last_modified: 'Last Modified',
    reader_empty_text: 'No extracted text pages available.',
    reader_ai_callout_title: 'Looking for AI Simplification or Scheme Rules?',
    reader_ai_callout_desc:
      'Conversational Document Explainer and statutory eligibility reasoning will connect directly to this document in Phase 10.',
    reader_ai_callout_btn: 'View Explainer (501)',
    delete_modal_title: 'Delete Uploaded Document?',
    delete_modal_desc:
      'Are you sure you want to delete this document? This will permanently remove the stored PDF, extracted pages, and associated search chunks. This action cannot be undone.',
    delete_modal_confirm: 'Confirm Delete',
    delete_modal_cancel: 'Cancel',
    delete_modal_deleting: 'Deleting...',

    // Upload Page
    upload_page_title: 'Upload Citizen Document',
    upload_page_subtitle:
      'Submit official notifications, gazette clippings, or welfare guidelines for private text extraction and personal indexing.',
    upload_select_pdf: 'Select PDF Document',
    upload_click_browse: 'Click to browse',
    upload_drag_drop: 'or drag and drop a PDF here',
    upload_pdf_only_hint: 'PDF format only • Maximum allowable size:',
    upload_meta_title: 'Document Metadata (Optional)',
    upload_meta_title_label: 'Document Title',
    upload_meta_title_placeholder: 'Leave empty to auto-extract from file name',
    upload_meta_category: 'Category',
    upload_meta_doctype: 'Document Type',
    upload_meta_language: 'Document Language',
    upload_meta_auto_detect: 'Auto-detect from text',
    upload_meta_published: 'Publication Date',
    upload_meta_authority: 'Issuing Authority',
    upload_meta_source: 'Source URL',
    upload_submit_btn: 'Upload & Queue Ingestion',
    upload_uploading_btn: 'Uploading',
    upload_cancel_btn: 'Cancel',
    upload_success_queued_title: 'Upload Accepted & Queued for Ingestion',
    upload_success_duplicate_title: 'Identical Document Recognized (Duplicate)',
    upload_success_open_reader: 'Open in Document Reader',
    upload_success_another: 'Upload Another Document',
    upload_specs_title: 'Upload Specifications',
    upload_specs_subtitle: 'Rules enforced by backend upload security pipeline',

    // Phase 10: AI Citizen Pages & HTTP 501 Disclosures
    ai_not_implemented_badge: 'Non-AI Foundation',
    ai_service_unavailable_title: 'AI Endpoint Not Available (HTTP 501)',
    probe_ai_status_btn: 'Check Backend AI Hook',
    citizen_submitted_inquiry: 'Citizen Submission Received:',
    ai_safeguard_explanation:
      'Generative synthesis and automated decision-making are intentionally unavailable (HTTP 501 NOT_IMPLEMENTED). Civic welfare guidance requires verification against official statutory gazettes rather than unverified model outputs.',
    ai_safeguard_backend_lock:
      'The backend endpoint is deliberately not implemented. Ingestion, OCR parsing, and citation pipelines are under active development and have not been connected to generative models.',
    planned_capabilities_heading: 'Planned Architecture Capabilities (Not Currently Operational)',
    probe_status_note:
      'Live probe confirms the endpoint is not connected (connected: false). No model inference is currently active.',
    ai_not_implemented_toast: 'AI service endpoint is scheduled for future integration.',

    // Assistant Page
    assistant_page_title: 'Civic AI Assistant',
    assistant_page_subtitle:
      'Multilingual conversational assistant providing accurate guidance on Indian government schemes, citizen benefits, and public services.',
    assistant_grounding_title: 'Grounded Civic Architecture',
    assistant_grounding_desc:
      'This assistant is designed to answer questions strictly using verified official gazettes and statutory policies. To prevent false welfare promises, conversational synthesis is kept inactive until full citation pipelines are online.',
    assistant_form_title: 'Ask a Civic Question',
    assistant_form_subtitle:
      'Enter your inquiry regarding welfare policies, gazettes, or eligibility criteria.',
    assistant_question_label: 'Your Question / Inquiry',
    assistant_placeholder:
      'e.g. What are the income limits and documentation required for PM-Kisan Samman Nidhi?',
    assistant_min_chars_note: 'Minimum 3 characters',
    assistant_min_chars_error: 'Please enter a question with at least 3 characters.',
    assistant_max_chars_error: 'Question cannot exceed 1000 characters.',
    btn_reset: 'Reset Form',
    assistant_submitting: 'Submitting Inquiry...',
    assistant_submit_btn: 'Submit Inquiry',
    assistant_unavailable_desc:
      'To ensure zero hallucinations in civic welfare delivery, conversational question-answering is locked until our sovereign RAG pipeline and verified citation engine are connected.',
    plan_feat_rag: 'Conversational RAG pipeline indexed over verified Indian government gazettes',
    plan_feat_citation:
      'Official statutory citations with exact gazette notification and page numbers',
    plan_feat_voice: 'Indic language speech input and voice synthesis powered by Bhashini',
    plan_feat_guardrails:
      'Strict guardrails preventing hallucinated welfare schemes or fake benefits',
    assistant_examples_title: 'Illustrative Sample Inquiries (UI Interaction Examples)',
    assistant_examples_disclaimer:
      'These queries are provided solely for interface demonstration and do not represent official scheme rules, verified facts, or government advice.',
    example_q1: 'What are the eligibility criteria for the PM Awas Yojana rural housing grant?',
    example_q2: 'Which documents are required for state disability pension enrollment?',
    example_q3: 'How can a small farmer apply for subsidized drip irrigation under PMKSY?',
    example_q4: 'What is the minimum landholding required for central fertilizer subsidy?',

    // Eligibility Page
    eligibility_page_title: 'Scheme Eligibility Evaluator',
    eligibility_page_subtitle:
      'Deterministic & AI-assisted eligibility verification matching citizen demographic criteria against official scheme rules.',
    eligibility_notice_title: 'Statutory Eligibility Verification Notice',
    eligibility_notice_desc:
      'Official scheme eligibility is governed by gazette notification criteria. To prevent wrongful denials or misleading expectations, automated matching is not enabled until verified deterministic evaluation tables are loaded.',
    eligibility_form_title: 'Enter Scheme & Applicant Criteria',
    eligibility_form_subtitle:
      'Provide the target scheme name and demographic parameters to check against official qualifications.',
    eligibility_scheme_label: 'Target Scheme or Benefit Program',
    eligibility_scheme_placeholder:
      'e.g. PM Kisan Samman Nidhi, Post-Matric Scholarship, Ayushman Bharat',
    eligibility_min_query_error:
      'Please specify a target scheme or benefit with at least 3 characters.',
    eligibility_state_label: 'State of Residence',
    select_state_placeholder: 'All India / Not Specified',
    eligibility_district_label: 'District (Optional)',
    eligibility_district_placeholder: 'e.g. Warangal, Patna, Pune',
    eligibility_category_label: 'Citizen / Beneficiary Category',
    select_category_placeholder: 'Select Citizen Category',
    eligibility_education_label: 'Education Level',
    select_education_placeholder: 'Select Education Level',
    eligibility_income_label: 'Annual Family Income Range',
    select_income_placeholder: 'Select Income Range',
    eligibility_occupation_label: 'Course or Specific Occupation',
    eligibility_occupation_placeholder: 'e.g. Small Farmer, B.Tech 2nd Year, Handloom Weaver',
    eligibility_social_label: 'Social Category (Optional)',
    eligibility_social_placeholder: 'e.g. General, OBC, SC, ST, EWS',
    eligibility_privacy_note:
      'Demographic fields are sent as parameters to POST /api/ai/eligibility solely for criteria matching. Because this endpoint currently returns HTTP 501, no eligibility assessment is evaluated or stored.',
    eligibility_evaluating: 'Evaluating Criteria...',
    eligibility_submit_btn: 'Evaluate Eligibility',
    eligibility_unavailable_desc:
      'To prevent wrongful denial of public benefits, automated eligibility evaluation is intentionally disabled until statutory rule engines and deterministic policy criteria are verified against gazettes.',
    plan_feat_matching:
      'Automated criteria matching against citizen profile (state, category, income, occupation)',
    plan_feat_checklist:
      'Checklist of statutory documentation required before visiting government offices',
    plan_feat_portals: 'Direct links to official application portals and offline nodal officers',
    plan_feat_breakdown:
      'Transparent breakdown of passing and failing qualification criteria (zero black-box AI)',
    eligibility_criteria_guide_title: 'Statutory Eligibility Verification Architecture',
    eligibility_criteria_guide_desc:
      'When activated, JanSathi AI uses a hybrid deterministic rule engine. First, deterministic filters evaluate hard statutory thresholds (age, income ceiling, state domicile). Second, citation models verify documentation checklists directly from the gazette order.',
    criteria_step1_title: 'Deterministic Filter',
    criteria_step1_desc: 'Exact threshold checks for income, state domicile, and age.',
    criteria_step2_title: 'Gazette Verification',
    criteria_step2_desc: 'Cross-referenced against verified notification text in the repository.',
    criteria_step3_title: 'Zero Fabrication',
    criteria_step3_desc: 'If a rule is ambiguous, the system flags it for officer consultation.',

    // Explainer Page
    explainer_page_title: 'Civic Document Explainer',
    explainer_page_subtitle:
      'Simplifies complex gazette notifications, government orders (G.O.s), and legal circulars into clear citizen summaries.',
    explainer_grounding_title: 'Document Grounding & Verification Notice',
    explainer_grounding_desc:
      'The Document Explainer operates on authentic gazettes stored in the official repository. You can read the verified extracted text below. AI summarization is deliberately locked with HTTP 501 until full citation and validation models are connected.',
    explainer_doc_fetch_error: 'Failed to load document',
    loading_document: 'Loading authentic document...',
    browse_catalog_btn: 'Browse Available Documents Catalog',
    untitled_document: 'Untitled Document',
    official_authority: 'Government of India',
    view_full_reader: 'Full Reader',
    request_summary_title: 'AI Document Simplification',
    request_summary_desc:
      'Sends document context to POST /api/ai/ask for structured citizen takeaways.',
    explaining_btn: 'Requesting Explanation...',
    explain_document_btn: 'Request AI Explanation',
    explainer_unavailable_desc:
      'Document explanation requires sovereign LLM summarization over parsed OCR tokens. This endpoint is intentionally locked with HTTP 501 NOT_IMPLEMENTED until verified citation extraction is completed.',
    plan_feat_plain_lang: 'Plain-language simplification without legalistic jargon',
    plan_feat_takeaways: 'Key citizen takeaways: who is affected, what changes, and next steps',
    plan_feat_multilingual_synth: 'Multilingual synthesis into English, Hindi, Telugu, and Tamil',
    plan_feat_side_by_side: 'Side-by-side view with original gazette text and page highlights',
    extracted_text_heading: 'Authentic Extracted Text (From Repository)',
    extracted_text_subheading: 'Direct OCR text stored in database from verified PDF processing.',
    page_label: 'Page',
    no_page_text: 'No text extracted on this page.',
    no_pages_preview: 'No page text preview available for this document.',
    explainer_select_title: 'Select a Civic Document to Explain',
    explainer_select_subtitle:
      'Choose an official gazette notification, circular, or scheme order from the repository.',
    explainer_select_desc:
      'To explain a document, browse the verified document library and click "Explain Document" on any policy or circular. You will be able to inspect both the raw text and the scheduled AI simplification.',
    explainer_capabilities_title: 'Document Explainer Features',
    explainer_feat1_desc:
      'Translates complex administrative orders into understandable civic guidance.',
    explainer_feat2_desc:
      'Clear action steps, deadlines, and requirements highlighted for citizens.',
    explainer_feat3_desc: 'Accessible across regional languages with accurate civic terminology.',
    explainer_feat4_desc:
      'Verify every summary bullet directly against the authentic gazette page.',

    // Verify Page
    verify_page_title: 'Government Claim & Fact Verification',
    verify_page_subtitle:
      'Cross-references viral messages, social media claims, and circulars against verified government sources to curb civic misinformation.',
    verify_grounding_title: 'Anti-Misinformation Guardrails',
    verify_grounding_desc:
      'To eliminate rumors responsibly, JanSathi AI refuses to issue automated "True" or "False" verdicts without cryptographic gazette citations and Press Information Bureau (PIB) verification. The verification pipeline returns HTTP 501 until full source cross-referencing is ready.',
    verify_form_title: 'Submit Claim or Viral Circular',
    verify_form_subtitle:
      'Paste a message, policy rumor, or news excerpt to evaluate against official gazette publications.',
    verify_claim_label: 'Claim / Rumor / Public Notice Text',
    verify_placeholder:
      'e.g. Government is distributing free solar pumps without any electricity connection charges under PM-KUSUM Component B...',
    verify_min_chars_note: 'Minimum 10 characters required',
    verify_min_chars_error: 'Please enter a claim with at least 10 characters.',
    verify_max_chars_error: 'Claim text cannot exceed 2000 characters.',
    verify_submitting: 'Cross-Referencing Sources...',
    verify_submit_btn: 'Verify Claim Against Sources',
    verify_unavailable_desc:
      'To prevent false fact-checking or inaccurate verdicts, the claim verification engine is intentionally locked with HTTP 501 NOT_IMPLEMENTED until official PIB Fact Check feeds and gazette semantic indexing are connected.',
    plan_feat_semantic:
      'Automated semantic comparison against official gazettes and PIB Fact Check feeds',
    plan_feat_verdict:
      'Transparent verdict: Confirmed Official, Debunked Misinformation, or Unverified',
    plan_feat_debunk_refs:
      'Official debunking references, press releases, and statutory gazette links',
    plan_feat_shareable:
      'Citizen shareable card with verifiable citations to combat WhatsApp rumors',
    verify_examples_title: 'Illustrative Sample Claims (Hypothetical UI Examples)',
    verify_examples_disclaimer:
      'These statements are hypothetical examples provided solely for interface testing. They are NOT actual government announcements, verified facts, or official circulars.',
    verify_ex1:
      'Viral message claims central government is offering Rs 5,000 monthly allowance to all unemployed youth.',
    verify_ex2:
      'Notice circulating online states Aadhaar linkage is mandatory for state pension withdrawal by tomorrow.',
    verify_ex3:
      'Message claims all farmer crop loans up to Rs 2 lakh have been waived unconditionally across India.',
    verify_ex4:
      'Social post asserts new gazette has made Ayushman Bharat coverage universal without income ceilings.',

    // Admin Navigation & Shell
    admin_portal_title: 'Civic Admin Console',
    admin_nav_overview: 'Overview',
    admin_nav_documents: 'Documents',
    admin_nav_jobs: 'Ingestion Jobs',
    admin_nav_sources: 'Official Sources',
    admin_nav_users: 'Users',
    admin_nav_analytics: 'Analytics',
    admin_nav_system: 'System Status',
    admin_return_citizen: 'Return to Citizen Portal',
    admin_sign_out: 'Sign Out',
    admin_badge_live: 'Live Production',
    admin_badge_active: 'Verified Active',
    admin_refresh: 'Refresh',
    admin_refreshing: 'Refreshing...',

    // Admin Dashboard
    admin_dashboard_title: 'Administrative Control Center',
    admin_dashboard_desc:
      'System-wide governance, crawler ingestion pipeline monitoring, and civic document verification.',
    admin_total_documents: 'Total Ingested Documents',
    admin_total_docs_sub: 'Complete database corpus (scope=all)',
    admin_ready_documents: 'Public Ready Documents',
    admin_ready_docs_sub: 'Indexed and queryable by citizens',
    admin_pending_documents: 'Pending & Processing',
    admin_pending_docs_sub: 'In text extraction or validation pipeline',
    admin_failed_documents: 'Failed & Needs OCR',
    admin_failed_docs_sub: 'Extraction failures or scanned PDFs',
    admin_ingestion_jobs_total: 'Ingestion Jobs Executed',
    admin_jobs_sub: 'Crawler and document ingestion tasks',
    admin_active_sources: 'Configured Official Sources',
    admin_sources_sub: 'Government ministries and gazette portals',
    admin_citizen_accounts: 'Citizen Accounts',
    admin_users_sub: 'User management API unavailable',
    admin_recent_jobs: 'Recent Ingestion Jobs',
    admin_recent_jobs_desc: 'Latest automated crawler and batch ingestion executions.',
    admin_recent_docs: 'Recent Documents',
    admin_recent_docs_desc: 'Recently uploaded and crawler-indexed civic documents.',
    admin_view_all_jobs: 'View All Jobs',
    admin_view_all_docs: 'View All Documents',

    // Admin Documents
    admin_docs_title: 'Civic Document Editorial Review',
    admin_docs_desc:
      'Audit, update metadata, verify extraction status, and manage official and citizen-uploaded documents.',
    admin_docs_count: 'documents in corpus',
    admin_search_docs_ph: 'Search documents by title, description, or authority...',
    admin_all_status: 'All Statuses',
    admin_all_categories: 'All Categories',
    admin_all_types: 'All Types',
    admin_col_title: 'Document Title',
    admin_col_category: 'Category',
    admin_col_type: 'Doc Type',
    admin_col_status: 'Status',
    admin_col_pages: 'Pages',
    admin_col_date: 'Uploaded',
    admin_col_actions: 'Actions',
    admin_edit_metadata: 'Edit Metadata',
    admin_inspect_doc: 'Inspect Details',
    admin_delete_doc: 'Delete Document',

    // Admin Jobs
    admin_jobs_title: 'Ingestion Queue & Pipeline Monitor',
    admin_jobs_desc:
      'Track background crawler runs, document parsing jobs, error traces, and retry failed operations.',
    admin_col_job_id: 'Job ID',
    admin_col_job_type: 'Type',
    admin_col_source: 'Source / Document',
    admin_col_job_status: 'Status',
    admin_col_retries: 'Retries',
    admin_col_created: 'Created At',
    admin_inspect_job: 'Inspect Job',
    admin_retry_job: 'Retry Ingestion',

    // Admin Sources
    admin_sources_title: 'Official Government Sources',
    admin_sources_desc:
      'Manage trusted civic data sources, RSS endpoints, gazette portals, and automated crawler schedules.',
    admin_sources_count: 'official sources configured',
    admin_add_source: 'Add Official Source',
    admin_col_source_name: 'Source Name',
    admin_col_source_url: 'Official URL',
    admin_col_trust_score: 'Trust Score',
    admin_col_source_status: 'Status',
    admin_col_last_fetched: 'Last Fetched',
    admin_trigger_ingest: 'Trigger Crawl',
    admin_toggle_status: 'Toggle Active Status',

    // Admin Users
    admin_users_title: 'Citizen & Administrator Accounts',
    admin_users_desc:
      'Security governance and identity controls for registered citizen and admin accounts.',
    admin_users_notice_title: 'User Management API Unavailable',
    admin_users_notice_desc:
      'The JanSathi AI backend does not currently provide administrative user listing or modification endpoints. In accordance with zero-fake-data standards, no mock user accounts are displayed.',

    // Admin Analytics
    admin_analytics_title: 'Corpus & Ingestion Analytics',
    admin_analytics_desc:
      'Database-backed aggregations of government documents, category breakdown, and crawler ingestion job outcomes.',
    admin_analytics_badge: 'Database Verified',
    admin_cat_distribution_title: 'Public Ready Documents by Scheme Category',
    admin_cat_distribution_desc:
      'Aggregated from public-ready documents via GET /api/documents/facets.',
    admin_type_distribution_title: 'Public Ready Documents by Document Type',
    admin_type_distribution_desc:
      'Aggregated from public-ready documents via GET /api/documents/facets.',
    admin_corpus_status_title: 'Total Corpus Distribution by Extraction Status',
    admin_corpus_status_desc:
      'Calculated from GET /api/documents?scope=all using exact database pagination counts.',
    admin_job_outcomes_title: 'Ingestion Job Execution Outcomes',
    admin_job_outcomes_desc:
      'Calculated from GET /api/admin/ingestion-jobs across all job statuses.',
    admin_analytics_disclosure_title: 'Architectural Data Disclosure',
    admin_analytics_disclosure_desc:
      'Category and document-type metrics are derived strictly from public-ready documents through GET /api/documents/facets. Overall status counts query the complete corpus (GET /api/documents?scope=all). Time-series trends are not tracked in the current backend database schema.',

    // Admin System Status
    admin_system_title: 'System Status & Telemetry',
    admin_system_desc:
      'Real-time diagnostics and liveness probes for database, API runtime, and AI integration services.',
    admin_system_badge: 'Telemetry Active',
    admin_last_probed: 'Last probe',
    admin_reprobe: 'Re-probe System',
    admin_probing: 'Probing...',
    admin_system_runtime: 'API Runtime',
    admin_system_database: 'Database Storage',
    admin_system_ai: 'AI & RAG Subsystem',
    admin_endpoint_probes: 'Health Endpoint Audit',
    admin_ai_matrix_title: 'AI Pipeline Operational Matrix',
    admin_security_compliance_title: 'Administrative Security & Data Privacy Standard',
  },

  te: {
    // Brand & General
    brand_title: 'జన్ సాథీ AI',
    brand_tagline: 'ప్రభుత్వ సమాచార పౌర సహాయకుడు',
    brand_theme: 'సివిక్ పల్స్',
    non_ai_notice: 'నాన్-AI ప్రాథమిక వ్యవస్థ యాక్టివ్‌లో ఉంది',

    // Navigation
    nav_assistant: 'సహాయకుడు',
    nav_eligibility: 'అర్హత',
    nav_explainer: 'వివరణకర్త',
    nav_verify: 'ధృవీకరణ',
    nav_documents: 'పత్రాలు',
    nav_upload: 'అప్‌లోడ్',
    nav_admin: 'అడ్మిన్',
    sign_in: 'లాగిన్',
    register: 'నమోదు',
    sign_out: 'లాగౌట్',
    my_profile: 'ప్రొఫైల్',
    citizen: 'పౌరుడు',

    // Hero Section
    hero_badge: 'FORGE 26 • థీమ్ 1: సివిక్ పల్స్ • జాతీయ పౌర సహాయక వేదిక',
    hero_title_prefix: 'ధృవీకరించబడిన సమాచారంతో ప్రతి పౌరునికి ',
    hero_title_highlight: 'సాధికారత & మార్గదర్శకత్వం',
    hero_subtitle:
      'భారతీయ పౌరులకు ప్రభుత్వ సంక్షేమ పథకాలు, గెజిట్ నోటిఫికేషన్లు మరియు పౌర హక్కులను సులభంగా అందించే ప్రామాణిక వేదిక — సురక్షితమైన MERN పునాదిపై నిర్మించబడింది.',
    search_placeholder: 'అధికారిక గెజిట్‌లు, సంక్షేమ పథకాలు లేదా సర్క్యులర్‌లను శోధించండి...',
    search_btn: 'శోధించండి',
    nav_examples: 'శోధన ఉదాహరణలు:',
    nav_examples_hint: '(కేటలాగ్ ఫిల్టర్ చేయడానికి క్లిక్ చేయండి)',
    explore_catalog: 'పత్రాల కేటలాగ్‌ను చూడండి',
    view_profile: 'ప్రొఫైల్ చూడండి',
    register_citizen: 'పౌరునిగా నమోదు చేసుకోండి',
    citizen_sign_in: 'పౌర లాగిన్',

    // Topic Pills
    topic_agriculture: 'వ్యవసాయం & రైతు సంక్షేమం',
    topic_healthcare: 'ఆరోగ్యం & కుటుంబ సంక్షేమం',
    topic_education: 'విద్య & స్కాలర్‌షిప్‌లు',
    topic_pension: 'సామాజిక భద్రత & పెన్షన్లు',
    topic_employment: 'ఉపాధి & పరిశ్రమలు',
    topic_gazettes: 'గెజిట్ ఉత్తర్వులు & సర్క్యులర్లు',

    // Trust Badges
    trust_non_ai: 'నాన్-AI పునాది (నకిలీ సమాచారం ఉండదు)',
    trust_pipeline: 'అధికారిక ఆధారాల పైప్‌లైన్',
    trust_indic: 'తెలుగు మరియు భారతీయ లిపి మద్దతు',
    trust_security: 'సురక్షిత ప్రమాణీకరణ & పాస్‌వర్డ్ రక్షణ',

    // AI Disclosure
    ai_disclosure_title: 'ఆర్కిటెక్చరల్ భద్రత: AI ఎండ్-పాయింట్లు 501 ఎందుకు చూపిస్తాయి',
    ai_disclosure_body:
      'ప్రభుత్వ సంక్షేమ పథకాలు పౌరుల జీవనోపాధిని నేరుగా ప్రభావితం చేస్తాయి కాబట్టి, జన్ సాథీ AI అసంపూర్ణ లేదా ఊహాత్మక సమాధానాలను నిరోధిస్తుంది. అధికారిక పత్రాల సమీకరణ, OCR విశ్లేషణ మరియు ధృవీకరించబడిన ఆధారాల పైప్‌లైన్ పూర్తయ్యే వరకు AI ఎండ్-పాయింట్లు (/api/ai/*) ఉద్దేశపూర్వకంగా 501 NOT_IMPLEMENTED అని సమాధానం ఇస్తాయి.',
    inspect_ai_status: 'AI హుక్ స్థితిని తనిఖీ చేయండి →',

    // Service Modules
    modules_heading: 'పౌర సేవా విభాగాలు',
    modules_subheading: 'అందుబాటులో ఉన్న సదుపాయాలు మరియు రాబోయే మైలురాళ్లను పరిశీలించండి',
    module_count: '6 పౌర విభాగాలు',

    mod_assistant_title: 'పౌర సహాయకుడు (Civic Assistant)',
    mod_assistant_desc:
      'ప్రభుత్వ గెజిట్‌ల నుండి ప్రత్యక్ష ఆధారాలతో పౌరుల ప్రశ్నలకు ఖచ్చితమైన మార్గదర్శకత్వం.',
    mod_assistant_badge: 'AI ఆర్కిటెక్చర్ (501)',

    mod_eligibility_title: 'పథక అర్హత మూల్యాంకనం',
    mod_eligibility_desc:
      'అధికారిక నిబంధనల ఆధారంగా పౌరుల అర్హత ప్రమాణాలను ఖచ్చితంగా సరిపోల్చే సాధనం.',
    mod_eligibility_badge: 'AI ఆర్కిటెక్చర్ (501)',

    mod_explainer_title: 'పత్ర వివరణకర్త (Document Explainer)',
    mod_explainer_desc:
      'కఠినమైన చట్టపరమైన గెజిట్ నోటిఫికేషన్లు మరియు ప్రభుత్వ ఆదేశాలను సామాన్య భాషలోకి మారుస్తుంది.',
    mod_explainer_badge: 'AI ఆర్కిటెక్చర్ (501)',

    mod_verify_title: 'వాదనల ధృవీకరణ (Claim Verification)',
    mod_verify_desc:
      'సోషల్ మీడియాలో వచ్చే తప్పుడు ప్రచారాలను అధికారిక గెజిట్‌లతో సరిపోల్చి ధృవీకరిస్తుంది.',
    mod_verify_badge: 'AI ఆర్కిటెక్చర్ (501)',

    mod_documents_title: 'అధికారిక పత్రాల గ్రంథాలయం',
    mod_documents_desc:
      'ప్రభుత్వ పాలసీలు, గెజిట్లు మరియు శాఖాపరమైన ఉత్తర్వుల సంపూర్ణ శోధన గ్రంథాలయం.',
    mod_documents_badge: 'కేటలాగ్ సిద్ధం',

    mod_upload_title: 'పౌర పత్రాల అప్‌లోడ్',
    mod_upload_desc:
      'SHA-256 డూప్లికేషన్ నివారణ మరియు భద్రతా తనిఖీలతో గెజిట్ పత్రాలను సురక్షితంగా అప్‌లోడ్ చేయండి.',
    mod_upload_badge: 'స్టోరేజ్ సిద్ధం',

    // Pipeline
    pipeline_heading: 'జన్ సాథీ ప్రజా సమాచారాన్ని ఎలా విశ్లేషిస్తుంది',
    pipeline_subheading:
      'మా బహుళ-దశల ధృవీకరణ వ్యవస్థ అమలులో ఉన్న సేవల వివరాలను స్పష్టంగా వెల్లడిస్తుంది',
    stage1_title: 'మూలాల సమీకరణ & ఇన్‌జెషన్',
    stage1_status: 'ఫేజ్ 5 & 6 లో అమలు చేయబడింది',
    stage1_desc:
      'SSRF రక్షణ, SHA-256 హాష్‌లు మరియు %PDF- బైనరీ తనిఖీలతో అధికారిక URL లను మాత్రమే కలుపుతుంది.',
    stage2_title: 'టెక్స్ట్ సాధారణీకరణ & చంకింగ్',
    stage2_status: 'ఫేజ్ 6 లో అమలు చేయబడింది',
    stage2_desc:
      'తెలుగు లిపిని భద్రపరిచే యూనికోడ్ NFC నార్మలైజేషన్ మరియు విశ్లేషణాత్మక వాక్య విభజన.',
    stage3_title: 'పత్రాల గ్రంథాలయం & శోధన',
    stage3_status: 'ఫేజ్ 9 కోసం షెడ్యూల్ చేయబడింది',
    stage3_desc:
      'కీవర్డ్ ఇండెక్సింగ్ మరియు శాఖల వారీగా ఫిల్టరింగ్‌తో అధికారిక ఉత్తర్వులను సులభంగా శోధించండి.',
    stage4_title: 'ఆధారాలతో కూడిన AI మార్గదర్శకత్వం',
    stage4_status: 'ఫేజ్ 10 కోసం షెడ్యూల్ చేయబడింది',
    stage4_desc:
      'ఖచ్చితమైన అధికారిక పేరా ఉల్లేఖనాలతో సంభాషణ. సంపూర్ణ రక్షణలు పూర్తయ్యే వరకు 501 రిటర్న్ చేస్తుంది.',

    // FAQ
    faq_heading: 'తరచుగా అడిగే ప్రశ్నలు (FAQ)',
    faq_subheading: 'ఆర్కిటెక్చర్, పౌర గోప్యత మరియు రాబోయే ఫీచర్లకు సంబంధించిన వివరణలు',
    faq1_q: 'AI సేవలు ప్రస్తుతం 501 Not Implemented ఎందుకు చూపిస్తాయి?',
    faq1_a:
      'ఇది ఉద్దేశపూర్వక ఆర్కిటెక్చరల్ భద్రతా చర్య. సంక్షేమ రంగంలో తప్పుడు లేదా ఊహాజనిత సమాచారం పౌరులను తప్పుదోవ పట్టించవచ్చు. అధికారిక పత్రాల సమగ్ర సేకరణ, సూచిక మరియు ధృవీకరించబడిన ఆధారాల పైప్‌లైన్ పూర్తయ్యే వరకు అన్ని సంభాషణా AI ఎండ్‌పాయింట్లు ఉద్దేశపూర్వకంగా 501 స్థితిని కలిగి ఉంటాయి.',
    faq2_q: 'అప్‌లోడ్ చేసిన పత్రాలు ప్రామాణికమైనవని ప్లాట్‌ఫారమ్ ఎలా నిర్ధారిస్తుంది?',
    faq2_a:
      'సర్వర్ బైనరీ మ్యాజిక్ బైట్‌లు (%PDF-) మరియు SHA-256 క్రిప్టోగ్రాఫిక్ హాష్‌లను ఉపయోగించి డూప్లికేట్ పత్రాలను నివారిస్తుంది మరియు ప్రత్యేక టెక్స్ట్ ఎక్స్‌ట్రాక్షన్ పైప్‌లైన్‌ను అమలు చేస్తుంది.',
    faq3_q: 'టాపిక్ బటన్లు ప్రత్యక్ష ప్రభుత్వ పథకాలా?',
    faq3_a:
      'కావు. ఇవి కేవలం శోధన ఉదాహరణలు మాత్రమే. ఇవి పథకాల జాబితాను సులభంగా శోధించడానికి ఉపయోగపడే విభాగాలు తప్ప, ముందస్తుగా మంజూరు చేయబడిన ప్రయోజనాలు లేదా దరఖాస్తు ఫారాలు కావు.',
    faq4_q: 'నా వ్యక్తిగత పౌర ప్రొఫైల్ వివరాలు సురక్షితంగా ఉంటాయా?',
    faq4_a:
      'అవును. ప్రొఫైల్ సమాచారం bcrypt పాస్‌వర్డ్ హాషింగ్ మరియు JWT ప్రమాణీకరణ ద్వారా అత్యంత సురక్షితమైన డేటాబేస్‌లో భద్రపరచబడుతుంది.',

    // CTA
    cta_title: 'ధృవీకరించబడిన ప్రజా సమాచారాన్ని పరిశీలించడానికి సిద్ధంగా ఉన్నారా?',
    cta_desc:
      'ఇండెక్స్ చేయబడిన పత్రాలను శోధించండి, పౌర ప్రాధాన్యతలను కాన్ఫిగర్ చేయండి లేదా అడ్మిన్ సదుపాయాలను పరీక్షించండి.',
    cta_browse: 'పత్రాలను శోధించండి',
    cta_register: 'ఖాతాను నమోదు చేసుకోండి',

    // Phase 9 — Documents & Uploads
    doc_library_title: 'అధికారిక పత్రాల గ్రంథాలయం',
    doc_library_subtitle:
      'ధృవీకరించబడిన ప్రభుత్వ నోటిఫికేషన్లు, సంక్షేమ పథకాలు, సర్క్యులర్లు మరియు మీ వ్యక్తిగత అప్‌లోడ్‌లను శోధించండి.',
    doc_scope_public: 'అధికారిక ప్రజా గ్రంథాలయం',
    doc_scope_mine: 'నా అప్‌లోడ్ చేసిన పత్రాలు',
    doc_search_placeholder: 'పత్రం శీర్షిక లేదా జారీ చేసిన మంత్రిత్వ శాఖ ద్వారా శోధించండి...',
    doc_search_btn: 'శోధించండి',
    doc_upload_btn: 'పత్రం అప్‌లోడ్ చేయండి',
    doc_refresh_btn: 'రిఫ్రెష్',
    doc_filter_category: 'వర్గం',
    doc_filter_all_categories: 'అన్ని వర్గాలు',
    doc_filter_doctype: 'పత్రం రకం',
    doc_filter_all_types: 'అన్ని రకాలు',
    doc_filter_language: 'భాష',
    doc_filter_all_languages: 'అన్ని భాషలు',
    doc_filter_status: 'ప్రాసెసింగ్ స్థితి',
    doc_filter_all_statuses: 'అన్ని స్థితులు',
    doc_filter_sort: 'క్రమబద్ధీకరణ',
    doc_sort_newest: 'తాజావి మొదట',
    doc_sort_oldest: 'పాతవి మొదట',
    doc_sort_title_asc: 'శీర్షిక (A–Z)',
    doc_sort_title_desc: 'శీర్షిక (Z–A)',
    doc_sort_published: 'ప్రచురణ తేదీ',
    doc_reset_filters: 'ఫిల్టర్‌లను రీసెట్ చేయండి',
    doc_open_reader: 'రీడర్ తెరవండి',
    doc_pages_count: 'పేజీలు',
    doc_chunks_count: 'భాగాలు',
    doc_no_matching: 'సరిపోలే పత్రాలు ఏవీ కనుగొనబడలేదు',
    doc_no_matching_desc: 'మీ శోధన పదాలను మార్చండి లేదా ఎంచుకున్న ఫిల్టర్‌లను తొలగించండి.',
    doc_empty_personal: 'ఇంకా పత్రాలు ఏవీ అప్‌లోడ్ చేయలేదు',
    doc_empty_personal_desc:
      'వచన వెలికితీతను ప్రారంభించడానికి మీ మొదటి సంక్షేమ పత్రాన్ని లేదా గెజిట్‌ను అప్‌లోడ్ చేయండి.',
    doc_empty_library: 'అధికారిక పత్రాలు ఏవీ అందుబాటులో లేవు',
    doc_empty_library_desc:
      'ప్రస్తుతం ప్రజా గ్రంథాలయం ఖాళీగా ఉంది. కొత్త అధికారిక ఆధారాలు చేర్చబడినప్పుడు తనిఖీ చేయండి.',
    doc_prev_page: 'మునుపటిది',
    doc_next_page: 'తరువాతిది',
    doc_page_of: 'నుండి',
    doc_showing: 'చూపిస్తున్నది',

    // Status Badges
    status_ready: 'సిద్ధంగా ఉంది',
    status_processing: 'ప్రాసెస్ అవుతోంది',
    status_pending: 'క్యూలో ఉంది',
    status_needs_ocr: 'OCR అవసరం',
    status_failed: 'విఫలమైంది',

    // Document Reader
    reader_back_to_library: 'పత్రాల గ్రంథాలయం',
    reader_official_portal: 'అధికారిక మూల పోర్టల్',
    reader_delete_btn: 'పత్రాన్ని తొలగించండి',
    reader_refresh_status: 'స్థితిని రిఫ్రెష్ చేయండి',
    reader_extracted_text: 'వెలికితీసిన వచన సమాచారం',
    reader_integrity_title: 'పత్రం సమగ్రత & నిల్వ వివరాలు',
    reader_integrity_subtitle: 'నమోదైన నిల్వ పారామితులు మరియు క్రిప్టోగ్రాఫిక్ చెక్‌సమ్',
    reader_recorded_sha256: 'నమోదైన SHA-256 చెక్‌సమ్',
    reader_checksum_desc:
      'డూప్లికేట్‌లను నిరోధించడానికి మరియు చెక్కుచెదరకుండా నిల్వ చేయడానికి ఫైల్ అప్‌లోడ్ సమయంలో లెక్కించబడింది.',
    reader_checksum_copied: 'చెక్‌సమ్ క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది',
    reader_file_type: 'ఫైల్ రకం',
    reader_file_size: 'ఫైల్ పరిమాణం',
    reader_scope: 'యాక్సెస్ పరిధి',
    reader_uploaded_date: 'అప్‌లోడ్ చేసిన తేదీ',
    reader_last_modified: 'చివరిగా సవరించిన తేదీ',
    reader_empty_text: 'వెలికితీసిన పేజీలు ఏవీ అందుబాటులో లేవు.',
    reader_ai_callout_title: 'AI వివరణ లేదా పథక అర్హత నియమాలు కావాలా?',
    reader_ai_callout_desc:
      'సంభాషణా పత్ర వివరణకర్త మరియు చట్టబద్ధమైన అర్హత విశ్లేషణ ఫేజ్ 10లో దీనితో అనుసంధానించబడతాయి.',
    reader_ai_callout_btn: 'వివరణకర్తను చూడండి (501)',
    delete_modal_title: 'అప్‌లోడ్ చేసిన పత్రాన్ని తొలగించాలా?',
    delete_modal_desc:
      'మీరు ఖచ్చితంగా ఈ పత్రాన్ని తొలగించాలనుకుంటున్నారా? ఇది నిల్వ చేసిన PDF, పేజీలు మరియు భాగాలను శాశ్వతంగా తొలగిస్తుంది.',
    delete_modal_confirm: 'తొలగింపును నిర్ధారించండి',
    delete_modal_cancel: 'రద్దు చేయండి',
    delete_modal_deleting: 'తొలగిస్తోంది...',

    // Upload Page
    upload_page_title: 'పౌర పత్రం అప్‌లోడ్',
    upload_page_subtitle:
      'వ్యక్తిగత వచన వెలికితీత మరియు ఇండెక్సింగ్ కోసం ప్రభుత్వ నోటిఫికేషన్లు లేదా గెజిట్‌లను సమర్పించండి.',
    upload_select_pdf: 'PDF పత్రాన్ని ఎంచుకోండి',
    upload_click_browse: 'బ్రౌజ్ చేయడానికి క్లిక్ చేయండి',
    upload_drag_drop: 'లేదా ఇక్కడ PDFని డ్రాగ్ & డ్రాప్ చేయండి',
    upload_pdf_only_hint: 'PDF ఫార్మాట్ మాత్రమే • గరిష్ట అనుమతి పరిమాణం:',
    upload_meta_title: 'పత్రం వివరాలు (ఐచ్ఛికం)',
    upload_meta_title_label: 'పత్రం శీర్షిక',
    upload_meta_title_placeholder: 'ఫైల్ పేరు నుండి స్వయంచాలకంగా పొందడానికి ఖాళీగా ఉంచండి',
    upload_meta_category: 'వర్గం',
    upload_meta_doctype: 'పత్రం రకం',
    upload_meta_language: 'పత్రం భాష',
    upload_meta_auto_detect: 'వచనం నుండి స్వయంచాలకంగా గుర్తించు',
    upload_meta_published: 'ప్రచురణ తేదీ',
    upload_meta_authority: 'జారీ చేసిన అధికారం/శాఖ',
    upload_meta_source: 'మూల URL',
    upload_submit_btn: 'అప్‌లోడ్ చేసి క్యూలో ఉంచండి',
    upload_uploading_btn: 'అప్‌లోడ్ అవుతోంది',
    upload_cancel_btn: 'రద్దు చేయండి',
    upload_success_queued_title: 'అప్‌లోడ్ స్వీకరించబడింది & ప్రాసెసింగ్ క్యూలో ఉంది',
    upload_success_duplicate_title: 'సరిపోలే పత్రం గుర్తించబడింది (డూప్లికేట్)',
    upload_success_open_reader: 'పత్రం రీడర్‌లో తెరవండి',
    upload_success_another: 'మరొక పత్రం అప్‌లోడ్ చేయండి',
    upload_specs_title: 'అప్‌లోడ్ నిబంధనలు',
    upload_specs_subtitle: 'బ్యాకెండ్ భద్రతా పైప్‌లైన్ ద్వారా అమలు చేయబడిన నియమాలు',

    // Phase 10: AI Citizen Pages & HTTP 501 Disclosures
    ai_not_implemented_badge: 'నాన్-AI ప్రాథమిక వ్యవస్థ',
    ai_service_unavailable_title: 'AI ఎండ్‌పాయింట్ అందుబాటులో లేదు (HTTP 501)',
    probe_ai_status_btn: 'బ్యాకెండ్ AI హుక్ తనిఖీ చేయండి',
    citizen_submitted_inquiry: 'స్వీకరించబడిన పౌర సమర్పణ:',
    ai_safeguard_explanation:
      'ఉత్పాదక సంశ్లేషణ మరియు ఆటోమేటెడ్ నిర్ణయాలు ఉద్దేశపూర్వకంగా అందుబాటులో లేవు (HTTP 501 NOT_IMPLEMENTED). పౌర సంక్షేమ మార్గదర్శకత్వం ధృవీకరించబడని మోడల్ అవుట్‌పుట్‌ల కంటే అధికారిక గెజిట్ నోటిఫికేషన్‌లను ధృవీకరించడం ద్వారా మాత్రమే అందించాలి.',
    ai_safeguard_backend_lock:
      'బ్యాకెండ్ ఎండ్‌పాయింట్ ఉద్దేశపూర్వకంగా ఇంకా అమలు చేయబడలేదు. డాక్యుమెంట్ OCR, వెలికితీత మరియు ఉల్లేఖన పైప్‌లైన్‌లు క్రియాశీల అభివృద్ధిలో ఉన్నాయి మరియు ఉత్పాదక మోడల్‌లకు కనెక్ట్ చేయబడలేదు.',
    planned_capabilities_heading:
      'ప్రణాళికాబద్ధమైన ఆర్కిటెక్చర్ సామర్థ్యాలు (ప్రస్తుతం పనిచేయడం లేదు)',
    probe_status_note:
      'లైవ్ ప్రోబ్ ఎండ్‌పాయింట్ కనెక్ట్ కాలేదని ధృవీకరిస్తుంది (connected: false). ప్రస్తుతం ఎటువంటి మోడల్ ఇన్ఫరెన్స్ యాక్టివ్‌గా లేదు.',
    ai_not_implemented_toast: 'AI సర్వీస్ ఎండ్‌పాయింట్ భవిష్యత్ దశలో అందుబాటులోకి వస్తుంది.',

    // Assistant Page
    assistant_page_title: 'సివిక్ AI సహాయకుడు',
    assistant_page_subtitle:
      'భారత ప్రభుత్వ పథకాలు, పౌర ప్రయోజనాలు మరియు ప్రజా సేవలపై ఖచ్చితమైన మార్గదర్శకత్వాన్ని అందించే బహుభాషా సంభాషణాత్మక సహాయకుడు.',
    assistant_grounding_title: 'ఆధారిత పౌర నిర్మాణ రూపకల్పన',
    assistant_grounding_desc:
      'ఈ సహాయకుడు అధికారిక గెజిట్‌లు మరియు చట్టబద్ధమైన విధానాలను ఉపయోగించి మాత్రమే సమాధానమిచ్చేలా రూపొందించబడింది. తప్పుడు హామీలను నివారించడానికి, పూర్తి మూలాల అనుసంధానం జరిగే వరకు సంభాషణ వ్యవస్థ నిష్క్రియంగా ఉంచబడింది.',
    assistant_form_title: 'ప్రజా సంబంధిత ప్రశ్న అడగండి',
    assistant_form_subtitle:
      'సంక్షేమ విధానాలు, గెజిట్‌లు లేదా అర్హత ప్రమాణాలపై మీ విచారణను నమోదు చేయండి.',
    assistant_question_label: 'మీ ప్రశ్న / విచారణ',
    assistant_placeholder:
      'ఉదాహరణ: పిఎం-కిసాన్ సమ్మాన్ నిధి పథకానికి ఆదాయ పరిమితులు మరియు అవసరమైన పత్రాలు ఏమిటి?',
    assistant_min_chars_note: 'కనీసం 3 అక్షరాలు ఉండాలి',
    assistant_min_chars_error: 'దయచేసి కనీసం 3 అక్షరాలతో ప్రశ్నను నమోదు చేయండి.',
    assistant_max_chars_error: 'ప్రశ్న 1000 అక్షరాలకు మించకూడదు.',
    btn_reset: 'ఫారం రీసెట్ చేయండి',
    assistant_submitting: 'విచారణ సమర్పిస్తోంది...',
    assistant_submit_btn: 'విచారణను సమర్పించండి',
    assistant_unavailable_desc:
      'పౌర సంక్షేమంలో ఎలాంటి ఊహాజనిత లేదా తప్పుడు సమాచారం రాకుండా ఉండేందుకు, మా RAG పైప్‌లైన్ మరియు ధృవీకరించబడిన అనులేఖనాల వ్యవస్థ అనుసంధానం అయ్యే వరకు సహాయక వ్యవస్థ నిలిపివేయబడింది.',
    plan_feat_rag:
      'ధృవీకరించబడిన భారత ప్రభుత్వ గెజిట్‌లతో ఇండెక్స్ చేయబడిన సంభాషణాత్మక RAG వ్యవస్థ',
    plan_feat_citation:
      'ఖచ్చితమైన గెజిట్ నోటిఫికేషన్ మరియు పేజీ నంబర్లతో అధికారిక చట్టబద్ధమైన మూలాలు',
    plan_feat_voice: 'భాషిణి (Bhashini) ద్వారా భారతీయ భాషలలో వాయిస్ ఇన్‌పుట్ మరియు స్పీచ్ సింథసిస్',
    plan_feat_guardrails: 'కల్పిత సంక్షేమ పథకాలు లేదా తప్పుడు ప్రయోజనాలను అరికట్టే కఠినమైన రక్షణలు',
    assistant_examples_title: 'ఉదాహరణ ప్రశ్నలు (UI పరీక్ష కోసం మాత్రమే)',
    assistant_examples_disclaimer:
      'ఈ ప్రశ్నలు ఇంటర్‌ఫేస్ పరీక్ష ప్రదర్శన కోసం మాత్రమే అందించబడ్డాయి మరియు అధికారిక ప్రభుత్వ సలహా లేదా పథక నియమాలను సూచించవు.',
    example_q1: 'పిఎం ఆవాస్ యోజన గ్రామీణ గృహ మంజూరుకు అర్హత ప్రమాణాలు ఏమిటి?',
    example_q2: 'రాష్ట్ర దివ్యాంగుల పింఛను నమోదు కోసం ఏ పత్రాలు అవసరం?',
    example_q3:
      'చిన్న రైతు PMKSY కింద రాయితీతో కూడిన డ్రిప్ ఇరిగేషన్ కోసం ఎలా దరఖాస్తు చేసుకోవచ్చు?',
    example_q4: 'కేంద్ర ఎరువుల రాయితీ కోసం కనీస భూమి పరిమితి ఎంత?',

    // Eligibility Page
    eligibility_page_title: 'పథకం అర్హత మూల్యాంకనం',
    eligibility_page_subtitle:
      'అధికారిక పథక నియమాలకు అనుగుణంగా పౌరుల జనాభా ప్రమాణాలను సరిపోల్చే నిర్ధారక & AI-సహాయక ధృవీకరణ.',
    eligibility_notice_title: 'చట్టబద్ధమైన అర్హత ధృవీకరణ నోటీసు',
    eligibility_notice_desc:
      'అధికారిక పథకాల అర్హత గెజిట్ నోటిఫికేషన్ నిబంధనల ద్వారా నియంత్రించబడుతుంది. తప్పుడు తిరస్కరణలను లేదా తప్పుదారి పట్టించే అంచనాలను నివారించడానికి, ధృవీకరించబడిన పట్టికలు లోడ్ అయ్యే వరకు ఆటోమేటెడ్ మ్యాచింగ్ ప్రారంభించబడదు.',
    eligibility_form_title: 'పథకం & దరఖాస్తుదారు వివరాలను నమోదు చేయండి',
    eligibility_form_subtitle:
      'అధికారిక అర్హతలతో సరిపోల్చడానికి లక్ష్య పథకం పేరు మరియు వివరాలను అందించండి.',
    eligibility_scheme_label: 'లక్ష్య పథకం లేదా ప్రయోజన కార్యక్రమం',
    eligibility_scheme_placeholder:
      'ఉదాహరణ: పిఎం కిసాన్ సమ్మాన్ నిధి, పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్, ఆయుష్మాన్ భారత్',
    eligibility_min_query_error: 'దయచేసి కనీసం 3 అక్షరాలతో పథకం పేరును పేర్కొనండి.',
    eligibility_state_label: 'నివాస రాష్ట్రం',
    select_state_placeholder: 'భారతదేశం అంతటా / పేర్కొనబడలేదు',
    eligibility_district_label: 'జిల్లా (ఐచ్ఛికం)',
    eligibility_district_placeholder: 'ఉదా: వరంగల్, పాట్నా, పూణే',
    eligibility_category_label: 'పౌరుడు / లబ్ధిదారుల వర్గం',
    select_category_placeholder: 'పౌర వర్గాన్ని ఎంచుకోండి',
    eligibility_education_label: 'విద్యార్హత స్థాయి',
    select_education_placeholder: 'విద్యార్హతను ఎంచుకోండి',
    eligibility_income_label: 'వార్షిక కుటుంబ ఆదాయ పరిధి',
    select_income_placeholder: 'ఆదాయ పరిధిని ఎంచుకోండి',
    eligibility_occupation_label: 'కోర్సు లేదా నిర్దిష్ట వృత్తి',
    eligibility_occupation_placeholder: 'ఉదా: చిన్న రైతు, బి.టెక్ 2వ సంవత్సరం, చేనేత కార్మికుడు',
    eligibility_social_label: 'సామాజిక వర్గం (ఐచ్ఛికం)',
    eligibility_social_placeholder: 'ఉదా: General, OBC, SC, ST, EWS',
    eligibility_privacy_note:
      'వివరాలు ప్రమాణాల పోలిక కోసం POST /api/ai/eligibility కి పారామితులుగా మాత్రమే పంపబడతాయి. ఈ ఎండ్‌పాయింట్ ప్రస్తుతం HTTP 501 ని అందిస్తున్నందున, ఎలాంటి అర్హత అంచనా వేయబడదు లేదా నిల్వ చేయబడదు.',
    eligibility_evaluating: 'ప్రమాణాలను అంచనా వేస్తోంది...',
    eligibility_submit_btn: 'అర్హతను అంచనా వేయండి',
    eligibility_unavailable_desc:
      'ప్రజా ప్రయోజనాలు అన్యాయంగా తిరస్కరించబడకుండా ఉండటానికి, అధికారిక గెజిట్‌ల ప్రకారం నిబంధనలు ఖరారయ్యే వరకు ఆటోమేటెడ్ అర్హత మూల్యాంకనం నిలిపివేయబడింది.',
    plan_feat_matching:
      'పౌరుల ప్రొఫైల్ (రాష్ట్రం, వర్గం, ఆదాయం, వృత్తి) ఆధారంగా ఆటోమేటెడ్ సరిపోలిక',
    plan_feat_checklist: 'ప్రభుత్వ కార్యాలయాలను సందర్శించే ముందు అవసరమైన చట్టబద్ధమైన పత్రాల జాబితా',
    plan_feat_portals: 'అధికారిక దరఖాస్తు పోర్టల్‌లు మరియు నోడల్ అధికారుల ప్రత్యక్ష లింకులు',
    plan_feat_breakdown:
      'అర్హత ప్రమాణాల స్పష్టమైన వివరాలు (ఎలాంటి అస్పష్టమైన బ్లాక్-బాక్స్ AI ఉండదు)',
    eligibility_criteria_guide_title: 'చట్టబద్ధమైన అర్హత ధృవీకరణ నిర్మాణం',
    eligibility_criteria_guide_desc:
      'ప్రారంభించబడినప్పుడు, జన్ సాథీ AI ఒక హైబ్రిడ్ డిటర్మినిస్టిక్ నియమ ఇంజిన్‌ను ఉపయోగిస్తుంది. మొదటిగా వయస్సు, ఆదాయ పరిమితి, రాష్ట్ర నివాసం వంటి నిబంధనలను పరిశీలిస్తుంది. రెండవది, గెజిట్ ఆర్డర్ నుండి పత్రాల చెక్‌లిస్ట్‌ను ధృవీకరిస్తుంది.',
    criteria_step1_title: 'డిటర్మినిస్టిక్ ఫిల్టర్',
    criteria_step1_desc: 'ఆదాయం, నివాసం మరియు వయస్సు పరిమితుల ఖచ్చితమైన తనిఖీ.',
    criteria_step2_title: 'గెజిట్ ధృవీకరణ',
    criteria_step2_desc: 'రిపోజిటరీలోని అధికారిక నోటిఫికేషన్ పాఠంతో సరిపోల్చబడుతుంది.',
    criteria_step3_title: 'సున్నా కల్పన',
    criteria_step3_desc: 'నియమం అస్పష్టంగా ఉంటే, అధికారి సంప్రదింపు కోసం సిఫార్సు చేస్తుంది.',

    // Explainer Page
    explainer_page_title: 'పౌర పత్రాల వివరణకర్త',
    explainer_page_subtitle:
      'సంక్లిష్టమైన గెజిట్ నోటిఫికేషన్‌లు, ప్రభుత్వ ఉత్తర్వులు (G.O.) మరియు చట్టపరమైన సర్క్యులర్‌లను సులభమైన పౌర సారాంశాలుగా మారుస్తుంది.',
    explainer_grounding_title: 'పత్రాల ప్రామాణికత & ధృవీకరణ నోటీసు',
    explainer_grounding_desc:
      'పత్రాల వివరణకర్త అధికారిక రిపోజిటరీలో నిల్వ చేయబడిన నిజమైన గెజిట్‌లపై పనిచేస్తుంది. మీరు దిగువ ధృవీకరించబడిన వచనాన్ని చదవవచ్చు. పూర్తి మోడల్స్ అనుసంధానమయ్యే వరకు AI సారాంశం HTTP 501 తో నిలిపివేయబడింది.',
    explainer_doc_fetch_error: 'పత్రాన్ని లోడ్ చేయడంలో విఫలమైంది',
    loading_document: 'ప్రామాణిక పత్రాన్ని లోడ్ చేస్తోంది...',
    browse_catalog_btn: 'అందుబాటులో ఉన్న పత్రాల కేటలాగ్‌ను బ్రౌజ్ చేయండి',
    untitled_document: 'పేరులేని పత్రం',
    official_authority: 'భారత ప్రభుత్వం',
    view_full_reader: 'పూర్తి రీడర్',
    request_summary_title: 'AI పత్రాల సరళీకరణ',
    request_summary_desc:
      'నిర్మాణాత్మక పౌర సారాంశం కోసం పత్ర సమాచారాన్ని POST /api/ai/ask కు పంపుతుంది.',
    explaining_btn: 'వివరణ కోరుతోంది...',
    explain_document_btn: 'AI వివరణను అభ్యర్థించండి',
    explainer_unavailable_desc:
      'పత్రాల వివరణకు OCR టోకెన్లపై LLM సారాంశం అవసరం. ధృవీకరించబడిన అనులేఖనాలు పూర్తయ్యే వరకు ఈ ఎండ్‌పాయింట్ HTTP 501 NOT_IMPLEMENTED తో లాక్ చేయబడింది.',
    plan_feat_plain_lang: 'చట్టపరమైన పరిభాష లేకుండా సరళమైన భాషలో వివరణ',
    plan_feat_takeaways: 'ముఖ్యమైన అంశాలు: ఎవరికి వర్తిస్తుంది, ఏమి మారుతుంది, తదుపరి చర్యలు',
    plan_feat_multilingual_synth: 'తెలుగు, ఇంగ్లీష్, హిందీ మరియు తమిళంలో బహుభాషా సంశ్లేషణ',
    plan_feat_side_by_side: 'అసలు గెజిట్ పాఠం మరియు పేజీ ముఖ్యాంశాలతో పక్కపక్కనే వీక్షణ',
    extracted_text_heading: 'ప్రామాణికంగా సేకరించిన వచనం (రిపోజిటరీ నుండి)',
    extracted_text_subheading: 'PDF ప్రాసెసింగ్ నుండి డేటాబేస్‌లో భద్రపరచబడిన ప్రత్యక్ష OCR పాఠం.',
    page_label: 'పేజీ',
    no_page_text: 'ఈ పేజీలో ఎలాంటి వచనం సేకరించబడలేదు.',
    no_pages_preview: 'ఈ పత్రానికి సంబంధించి ఎలాంటి పేజీ పాఠం అందుబాటులో లేదు.',
    explainer_select_title: 'వివరించడానికి ఒక పత్రాన్ని ఎంచుకోండి',
    explainer_select_subtitle:
      'రిపోజిటరీ నుండి అధికారిక గెజిట్ నోటిఫికేషన్, సర్క్యులర్ లేదా పథకం ఆర్డర్‌ను ఎంచుకోండి.',
    explainer_select_desc:
      'పత్రాన్ని వివరించడానికి, లైబ్రరీని బ్రౌజ్ చేసి "Explain Document" పై క్లిక్ చేయండి. మీరు అసలు వచనాన్ని మరియు ప్రణాళిక చేయబడిన సారాంశాన్ని చూడవచ్చు.',
    explainer_capabilities_title: 'పత్ర వివరణ సామర్థ్యాలు',
    explainer_feat1_desc: 'పరిపాలనా ఆదేశాలను అర్థమయ్యే పౌర మార్గదర్శకంగా మారుస్తుంది.',
    explainer_feat2_desc: 'పౌరులకు అవసరమైన కీలక చర్యలు, గడువులు మరియు నిబంధనలను హైలైట్ చేస్తుంది.',
    explainer_feat3_desc: 'ఖచ్చితమైన పౌర పదజాలంతో ప్రాంతీయ భాషలలో అందుబాటులో ఉంటుంది.',
    explainer_feat4_desc: 'ప్రతి సారాంశ పాయింట్‌ను అసలు గెజిట్ పేజీతో నేరుగా ధృవీకరించుకోవచ్చు.',

    // Verify Page
    verify_page_title: 'ప్రభుత్వ సమాచారం & వాస్తవాల ధృవీకరణ',
    verify_page_subtitle:
      'తప్పుడు ప్రచారాలను అరికట్టడానికి వైరల్ సందేశాలు, సోషల్ మీడియా వాదనలను అధికారిక గెజిట్‌లతో సరిపోల్చండి.',
    verify_grounding_title: 'తప్పుడు సమాచార నిరోధక నిబంధనలు',
    verify_grounding_desc:
      'బాధ్యతాయుతంగా వ్యవహరించడానికి, అధికారిక గెజిట్ మరియు PIB ధృవీకరణ లేకుండా జన్ సాథీ AI ఎలాంటి "నిజం" లేదా "అబద్ధం" తీర్పులను జారీ చేయదు. పూర్తి మూలాల అనుసంధానం పూర్తయ్యే వరకు ఈ వ్యవస్థ HTTP 501 ను చూపుతుంది.',
    verify_form_title: 'వాదన లేదా వైరల్ సర్క్యులర్‌ను సమర్పించండి',
    verify_form_subtitle:
      'అధికారిక గెజిట్ ప్రచురణలతో మూల్యాంకనం చేయడానికి సందేశం లేదా వార్తలను నమోదు చేయండి.',
    verify_claim_label: 'వాదన / పుకారు / నోటీసు వచనం',
    verify_placeholder:
      'ఉదాహరణ: పిఎం-కుసుమ్ కింద ఎటువంటి విద్యుత్ ఛార్జీలు లేకుండా ఉచిత సౌర పంపులను ప్రభుత్వం పంపిణీ చేస్తోందన్న సందేశం...',
    verify_min_chars_note: 'కనీసం 10 అక్షరాలు అవసరం',
    verify_min_chars_error: 'దయచేసి కనీసం 10 అక్షరాలతో వాదనను నమోదు చేయండి.',
    verify_max_chars_error: 'వాదన 2000 అక్షరాలకు మించకూడదు.',
    verify_submitting: 'మూలాలతో సరిపోలుస్తోంది...',
    verify_submit_btn: 'మూలాలతో వాదనను ధృవీకరించండి',
    verify_unavailable_desc:
      'తప్పుడు వాస్తవ తనిఖీలను నివారించడానికి, అధికారిక PIB ఫీడ్‌లు మరియు గెజిట్ సెమాంటిక్ ఇండెక్సింగ్ పూర్తయ్యే వరకు ఈ వ్యవస్థ HTTP 501 NOT_IMPLEMENTED తో లాక్ చేయబడింది.',
    plan_feat_semantic:
      'అధికారిక గెజిట్‌లు మరియు PIB ఫ్యాక్ట్ చెక్ ఫీడ్‌లతో ఆటోమేటెడ్ సెమాంటిక్ పోలిక',
    plan_feat_verdict:
      'పారదర్శక తీర్పు: అధికారికంగా ధృవీకరించబడింది, అవాస్తవం, లేదా ధృవీకరించబడలేదు',
    plan_feat_debunk_refs: 'అధికారిక వివరణలు, పత్రికా ప్రకటనలు మరియు చట్టబద్ధమైన గెజిట్ లింకులు',
    plan_feat_shareable:
      'వాట్సాప్ పుకార్లను ఎదుర్కోవడానికి ధృవీకరించదగిన మూలాలతో కూడిన షేరబుల్ కార్డు',
    verify_examples_title: 'నమూనా వాదనలు (UI పరీక్ష కోసం మాత్రమే)',
    verify_examples_disclaimer:
      'ఈ ప్రకటనలు ఇంటర్‌ఫేస్ పరీక్ష ప్రదర్శన కోసం మాత్రమే అందించబడ్డాయి మరియు అధికారిక ప్రభుత్వ ప్రకటనలు, ధృవీకరించబడిన వాస్తవాలు కావు.',
    verify_ex1:
      'నిరుద్యోగ యువతందరికీ నెలకు రూ. 5,000 భత్యం అందజేస్తున్నట్లు వైరల్ అవుతున్న సందేశం.',
    verify_ex2:
      'రేపటిలోగా పెన్షన్ ఉపసంహరణకు ఆధార్ అనుసంధానం తప్పనిసరి అని ఆన్‌లైన్‌లో వస్తున్న నోటీసు.',
    verify_ex3: 'రైతుల రూ. 2 లక్షల వరకు పంట రుణాలు బేషరతుగా రద్దయ్యాయని పేర్కొంటున్న సందేశం.',
    verify_ex4: 'ఆయుష్మాన్ భారత్ కవరేజ్ ఆదాయ పరిమితులు లేకుండా అందరికీ వర్తిస్తుందన్న పోస్ట్.',

    // Admin Navigation & Shell
    admin_portal_title: 'పౌర పరిపాలన కన్సోల్',
    admin_nav_overview: 'అవలోకనం',
    admin_nav_documents: 'పత్రాలు',
    admin_nav_jobs: 'ఇంజెషన్ పనులు',
    admin_nav_sources: 'అధికారిక మూలాలు',
    admin_nav_users: 'వినియోగదారులు',
    admin_nav_analytics: 'విశ్లేషణలు',
    admin_nav_system: 'సిస్టమ్ స్థితి',
    admin_return_citizen: 'పౌర పోర్టల్‌కు తిరిగి వెళ్లండి',
    admin_sign_out: 'లాగ్ అవుట్',
    admin_badge_live: 'లైవ్ ప్రొడక్షన్',
    admin_badge_active: 'ధృవీకరించబడిన క్రియాశీల',
    admin_refresh: 'రిఫ్రెష్',
    admin_refreshing: 'రిఫ్రెష్ అవుతోంది...',

    // Admin Dashboard
    admin_dashboard_title: 'పరిపాలన నియంత్రణ కేంద్రం',
    admin_dashboard_desc:
      'వ్యవస్థ వ్యాప్త పాలన, క్రాలర్ ఇంజెషన్ పైప్‌లైన్ పర్యవేక్షణ మరియు పౌర పత్రాల ధృవీకరణ.',
    admin_total_documents: 'మొత్తం చేర్చబడిన పత్రాలు',
    admin_total_docs_sub: 'పూర్తి డేటాబేస్ నిల్వ (scope=all)',
    admin_ready_documents: 'ప్రజా ప్రచురణకు సిద్ధమైన పత్రాలు',
    admin_ready_docs_sub: 'పౌరులు శోధించగల పత్రాలు',
    admin_pending_documents: 'పెండింగ్ & ప్రాసెసింగ్',
    admin_pending_docs_sub: 'టెక్స్ట్ వెలికితీత లేదా ధృవీకరణ ప్రక్రియలో ఉన్నాయి',
    admin_failed_documents: 'విఫలమైనవి & OCR అవసరం',
    admin_failed_docs_sub: 'వెలికితీత లోపాలు లేదా స్కాన్ చేసిన పీడీఎఫ్‌లు',
    admin_ingestion_jobs_total: 'నమోదైన మొత్తం ఇంజెషన్ పనులు',
    admin_jobs_sub: 'క్రాలర్ మరియు డాక్యుమెంట్ ఇంజెషన్ టాస్క్‌లు',
    admin_active_sources: 'కాన్ఫిగర్ చేసిన అధికారిక మూలాలు',
    admin_sources_sub: 'ప్రభుత్వ మంత్రిత్వ శాఖలు మరియు గెజిట్ పోర్టల్‌లు',
    admin_citizen_accounts: 'పౌర ఖాతాలు',
    admin_users_sub: 'వినియోగదారు నిర్వహణ API ప్రస్తుతం అందుబాటులో లేదు',
    admin_recent_jobs: 'ఇటీవలి ఇంజెషన్ పనులు',
    admin_recent_jobs_desc: 'ఇటీవలి ఆటోమేటెడ్ క్రాలర్ మరియు బ్యాచ్ ఇంజెషన్ పనులు.',
    admin_recent_docs: 'ఇటీవలి పత్రాలు',
    admin_recent_docs_desc:
      'ఇటీవల అప్‌లోడ్ చేయబడిన మరియు క్రాలర్ ద్వారా సూచిక చేయబడిన పౌర పత్రాలు.',
    admin_view_all_jobs: 'అన్ని పనులను వీక్షించండి',
    admin_view_all_docs: 'అన్ని పత్రాలను వీక్షించండి',

    // Admin Documents
    admin_docs_title: 'పౌర పత్రాల సమీక్ష & నిర్వహణ',
    admin_docs_desc:
      'ఆడిట్ చేయండి, మెటాడేటాను నవీకరించండి, వెలికితీత స్థితిని ధృవీకరించండి మరియు అధికారిక పత్రాలను నిర్వహించండి.',
    admin_docs_count: 'మొత్తం పత్రాలు',
    admin_search_docs_ph: 'శీర్షిక, వివరణ లేదా అధికారం ద్వారా పత్రాలను శోధించండి...',
    admin_all_status: 'అన్ని స్థితులు',
    admin_all_categories: 'అన్ని వర్గాలు',
    admin_all_types: 'అన్ని రకాలు',
    admin_col_title: 'పత్రం శీర్షిక',
    admin_col_category: 'వర్గం',
    admin_col_type: 'పత్రం రకం',
    admin_col_status: 'స్థితి',
    admin_col_pages: 'పేజీలు',
    admin_col_date: 'అప్‌లోడ్ చేయబడింది',
    admin_col_actions: 'చర్యలు',
    admin_edit_metadata: 'మెటాడేటాను సవరించండి',
    admin_inspect_doc: 'వివరాలను పరిశీలించండి',
    admin_delete_doc: 'పత్రాన్ని తొలగించండి',

    // Admin Jobs
    admin_jobs_title: 'ఇంజెషన్ క్యూ & పైప్‌లైన్ మానిటర్',
    admin_jobs_desc:
      'బ్యాక్‌గ్రౌండ్ క్రాలర్ రన్‌లను, డాక్యుమెంట్ ప్రాసెసింగ్‌ను ట్రాక్ చేయండి మరియు విఫలమైన పనులను మళ్ళీ ప్రయత్నించండి.',
    admin_col_job_id: 'జాబ్ ID',
    admin_col_job_type: 'రకం',
    admin_col_source: 'మూలం / పత్రం',
    admin_col_job_status: 'స్థితి',
    admin_col_retries: 'ప్రయత్నాలు',
    admin_col_created: 'సృష్టించబడిన సమయం',
    admin_inspect_job: 'పనిని పరిశీలించండి',
    admin_retry_job: 'మళ్ళీ ప్రయత్నించండి',

    // Admin Sources
    admin_sources_title: 'అధికారిక ప్రభుత్వ మూలాలు',
    admin_sources_desc:
      'విశ్వసనీయ పౌర సమాచార మూలాలు, RSS ఫీడ్‌లు, గెజిట్ పోర్టల్‌లు మరియు ఆటోమేటెడ్ షెడ్యూల్‌లను నిర్వహించండి.',
    admin_sources_count: 'అధికారిక మూలాలు కాన్ఫిగర్ చేయబడ్డాయి',
    admin_add_source: 'అధికారిక మూలాన్ని జోడించండి',
    admin_col_source_name: 'మూలం పేరు',
    admin_col_source_url: 'అధికారిక URL',
    admin_col_trust_score: 'విశ్వసనీయత స్కోరు',
    admin_col_source_status: 'స్థితి',
    admin_col_last_fetched: 'చివరిగా సేకరించిన సమయం',
    admin_trigger_ingest: 'క్రాల్ ప్రారంభించండి',
    admin_toggle_status: 'స్థితిని మార్చండి',

    // Admin Users
    admin_users_title: 'పౌర & నిర్వాహక ఖాతాలు',
    admin_users_desc: 'నమోదిత పౌర మరియు నిర్వాహక ఖాతాల భద్రతా పాలన మరియు గుర్తింపు నియంత్రణలు.',
    admin_users_notice_title: 'వినియోగదారు నిర్వహణ API అందుబాటులో లేదు',
    admin_users_notice_desc:
      'JanSathi AI బ్యాకెండ్ ప్రస్తుతం నిర్వాహక వినియోగదారుల జాబితా లేదా సవరణ ఎండ్‌పాయింట్లను అందించదు. వాస్తవ డేటా నిబంధనల ప్రకారం నకిలీ వినియోగదారు ఖాతాలు ప్రదర్శించబడవు.',

    // Admin Analytics
    admin_analytics_title: 'పత్రాల నిల్వ & ఇంజెషన్ విశ్లేషణలు',
    admin_analytics_desc:
      'ప్రభుత్వ పత్రాలు, వర్గాల విభజన మరియు క్రాలర్ ఇంజెషన్ పనుల ఫలితాల డేటాబేస్ ఆధారిత సమగ్ర విశ్లేషణలు.',
    admin_analytics_badge: 'డేటాబేస్ ధృవీకరించబడింది',
    admin_cat_distribution_title: 'పథకం వర్గం వారీగా సిద్ధమైన పత్రాలు',
    admin_cat_distribution_desc:
      'GET /api/documents/facets ద్వారా పబ్లిక్-రెడీ పత్రాల నుండి సంకలనం చేయబడింది.',
    admin_type_distribution_title: 'పత్రం రకం వారీగా సిద్ధమైన పత్రాలు',
    admin_type_distribution_desc:
      'GET /api/documents/facets ద్వారా పబ్లిక్-రెడీ పత్రాల నుండి సంకలనం చేయబడింది.',
    admin_corpus_status_title: 'వెలికితీత స్థితి వారీగా మొత్తం పత్రాల నిల్వ పంపిణీ',
    admin_corpus_status_desc:
      'ఖచ్చితమైన డేటాబేస్ గణనలను ఉపయోగించి GET /api/documents?scope=all నుండి లెక్కించబడింది.',
    admin_job_outcomes_title: 'ఇంజెషన్ పనుల నిర్వహణ ఫలితాలు',
    admin_job_outcomes_desc:
      'అన్ని పనుల స్థితుల వ్యాప్తంగా GET /api/admin/ingestion-jobs నుండి లెక్కించబడింది.',
    admin_analytics_disclosure_title: 'నిర్మాణ సమాచార బహిర్గతం',
    admin_analytics_disclosure_desc:
      'వర్గం మరియు పత్రం రకం కొలమానాలు పబ్లిక్-రెడీ పత్రాల నుండి పొందబడ్డాయి. మొత్తం స్థితి గణనలు పూర్తి డేటాబేస్ నుండి పొందబడ్డాయి. సమయ-శ్రేణి గణాంకాలు ప్రస్తుత డేటాబేస్‌లో నిల్వ చేయబడవు.',

    // Admin System Status
    admin_system_title: 'సిస్టమ్ స్థితి & టెలిమెట్రీ',
    admin_system_desc:
      'డేటాబేస్, API రన్‌టైమ్ మరియు AI సేవలకు సంబంధించిన నిజ-సమయ నిర్ధారణలు మరియు లైవ్‌నెస్ ప్రోబ్‌లు.',
    admin_system_badge: 'టెలిమెట్రీ సక్రియంగా ఉంది',
    admin_last_probed: 'చివరి ప్రోబ్ సమయం',
    admin_reprobe: 'సిస్టమ్‌ను మళ్ళీ ప్రోబ్ చేయండి',
    admin_probing: 'ప్రోబ్ చేస్తోంది...',
    admin_system_runtime: 'API రన్‌టైమ్',
    admin_system_database: 'డేటాబేస్ నిల్వ',
    admin_system_ai: 'AI & RAG ఉపవ్యవస్థ',
    admin_endpoint_probes: 'హెల్త్ ఎండ్‌పాయింట్ ఆడిట్',
    admin_ai_matrix_title: 'AI పైప్‌లైన్ కార్యాచరణ మాత్రిక',
    admin_security_compliance_title: 'పరిపాలనా భద్రత & డేటా గోప్యతా ప్రమాణం',
  },

  hi: {
    // Brand & General
    brand_title: 'जन साथी AI',
    brand_tagline: 'शासकीय सूचना नागरिक सहायक',
    brand_theme: 'सिविक पल्स',
    non_ai_notice: 'गैर-एआई आधारभूत संरचना सक्रिय',

    // Navigation
    nav_assistant: 'सहायक',
    nav_eligibility: 'पात्रता',
    nav_explainer: 'व्याख्याता',
    nav_verify: 'सत्यापन',
    nav_documents: 'दस्तावेज',
    nav_upload: 'अपलोड',
    nav_admin: 'एडमिन',
    sign_in: 'लॉग इन',
    register: 'पंजीकरण',
    sign_out: 'लॉग आउट',
    my_profile: 'प्रोफाइल',
    citizen: 'नागरिक',

    // Hero Section
    hero_badge: 'FORGE 26 • थीम 1: सिविक पल्स • राष्ट्रीय नागरिक सहायक',
    hero_title_prefix: 'सत्यापित सार्वजनिक जानकारी से हर नागरिक का ',
    hero_title_highlight: 'सशक्तिकरण एवं मार्गदर्शन',
    hero_subtitle:
      'भारतीय नागरिकों को सरकारी कल्याणकारी योजनाओं, राजपत्र अधिसूचनाओं और अधिकारों से जोड़ने वाला प्रामाणिक मंच — सुरक्षित MERN तकनीक पर आधारित।',
    search_placeholder: 'आधिकारिक राजपत्र, योजनाएं या परिपत्र खोजें...',
    search_btn: 'खोजें',
    nav_examples: 'खोज उदाहरण:',
    nav_examples_hint: '(कैटलॉग फ़िल्टर करने के लिए क्लिक करें)',
    explore_catalog: 'दस्तावेज कैटलॉग देखें',
    view_profile: 'प्रोफाइल देखें',
    register_citizen: 'नागरिक पंजीकरण करें',
    citizen_sign_in: 'नागरिक लॉग इन',

    // Topic Pills
    topic_agriculture: 'कृषि एवं किसान कल्याण',
    topic_healthcare: 'स्वास्थ्य एवं परिवार कल्याण',
    topic_education: 'शिक्षा एवं छात्रवृत्ति',
    topic_pension: 'सामाजिक सुरक्षा एवं पेंशन',
    topic_employment: 'श्रम एवं रोजगार',
    topic_gazettes: 'राजपत्र एवं परिपत्र',

    // Trust Badges
    trust_non_ai: 'गैर-एआई नींव (शून्य नकली आउटपुट)',
    trust_pipeline: 'आधिकारिक स्रोतों की पाइपलाइन',
    trust_indic: 'देवनागरी एवं भारतीय भाषाओं का समर्थन',
    trust_security: 'सुरक्षित प्रमाणीकरण एवं डेटा गोपनीयता',

    // AI Disclosure
    ai_disclosure_title: 'संरचनात्मक शुचिता: एआई एंडपॉइंट्स 501 क्यों लौटाते हैं',
    ai_disclosure_body:
      'सरकारी योजनाएं नागरिकों के जीवन को सीधे प्रभावित करती हैं, इसलिए जन साथी AI किसी भी कृत्रिम या भ्रामक सलाह को उत्पन्न नहीं करता। पूर्ण दस्तावेज विश्लेषण और सत्यापन पाइपलाइन तैयार होने तक सभी एआई एंडपॉइंट्स (/api/ai/*) जानबूझकर 501 NOT_IMPLEMENTED लौटाते हैं।',
    inspect_ai_status: 'एआई हुक स्थिति जांचें →',

    // Service Modules
    modules_heading: 'नागरिक सेवा प्रभाग',
    modules_subheading: 'उपलब्ध सेवाओं और आगामी विकास चरणों का अन्वेषण करें',
    module_count: '6 नागरिक प्रभाग',

    mod_assistant_title: 'नागरिक सहायक (Civic Assistant)',
    mod_assistant_desc:
      'सरकारी राजपत्रों के प्रत्यक्ष उद्धरणों के साथ नागरिक प्रश्नों का उत्तर देने वाला सहायक।',
    mod_assistant_badge: 'एआई आर्किटेक्चर (501)',

    mod_eligibility_title: 'योजना पात्रता मूल्यांकन',
    mod_eligibility_desc:
      'आधिकारिक योजना नियमों के विरुद्ध नागरिक मानदंडों का पारदर्शी और सटीक मिलान।',
    mod_eligibility_badge: 'एआई आर्किटेक्चर (501)',

    mod_explainer_title: 'दस्तावेज व्याख्याता (Document Explainer)',
    mod_explainer_desc:
      'जटिल कानूनी राजपत्रों और परिपत्रों को सरल नागरिक भाषा में समझाने वाला माध्यम।',
    mod_explainer_badge: 'एआई आर्किटेक्चर (501)',

    mod_verify_title: 'दावा सत्यापन (Claim Verification)',
    mod_verify_desc: 'वायरल संदेशों और दावों का आधिकारिक सरकारी स्रोतों से निष्पक्ष सत्यापन।',
    mod_verify_badge: 'एआई आर्किटेक्चर (501)',

    mod_documents_title: 'आधिकारिक दस्तावेज पुस्तकालय',
    mod_documents_desc:
      'विभागीय फ़िल्टर और पूर्ण-पाठ खोज के साथ सरकारी नीतियों का सत्यापित संग्रह।',
    mod_documents_badge: 'कैटलॉग तैयार',

    mod_upload_title: 'नागरिक दस्तावेज अपलोड',
    mod_upload_desc:
      'SHA-256 डिडुप्लीकेशन और सुरक्षा जांच के साथ सरकारी पीडीएफ का सुरक्षित भंडारण।',
    mod_upload_badge: 'स्टोरेज तैयार',

    // Pipeline
    pipeline_heading: 'जन साथी नागरिक सूचना को कैसे संसाधित करता है',
    pipeline_subheading:
      'हमारी सत्यापन वास्तुकला वर्तमान सक्रिय सेवाओं और आगामी सुविधाओं को स्पष्ट करती है',
    stage1_title: 'स्रोत प्रबंधन एवं निष्कर्षण',
    stage1_status: 'चरण 5 और 6 में लागू',
    stage1_desc:
      'एसएसआरएफ सुरक्षा, एसएचए-256 डिडुप्लीकेशन और पीडीएफ मैजिक-बाइट जांच के साथ आधिकारिक स्रोत।',
    stage2_title: 'पाठ सामान्यीकरण और विखंडन',
    stage2_status: 'चरण 6 में लागू',
    stage2_desc: 'यूनिकोड एनएफसी सामान्यीकरण जो भारतीय लिपियों को संरक्षित रखता है।',
    stage3_title: 'दस्तावेज पुस्तकालय एवं खोज',
    stage3_status: 'चरण 9 हेतु निर्धारित',
    stage3_desc: 'कीवर्ड इंडेक्सिंग द्वारा सरकारी परिपत्रों को विभाग और राज्य अनुसार खोजें।',
    stage4_title: 'सत्यापित उद्धरण आधारित एआई',
    stage4_status: 'चरण 10 हेतु निर्धारित',
    stage4_desc: 'सटीक संदर्भों के साथ संवाद। सुरक्षा मानक पूरे होने तक जानबूझकर 501 लौटाता है।',

    // FAQ
    faq_heading: 'अक्सर पूछे जाने वाले प्रश्न (FAQ)',
    faq_subheading: 'प्रणाली संरचना, नागरिक गोपनीयता और आगामी सुविधाओं के संबंध में उत्तर',
    faq1_q: 'एआई सुविधाएं वर्तमान में 501 Not Implemented क्यों लौटाती हैं?',
    faq1_a:
      'यह एक सोची-समझी सुरक्षा व्यवस्था है। कल्याणकारी योजनाओं में गलत या काल्पनिक जानकारी नागरिकों को गुमराह कर सकती है। दस्तावेज विश्लेषण और सत्यापन पाइपलाइन पूरी होने तक सभी एआई एंडपॉइंट्स जानबूझकर 501 स्थिति में रखे गए हैं।',
    faq2_q: 'अपलोड किए गए दस्तावेजों की प्रामाणिकता कैसे जांची जाती है?',
    faq2_a:
      'सर्वर बाइनरी मैजिक बाइट्स (%PDF-) और SHA-256 हैश का उपयोग करके डुप्लीकेट दस्तावेजों को रोकता है।',
    faq3_q: 'क्या टॉपिक बटन लाइव सरकारी योजनाएं हैं?',
    faq3_a:
      'नहीं। ये खोज उदाहरण हैं जो आपको संबंधित श्रेणियों (कृषि, स्वास्थ्य, शिक्षा आदि) में दस्तावेजों को खोजने में मदद करते हैं।',
    faq4_q: 'क्या मेरा व्यक्तिगत नागरिक डेटा सुरक्षित है?',
    faq4_a:
      'हाँ। प्रोफाइल डेटा bcrypt पासवर्ड हैशिंग और JWT प्रमाणीकरण के साथ सुरक्षित डेटाबेस में रखा जाता है।',

    // CTA
    cta_title: 'सत्यापित सार्वजनिक जानकारी देखने के लिए तैयार हैं?',
    cta_desc:
      'इंडेक्स किए गए दस्तावेजों को खोजें, नागरिक प्राथमिकताएं सेट करें या एडमिन सुविधाओं को जांचें।',
    cta_browse: 'दस्तावेज देखें',
    cta_register: 'खाता बनाएं',

    // Phase 9 — Documents & Uploads
    doc_library_title: 'आधिकारिक दस्तावेज पुस्तकालय',
    doc_library_subtitle:
      'सत्यापित सरकारी अधिसूचनाएं, योजना दिशा-निर्देश, परिपत्र और अपने व्यक्तिगत अपलोड खोजें।',
    doc_scope_public: 'आधिकारिक सार्वजनिक पुस्तकालय',
    doc_scope_mine: 'मेरे अपलोड किए गए दस्तावेज',
    doc_search_placeholder: 'दस्तावेज शीर्षक या जारीकर्ता मंत्रालय द्वारा खोजें...',
    doc_search_btn: 'खोजें',
    doc_upload_btn: 'दस्तावेज अपलोड करें',
    doc_refresh_btn: 'रिफ्रेश',
    doc_filter_category: 'श्रेणी',
    doc_filter_all_categories: 'सभी श्रेणियां',
    doc_filter_doctype: 'दस्तावेज प्रकार',
    doc_filter_all_types: 'सभी प्रकार',
    doc_filter_language: 'भाषा',
    doc_filter_all_languages: 'सभी भाषाएं',
    doc_filter_status: 'प्रसंस्करण स्थिति',
    doc_filter_all_statuses: 'सभी स्थितियां',
    doc_filter_sort: 'क्रमबद्धता',
    doc_sort_newest: 'नवीनतम पहले',
    doc_sort_oldest: 'पुरातन पहले',
    doc_sort_title_asc: 'शीर्षक (A–Z)',
    doc_sort_title_desc: 'शीर्षक (Z–A)',
    doc_sort_published: 'प्रकाशन तिथि',
    doc_reset_filters: 'फ़िल्टर रीसेट करें',
    doc_open_reader: 'रीडर खोलें',
    doc_pages_count: 'पृष्ठ',
    doc_chunks_count: 'खंड',
    doc_no_matching: 'कोई मेल खाता दस्तावेज नहीं मिला',
    doc_no_matching_desc: 'अपने खोज शब्दों को बदलें या चयनित फ़िल्टर हटाएं।',
    doc_empty_personal: 'अभी तक कोई दस्तावेज अपलोड नहीं किया गया',
    doc_empty_personal_desc:
      'टेक्स्ट निष्कर्षण शुरू करने के लिए अपना पहला सरकारी दस्तावेज या राजपत्र अपलोड करें।',
    doc_empty_library: 'कोई आधिकारिक दस्तावेज उपलब्ध नहीं है',
    doc_empty_library_desc:
      'वर्तमान में सार्वजनिक पुस्तकालय खाली है। नए आधिकारिक स्रोत जुड़ने पर पुनः जांचें।',
    doc_prev_page: 'पिछला',
    doc_next_page: 'अगला',
    doc_page_of: 'का',
    doc_showing: 'प्रदर्शित',

    // Status Badges
    status_ready: 'तैयार',
    status_processing: 'प्रसंस्करण जारी',
    status_pending: 'कतार में',
    status_needs_ocr: 'ओसीआर आवश्यक',
    status_failed: 'विफल',

    // Document Reader
    reader_back_to_library: 'दस्तावेज पुस्तकालय',
    reader_official_portal: 'आधिकारिक स्रोत पोर्टल',
    reader_delete_btn: 'दस्तावेज हटाएं',
    reader_refresh_status: 'स्थिति रिफ्रेश करें',
    reader_extracted_text: 'निकाली गई पाठ्य सामग्री',
    reader_integrity_title: 'दस्तावेज शुचिता एवं स्रोत विवरण',
    reader_integrity_subtitle: 'दर्ज भंडारण पैरामीटर और क्रिप्टोग्राफ़िक चेकसम',
    reader_recorded_sha256: 'दर्ज SHA-256 चेकसम',
    reader_checksum_desc:
      'डुप्लीकेट रोकने और सुरक्षित भंडारण सुनिश्चित करने के लिए अपलोड के समय गणना की गई।',
    reader_checksum_copied: 'चेकसम क्लिपबोर्ड पर कॉपी किया गया',
    reader_file_type: 'फ़ाइल प्रकार',
    reader_file_size: 'फ़ाइल आकार',
    reader_scope: 'पहुंच दायरा',
    reader_uploaded_date: 'अपलोड तिथि',
    reader_last_modified: 'अंतिम संशोधन',
    reader_empty_text: 'कोई निकाली गई पाठ्य सामग्री उपलब्ध नहीं है।',
    reader_ai_callout_title: 'क्या आप एआई सरलीकरण या योजना नियम चाहते हैं?',
    reader_ai_callout_desc:
      'संवादात्मक दस्तावेज व्याख्याता और पात्रता विश्लेषण चरण 10 में उपलब्ध कराए जाएंगे।',
    reader_ai_callout_btn: 'व्याख्याता देखें (501)',
    delete_modal_title: 'अपलोड किया गया दस्तावेज हटाएं?',
    delete_modal_desc:
      'क्या आप वाकई इस दस्तावेज को हटाना चाहते हैं? यह सहेजी गई पीडीएफ, पृष्ठों और टेक्स्ट अंशों को स्थायी रूप से मिटा देगा।',
    delete_modal_confirm: 'हटाने की पुष्टि करें',
    delete_modal_cancel: 'रद्द करें',
    delete_modal_deleting: 'हटाया जा रहा है...',

    // Upload Page
    upload_page_title: 'नागरिक दस्तावेज अपलोड',
    upload_page_subtitle:
      'व्यक्तिगत टेक्स्ट निष्कर्षण और इंडेक्सिंग के लिए आधिकारिक परिपत्र या राजपत्र अपलोड करें।',
    upload_select_pdf: 'पीडीएफ दस्तावेज चुनें',
    upload_click_browse: 'ब्राउज़ करने के लिए क्लिक करें',
    upload_drag_drop: 'या यहाँ पीडीएफ ड्रैग और ड्रॉप करें',
    upload_pdf_only_hint: 'केवल पीडीएफ प्रारूप • अधिकतम अनुमेय आकार:',
    upload_meta_title: 'दस्तावेज विवरण (वैकल्पिक)',
    upload_meta_title_label: 'दस्तावेज शीर्षक',
    upload_meta_title_placeholder: 'फ़ाइल नाम से स्वतः प्राप्त करने के लिए खाली छोड़ें',
    upload_meta_category: 'श्रेणी',
    upload_meta_doctype: 'दस्तावेज प्रकार',
    upload_meta_language: 'दस्तावेज भाषा',
    upload_meta_auto_detect: 'टेक्स्ट से स्वतः पहचानें',
    upload_meta_published: 'प्रकाशन तिथि',
    upload_meta_authority: 'जारीकर्ता प्राधिकरण',
    upload_meta_source: 'स्रोत URL',
    upload_submit_btn: 'अपलोड करें और कतारबद्ध करें',
    upload_uploading_btn: 'अपलोड हो रहा है',
    upload_cancel_btn: 'रद्द करें',
    upload_success_queued_title: 'अपलोड स्वीकृत और प्रसंस्करण कतार में',
    upload_success_duplicate_title: 'समान दस्तावेज पहले से उपलब्ध (डुप्लीकेट)',
    upload_success_open_reader: 'दस्तावेज रीडर में खोलें',
    upload_success_another: 'अन्य दस्तावेज अपलोड करें',
    upload_specs_title: 'अपलोड विनिर्देश',
    upload_specs_subtitle: 'बैकएंड सुरक्षा पाइपलाइन द्वारा लागू नियम',

    // Phase 10: AI Citizen Pages & HTTP 501 Disclosures
    ai_not_implemented_badge: 'गैर-एआई आधारभूत संरचना',
    ai_service_unavailable_title: 'एआई एंडपॉइंट उपलब्ध नहीं है (HTTP 501)',
    probe_ai_status_btn: 'बैकएंड एआई हुक जांचें',
    citizen_submitted_inquiry: 'प्राप्त नागरिक प्रविष्टि:',
    ai_safeguard_explanation:
      'सृजनात्मक संश्लेषण और स्वचालित निर्णय जानबूझकर अनुपलब्ध हैं (HTTP 501 NOT_IMPLEMENTED)। नागरिक कल्याण मार्गदर्शन के लिए असत्यापित मॉडल आउटपुट के बजाय आधिकारिक वैधानिक राजपत्रों के सत्यापन की आवश्यकता होती है।',
    ai_safeguard_backend_lock:
      'बैकएंड एंडपॉइंट जानबूझकर लागू नहीं किया गया है। अंतर्ग्रहण, ओसीआर पार्सिंग और उद्धरण पाइपलाइन सक्रिय विकास में हैं और मॉडल से जुड़े नहीं हैं।',
    planned_capabilities_heading: 'नियोजित वास्तुकला क्षमताएं (वर्तमान में परिचालन नहीं)',
    probe_status_note:
      'लाइव जांच पुष्टि करती है कि एंडपॉइंट जुड़ा नहीं है (connected: false)। वर्तमान में कोई मॉडल निष्कर्ष सक्रिय नहीं है।',
    ai_not_implemented_toast: 'एआई सेवा एंडपॉइंट आगामी एकीकरण के लिए निर्धारित है।',

    // Assistant Page
    assistant_page_title: 'सिविक एआई सहायक',
    assistant_page_subtitle:
      'भारतीय सरकारी योजनाओं, नागरिक लाभों और सार्वजनिक सेवाओं पर सटीक मार्गदर्शन प्रदान करने वाला बहुभाषी संवादात्मक सहायक।',
    assistant_grounding_title: 'आधारित नागरिक संरचना',
    assistant_grounding_desc:
      'यह सहायक केवल सत्यापित आधिकारिक राजपत्रों और सांविधिक नीतियों का उपयोग करके उत्तर देने के लिए बनाया गया है। झूठे कल्याणकारी वादों को रोकने के लिए संवादात्मक संश्लेषण को फिलहाल निष्क्रिय रखा गया है।',
    assistant_form_title: 'नागरिक प्रश्न पूछें',
    assistant_form_subtitle:
      'कल्याणकारी नीतियों, राजपत्रों या पात्रता मानदंडों के संबंध में अपनी पूछताछ दर्ज करें।',
    assistant_question_label: 'आपका प्रश्न / पूछताछ',
    assistant_placeholder:
      'उदा. पीएम-किसान सम्मान निधि के लिए आय सीमा और आवश्यक दस्तावेज क्या हैं?',
    assistant_min_chars_note: 'न्यूनतम 3 अक्षर आवश्यक',
    assistant_min_chars_error: 'कृपया कम से कम 3 अक्षरों का प्रश्न दर्ज करें।',
    assistant_max_chars_error: 'प्रश्न 1000 अक्षरों से अधिक नहीं हो सकता।',
    btn_reset: 'फॉर्म रीसेट करें',
    assistant_submitting: 'पूछताछ प्रस्तुत की जा रही है...',
    assistant_submit_btn: 'पूछताछ सबमिट करें',
    assistant_unavailable_desc:
      'नागरिक कल्याण में शून्य भ्रांति (हलुसिनेशन) सुनिश्चित करने के लिए, संवादात्मक प्रश्न-उत्तर को हमारे RAG पाइपलाइन और सत्यापित स्रोत इंजन के जुड़ने तक रोका गया है।',
    plan_feat_rag: 'सत्यापित भारतीय सरकारी राजपत्रों पर आधारित संवादात्मक RAG पाइपलाइन',
    plan_feat_citation: 'सटीक राजपत्र अधिसूचना और पृष्ठ संख्या के साथ आधिकारिक सांविधिक संदर्भ',
    plan_feat_voice: 'भाषिणी (Bhashini) द्वारा समर्थित भारतीय भाषा इनपुट और ध्वनि संश्लेषण',
    plan_feat_guardrails:
      'काल्पनिक कल्याण योजनाओं या फर्जी लाभों को रोकने के लिए सख्त सुरक्षा नियम',
    assistant_examples_title: 'उदाहरणात्मक नमूना प्रश्न (UI परीक्षण उदाहरण)',
    assistant_examples_disclaimer:
      'ये प्रश्न केवल इंटरफ़ेस प्रदर्शन के लिए दिए गए हैं और आधिकारिक योजना नियमों, सत्यापित तथ्यों या सरकारी सलाह का प्रतिनिधित्व नहीं करते हैं।',
    example_q1: 'पीएम आवास योजना ग्रामीण आवास अनुदान के लिए पात्रता मानदंड क्या हैं?',
    example_q2: 'राज्य विकलांगता पेंशन नामांकन के लिए कौन से दस्तावेज आवश्यक हैं?',
    example_q3: 'एक छोटा किसान PMKSY के तहत रियायती ड्रिप सिंचाई के लिए कैसे आवेदन कर सकता है?',
    example_q4: 'केंद्रीय उर्वरक सब्सिडी के लिए न्यूनतम भूमि सीमा क्या है?',

    // Eligibility Page
    eligibility_page_title: 'योजना पात्रता मूल्यांकनकर्ता',
    eligibility_page_subtitle:
      'सरकारी योजना नियमों के साथ नागरिक जनसांख्यिकीय मानदंडों का मिलान करने वाला निश्चित एवं एआई-सहायता प्राप्त मूल्यांकन।',
    eligibility_notice_title: 'सांविधिक पात्रता सत्यापन सूचना',
    eligibility_notice_desc:
      'आधिकारिक योजना पात्रता राजपत्र अधिसूचना मानदंडों द्वारा शासित होती है। गलत अस्वीकृति या भ्रामक अपेक्षाओं को रोकने के लिए, सत्यापित मूल्यांकन तालिकाओं के लोड होने तक स्वचालित मिलान सक्षम नहीं है।',
    eligibility_form_title: 'योजना और आवेदक मानदंड दर्ज करें',
    eligibility_form_subtitle:
      'आधिकारिक योग्यताओं के साथ तुलना करने के लिए लक्षित योजना का नाम और विवरण प्रदान करें।',
    eligibility_scheme_label: 'लक्षित योजना या लाभ कार्यक्रम',
    eligibility_scheme_placeholder:
      'उदा. पीएम किसान सम्मान निधि, पोस्ट-मैट्रिक छात्रवृत्ति, आयुष्मान भारत',
    eligibility_min_query_error: 'कृपया कम से कम 3 अक्षरों में योजना का नाम निर्दिष्ट करें।',
    eligibility_state_label: 'निवास का राज्य',
    select_state_placeholder: 'अखिल भारतीय / अनिर्दिष्ट',
    eligibility_district_label: 'जिला (वैकल्पिक)',
    eligibility_district_placeholder: 'उदा. पटना, पुणे, लखनऊ',
    eligibility_category_label: 'नागरिक / लाभार्थी श्रेणी',
    select_category_placeholder: 'नागरिक श्रेणी चुनें',
    eligibility_education_label: 'शिक्षा स्तर',
    select_education_placeholder: 'शिक्षा स्तर चुनें',
    eligibility_income_label: 'वार्षिक पारिवारिक आय सीमा',
    select_income_placeholder: 'आय सीमा चुनें',
    eligibility_occupation_label: 'पाठ्यक्रम या विशिष्ट व्यवसाय',
    eligibility_occupation_placeholder: 'उदा. लघु किसान, बी.टेक द्वितीय वर्ष, बुनकर',
    eligibility_social_label: 'सामाजिक श्रेणी (वैकल्पिक)',
    eligibility_social_placeholder: 'उदा. General, OBC, SC, ST, EWS',
    eligibility_privacy_note:
      'जनसांख्यिकीय फ़ील्ड केवल मानदंड मिलान के लिए POST /api/ai/eligibility को पैरामीटर के रूप में भेजे जाते हैं। चूंकि यह एंडपॉइंट वर्तमान में HTTP 501 लौटाता है, इसलिए कोई पात्रता मूल्यांकन न तो संसाधित होता है और न ही संग्रहीत किया जाता है।',
    eligibility_evaluating: 'मानदंडों का मूल्यांकन किया जा रहा है...',
    eligibility_submit_btn: 'पात्रता का मूल्यांकन करें',
    eligibility_unavailable_desc:
      'सार्वजनिक लाभों के अनुचित इनकार को रोकने के लिए, सांविधिक नियम इंजनों के राजपत्रों से सत्यापित होने तक स्वचालित पात्रता मूल्यांकन जानबूझकर अक्षम रखा गया है।',
    plan_feat_matching:
      'नागरिक प्रोफ़ाइल (राज्य, श्रेणी, आय, व्यवसाय) के आधार पर स्वचालित मानदंड मिलान',
    plan_feat_checklist: 'सरकारी कार्यालयों में जाने से पहले आवश्यक दस्तावेजों की वैधानिक चेकलिस्ट',
    plan_feat_portals: 'आधिकारिक आवेदन पोर्टल और नोडल अधिकारियों के सीधे लिंक',
    plan_feat_breakdown:
      'सफल और असफल योग्यता मानदंडों का पारदर्शी विवरण (कोई अज्ञात ब्लैक-बॉक्स एआई नहीं)',
    eligibility_criteria_guide_title: 'सांविधिक पात्रता सत्यापन संरचना',
    eligibility_criteria_guide_desc:
      'सक्रिय होने पर, जन साथी AI एक हाइब्रिड नियम इंजन का उपयोग करता है। सबसे पहले यह आयु, आय सीमा और राज्य निवास की जांच करता है। इसके बाद, राजपत्र आदेश से दस्तावेजों की सूची का सत्यापन करता है।',
    criteria_step1_title: 'निश्चित फ़िल्टर',
    criteria_step1_desc: 'आय, अधिवास और आयु सीमा की सटीक जांच।',
    criteria_step2_title: 'राजपत्र सत्यापन',
    criteria_step2_desc: 'रिपॉजिटरी में सत्यापित अधिसूचना पाठ के साथ तुलना।',
    criteria_step3_title: 'शून्य मनगढ़ंत दावा',
    criteria_step3_desc: 'यदि कोई नियम अस्पष्ट है, तो प्रणाली अधिकारी परामर्श की सिफारिश करती है।',

    // Explainer Page
    explainer_page_title: 'नागरिक दस्तावेज़ व्याख्याकार',
    explainer_page_subtitle:
      'जटिल राजपत्र अधिसूचनाओं, सरकारी आदेशों (G.O.) और परिपत्रों को स्पष्ट नागरिक सारांशों में सरलीकृत करता है।',
    explainer_grounding_title: 'दस्तावेज़ प्रामाणिकता एवं सत्यापन सूचना',
    explainer_grounding_desc:
      'दस्तावेज़ व्याख्याकार आधिकारिक रिपॉजिटरी में संग्रहीत प्रामाणिक राजपत्रों पर कार्य करता है। आप नीचे सत्यापित पाठ पढ़ सकते हैं। पूर्ण सत्यापन मॉडल जुड़ने तक एआई सारांश HTTP 501 के साथ सुरक्षित है।',
    explainer_doc_fetch_error: 'दस्तावेज़ लोड करने में विफल',
    loading_document: 'प्रामाणिक दस्तावेज़ लोड हो रहा है...',
    browse_catalog_btn: 'उपलब्ध दस्तावेज़ कैटलॉग ब्राउज़ करें',
    untitled_document: 'अनाम दस्तावेज़',
    official_authority: 'भारत सरकार',
    view_full_reader: 'पूर्ण रीडर',
    request_summary_title: 'एआई दस्तावेज़ सरलीकरण',
    request_summary_desc:
      'संरचित नागरिक निष्कर्षों के लिए दस्तावेज़ संदर्भ POST /api/ai/ask को भेजता है।',
    explaining_btn: 'व्याख्या का अनुरोध किया जा रहा है...',
    explain_document_btn: 'एआई व्याख्या का अनुरोध करें',
    explainer_unavailable_desc:
      'दस्तावेज़ व्याख्या के लिए ओसीआर टोकन पर एलएलएम सारांश की आवश्यकता होती है। यह एंडपॉइंट सत्यापित संदर्भ निष्कर्षण पूर्ण होने तक HTTP 501 NOT_IMPLEMENTED के साथ सुरक्षित है।',
    plan_feat_plain_lang: 'कानूनी जटिलताओं के बिना सरल भाषा में व्याख्या',
    plan_feat_takeaways: 'मुख्य नागरिक निष्कर्ष: कौन प्रभावित है, क्या बदलता है, और आगामी कदम',
    plan_feat_multilingual_synth: 'हिंदी, अंग्रेजी, तेलुगु और तमिल में बहुभाषी संश्लेषण',
    plan_feat_side_by_side: 'मूल राजपत्र पाठ और पृष्ठ हाइलाइट्स के साथ साथ-साथ दृश्य',
    extracted_text_heading: 'प्रामाणिक रूप से निकाला गया पाठ (रिपॉजिटरी से)',
    extracted_text_subheading:
      'सत्यापित पीडीएफ प्रसंस्करण से डेटाबेस में संग्रहीत प्रत्यक्ष ओसीआर पाठ।',
    page_label: 'पृष्ठ',
    no_page_text: 'इस पृष्ठ पर कोई पाठ नहीं निकाला गया।',
    no_pages_preview: 'इस दस्तावेज़ के लिए कोई पृष्ठ पाठ पूर्वावलोकन उपलब्ध नहीं है।',
    explainer_select_title: 'व्याख्या करने के लिए एक दस्तावेज़ चुनें',
    explainer_select_subtitle:
      'रिपॉजिटरी से आधिकारिक राजपत्र अधिसूचना, परिपत्र या योजना आदेश का चयन करें।',
    explainer_select_desc:
      'दस्तावेज़ की व्याख्या देखने के लिए, लाइब्रेरी ब्राउज़ करें और किसी भी नीति पर "Explain Document" पर क्लिक करें। आप मूल पाठ और एआई सरलीकरण दोनों का निरीक्षण कर सकेंगे।',
    explainer_capabilities_title: 'दस्तावेज़ व्याख्याकार की विशेषताएं',
    explainer_feat1_desc: 'प्रशासनिक आदेशों को समझने योग्य नागरिक मार्गदर्शन में अनुवादित करता है।',
    explainer_feat2_desc:
      'नागरिकों के लिए आवश्यक कदमों, समय-सीमाओं और आवश्यकताओं को रेखांकित करता है।',
    explainer_feat3_desc: 'सटीक नागरिक शब्दावली के साथ क्षेत्रीय भाषाओं में उपलब्ध।',
    explainer_feat4_desc: 'प्रत्येक सारांश बिंदु को सीधे प्रामाणिक राजपत्र पृष्ठ से सत्यापित करें।',

    // Verify Page
    verify_page_title: 'सरकारी दावे एवं तथ्य सत्यापन',
    verify_page_subtitle:
      'नागरिक दुष्प्रचार को रोकने के लिए वायरल संदेशों और सोशल मीडिया दावों को सत्यापित सरकारी स्रोतों से जांचें।',
    verify_grounding_title: 'दुष्प्रचार-रोधी सुरक्षा उपाय',
    verify_grounding_desc:
      'जिम्मेदारी से काम करने के लिए, जन साथी AI आधिकारिक राजपत्र और पीआईबी (PIB) सत्यापन के बिना कोई भी स्वचालित "सही" या "गलत" निर्णय जारी नहीं करता है। पूर्ण स्रोत सत्यापन तैयार होने तक यह प्रणाली HTTP 501 दर्शाती है।',
    verify_form_title: 'दावा या वायरल परिपत्र प्रस्तुत करें',
    verify_form_subtitle:
      'आधिकारिक राजपत्र प्रकाशनों के साथ मूल्यांकन के लिए संदेश या समाचार अंश दर्ज करें।',
    verify_claim_label: 'दावा / अफवाह / सार्वजनिक सूचना पाठ',
    verify_placeholder:
      'उदा. संदेश में दावा किया गया है कि सरकार पीएम-कुसुम के तहत बिना बिजली शुल्क के मुफ्त सौर पंप वितरित कर रही है...',
    verify_min_chars_note: 'कम से कम 10 अक्षर आवश्यक हैं',
    verify_min_chars_error: 'कृपया कम से कम 10 अक्षरों का दावा दर्ज करें।',
    verify_max_chars_error: 'दावा 2000 अक्षरों से अधिक नहीं हो सकता।',
    verify_submitting: 'स्रोतों से मिलान किया जा रहा है...',
    verify_submit_btn: 'स्रोतों के साथ दावे का सत्यापन करें',
    verify_unavailable_desc:
      'गलत तथ्य-जांच को रोकने के लिए, आधिकारिक पीआईबी फीड और राजपत्र सिमेंटिक अनुक्रमण पूरा होने तक दावा सत्यापन इंजन HTTP 501 NOT_IMPLEMENTED के साथ सुरक्षित है।',
    plan_feat_semantic: 'आधिकारिक राजपत्रों और पीआईबी फैक्ट चेक फीड के साथ स्वचालित सिमेंटिक तुलना',
    plan_feat_verdict: 'पारदर्शी निर्णय: आधिकारिक रूप से पुष्ट, निराधार अफवाह, या असत्यापित',
    plan_feat_debunk_refs: 'आधिकारिक खंडन संदर्भ, प्रेस विज्ञप्तियां और सांविधिक राजपत्र लिंक',
    plan_feat_shareable:
      'व्हाट्सएप अफवाहों से निपटने के लिए सत्यापित संदर्भों वाला साझा करने योग्य कार्ड',
    verify_examples_title: 'उदाहरणात्मक नमूना दावे (काल्पनिक UI उदाहरण)',
    verify_examples_disclaimer:
      'ये कथन केवल इंटरफ़ेस परीक्षण के लिए प्रदान किए गए काल्पनिक उदाहरण हैं। वे वास्तविक सरकारी घोषणाएं, सत्यापित तथ्य या आधिकारिक परिपत्र नहीं हैं।',
    verify_ex1:
      'वायरल संदेश में दावा है कि केंद्र सरकार सभी बेरोजगार युवाओं को 5,000 रुपये मासिक भत्ता दे रही है।',
    verify_ex2:
      'सोशल मीडिया पर प्रसारित नोटिस में कहा गया है कि कल तक पेंशन निकासी के लिए आधार अनिवार्य है।',
    verify_ex3:
      'संदेश में दावा किया गया है कि देश भर में किसानों के 2 लाख रुपये तक के फसली ऋण माफ कर दिए गए हैं।',
    verify_ex4:
      'पोस्ट में दावा किया गया है कि नए राजपत्र ने बिना आय सीमा के आयुष्मान भारत को सार्वभौमिक बना दिया है।',

    // Admin Navigation & Shell
    admin_portal_title: 'नागरिक व्यवस्थापक कंसोल',
    admin_nav_overview: 'अवलोकन',
    admin_nav_documents: 'दस्तावेज़',
    admin_nav_jobs: 'अंतर्ग्रहण कार्य',
    admin_nav_sources: 'आधिकारिक स्रोत',
    admin_nav_users: 'उपयोगकर्ता',
    admin_nav_analytics: 'एनालिटिक्स',
    admin_nav_system: 'सिस्टम स्थिति',
    admin_return_citizen: 'नागरिक पोर्टल पर लौटें',
    admin_sign_out: 'साइन आउट',
    admin_badge_live: 'लाइव प्रोडक्शन',
    admin_badge_active: 'सत्यापित सक्रिय',
    admin_refresh: 'रीफ्रेश करें',
    admin_refreshing: 'रीफ्रेश हो रहा है...',

    // Admin Dashboard
    admin_dashboard_title: 'प्रशासनिक नियंत्रण केंद्र',
    admin_dashboard_desc:
      'सिस्टम-स्तरीय शासन, क्रॉलर अंतर्ग्रहण पाइपलाइन निगरानी और नागरिक दस्तावेज़ सत्यापन।',
    admin_total_documents: 'कुल अंतर्ग्रहीत दस्तावेज़',
    admin_total_docs_sub: 'संपूर्ण डेटाबेस संकलन (scope=all)',
    admin_ready_documents: 'सार्वजनिक उपयोग हेतु तैयार',
    admin_ready_docs_sub: 'नागरिकों द्वारा खोजे जाने योग्य',
    admin_pending_documents: 'लंबित एवं प्रक्रियाधीन',
    admin_pending_docs_sub: 'पाठ निष्कर्षण या सत्यापन प्रक्रिया में',
    admin_failed_documents: 'विफल एवं OCR आवश्यक',
    admin_failed_docs_sub: 'निष्कर्षण विफलताएं या स्कैन किए गए पीडीएफ',
    admin_ingestion_jobs_total: 'निष्पादित अंतर्ग्रहण कार्य',
    admin_jobs_sub: 'क्रॉलर और दस्तावेज़ अंतर्ग्रहण कार्य',
    admin_active_sources: 'कॉन्फ़िगर किए गए आधिकारिक स्रोत',
    admin_sources_sub: 'सरकारी मंत्रालय और राजपत्र पोर्टल',
    admin_citizen_accounts: 'नागरिक खाते',
    admin_users_sub: 'उपयोगकर्ता प्रबंधन API वर्तमान में अनुपलब्ध है',
    admin_recent_jobs: 'हाल के अंतर्ग्रहण कार्य',
    admin_recent_jobs_desc: 'नवीनतम स्वचालित क्रॉलर और बैच अंतर्ग्रहण निष्पादन।',
    admin_recent_docs: 'हाल के दस्तावेज़',
    admin_recent_docs_desc: 'हाल ही में अपलोड और अनुक्रमित किए गए नागरिक दस्तावेज़।',
    admin_view_all_jobs: 'सभी कार्य देखें',
    admin_view_all_docs: 'सभी दस्तावेज़ देखें',

    // Admin Documents
    admin_docs_title: 'नागरिक दस्तावेज़ समीक्षा एवं प्रबंधन',
    admin_docs_desc:
      'ऑडिट करें, मेटाडेटा अपडेट करें, निष्कर्षण स्थिति सत्यापित करें और आधिकारिक दस्तावेज़ों का प्रबंधन करें।',
    admin_docs_count: 'कुल दस्तावेज़',
    admin_search_docs_ph: 'शीर्षक, विवरण या प्राधिकरण द्वारा खोजें...',
    admin_all_status: 'सभी स्थितियाँ',
    admin_all_categories: 'सभी श्रेणियाँ',
    admin_all_types: 'सभी प्रकार',
    admin_col_title: 'दस्तावेज़ शीर्षक',
    admin_col_category: 'श्रेणी',
    admin_col_type: 'दस्तावेज़ प्रकार',
    admin_col_status: 'स्थिति',
    admin_col_pages: 'पृष्ठ',
    admin_col_date: 'अपलोड तिथि',
    admin_col_actions: 'कार्रवाई',
    admin_edit_metadata: 'मेटाडेटा संपादित करें',
    admin_inspect_doc: 'विवरण जांचें',
    admin_delete_doc: 'दस्तावेज़ हटाएं',

    // Admin Jobs
    admin_jobs_title: 'अंतर्ग्रहण कतार एवं पाइपलाइन मॉनिटर',
    admin_jobs_desc:
      'पृष्ठभूमि क्रॉलर रन, दस्तावेज़ पार्सिंग कार्यों को ट्रैक करें और विफल कार्यों को पुनः प्रयास करें।',
    admin_col_job_id: 'जॉब आईडी',
    admin_col_job_type: 'प्रकार',
    admin_col_source: 'स्रोत / दस्तावेज़',
    admin_col_job_status: 'स्थिति',
    admin_col_retries: 'पुनः प्रयास',
    admin_col_created: 'सृजन समय',
    admin_inspect_job: 'कार्य जांचें',
    admin_retry_job: 'पुनः प्रयास करें',

    // Admin Sources
    admin_sources_title: 'आधिकारिक सरकारी स्रोत',
    admin_sources_desc:
      'विश्वसनीय नागरिक डेटा स्रोतों, RSS फ़ीड, राजपत्र पोर्टलों और स्वचालित क्रॉलर शेड्यूल का प्रबंधन करें।',
    admin_sources_count: 'आधिकारिक स्रोत कॉन्फ़िगर किए गए',
    admin_add_source: 'नया आधिकारिक स्रोत जोड़ें',
    admin_col_source_name: 'स्रोत नाम',
    admin_col_source_url: 'आधिकारिक URL',
    admin_col_trust_score: 'विश्वसनीयता स्कोर',
    admin_col_source_status: 'स्थिति',
    admin_col_last_fetched: 'अंतिम निष्कर्षण',
    admin_trigger_ingest: 'क्रॉल प्रारंभ करें',
    admin_toggle_status: 'स्थिति बदलें',

    // Admin Users
    admin_users_title: 'नागरिक एवं व्यवस्थापक खाते',
    admin_users_desc: 'पंजीकृत नागरिक और व्यवस्थापक खातों के लिए सुरक्षा शासन और पहचान नियंत्रण।',
    admin_users_notice_title: 'उपयोगकर्ता प्रबंधन API अनुपलब्ध है',
    admin_users_notice_desc:
      'JanSathi AI बैकएंड वर्तमान में प्रशासनिक उपयोगकर्ता सूची या संपादन एंडपॉइंट प्रदान नहीं करता है। वास्तविक डेटा मानकों के अनुसार कोई नकली खाता प्रदर्शित नहीं किया गया है।',

    // Admin Analytics
    admin_analytics_title: 'दस्तावेज़ संकलन एवं अंतर्ग्रहण एनालिटिक्स',
    admin_analytics_desc:
      'सरकारी दस्तावेज़ों, श्रेणी विभाजन और क्रॉलर अंतर्ग्रहण कार्य परिणामों का डेटाबेस-आधारित समेकित विश्लेषण।',
    admin_analytics_badge: 'डेटाबेस सत्यापित',
    admin_cat_distribution_title: 'योजना श्रेणी अनुसार सार्वजनिक दस्तावेज़',
    admin_cat_distribution_desc:
      'GET /api/documents/facets के माध्यम से सार्वजनिक रूप से तैयार दस्तावेज़ों से संकलित।',
    admin_type_distribution_title: 'दस्तावेज़ प्रकार अनुसार सार्वजनिक दस्तावेज़',
    admin_type_distribution_desc:
      'GET /api/documents/facets के माध्यम से सार्वजनिक रूप से तैयार दस्तावेज़ों से संकलित।',
    admin_corpus_status_title: 'निष्कर्षण स्थिति अनुसार कुल संकलन वितरण',
    admin_corpus_status_desc:
      'सटीक डेटाबेस पेजिनेशन गणनाओं का उपयोग करके GET /api/documents?scope=all से परिकलित।',
    admin_job_outcomes_title: 'अंतर्ग्रहण कार्य निष्पादन परिणाम',
    admin_job_outcomes_desc: 'सभी कार्य स्थितियों के पार GET /api/admin/ingestion-jobs से परिकलित।',
    admin_analytics_disclosure_title: 'वास्तुशिल्प डेटा प्रकटीकरण',
    admin_analytics_disclosure_desc:
      'श्रेणी और दस्तावेज़-प्रकार के मेट्रिक्स सार्वजनिक-तैयार दस्तावेज़ों से प्राप्त किए गए हैं। कुल स्थिति गणना संपूर्ण डेटाबेस से प्राप्त की गई है। समय-श्रृंखला रुझान वर्तमान डेटाबेस में ट्रैक नहीं किए जाते हैं।',

    // Admin System Status
    admin_system_title: 'सिस्टम स्थिति एवं टेलीमेट्री',
    admin_system_desc:
      'डेटाबेस, API रनटाइम और AI एकीकरण सेवाओं के लिए रीयल-टाइम डायग्नोस्टिक्स और लाइवनेस प्रोब।',
    admin_system_badge: 'टेलीमेट्री सक्रिय',
    admin_last_probed: 'अंतिम प्रोब',
    admin_reprobe: 'सिस्टम पुनः जांचें',
    admin_probing: 'जांच जारी है...',
    admin_system_runtime: 'API रनटाइम',
    admin_system_database: 'डेटाबेस स्टोरेज',
    admin_system_ai: 'AI और RAG सबसिस्टम',
    admin_endpoint_probes: 'हेल्थ एंडपॉइंट ऑडिट',
    admin_ai_matrix_title: 'AI पाइपलाइन परिचालन मैट्रिक्स',
    admin_security_compliance_title: 'प्रशासनिक सुरक्षा एवं डेटा गोपनीयता मानक',
  },

  ta: {
    // Brand & General
    brand_title: 'ஜன் சாதி AI',
    brand_tagline: 'அரசு தகவல் குடிமக்கள் உதவியாளர்',
    brand_theme: 'சிவிக் பல்ஸ்',
    non_ai_notice: 'செயற்கை நுண்ணறிவு அல்லாத அடித்தளம் செயலில் உள்ளது',

    // Navigation
    nav_assistant: 'உதவியாளர்',
    nav_eligibility: 'தகுதி',
    nav_explainer: 'விளக்க உரை',
    nav_verify: 'சரிபார்ப்பு',
    nav_documents: 'ஆவணங்கள்',
    nav_upload: 'பதிவேற்றம்',
    nav_admin: 'நிர்வாகம்',
    sign_in: 'உள்நுழைக',
    register: 'பதிவுசெய்க',
    sign_out: 'வெளியேறு',
    my_profile: 'சுயவிவரம்',
    citizen: 'குடிமகன்',

    // Hero Section
    hero_badge: 'FORGE 26 • தீம் 1: சிவிக் பல்ஸ் • தேசிய குடிமக்கள் உதவியாளர்',
    hero_title_prefix: 'சரிபார்க்கப்பட்ட தகவல்களுடன் ஒவ்வொரு குடிமகனுக்கும் ',
    hero_title_highlight: 'வழிகாட்டுதல் மற்றும் அதிகாரம்',
    hero_subtitle:
      'இந்திய குடிமக்களையும் அரசு நலத்திட்டங்கள் மற்றும் அரசாணை அறிவிப்புகளையும் இணைக்கும் நம்பகமான தளம் — பாதுகாப்பான MERN தொழில்நுட்பத்தில் உருவானது.',
    search_placeholder: 'அதிகாரப்பூர்வ அரசாணைகள் அல்லது சுற்றறிக்கைகளைத் தேடுங்கள்...',
    search_btn: 'தேடு',
    nav_examples: 'தேடல் உதாரணங்கள்:',
    nav_examples_hint: '(வடிகட்ட கிளிக் செய்க)',
    explore_catalog: 'ஆவணப் பட்டியலைப் பார்க்கவும்',
    view_profile: 'சுயவிவரம் பார்க்க',
    register_citizen: 'குடிமகனாகப் பதிவுசெய்க',
    citizen_sign_in: 'குடிமக்கள் உள்நுழைவு',

    // Topic Pills
    topic_agriculture: 'விவசாயம் & உழவர் நலம்',
    topic_healthcare: 'சுகாதாரம் & குடும்ப நலம்',
    topic_education: 'கல்வி & உதவித்தொகை',
    topic_pension: 'சமூகப் பாதுகாப்பு & ஓய்வூதியம்',
    topic_employment: 'தொழிலாளர் நலம் & வேலைவாய்ப்பு',
    topic_gazettes: 'அரசாணைகள் & சுற்றறிக்கைகள்',

    // Trust Badges
    trust_non_ai: 'உண்மையான தகவல்கள் (போலி வெளியீடுகள் இல்லை)',
    trust_pipeline: 'அதிகாரப்பூர்வ ஆதாரப் பாதை',
    trust_indic: 'தமிழ் மற்றும் இந்திய எழுத்துரு ஆதரவு',
    trust_security: 'பாதுகாப்பான அங்கீகாரம் & தனியுரிமை',

    // AI Disclosure
    ai_disclosure_title: 'கட்டமைப்பு பாதுகாப்பு: AI ஏன் 501 தருகிறது',
    ai_disclosure_body:
      'அரசுத் திட்டங்கள் குடிமக்களின் வாழ்வாதாரத்தை நேரடியாகப் பாதிப்பதால், போலி AI தகவல்கள் தவிர்க்கப்படுகின்றன. ஆவண சரிபார்ப்பு முடியும் வரை AI சேவைகள் (/api/ai/*) திட்டமிட்டு 501 NOT_IMPLEMENTED தருகின்றன.',
    inspect_ai_status: 'AI நிலையைச் சரிபார்க்கவும் →',

    // Service Modules
    modules_heading: 'குடிமக்கள் சேவைப் பிரிவுகள்',
    modules_subheading: 'கிடைக்கக்கூடிய வசதிகள் மற்றும் திட்டமிடப்பட்ட அம்சங்களை ஆராயுங்கள்',
    module_count: '6 சேவைப் பிரிவுகள்',

    mod_assistant_title: 'குடிமக்கள் உதவியாளர் (Civic Assistant)',
    mod_assistant_desc: 'அரசாணைகளின் நேரடி மேற்கோள்களுடன் குடிமக்களின் கேள்விகளுக்கு வழிகாட்டல்.',
    mod_assistant_badge: 'AI கட்டமைப்பு (501)',

    mod_eligibility_title: 'திட்டத் தகுதி மதிப்பீட்டாளர்',
    mod_eligibility_desc: 'அரசு விதிகளின்படி குடிமக்களின் தகுதியைத் துல்லியமாக மதிப்பிடும் கருவி.',
    mod_eligibility_badge: 'AI கட்டமைப்பு (501)',

    mod_explainer_title: 'ஆவண விளக்க உரை (Document Explainer)',
    mod_explainer_desc: 'கடினமான சட்ட அரசாணைகளை எளிய குடிமக்கள் மொழியில் மாற்றுகிறது.',
    mod_explainer_badge: 'AI கட்டமைப்பு (501)',

    mod_verify_title: 'உரிமைகோரல் சரிபார்ப்பு (Claim Verification)',
    mod_verify_desc: 'சமூக ஊடக வதந்திகளை அதிகாரப்பூர்வ அரசாணைகளுடன் ஒப்பிட்டு சரிபார்க்கிறது.',
    mod_verify_badge: 'AI கட்டமைப்பு (501)',

    mod_documents_title: 'அதிகாரப்பூர்வ ஆவண நூலகம்',
    mod_documents_desc: 'துறை வாரியான வடிகட்டிகளுடன் அரசு கொள்கைகளைத் தேடும் நூலகம்.',
    mod_documents_badge: 'பட்டியல் தயார்',

    mod_upload_title: 'குடிமக்கள் ஆவணப் பதிவேற்றம்',
    mod_upload_desc: 'பாதுகாப்பு சரிபார்ப்புகளுடன் அரசாணைகளைப் பாதுகாப்பாகப் பதிவேற்றவும்.',
    mod_upload_badge: 'சேமிப்பு தயார்',

    // Pipeline
    pipeline_heading: 'ஜன் சாதி எவ்வாறு செயல்படுகிறது',
    pipeline_subheading: 'எங்கள் பல கட்ட சரிபார்ப்பு அமைப்பு செயலில் உள்ள சேவைகளை விளக்குகிறது',
    stage1_title: 'ஆதார மேலாண்மை & உட்செலுத்துதல்',
    stage1_status: 'கட்டம் 5 & 6 இல் செயல்படுத்தப்பட்டது',
    stage1_desc: 'SSRF பாதுகாப்பு மற்றும் SHA-256 குறியீட்டுடன் அதிகாரப்பூர்வ இணைப்புகள்.',
    stage2_title: 'உரைச் சீராக்கம்',
    stage2_status: 'கட்டம் 6 இல் செயல்படுத்தப்பட்டது',
    stage2_desc: 'தமிழ் எழுத்துருக்களைப் பாதுகாக்கும் யூனிகோட் NFC சீராக்கம்.',
    stage3_title: 'ஆவண நூலகம் & தேடல்',
    stage3_status: 'கட்டம் 9 க்கு திட்டமிடப்பட்டுள்ளது',
    stage3_desc: 'அரசாணைகளைத் துறை வாரியாகத் தேடும் வசதி.',
    stage4_title: 'சரிபார்க்கப்பட்ட AI வழிகாட்டல்',
    stage4_status: 'கட்டம் 10 க்கு திட்டமிடப்பட்டுள்ளது',
    stage4_desc: 'அரசாணை பத்தி மேற்கோள்களுடன் கூடிய வழிகாட்டல்.',

    // FAQ
    faq_heading: 'அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQ)',
    faq_subheading: 'கட்டமைப்பு, தனியுரிமை மற்றும் வரவிருக்கும் அம்சங்கள் பற்றிய பதில்கள்',
    faq1_q: 'AI அம்சங்கள் தற்போது 501 Not Implemented ஏன் தருகின்றன?',
    faq1_a:
      'இது ஒரு பாதுகாப்பு நடவடிக்கை. ஆவண சரிபார்ப்பு முடியும் வரை அனைத்து AI சேவைகளும் 501 நிலையில் வைக்கப்பட்டுள்ளன.',
    faq2_q: 'பதிவேற்றப்பட்ட ஆவணங்கள் எவ்வாறு சரிபார்க்கப்படுகின்றன?',
    faq2_a: '%PDF- மேஜிக் பைட்டுகள் மற்றும் SHA-256 குறியீடு மூலம் ஆவணங்கள் சரிபார்க்கப்படுகின்றன.',
    faq3_q: 'தலைப்பு பொத்தான்கள் நேரடி திட்டங்களா?',
    faq3_a:
      'இல்லை, இவை ஆவணங்களை எளிதாகத் தேடுவதற்கான வகைப்படுத்தப்பட்ட எடுத்துக்காட்டுகள் மட்டுமே.',
    faq4_q: 'எனது விவரங்கள் பாதுகாப்பானவையா?',
    faq4_a: 'ஆம், குடிமக்கள் விவரங்கள் மறைகுறியாக்கப்பட்ட முறையில் பாதுகாப்பாக வைக்கப்படுகின்றன.',

    // CTA
    cta_title: 'அரசு தகவல்களை ஆராயத் தயாரா?',
    cta_desc: 'ஆவணங்களைத் தேடுங்கள் அல்லது குடிமக்கள் விருப்பங்களை அமைக்கவும்.',
    cta_browse: 'ஆவணங்களை உலாவுக',
    cta_register: 'கணக்கை பதிவுசெய்க',

    // Phase 9 — Documents & Uploads
    doc_library_title: 'அதிகாரப்பூர்வ ஆவண நூலகம்',
    doc_library_subtitle:
      'சரிபார்க்கப்பட்ட அரசு அறிவிப்புகள், திட்ட வழிகாட்டுதல்கள் மற்றும் உங்கள் தனிப்பட்ட பதிவேற்றங்களை தேடுங்கள்.',
    doc_scope_public: 'அதிகாரப்பூர்வ பொது நூலகம்',
    doc_scope_mine: 'எனது ஆவணப் பதிவேற்றங்கள்',
    doc_search_placeholder: 'ஆவண தலைப்பு அல்லது வெளியிட்ட துறை மூலம் தேடவும்...',
    doc_search_btn: 'தேடு',
    doc_upload_btn: 'ஆவணத்தை பதிவேற்றவும்',
    doc_refresh_btn: 'புதுப்பி',
    doc_filter_category: 'பிரிவு',
    doc_filter_all_categories: 'அனைத்து பிரிவுகள்',
    doc_filter_doctype: 'ஆவண வகை',
    doc_filter_all_types: 'அனைத்து வகைகள்',
    doc_filter_language: 'மொழி',
    doc_filter_all_languages: 'அனைத்து மொழிகள்',
    doc_filter_status: 'செயலாக்க நிலை',
    doc_filter_all_statuses: 'அனைத்து நிலைகள்',
    doc_filter_sort: 'வரிசைப்படுத்து',
    doc_sort_newest: 'புதியது முதலில்',
    doc_sort_oldest: 'பழையது முதலில்',
    doc_sort_title_asc: 'தலைப்பு (A–Z)',
    doc_sort_title_desc: 'தலைப்பு (Z–A)',
    doc_sort_published: 'வெளியிடப்பட்ட தேதி',
    doc_reset_filters: 'வடிகட்டிகளை மீட்டமை',
    doc_open_reader: 'ரீடரைத் திறக்கவும்',
    doc_pages_count: 'பக்கங்கள்',
    doc_chunks_count: 'துண்டுகள்',
    doc_no_matching: 'பொருந்தும் ஆவணங்கள் எதுவும் இல்லை',
    doc_no_matching_desc: 'உங்கள் தேடல் சொற்களை மாற்றவும் அல்லது வடிகட்டிகளை நீக்கவும்.',
    doc_empty_personal: 'இன்னும் ஆவணங்கள் பதிவேற்றப்படவில்லை',
    doc_empty_personal_desc:
      'உரை பிரித்தெடுப்பைத் தொடங்க உங்கள் முதல் அரசாணை அல்லது ஆவணத்தைப் பதிவேற்றவும்.',
    doc_empty_library: 'அதிகாரப்பூர்வ ஆவணங்கள் எதுவும் கிடைக்கவில்லை',
    doc_empty_library_desc:
      'தற்போது ஆவண நூலகம் காலியாக உள்ளது. புதிய ஆவணங்கள் சேர்க்கப்படும் போது சரிபார்க்கவும்.',
    doc_prev_page: 'முந்தையது',
    doc_next_page: 'அடுத்தது',
    doc_page_of: 'இல்',
    doc_showing: 'காண்பிக்கப்படுகிறது',

    // Status Badges
    status_ready: 'தயார்',
    status_processing: 'செயலாக்கத்தில் உள்ளது',
    status_pending: 'வரிசையில் உள்ளது',
    status_needs_ocr: 'OCR தேவை',
    status_failed: 'தோல்வியடைந்தது',

    // Document Reader
    reader_back_to_library: 'ஆவண நூலகம்',
    reader_official_portal: 'அதிகாரப்பூர்வ மூல போர்டல்',
    reader_delete_btn: 'ஆவணத்தை நீக்கு',
    reader_refresh_status: 'நிலையைப் புதுப்பி',
    reader_extracted_text: 'பிரித்தெடுக்கப்பட்ட உரை உள்ளடக்கம்',
    reader_integrity_title: 'ஆவண நம்பகத்தன்மை & சேமிப்பக விவரம்',
    reader_integrity_subtitle: 'பதிவு செய்யப்பட்ட சேமிப்பக அளவுருக்கள் மற்றும் செக்சம்',
    reader_recorded_sha256: 'பதிவு செய்யப்பட்ட SHA-256 செக்சம்',
    reader_checksum_desc:
      'நகல்களைத் தவிர்க்கவும் நம்பகமான சேமிப்பை உறுதிப்படுத்தவும் பதிவேற்றத்தின் போது கணக்கிடப்பட்டது.',
    reader_checksum_copied: 'செக்சம் கிளிப்போர்டில் நகலெடுக்கப்பட்டது',
    reader_file_type: 'கோப்பு வகை',
    reader_file_size: 'கோப்பு அளவு',
    reader_scope: 'அணுகல் நோக்கம்',
    reader_uploaded_date: 'பதிவேற்றப்பட்ட தேதி',
    reader_last_modified: 'கடைசியாக திருத்தப்பட்டது',
    reader_empty_text: 'பிரித்தெடுக்கப்பட்ட பக்கங்கள் எதுவும் கிடைக்கவில்லை.',
    reader_ai_callout_title: 'AI எளிமைப்படுத்தல் அல்லது திட்ட விதிகளைத் தேடுகிறீர்களா?',
    reader_ai_callout_desc:
      'உரையாடல் ஆவண விளக்க உரை மற்றும் தகுதி பகுப்பாய்வு கட்டம் 10 இல் இணைக்கப்படும்.',
    reader_ai_callout_btn: 'விளக்க உரையைப் பார்க்கவும் (501)',
    delete_modal_title: 'பதிவேற்றிய ஆவணத்தை நீக்கவா?',
    delete_modal_desc:
      'இந்த ஆவணத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா? இது சேமிக்கப்பட்ட PDF மற்றும் உரையை நிரந்தரமாக நீக்கும்.',
    delete_modal_confirm: 'நீக்குவதை உறுதிசெய்',
    delete_modal_cancel: 'ரத்து செய்',
    delete_modal_deleting: 'நீக்கப்படுகிறது...',

    // Upload Page
    upload_page_title: 'குடிமக்கள் ஆவணப் பதிவேற்றம்',
    upload_page_subtitle:
      'தனிப்பட்ட உரை பிரித்தெடுத்தல் மற்றும் அட்டவணைப்படுத்தலுக்காக அதிகாரப்பூர்வ அறிவிப்புகளைப் பதிவேற்றவும்.',
    upload_select_pdf: 'PDF ஆவணத்தைத் தேர்ந்தெடுக்கவும்',
    upload_click_browse: 'உலாவ கிளிக் செய்யவும்',
    upload_drag_drop: 'அல்லது PDF-ஐ இங்கே இழுத்துப் போடவும்',
    upload_pdf_only_hint: 'PDF வடிவம் மட்டுமே • அதிகபட்ச அனுமதிக்கப்பட்ட அளவு:',
    upload_meta_title: 'ஆவண மெட்டாடேட்டா (விருப்பமானது)',
    upload_meta_title_label: 'ஆவணத் தலைப்பு',
    upload_meta_title_placeholder: 'கோப்பு பெயரிலிருந்து தானாக எடுக்க காலியாக விடவும்',
    upload_meta_category: 'பிரிவு',
    upload_meta_doctype: 'ஆவண வகை',
    upload_meta_language: 'ஆவண மொழி',
    upload_meta_auto_detect: 'உரையிலிருந்து தானாகக் கண்டறியவும்',
    upload_meta_published: 'வெளியிடப்பட்ட தேதி',
    upload_meta_authority: 'வெளியிட்ட அதிகாரம்',
    upload_meta_source: 'மூல URL',
    upload_submit_btn: 'பதிவேற்றி வரிசைப்படுத்தவும்',
    upload_uploading_btn: 'பதிவேற்றப்படுகிறது',
    upload_cancel_btn: 'ரத்து செய்',
    upload_success_queued_title: 'பதிவேற்றம் ஏற்கப்பட்டு செயலாக்க வரிசையில் உள்ளது',
    upload_success_duplicate_title: 'ஒரே மாதிரியான ஆவணம் கண்டறியப்பட்டது (நகல்)',
    upload_success_open_reader: 'ஆவண ரீடரில் திறக்கவும்',
    upload_success_another: 'மற்றொரு ஆவணத்தை பதிவேற்றவும்',
    upload_specs_title: 'பதிவேற்ற விவரக்குறிப்புகள்',
    upload_specs_subtitle: 'பின்தள பாதுகாப்பு விதிகளால் செயல்படுத்தப்படும் கட்டுப்பாடுகள்',

    // Phase 10: AI Citizen Pages & HTTP 501 Disclosures
    ai_not_implemented_badge: 'செயற்கை நுண்ணறிவு அல்லாத அடித்தளம்',
    ai_service_unavailable_title: 'AI இறுதிப்புள்ளி கிடைக்கவில்லை (HTTP 501)',
    probe_ai_status_btn: 'பின்தள AI ஹூக்கை சரிபார்க்கவும்',
    citizen_submitted_inquiry: 'பெறப்பட்ட குடிமக்கள் சமர்ப்பிப்பு:',
    ai_safeguard_explanation:
      'உருவாக்கப்படும் உரை மற்றும் தானியங்கி முடிவெடுத்தல் திட்டமிட்டு முடக்கப்பட்டுள்ளன (HTTP 501 NOT_IMPLEMENTED). குடிமக்கள் நல வழிகாட்டுதலுக்கு சரிபார்க்கப்படாத மாதிரி வெளியீடுகளை விட அதிகாரப்பூர்வ அரசிதழ்கள் தேவை.',
    ai_safeguard_backend_lock:
      'பின்தள இறுதிப்புள்ளி இன்னும் செயல்படுத்தப்படவில்லை. OCR பிரித்தெடுத்தல் மற்றும் மேற்கோள் உள்கட்டமைப்பு உருவாக்கத்தில் உள்ளன மற்றும் மாடல்களுடன் இணைக்கப்படவில்லை.',
    planned_capabilities_heading:
      'திட்டமிடப்பட்ட கட்டமைப்பு திறன்கள் (தற்போது செயல்பாட்டில் இல்லை)',
    probe_status_note:
      'இறுதிப்புள்ளி இணைக்கப்படவில்லை (connected: false) என்பதை நேரடி சோதனை உறுதிப்படுத்துகிறது. தற்போது எந்த AI மாதிரியும் செயலில் இல்லை.',
    ai_not_implemented_toast: 'AI சேவை எதிர்கால ஒருங்கிணைப்புக்காக திட்டமிடப்பட்டுள்ளது.',

    // Assistant Page
    assistant_page_title: 'குடிமக்கள் AI உதவியாளர்',
    assistant_page_subtitle:
      'இந்திய அரசுத் திட்டங்கள், குடிமக்கள் நன்மைகள் மற்றும் பொதுச் சேவைகள் குறித்த துல்லியமான வழிகாட்டுதலை வழங்கும் பன்மொழி உரையாடல் உதவியாளர்.',
    assistant_grounding_title: 'அரசு ஆவண அடிப்படையிலான கட்டமைப்பு',
    assistant_grounding_desc:
      'அதிகாரப்பூர்வ அரசிதழ்கள் மற்றும் சட்டரீதியான கொள்கைகளைப் பயன்படுத்தி மட்டுமே பதிலளிக்கும் வகையில் இந்த உதவியாளர் வடிவமைக்கப்பட்டுள்ளது. தவறான வாக்குறுதிகளைத் தடுக்க, முழுமையான ஆவண இணைப்பு வரை உரையாடல் அமைப்பு நிறுத்தி வைக்கப்பட்டுள்ளது.',
    assistant_form_title: 'பொதுக் கேள்வியைக் கேளுங்கள்',
    assistant_form_subtitle:
      'நலத்திட்டங்கள், அரசிதழ்கள் அல்லது தகுதி வரம்புகள் குறித்த உங்கள் வினவலை உள்ளிடவும்.',
    assistant_question_label: 'உங்கள் கேள்வி / வினவல்',
    assistant_placeholder:
      'எ.கா. பிஎம்-கிசான் சம்மான் நிதி திட்டத்திற்கான வருமான வரம்பு மற்றும் தேவையான ஆவணங்கள் என்ன?',
    assistant_min_chars_note: 'குறைந்தபட்சம் 3 எழுத்துக்கள் தேவை',
    assistant_min_chars_error: 'தயவுசெய்து குறைந்தது 3 எழுத்துக்களுடன் கேள்வியை உள்ளிடவும்.',
    assistant_max_chars_error: 'கேள்வி 1000 எழுத்துகளுக்கு மிகாமல் இருக்க வேண்டும்.',
    btn_reset: 'படிவத்தை மீட்டமைக்கவும்',
    assistant_submitting: 'வினவல் சமர்ப்பிக்கப்படுகிறது...',
    assistant_submit_btn: 'வினவலைச் சமர்ப்பிக்கவும்',
    assistant_unavailable_desc:
      'குடிமக்கள் சேவைகளில் பிழைகளைத் தவிர்க்க, எங்களது RAG கட்டமைப்பு மற்றும் சரிபார்க்கப்பட்ட மேற்கோள் இயந்திரம் இணையும் வரை உரையாடல் அமைப்பு முடக்கப்பட்டுள்ளது.',
    plan_feat_rag: 'அரசு அரசிதழ்களுடன் குறியிடப்பட்ட உரையாடல் RAG கட்டமைப்பு',
    plan_feat_citation:
      'சரியான அரசிதழ் அறிவிப்பு மற்றும் பக்க எண்களுடன் கூடிய அதிகாரப்பூர்வ மேற்கோள்கள்',
    plan_feat_voice:
      'பாஷிணி (Bhashini) மூலம் இந்திய மொழிகளில் குரல் உள்ளீடு மற்றும் பேச்சு உருவாக்கம்',
    plan_feat_guardrails:
      'போலி நலத்திட்டங்கள் அல்லது தவறான நன்மைகளைத் தடுக்கும் கடுமையான பாதுகாப்பு விதிகள்',
    assistant_examples_title: 'மாதிரி வினவல்கள் (UI சோதனை உதாரணங்கள்)',
    assistant_examples_disclaimer:
      'இந்தக் கேள்விகள் இடைமுகப் பரிசோதனைக்காக மட்டுமே வழங்கப்படுகின்றன. இவை அதிகாரப்பூர்வ திட்ட விதிகளையோ, சரிபார்க்கப்பட்ட உண்மைகளையோ அல்லது அரசு ஆலோசனையையோ குறிக்கவில்லை.',
    example_q1: 'பிஎம் ஆவாஸ் யோஜனா கிராமப்புற வீட்டு மானியத்திற்கான தகுதி வரம்புகள் என்ன?',
    example_q2: 'மாநில மாற்றுத்திறனாளிகள் ஓய்வூதியப் பதிவுக்கு என்ன ஆவணங்கள் தேவை?',
    example_q3:
      'ஒரு சிறு விவசாயி PMKSY இன் கீழ் மானியத்துடன் கூடிய சொட்டு நீர் பாசனத்திற்கு எவ்வாறு விண்ணப்பிக்கலாம்?',
    example_q4: 'மத்திய உர மானியத்திற்கு தேவையான குறைந்தபட்ச நில உரிமை எவ்வளவு?',

    // Eligibility Page
    eligibility_page_title: 'திட்ட தகுதி மதிப்பீட்டாளர்',
    eligibility_page_subtitle:
      'அதிகாரப்பூர்வ திட்ட விதிகளுக்கு எதிராக குடிமக்களின் விவரங்களை ஒப்பிடும் உறுதியான & AI-உதவி தகுதி சரிபார்ப்பு.',
    eligibility_notice_title: 'சட்டரீதியான தகுதி சரிபார்ப்பு அறிவிப்பு',
    eligibility_notice_desc:
      'அரசுத் திட்டங்களின் தகுதியானது அரசிதழ் அறிவிப்பு விதிகளால் நிர்வகிக்கப்படுகிறது. தவறான நிராகரிப்புகள் அல்லது எதிர்பார்ப்புகளைத் தவிர்க்க, சரிபார்க்கப்பட்ட அட்டவணைகள் வரும் வரை தானியங்கி பொருத்தம் இயக்கப்படவில்லை.',
    eligibility_form_title: 'திட்டம் மற்றும் விண்ணப்பதாரர் விவரங்களை உள்ளிடவும்',
    eligibility_form_subtitle:
      'அதிகாரப்பூர்வ தகுதிகளுடன் ஒப்பிடுவதற்கு திட்டத்தின் பெயர் மற்றும் விவரங்களை வழங்கவும்.',
    eligibility_scheme_label: 'இலக்கு திட்டம் அல்லது நலத்திட்டம்',
    eligibility_scheme_placeholder:
      'எ.கா. பிஎம் கிசான் சம்மான் நிதி, போஸ்ட்-மெட்ரிக் கல்வி உதவித்தொகை, ஆயுஷ்மான் பாரத்',
    eligibility_min_query_error: 'தயவுசெய்து குறைந்தது 3 எழுத்துக்களில் திட்டத்தைக் குறிப்பிடவும்.',
    eligibility_state_label: 'வசிக்கும் மாநிலம்',
    select_state_placeholder: 'இந்தியா முழுவதும் / குறிப்பிடப்படவில்லை',
    eligibility_district_label: 'மாவட்டம் (விருப்பமானது)',
    eligibility_district_placeholder: 'எ.கா. மதுரை, கோவை, திருச்சி',
    eligibility_category_label: 'குடிமகன் / பயனாளி பிரிவு',
    select_category_placeholder: 'குடிமக்கள் பிரிவைத் தேர்ந்தெடுக்கவும்',
    eligibility_education_label: 'கல்வித் தகுதி',
    select_education_placeholder: 'கல்வி நிலையைத் தேர்ந்தெடுக்கவும்',
    eligibility_income_label: 'ஆண்டு குடும்ப வருமான வரம்பு',
    select_income_placeholder: 'வருமான வரம்பைத் தேர்ந்தெடுக்கவும்',
    eligibility_occupation_label: 'படிப்பு அல்லது குறிப்பிட்ட தொழில்',
    eligibility_occupation_placeholder: 'எ.கா. சிறு விவசாயி, பி.டெக் 2ஆம் ஆண்டு, கைத்தறி நெசவாளர்',
    eligibility_social_label: 'சமூகப் பிரிவு (விருப்பமானது)',
    select_social_placeholder: 'எ.கா. General, OBC, SC, ST, EWS',
    eligibility_privacy_note:
      'விவரங்கள் தகுதி ஒப்பீட்டிற்காக மட்டுமே POST /api/ai/eligibility க்கு அளவுருக்களாக அனுப்பப்படுகின்றன. இந்த இறுதிப்புள்ளி தற்போது HTTP 501 ஐ வழங்குவதால், எந்த தகுதியும் மதிப்பிடப்படுவதோ அல்லது சேமிக்கப்படுவதோ இல்லை.',
    eligibility_evaluating: 'விவரங்கள் மதிப்பீடு செய்யப்படுகின்றன...',
    eligibility_submit_btn: 'தகுதியை மதிப்பிடுங்கள்',
    eligibility_unavailable_desc:
      'பொது நன்மைகள் தவறாக மறுக்கப்படுவதைத் தடுக்க, அரசிதழ்களின்படி விதிகள் உறுதிசெய்யப்படும் வரை தானியங்கி தகுதி மதிப்பீடு முடக்கப்பட்டுள்ளது.',
    plan_feat_matching:
      'குடிமகன் சுயவிவரத்தின்படி (மாநிலம், பிரிவு, வருமானம், தொழில்) தானியங்கி தகுதி பொருத்தம்',
    plan_feat_checklist:
      'அரசு அலுவலகங்களுக்குச் செல்வதற்கு முன் தேவையான சட்டப்பூர்வ ஆவணங்களின் பட்டியல்',
    plan_feat_portals: 'அதிகாரப்பூர்வ விண்ணப்ப இணையதளங்கள் மற்றும் அதிகாரிகளின் நேரடி இணைப்புகள்',
    plan_feat_breakdown:
      'தகுதி அளவுகோல்களின் வெளிப்படையான விவரங்கள் (மறைமுக பிளாக்-பாக்ஸ் AI கிடையாது)',
    eligibility_criteria_guide_title: 'சட்டரீதியான தகுதி சரிபார்ப்பு கட்டமைப்பு',
    eligibility_criteria_guide_desc:
      'இயக்கப்பட்டதும், ஜன் சாதி AI ஒரு கலப்பின விதி இயந்திரத்தைப் பயன்படுத்துகிறது. முதலில் வயது, வருமான வரம்பு, மாநில இருப்பிடத்தை சரிபார்க்கிறது. பின்னர் அரசிதழ் ஆவணத்திலிருந்து சரிபார்ப்புப் பட்டியலை உறுதிப்படுத்துகிறது.',
    criteria_step1_title: 'நிலையான வடிகட்டி',
    criteria_step1_desc: 'வருமானம், இருப்பிடம் மற்றும் வயது வரம்புகளின் துல்லியமான சோதனை.',
    criteria_step2_title: 'அரசிதழ் சரிபார்ப்பு',
    criteria_step2_desc: 'களஞ்சியத்தில் உள்ள அதிகாரப்பூர்வ அறிவிப்பு உரையுடன் ஒப்பிடப்படுகிறது.',
    criteria_step3_title: 'பூஜ்ஜிய தவறான தகவல்',
    criteria_step3_desc: 'விதி தெளிவாக இல்லையென்றால், அதிகாரியை அணுக அமைப்பு பரிந்துரைக்கும்.',

    // Explainer Page
    explainer_page_title: 'குடிமக்கள் ஆவண விளக்க உரை',
    explainer_page_subtitle:
      'சிக்கலான அரசிதழ் அறிவிப்புகள், அரசு ஆணைகள் (G.O.) மற்றும் சுற்றறிக்கைகளை எளிய குடிமக்கள் சுருக்கமாக மாற்றுகிறது.',
    explainer_grounding_title: 'ஆவண உண்மைத்தன்மை & சரிபார்ப்பு அறிவிப்பு',
    explainer_grounding_desc:
      'ஆவண விளக்க உரை அதிகாரப்பூர்வ களஞ்சியத்தில் சேமிக்கப்பட்ட உண்மையான அரசிதழ்களில் செயல்படுகிறது. பிரித்தெடுக்கப்பட்ட உரையை கீழே படிக்கலாம். முழு AI மாதிரிகள் இணையும் வரை AI சுருக்கம் HTTP 501 உடன் முடக்கப்பட்டுள்ளது.',
    explainer_doc_fetch_error: 'ஆவணத்தை ஏற்றுவதில் தோல்வி',
    loading_document: 'அசல் ஆவணம் ஏற்றப்படுகிறது...',
    browse_catalog_btn: 'கிடைக்கக்கூடிய ஆவணங்களின் பட்டியலை உலாவவும்',
    untitled_document: 'தலைப்பற்ற ஆவணம்',
    official_authority: 'இந்திய அரசு',
    view_full_reader: 'முழு வாசிப்பாளர்',
    request_summary_title: 'AI ஆவண எளிமைப்படுத்தல்',
    request_summary_desc:
      'எளிமையான சுருக்கத்திற்காக ஆவண விவரங்களை POST /api/ai/ask க்கு அனுப்புகிறது.',
    explaining_btn: 'விளக்கம் கோரப்படுகிறது...',
    explain_document_btn: 'AI விளக்கத்தைக் கோரவும்',
    explainer_unavailable_desc:
      'ஆவண விளக்கத்திற்கு OCR தகவல்களில் LLM சுருக்கம் தேவைப்படுகிறது. சரிபார்க்கப்பட்ட மேற்கோள்கள் தயாராகும் வரை இந்த இறுதிப்புள்ளி HTTP 501 NOT_IMPLEMENTED உடன் உள்ளது.',
    plan_feat_plain_lang: 'சட்டரீதியான சிக்கல்கள் இல்லாத எளிய மொழி விளக்கம்',
    plan_feat_takeaways: 'முக்கிய பலன்கள்: யாருக்குப் பொருந்தும், என்ன மாறுகிறது, அடுத்த படிகள்',
    plan_feat_multilingual_synth: 'தமிழ், ஆங்கிலம், இந்தி மற்றும் தெலுங்கில் பன்மொழி உருவாக்கம்',
    plan_feat_side_by_side: 'அசல் அரசிதழ் உரை மற்றும் பக்க சிறப்பம்சங்களுடன் அருகருகே பார்வை',
    extracted_text_heading: 'பிரித்தெடுக்கப்பட்ட அசல் உரை (களஞ்சியத்திலிருந்து)',
    extracted_text_subheading:
      'PDF செயலாக்கத்திலிருந்து தரவுத்தளத்தில் சேமிக்கப்பட்ட நேரடி OCR உரை.',
    page_label: 'பக்கம்',
    no_page_text: 'இந்தப் பக்கத்தில் உரை எதுவும் பிரித்தெடுக்கப்படவில்லை.',
    no_pages_preview: 'இந்த ஆவணத்திற்கு பக்க உரை முன்னோட்டம் எதுவும் கிடைக்கவில்லை.',
    explainer_select_title: 'விளக்குவதற்கு ஒரு ஆவணத்தைத் தேர்ந்தெடுக்கவும்',
    explainer_select_subtitle:
      'களஞ்சியத்திலிருந்து அதிகாரப்பூர்வ அரசிதழ், சுற்றறிக்கை அல்லது திட்ட ஆணையைத் தேர்ந்தெடுக்கவும்.',
    explainer_select_desc:
      'ஆவணத்தின் விளக்கத்தைக் காண, பட்டியலை உலாவவும் மற்றும் "Explain Document" என்பதைக் கிளிக் செய்யவும். நீங்கள் அசல் உரையையும் திட்டமிடப்பட்ட சுருக்கத்தையும் பார்க்கலாம்.',
    explainer_capabilities_title: 'ஆவண விளக்க அம்சங்கள்',
    explainer_feat1_desc:
      'நிர்வாக ஆணைகளை எளிதில் புரிந்துகொள்ளக்கூடிய குடிமக்கள் வழிகாட்டுதலாக மாற்றுகிறது.',
    explainer_feat2_desc:
      'முக்கிய நடவடிக்கைகள், காலக்கெடு மற்றும் தேவைகளை குடிமக்களுக்கு தெளிவுபடுத்துகிறது.',
    explainer_feat3_desc: 'சரியான கலைச்சொற்களுடன் பிராந்திய மொழிகளில் கிடைக்கிறது.',
    explainer_feat4_desc:
      'ஒவ்வொரு சுருக்கக் குறிப்பையும் அசல் அரசிதழ் பக்கத்துடன் நேரடியாக சரிபார்க்கலாம்.',

    // Verify Page
    verify_page_title: 'அரசுத் தகவல் & உண்மை சரிபார்ப்பு',
    verify_page_subtitle:
      'தவறான தகவல்களைத் தடுக்க வைரல் செய்திகள் மற்றும் சமூக ஊடகத் தகவல்களை அதிகாரப்பூர்வ அரசிதழ்களுடன் ஒப்பிடுங்கள்.',
    verify_grounding_title: 'வதந்தி தடுப்புப் பாதுகாப்பு விதிகள்',
    verify_grounding_desc:
      'பொறுப்புடன் செயல்பட, அதிகாரப்பூர்வ அரசிதழ் மற்றும் பத்திரிகை தகவல் பணியக (PIB) சரிபார்ப்பு இல்லாமல் ஜன் சாதி AI தானியங்கி "உண்மை" அல்லது "பொய்" தீர்ப்புகளை வழங்காது. முழு இணைப்பு வரை இது HTTP 501 ஐக் குறிக்கும்.',
    verify_form_title: 'கூற்று அல்லது வைரல் சுற்றறிக்கையைச் சமர்ப்பிக்கவும்',
    verify_form_subtitle:
      'அதிகாரப்பூர்வ வெளியீடுகளுடன் மதிப்பீடு செய்ய செய்தி அல்லது அறிக்கையை உள்ளிடவும்.',
    verify_claim_label: 'கூற்று / வதந்தி / பொது அறிவிப்பு உரை',
    verify_placeholder:
      'எ.கா. பிஎம்-குசும் கீழ் மின் கட்டணம் இல்லாமல் அரசு இலவச சோலார் பம்புகளை விநியோகிக்கிறது என்ற செய்தி...',
    verify_min_chars_note: 'குறைந்தபட்சம் 10 எழுத்துக்கள் தேவை',
    verify_min_chars_error: 'தயவுசெய்து குறைந்தது 10 எழுத்துக்களுடன் கூற்றை உள்ளிடவும்.',
    verify_max_chars_error: 'கூற்று 2000 எழுத்துகளுக்கு மிகாமல் இருக்க வேண்டும்.',
    verify_submitting: 'மூலங்களுடன் ஒப்பிடப்படுகிறது...',
    verify_submit_btn: 'அரசுத் தகவல்களுடன் சரிபார்க்கவும்',
    verify_unavailable_desc:
      'தவறான சரிபார்ப்புகளைத் தவிர்க்க, அதிகாரப்பூர்வ PIB தரவு மற்றும் அரசிதழ் தகவல்கள் இணையும் வரை சரிபார்ப்பு இயந்திரம் HTTP 501 NOT_IMPLEMENTED உடன் உள்ளது.',
    plan_feat_semantic:
      'அதிகாரப்பூர்வ அரசிதழ்கள் மற்றும் PIB உண்மைச் சோதனைகளுடன் தானியங்கி ஒப்பீடு',
    plan_feat_verdict:
      'வெளிப்படையான தீர்ப்பு: அதிகாரப்பூர்வமானது, பொய்யானது, அல்லது சரிபார்க்கப்படவில்லை',
    plan_feat_debunk_refs:
      'அதிகாரப்பூர்வ மறுப்புகள், செய்திக் குறிப்புகள் மற்றும் அரசிதழ் இணைப்புகள்',
    plan_feat_shareable:
      'வாட்ஸ்அப் வதந்திகளை முறியடிக்க சரிபார்க்கக்கூடிய மேற்கோள்களுடன் பகிரக்கூடிய அட்டை',
    verify_examples_title: 'மாதிரி பொதுக் கூற்றுகள் (கற்பனையான UI உதாரணங்கள்)',
    verify_examples_disclaimer:
      'இந்த அறிக்கைகள் இடைமுகப் பரிசோதனைக்காக மட்டுமே வழங்கப்பட்ட கற்பனையான உதாரணங்கள் ஆகும். அவை உண்மையான அரசு அறிவிப்புகளோ, சரிபார்க்கப்பட்ட உண்மைகளோ அல்லது அதிகாரப்பூர்வ சுற்றறிக்கைகளோ அல்ல.',
    verify_ex1:
      'வேலையில்லாத இளைஞர்கள் அனைவருக்கும் மாதம் ரூ.5,000 உதவித்தொகை வழங்குவதாகக் கூறும் வைரல் செய்தி.',
    verify_ex2:
      'நாளைக்குள் ஓய்வூதியம் பெற ஆதார் இணைப்பு கட்டாயம் என்று இணையத்தில் வரும் அறிவிப்பு.',
    verify_ex3:
      'விவசாயிகளின் ரூ.2 லட்சம் வரையிலான பயிர்க்கடன் தள்ளுபடி செய்யப்பட்டுள்ளதாகக் கூறும் தகவல்.',
    verify_ex4:
      'புதிய அரசிதழ் வருமான வரம்பின்றி ஆயுஷ்மான் பாரத்தை அனைவருக்கும் பொதுவாக்கியுள்ளது என்ற தகவல்.',

    // Admin Navigation & Shell
    admin_portal_title: 'குடிமக்கள் நிர்வாக கன்சோல்',
    admin_nav_overview: 'கண்ணோட்டம்',
    admin_nav_documents: 'ஆவணங்கள்',
    admin_nav_jobs: 'உள்ளீட்டு பணிகள்',
    admin_nav_sources: 'அதிகாரப்பூர்வ ஆதாரங்கள்',
    admin_nav_users: 'பயனர்கள்',
    admin_nav_analytics: 'பகுப்பாய்வு',
    admin_nav_system: 'அமைப்பு நிலை',
    admin_return_citizen: 'குடிமக்கள் தளத்திற்குத் திரும்பு',
    admin_sign_out: 'வெளியேறு',
    admin_badge_live: 'நேரலை தயாரிப்பு',
    admin_badge_active: 'சரிபார்க்கப்பட்ட செயல்பாடு',
    admin_refresh: 'புதுப்பி',
    admin_refreshing: 'புதுப்பிக்கிறது...',

    // Admin Dashboard
    admin_dashboard_title: 'நிர்வாகக் கட்டுப்பாட்டு மையம்',
    admin_dashboard_desc:
      'அமைப்பு அளவிலான மேலாண்மை, கிராலர் உள்ளீட்டு கண்காணிப்பு மற்றும் குடிமக்கள் ஆவண சரிபார்ப்பு.',
    admin_total_documents: 'மொத்த உள்ளீட்டு ஆவணங்கள்',
    admin_total_docs_sub: 'முழுமையான தரவுத்தள ஆவணங்கள் (scope=all)',
    admin_ready_documents: 'பொது பயன்பாட்டுக்கு தயாரானவை',
    admin_ready_docs_sub: 'குடிமக்கள் தேடக்கூடிய ஆவணங்கள்',
    admin_pending_documents: 'நிலுவையில் & செயல்பாட்டில்',
    admin_pending_docs_sub: 'உரை பிரித்தெடுத்தல் அல்லது சரிபார்ப்பு செயல்பாட்டில்',
    admin_failed_documents: 'தோல்வி & OCR தேவை',
    admin_failed_docs_sub: 'பிரித்தெடுத்தல் பிழைகள் அல்லது ஸ்கேன் செய்யப்பட்ட PDFகள்',
    admin_ingestion_jobs_total: 'செயல்படுத்தப்பட்ட உள்ளீட்டு பணிகள்',
    admin_jobs_sub: 'கிராலர் மற்றும் ஆவண உள்ளீட்டு பணிகள்',
    admin_active_sources: 'கட்டமைக்கப்பட்ட அதிகாரப்பூர்வ ஆதாரங்கள்',
    admin_sources_sub: 'அரசு அமைச்சகங்கள் மற்றும் அரசிதழ் தளங்கள்',
    admin_citizen_accounts: 'குடிமக்கள் கணக்குகள்',
    admin_users_sub: 'பயனர் மேலாண்மை API தற்போது கிடைக்கவில்லை',
    admin_recent_jobs: 'சமீபத்திய உள்ளீட்டு பணிகள்',
    admin_recent_jobs_desc: 'சமீபத்திய தானியங்கி கிராலர் மற்றும் தொகுதி உள்ளீட்டு செயல்பாடுகள்.',
    admin_recent_docs: 'சமீபத்திய ஆவணங்கள்',
    admin_recent_docs_desc: 'சமீபத்தில் பதிவேற்றப்பட்ட மற்றும் குறியிடப்பட்ட குடிமக்கள் ஆவணங்கள்.',
    admin_view_all_jobs: 'அனைத்து பணிகளையும் காண்க',
    admin_view_all_docs: 'அனைத்து ஆவணங்களையும் காண்க',

    // Admin Documents
    admin_docs_title: 'குடிமக்கள் ஆவணங்கள் தணிக்கை & மேலாண்மை',
    admin_docs_desc:
      'தணிக்கை செய்யவும், மெட்டாடேட்டாவைப் புதுப்பிக்கவும், பிரித்தெடுத்தல் நிலையைச் சரிபார்க்கவும் மற்றும் அதிகாரப்பூர்வ ஆவணங்களை நிர்வகிக்கவும்.',
    admin_docs_count: 'மொத்த ஆவணங்கள்',
    admin_search_docs_ph: 'தலைப்பு, விளக்கம் அல்லது அதிகாரம் மூலம் ஆவணங்களைத் தேடுங்கள்...',
    admin_all_status: 'அனைத்து நிலைகளும்',
    admin_all_categories: 'அனைத்து பிரிவுகளும்',
    admin_all_types: 'அனைத்து வகைகளும்',
    admin_col_title: 'ஆவணத் தலைப்பு',
    admin_col_category: 'பிரிவு',
    admin_col_type: 'ஆவண வகை',
    admin_col_status: 'நிலை',
    admin_col_pages: 'பக்கங்கள்',
    admin_col_date: 'பதிவேற்றப்பட்டது',
    admin_col_actions: 'நடவடிக்கைகள்',
    admin_edit_metadata: 'மெட்டாடேட்டாவைத் திருத்து',
    admin_inspect_doc: 'விவரங்களை ஆய்வு செய்',
    admin_delete_doc: 'ஆவணத்தை நீக்கு',

    // Admin Jobs
    admin_jobs_title: 'உள்ளீட்டு வரிசை & கண்காணிப்பு',
    admin_jobs_desc:
      'தானியங்கி கிராலர் செயல்பாடுகளைக் கண்காணிக்கவும், தோல்வியுற்ற பணிகளை மீண்டும் முயற்சிக்கவும்.',
    admin_col_job_id: 'பணி எண் (ID)',
    admin_col_job_type: 'வகை',
    admin_col_source: 'ஆதாரம் / ஆவணம்',
    admin_col_job_status: 'நிலை',
    admin_col_retries: 'மறுமுயற்சிகள்',
    admin_col_created: 'உருவாக்கப்பட்ட நேரம்',
    admin_inspect_job: 'பணியை ஆய்வு செய்',
    admin_retry_job: 'மீண்டும் முயற்சி செய்',

    // Admin Sources
    admin_sources_title: 'அதிகாரப்பூர்வ அரசு ஆதாரங்கள்',
    admin_sources_desc:
      'நம்பகமான குடிமக்கள் தரவு ஆதாரங்கள், RSS ஊட்டம், அரசிதழ் தளங்கள் மற்றும் அட்டவணைகளை நிர்வகிக்கவும்.',
    admin_sources_count: 'அதிகாரப்பூர்வ ஆதாரங்கள் கட்டமைக்கப்பட்டுள்ளன',
    admin_add_source: 'புதிய அதிகாரப்பூர்வ ஆதாரத்தைச் சேர்',
    admin_col_source_name: 'ஆதாரப் பெயர்',
    admin_col_source_url: 'அதிகாரப்பூர்வ இணைய முகவரி',
    admin_col_trust_score: 'நம்பகத்தன்மை மதிப்பெண்',
    admin_col_source_status: 'நிலை',
    admin_col_last_fetched: 'கடைசியாக எடுக்கப்பட்ட நேரம்',
    admin_trigger_ingest: 'கிரால் தொடங்கு',
    admin_toggle_status: 'நிலையை மாற்று',

    // Admin Users
    admin_users_title: 'குடிமக்கள் & நிர்வாகக் கணக்குகள்',
    admin_users_desc:
      'பதிவுசெய்யப்பட்ட குடிமக்கள் மற்றும் நிர்வாகக் கணக்குகளுக்கான பாதுகாப்பு மற்றும் அடையாளக் கட்டுப்பாடுகள்.',
    admin_users_notice_title: 'பயனர் மேலாண்மை API கிடைக்கவில்லை',
    admin_users_notice_desc:
      'JanSathi AI பின்தளம் தற்போது நிர்வாகப் பயனர் பட்டியல் அல்லது மாற்றியமைக்கும் அமைப்பை வழங்கவில்லை. உண்மைத் தரவு வழிகாட்டுதலின்படி போலி பயனர் கணக்குகள் எதுவும் காட்டப்படவில்லை.',

    // Admin Analytics
    admin_analytics_title: 'ஆவணக் களஞ்சியம் & உள்ளீட்டுப் பகுப்பாய்வு',
    admin_analytics_desc:
      'அரசு ஆவணங்கள், பிரிவு வாரியான பகிர்வு மற்றும் கிராலர் உள்ளீட்டு முடிவுகளின் தரவுத்தள அடிப்படையிலான தொகுப்பு.',
    admin_analytics_badge: 'தரவுத்தளம் சரிபார்க்கப்பட்டது',
    admin_cat_distribution_title: 'திட்டப் பிரிவு வாரியாக தயாரான ஆவணங்கள்',
    admin_cat_distribution_desc:
      'GET /api/documents/facets மூலம் பொது பயன்பாட்டுக்கு தயாரான ஆவணங்களிலிருந்து திரட்டப்பட்டது.',
    admin_type_distribution_title: 'ஆவண வகை வாரியாக தயாரான ஆவணங்கள்',
    admin_type_distribution_desc:
      'GET /api/documents/facets மூலம் பொது பயன்பாட்டுக்கு தயாரான ஆவணங்களிலிருந்து திரட்டப்பட்டது.',
    admin_corpus_status_title: 'பிரித்தெடுத்தல் நிலை வாரியாக மொத்த ஆவணப் பகிர்வு',
    admin_corpus_status_desc:
      'துல்லியமான தரவுத்தள பக்கவகை எண்ணிக்கையைப் பயன்படுத்தி GET /api/documents?scope=all இலிருந்து கணக்கிடப்பட்டது.',
    admin_job_outcomes_title: 'உள்ளீட்டு பணி செயல்பாட்டு முடிவுகள்',
    admin_job_outcomes_desc:
      'அனைத்து பணி நிலைகளிலும் GET /api/admin/ingestion-jobs இலிருந்து கணக்கிடப்பட்டது.',
    admin_analytics_disclosure_title: 'கட்டமைப்புத் தரவு வெளிப்பாடு',
    admin_analytics_disclosure_desc:
      'பிரிவு மற்றும் ஆவண வகை அளவீடுகள் பொது பயன்பாட்டுக்கு தயாரான ஆவணங்களிலிருந்து மட்டுமே பெறப்படுகின்றன. ஒட்டுமொத்த நிலை எண்ணிக்கைகள் முழு தரவுத்தளத்திலிருந்தும் பெறப்படுகின்றன. தற்போதைய தரவுத்தளத்தில் கால வரிசை போக்குகள் கண்காணிக்கப்படுவதில்லை.',

    // Admin System Status
    admin_system_title: 'அமைப்பு நிலை & தொலை அளவீடு',
    admin_system_desc:
      'தரவுத்தளம், API இயக்க நேரம் மற்றும் AI ஒருங்கிணைப்பு சேவைகளுக்கான நிகழ்நேர கண்டறிதல் சோதனைகள்.',
    admin_system_badge: 'தொலை அளவீடு செயலில் உள்ளது',
    admin_last_probed: 'கடைசி சோதனை நேரம்',
    admin_reprobe: 'அமைப்பை மீண்டும் சோதி',
    admin_probing: 'சோதிக்கிறது...',
    admin_system_runtime: 'API இயக்க நேரம்',
    admin_system_database: 'தரவுத்தள சேமிப்பு',
    admin_system_ai: 'AI & RAG துணை அமைப்பு',
    admin_endpoint_probes: 'நலன் முனைப்புள்ளி தணிக்கை',
    admin_ai_matrix_title: 'AI பைப்லைன் செயல்பாட்டு அணிவரிசை',
    admin_security_compliance_title: 'நிர்வாகப் பாதுகாப்பு & தரவு தனியுரிமைத் தரம்',
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const { user, status, updateProfile } = useAuth();
  const [language, setLanguageState] = useState(() => {
    return tokenStorage.getStoredLanguage() || 'en';
  });

  // Keep in sync with user profile if authenticated
  useEffect(() => {
    if (status === 'authenticated' && user?.preferredLanguage) {
      setLanguageState(user.preferredLanguage);
      document.documentElement.lang = user.preferredLanguage;
    } else {
      const stored = tokenStorage.getStoredLanguage() || 'en';
      setLanguageState(stored);
      document.documentElement.lang = stored;
    }
  }, [status, user?.preferredLanguage]);

  const setLanguage = useCallback(
    async (newLang) => {
      const prevLang = language;
      // Optimistic update
      setLanguageState(newLang);
      document.documentElement.lang = newLang;
      tokenStorage.setStoredLanguage(newLang);

      if (status === 'authenticated') {
        try {
          const res = await updateProfile({ preferredLanguage: newLang });
          if (!res.success) {
            // Revert
            setLanguageState(prevLang);
            document.documentElement.lang = prevLang;
            tokenStorage.setStoredLanguage(prevLang);
          }
        } catch {
          setLanguageState(prevLang);
          document.documentElement.lang = prevLang;
          tokenStorage.setStoredLanguage(prevLang);
        }
      }
    },
    [language, status, updateProfile]
  );

  const t = useCallback(
    (key, fallback = '') => {
      const langDict = translations[language] || translations.en;
      return langDict[key] ?? translations.en[key] ?? fallback ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};

export default LanguageContext;
