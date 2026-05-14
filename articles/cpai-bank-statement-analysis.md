---
title: "Building CPAi: An AI-Powered Bank Statement Analysis Dashboard"
published: true
tags: webdev, ai, fintech, nextjs
canonical_url: https://www.hydrabytes.tech/portfolio/cpai-bank-statement-analysis
cover_image: https://www.hydrabytes.tech/Bank%20Statement%20Analysis%20Dashboard/thumbnail.png
---

Manually reviewing bank statements to assess creditworthiness is one of those tasks that sounds simple until you realize there are dozens of bank formats, each with different layouts, column names, and transaction structures. A credit analyst might spend hours on a single applicant's documents. Multiply that across a loan pipeline and you have a serious bottleneck.

We built **CPAi (Credit Profile Analysis AI)** to solve this: a dashboard that auto-detects Malaysian bank formats from uploaded PDFs, extracts transactions, and generates credit analysis reports. All client-side.

## The Problem

Financial institutions in Malaysia deal with statements from over a dozen banks. Each bank has its own PDF structure. Extracting transaction data means either manual data entry or brittle format-specific parsers that break whenever a bank updates their template.

The consequences are real: slow turnaround on loan applications, human error in data extraction, and inconsistent credit assessments across analysts.

## How CPAi Works

The pipeline is straightforward:

1. **Upload**: Drop one or more PDF bank statements into the dashboard
2. **Auto-detect**: The system identifies which of the 12 supported Malaysian bank formats the statement belongs to
3. **Parse**: Transactions are extracted with dates, descriptions, credits, debits, and running balances
4. **Analyze**: The dashboard aggregates data across statements for balance trends, transaction categorization, and anomaly detection
5. **Report**: Export a full credit profile as PDF

The critical design decision was doing everything client-side. Bank statements contain extremely sensitive financial data. By processing PDFs in the browser rather than uploading them to a server, we eliminated the data privacy concern entirely. No statement data ever leaves the user's machine.

## Key Features

### Parsed Statements View

Once statements are uploaded, the dashboard shows a unified table of all parsed data across banks: account names, periods, transaction counts, total credits and debits, and file references. Analysts can search across all transactions from a single search bar.

### Bank Analysis & Balance Checks

The dashboard computes monthly balance trends with interactive charts, showing closing balances over time across all accounts. This gives an immediate visual read on an applicant's financial trajectory.

### Transaction Rules Engine

This is where CPAi gets powerful. The rules engine auto-identifies and flags transactions by category: loan/financing payments, rental payments, salary/payroll deposits, and custom patterns. Each rule uses keyword matching that analysts can edit, with flagged transaction counts and totals computed in real time.

For example, the "Loan / Financing" rule scans for keywords like `LOAN`, `DISBURSE`, `MORTGAGE`, `INSTALMENT`, and `PERSONAL LOAN` across all statement descriptions. Analysts can add or remove keywords to tune detection for their specific use case.

### TPV (Transaction Processing Volume) Input

A dedicated module tracks monthly transaction processing volumes by source, with editable cells and automatic percentage-change calculations. This feeds into the broader credit assessment.

### Loan Eligibility & Export

The platform calculates loan eligibility based on extracted financial data and exports everything as a formatted PDF report, ready for committee review.

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **PDF Parsing**: Client-side JavaScript PDF extraction
- **Charts**: Interactive visualization for balance trends and analytics
- **Export**: PDF report generation

## What We Learned

The hardest part was not the AI or the parsing. It was handling the sheer variety of PDF formats. Some banks use tables, some use fixed-width text, some embed data in images. We had to build format-specific extractors and a detection layer that identifies the bank from structural cues in the PDF before selecting the right parser.

The transaction rules engine was an intentional design choice over fully automated categorization. In financial compliance, analysts need to understand and control how transactions are classified. A black-box AI categorizer would not pass audit requirements. The keyword-based rules are transparent, editable, and auditable.

## Try It

The project is available on GitHub: [github.com/faizan-02/Bank-Statement-Dashboard](https://github.com/faizan-02/Bank-Statement-Dashboard)

If you are building fintech tools or need a similar dashboard for your institution, [get in touch with our team](https://www.hydrabytes.tech/contact).

---

*Built by [HydraBytes](https://www.hydrabytes.tech), an Islamabad-based development agency specializing in web, mobile, and AI solutions.*
