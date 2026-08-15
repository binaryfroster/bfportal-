import React, { useState, useEffect } from "react";
import { Invoice, Project } from "../types";
import { api } from "../lib/api";
import { CreditCard, FileText, Download, Check, ExternalLink, Printer, Clock, AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Shield, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BillingHubProps {
  project: Project;
  user: any;
  onPaymentSettled?: () => void;
}

export default function BillingHub({ project, user, onPaymentSettled }: BillingHubProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  
  // Checkout simulation state
  const [checkoutInvoice, setCheckoutInvoice] = useState<Invoice | null>(null);
  const [ccNumber, setCcNumber] = useState("");
  const [ccExpiry, setCcExpiry] = useState("");
  const [ccCvc, setCcCvc] = useState("");
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const loadInvoices = async () => {
    try {
      const data = await api.getInvoices(project.id);
      setInvoices(data);
      // Keep active synced
      if (activeInvoice) {
        const refreshed = data.find((inv) => inv.id === activeInvoice.id);
        if (refreshed) setActiveInvoice(refreshed);
      }
    } catch (err) {
      console.error("Failed loading invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
    const interval = setInterval(loadInvoices, 15000);
    return () => clearInterval(interval);
  }, [project, activeInvoice]);

  const handlePayNow = async (invoice: Invoice) => {
    // Open the simulated checkout panel
    setCheckoutInvoice(invoice);
    setCcNumber("");
    setCcExpiry("");
    setCcCvc("");
    setPaySuccess(false);
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutInvoice) return;
    setPaying(true);
    try {
      // Calls webhook successfully on server
      await api.completePayment(checkoutInvoice.id);
      setPaySuccess(true);
      setTimeout(() => {
        setCheckoutInvoice(null);
        setPaySuccess(false);
        loadInvoices();
        if (onPaymentSettled) onPaymentSettled();
      }, 3000);
    } catch (err) {
      console.error("Payment webhook failed:", err);
    } finally {
      setPaying(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  if (loading) {
    return (
      <div className="bg-bg-card border border-border-custom p-6 rounded-card animate-pulse space-y-4">
        <div className="h-8 bg-bg-secondary w-1/4 rounded"></div>
        <div className="h-40 bg-bg-secondary rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table grid */}
      <div className="bg-bg-card border border-border-custom rounded-card overflow-hidden">
        <div className="p-4 border-b border-border-custom/50 bg-bg-secondary/40 flex justify-between items-center">
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
            // FINANCES LEDGER: INVOICES OUTSTANDING
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-custom/60 font-mono text-[10px] text-text-muted uppercase tracking-wider bg-bg-secondary/10">
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Description</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom/40">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-bg-secondary/10 transition-colors">
                  <td className="p-4 font-mono text-text-primary font-semibold">{inv.invoiceNumber}</td>
                  <td className="p-4 font-sans text-text-primary font-medium">{inv.description}</td>
                  <td className="p-4 font-mono text-text-secondary">{inv.dueDate}</td>
                  <td className="p-4 font-mono font-bold text-text-primary">{formatCurrency(inv.total)}</td>
                  <td className="p-4">
                    <span className={`font-mono text-[8px] px-2 py-0.5 border rounded uppercase ${
                      inv.status === "Paid" ? "bg-brand-success/15 border-brand-success/30 text-brand-success" :
                      inv.status === "Sent" ? "bg-accent-primary/15 border-accent-primary/30 text-accent-primary" :
                      inv.status === "Overdue" ? "bg-brand-error/15 border-brand-error/30 text-brand-error animate-pulse" :
                      "bg-bg-secondary border-border-custom text-text-muted"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => setActiveInvoice(inv)}
                      className="p-1.5 bg-bg-secondary border border-border-custom hover:border-accent-primary/40 text-text-secondary hover:text-text-primary rounded transition-all cursor-pointer"
                      title="Print PDF Invoice"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    {inv.status !== "Paid" && (
                      <button
                        onClick={() => handlePayNow(inv)}
                        className="px-3 py-1 bg-accent-primary text-bg-primary hover:bg-accent-hover font-mono text-[10px] font-bold uppercase rounded-input transition-all flex items-center gap-1.5 cursor-pointer shadow-glow-strong"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        [PAY_NOW]
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL SCREEN PDF DETAILED VIEWER */}
      <AnimatePresence>
        {activeInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveInvoice(null)}
              className="absolute inset-0 bg-black"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white text-gray-900 min-h-[80vh] flex flex-col rounded-card shadow-2xl p-8 overflow-y-auto"
            >
              {/* Close panel */}
              <button
                onClick={() => setActiveInvoice(null)}
                className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors cursor-pointer border border-gray-200 shadow-sm"
              >
                <Printer className="h-4 w-4" />
              </button>

              {/* Printable PDF format */}
              <div className="space-y-8 flex-grow pr-1 pt-4">
                {/* PDF Header */}
                <div className="flex justify-between items-start pb-6 border-b border-gray-200">
                  <div className="space-y-1">
                    <h1 className="text-xl font-extrabold tracking-tight text-gray-900 font-sans">
                      BINARY <span className="text-cyan-600">FROSTER</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">// PRECISION CUSTOM SOFTWARE</p>
                    <p className="text-xs text-gray-600 font-sans mt-2">
                      Binary Froster Engineering Office<br />
                      Hennur Main Road, Bengaluru, India 560043<br />
                      billing@binaryfroster.com
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="inline-block text-xs font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 px-2.5 py-1 rounded">
                      INVOICE {activeInvoice.status}
                    </span>
                    <h2 className="text-base font-bold text-gray-800 font-mono mt-2">{activeInvoice.invoiceNumber}</h2>
                    <p className="text-xs text-gray-500 font-mono">Date Issued: {activeInvoice.issueDate}</p>
                    <p className="text-xs text-red-600 font-mono font-bold">Due Date: {activeInvoice.dueDate}</p>
                  </div>
                </div>

                {/* Billing Addresses */}
                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-200 text-xs">
                  <div>
                    <span className="block font-bold text-gray-500 uppercase tracking-widest mb-1.5">CLIENT BILLED</span>
                    <h4 className="font-bold text-gray-900 font-sans text-sm">{user.companyName}</h4>
                    <p className="text-gray-600 mt-1">
                      Attn: {user.name}<br />
                      {user.email}<br />
                      {user.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-gray-500 uppercase tracking-widest mb-1.5">REQUISITION REF</span>
                    <h4 className="font-bold text-gray-800 font-sans text-xs">{project.name}</h4>
                    <p className="text-gray-500 font-mono mt-1">// STAGE: {project.phase}</p>
                  </div>
                </div>

                {/* Itemized list */}
                <div className="space-y-3">
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">ITEMIZED LEDGER LINES</span>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-300 font-bold text-gray-700 uppercase bg-gray-50 text-[10px]">
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Amount (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activeInvoice.lineItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-medium text-gray-900">{item.description}</td>
                          <td className="p-3 text-right font-mono font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculations */}
                <div className="flex justify-end pt-4">
                  <div className="w-72 space-y-2 border-t border-gray-300 pt-4 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-mono font-semibold">{formatCurrency(activeInvoice.amount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>International Tax Processing:</span>
                      <span className="font-mono">0.00%</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900 text-sm">
                      <span>Total Invoice Balance:</span>
                      <span className="font-mono">{formatCurrency(activeInvoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Footer button */}
              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                <p className="font-mono">// Binary Froster Secure Electronic Invoice</p>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-mono rounded flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" /> [PRINT_HARDCOPY]
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STRIPE CHECKOUT SIMULATOR PANEL */}
      <AnimatePresence>
        {checkoutInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!paying) setCheckoutInvoice(null); }}
              className="absolute inset-0 bg-black"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-bg-card border border-border-custom rounded-card shadow-glow overflow-hidden z-10 p-6 space-y-6"
            >
              {/* Checkout header */}
              <div className="flex justify-between items-center pb-4 border-b border-border-custom/50">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent-primary animate-pulse" />
                  <span className="font-mono text-xs font-bold text-text-primary uppercase tracking-widest">
                    // Stripe Checkout Simulator
                  </span>
                </div>
                {!paying && (
                  <button
                    onClick={() => setCheckoutInvoice(null)}
                    className="p-1 rounded-full bg-bg-secondary hover:text-accent-primary border border-border-custom cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {paySuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="h-14 w-14 rounded-full bg-brand-success/15 border border-brand-success/40 text-brand-success flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                  </div>
                  <h3 className="font-sans text-base font-bold text-text-primary">Stripe Payment Validated</h3>
                  <p className="font-mono text-[10px] text-brand-success uppercase tracking-wider">
                    // Webhook received successfully. Ledgers synchronized. Dispatched transactional email logs.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSimulatePayment} className="space-y-4">
                  <div className="p-4 bg-bg-secondary border border-border-custom rounded-input space-y-1.5 text-center">
                    <span className="font-mono text-[9px] text-text-muted uppercase">// OUTSTANDING DEPLOYMENT BALANCES</span>
                    <h2 className="text-2xl font-extrabold text-accent-primary font-mono">{formatCurrency(checkoutInvoice.total)}</h2>
                    <p className="font-sans text-xs text-text-secondary">{checkoutInvoice.description}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">// Card Number</label>
                      <input
                        required
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        value={ccNumber}
                        onChange={(e) => setCcNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                        className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary p-2.5 text-xs font-mono rounded-input outline-none tracking-widest"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">// EXPIRY</label>
                        <input
                          required
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={ccExpiry}
                          onChange={(e) => setCcExpiry(e.target.value)}
                          className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary p-2.5 text-xs font-mono rounded-input outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">// CVC SECURITY</label>
                        <input
                          required
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          value={ccCvc}
                          onChange={(e) => setCcCvc(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary p-2.5 text-xs font-mono rounded-input outline-none text-center tracking-widest"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={paying || ccNumber.length < 16}
                    className="w-full py-3.5 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase tracking-widest font-bold rounded-input transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-glow"
                  >
                    {paying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        PROCESSING WEBHOCK SYNC...
                      </>
                    ) : (
                      <>
                        CONFIRM PAYMENT via Stripe
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
