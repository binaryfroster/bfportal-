export function generateInvoiceEmailHtml(invoiceNumber: string, amount: number, dueDate: string, clientName: string) {
  return `
    <div style="background-color: #131313; color: #ffffff; font-family: monospace; padding: 24px; border-radius: 8px;">
      <h2 style="color: #00f0ff; margin-bottom: 8px;">BINARY FROSTER // INVOICE NOTIFICATION</h2>
      <p style="color: #a0a0a0; font-size: 14px;">Hello ${clientName},</p>
      <p style="color: #ffffff; font-size: 14px;">
        Invoice <strong>${invoiceNumber}</strong> for <strong>$${amount.toLocaleString()}</strong> has been issued with a due date of <strong>${dueDate}</strong>.
      </p>
      <div style="margin-top: 20px; padding: 12px; background-color: #1a1a1a; border-left: 3px solid #00f0ff;">
        <a href="https://portal.binaryfroster.com/billing" style="color: #00f0ff; font-weight: bold; text-decoration: none;">[PAY INVOICE VIA PORTAL] &rarr;</a>
      </div>
    </div>
  `;
}

export function generateMilestoneEmailHtml(milestoneTitle: string, clientName: string) {
  return `
    <div style="background-color: #131313; color: #ffffff; font-family: monospace; padding: 24px; border-radius: 8px;">
      <h2 style="color: #00f0ff; margin-bottom: 8px;">BINARY FROSTER // MILESTONE SEALED</h2>
      <p style="color: #a0a0a0; font-size: 14px;">Hello ${clientName},</p>
      <p style="color: #ffffff; font-size: 14px;">
        Milestone <strong>${milestoneTitle}</strong> has been successfully completed and verified.
      </p>
      <div style="margin-top: 20px; padding: 12px; background-color: #1a1a1a; border-left: 3px solid #00f0ff;">
        <a href="https://portal.binaryfroster.com/project" style="color: #00f0ff; font-weight: bold; text-decoration: none;">[VIEW PROJECT TRACKER] &rarr;</a>
      </div>
    </div>
  `;
}
