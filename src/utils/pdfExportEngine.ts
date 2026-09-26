// MahaSkill Intelligence - PDF Export Engine for District Training Plans (Phase 7)
import type { DistrictTrainingPlanItem } from '../analytics/districtTrainingPlanEngine';

/**
 * Triggers a professional printable PDF document view for a District Training Plan.
 */
export function exportDistrictTrainingPlanPDF(plan: DistrictTrainingPlanItem): void {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Please allow popups to export the PDF Training Plan report.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>MahaSkill Intelligence - District Training Plan (${plan.district_name})</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #0f172a;
          line-height: 1.5;
          margin: 0;
          padding: 24px;
          background-color: #ffffff;
        }
        .header {
          border-bottom: 3px solid #4f46e5;
          padding-bottom: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .header-title {
          font-size: 20px;
          font-weight: bold;
          color: #1e1b4b;
          margin: 0;
        }
        .header-subtitle {
          font-size: 11px;
          color: #64748b;
          margin-top: 4px;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          font-size: 10px;
          font-weight: bold;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .badge-high { background-color: #ffe4e6; color: #be123c; border: 1px solid #f43f5e; }
        .badge-medium { background-color: #fef3c7; color: #b45309; border: 1px solid #f59e0b; }
        .badge-watch { background-color: #dbeafe; color: #1d4ed8; border: 1px solid #3b82f6; }
        .badge-demo { background-color: #f3e8ff; color: #7e22ce; border: 1px solid #a855f7; }
        
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 13px;
          font-weight: bold;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 10px 12px;
          border-radius: 6px;
        }
        .card-label {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }
        .card-value {
          font-size: 14px;
          font-weight: bold;
          color: #0f172a;
          margin-top: 2px;
        }
        .card-sub {
          font-size: 10px;
          color: #4f46e5;
          margin-top: 2px;
        }
        .reason-box {
          background-color: #f1f5f9;
          border-left: 4px solid #4f46e5;
          padding: 12px;
          font-size: 11px;
          border-radius: 0 6px 6px 0;
          white-space: pre-line;
        }
        ul {
          margin: 4px 0 0 16px;
          padding: 0;
          font-size: 11px;
        }
        li {
          margin-bottom: 4px;
        }
        .footer {
          margin-top: 30px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          font-size: 10px;
          color: #64748b;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 16px; text-align: right;">
        <button onclick="window.print()" style="padding: 8px 16px; bg-color: #4f46e5; color: white; background: #4f46e5; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div class="header">
        <div>
          <h1 class="header-title">MahaSkill Intelligence — District Skilling Roadmap Plan</h1>
          <div class="header-subtitle">State & District Skill Development Decision-Support System (SIH26134)</div>
          <div style="margin-top: 6px;">
            <span class="badge badge-demo">PROTOTYPE / SYNTHETIC DEMO DATA</span>
            <span class="badge badge-high" style="margin-left: 6px;">${plan.priority.level}</span>
          </div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #475569;">
          <div><strong>Report Date:</strong> ${currentDate}</div>
          <div><strong>District:</strong> ${plan.district_name}</div>
          <div><strong>Sector:</strong> ${plan.sector_name}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">1. Executive Overview & Priority Target</div>
        <div class="grid">
          <div class="card">
            <div class="card-label">Target Skill & Module</div>
            <div class="card-value">${plan.skill_name}</div>
            <div class="card-sub">${plan.course_name}</div>
          </div>
          <div class="card">
            <div class="card-label">District Priority Score</div>
            <div class="card-value">${plan.priority_score} / 100</div>
            <div class="card-sub">${plan.priority.level} Recommendation</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">2. Capacity & Seat Requirements Audit</div>
        <div class="grid">
          <div class="card">
            <div class="card-label">Current Annual Capacity</div>
            <div class="card-value">${plan.current_annual_capacity} Seats</div>
            <div class="card-sub">Existing Enrolment Baseline</div>
          </div>
          <div class="card">
            <div class="card-label">Estimated Additional Capacity Required</div>
            <div class="card-value" style="color: #059669;">+${plan.estimated_additional_seats} Additional Seats</div>
            <div class="card-sub">Estimated Required Total: ${plan.estimated_required_capacity} Seats</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">3. Instructor & Practical Equipment Deficit Audit</div>
        <div class="grid">
          <div class="card">
            <div class="card-label">Additional Certified Trainers Required</div>
            <div class="card-value" style="color: #dc2626;">+${plan.estimated_additional_trainers} Instructors</div>
            <div class="card-sub">${plan.trainer_assumption_label}</div>
          </div>
          <div class="card">
            <div class="card-label">Additional Practical Equipment Units</div>
            <div class="card-value" style="color: #d97706;">+${plan.estimated_additional_equipment} Units</div>
            <div class="card-sub">${plan.equipment_type}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">4. Employer Validation Consensus</div>
        <div class="card">
          <div class="card-label">Industry Validation Score</div>
          <div class="card-value">${plan.employer_validation_score} / 100 (${plan.employers_agree_count} Employers Agreed)</div>
          <div class="card-sub">High consensus from regional manufacturing & IT employers</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">5. "Why This District?" Governance Explanation</div>
        <div class="reason-box">
          ${plan.why_this_district}
        </div>
      </div>

      <div class="section">
        <div class="section-title">6. Recommended Governance Actions</div>
        <ul>
          ${plan.recommended_actions.map((act) => `<li>${act}</li>`).join('')}
        </ul>
      </div>

      <div class="footer">
        <div>System Confidence Score: <strong>${plan.confidence_score}%</strong> (Deterministic Traceable Model)</div>
        <div>MahaSkill Intelligence &copy; 2026 — Government Decision-Support Platform</div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
