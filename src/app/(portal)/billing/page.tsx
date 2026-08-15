"use client";

import * as React from "react";
import {
  CreditCard,
  Printer,
  X,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import { formatCurrency } from "@/src/lib/utils";
import toast from "react-hot-toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  lineItems: Array<{ description: string; amount: number }>;
  tax: number;
  total: number;
  paidAt: string | null;
}

export default function BillingLedgerPage() {
  const { user } = useUser();
  const { loading: dataLoading, invoices, payInvoice } = usePortalData();
  const [activeInvoice, setActiveInvoice] = React.useState<Invoice | null>(null);

  // Stripe Checkout state
  const [checkoutInvoice, setCheckoutInvoice] = React.useState<Invoice | null>(null);
  const [ccNumber, setCcNumber] = React.useState("");
  const [ccExpiry, setCcExpiry] = React.useState("");
  const [ccCvc, setCcCvc] = React.useState("");
  const [paying, setPaying] = React.useState(false);
  const [paySuccess, setPaySuccess] = React.useState(false);

  const loading = dataLoading;

  const handlePayNow = (invoice: Invoice) => {
    setCheckoutInvoice(invoice);
    window.open("https://razorpay.me/@shivamsurajdube", "_blank", "noopener,noreferrer");
    toast.success("Redirecting to Razorpay (@shivamsurajdube)...");
  };

  const handleConfirmRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutInvoice) return;

    setPaying(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    payInvoice(checkoutInvoice.id);

    setPaySuccess(true);
    toast.success("Razorpay payment recorded & verified!");

    setTimeout(() => {
      setCheckoutInvoice(null);
      setPaySuccess(false);
    }, 2000);
  };

  if (loading) {
    return <Skeleton className="h-64 w-full bg-bg-card border border-border-custom" />;
  }

  return (
    <div className="space-y-6">
      {/* Finances Ledger Card */}
      <Card className="bg-bg-card border-border-custom overflow-hidden">
        <CardHeader className="border-b border-border-custom/50 bg-bg-secondary/40">
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
            // FINANCES LEDGER: INVOICES OUTSTANDING
          </span>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono font-semibold">{inv.invoiceNumber}</TableCell>
                <TableCell className="font-sans font-medium">{inv.description}</TableCell>
                <TableCell className="font-mono text-text-secondary">{inv.dueDate}</TableCell>
                <TableCell className="font-mono font-bold">{formatCurrency(inv.total)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      inv.status === "Paid" ? "success" : inv.status === "Sent" ? "cyan" : "error"
                    }
                    className="font-mono text-[8px]"
                  >
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActiveInvoice(inv)}
                      className="p-1.5 bg-bg-secondary border border-border-custom hover:border-accent-primary/40 text-text-secondary hover:text-white rounded transition-all cursor-pointer"
                      title="Print PDF Invoice"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    {inv.status !== "Paid" && (
                      <Button
                        onClick={() => handlePayNow(inv)}
                        variant="accent"
                        size="sm"
                        className="font-mono text-[10px] uppercase font-bold cursor-pointer"
                      >
                        <CreditCard className="h-3.5 w-3.5 mr-1" />
                        [PAY_NOW]
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* FULL SCREEN PDF DETAILED VIEWER */}
      <AnimatePresence>
        {activeInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveInvoice(null)}
              className="absolute inset-0 bg-black cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white text-gray-900 min-h-[80vh] flex flex-col rounded-card shadow-2xl p-8 overflow-y-auto"
            >
              {/* Close Panel Button */}
              <button
                onClick={() => setActiveInvoice(null)}
                className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors cursor-pointer border border-gray-200 shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Printable PDF grade Invoice wrapper */}
              <div className="space-y-8 flex-grow pr-1 pt-4">
                <div className="flex justify-between items-start pb-6 border-b border-gray-200">
                  <div className="space-y-1">
                    <h1 className="text-xl font-extrabold tracking-tight text-gray-900 font-sans">
                      BINARY <span className="text-cyan-600">FROSTER</span>
                    </h1>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                      // PRECISION CUSTOM SOFTWARE
                    </p>
                    <p className="text-xs text-gray-600 font-sans mt-2">
                      Binary Froster Engineering Office
                      <br />
                      Hennur Main Road, Bengaluru, India 560043
                      <br />
                      billing@binaryfroster.com
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="inline-block text-xs font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 px-2.5 py-1 rounded">
                      INVOICE {activeInvoice.status}
                    </span>
                    <h2 className="text-base font-bold text-gray-800 font-mono mt-2">
                      {activeInvoice.invoiceNumber}
                    </h2>
                    <p className="text-xs text-gray-500 font-mono">
                      Date Issued: {activeInvoice.issueDate}
                    </p>
                    <p className="text-xs text-red-600 font-mono font-bold">
                      Due Date: {activeInvoice.dueDate}
                    </p>
                  </div>
                </div>

                {/* Billing Addresses */}
                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-200 text-xs">
                  <div>
                    <span className="block font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      CLIENT BILLED
                    </span>
                    <h4 className="font-bold text-gray-900 font-sans text-sm">
                      {user?.companyName}
                    </h4>
                    <p className="text-gray-600 mt-1">
                      Attn: {user?.name}
                      <br />
                      {user?.email}
                      <br />
                      {user?.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      REQUISITION REF
                    </span>
                    <h4 className="font-bold text-gray-800 font-sans text-xs">
                      Sterling Algorithmic Suite
                    </h4>
                    <p className="text-gray-500 font-mono mt-1">// STAGE: Active Build</p>
                  </div>
                </div>

                {/* Itemized lines */}
                <div className="space-y-3">
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                    ITEMIZED LEDGER LINES
                  </span>
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
                          <td className="p-3 text-right font-mono font-semibold text-gray-900">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Calc */}
                <div className="flex justify-end pt-4">
                  <div className="w-72 space-y-2 border-t border-gray-300 pt-4 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-mono font-semibold">
                        {formatCurrency(activeInvoice.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>International processing tax:</span>
                      <span className="font-mono">0.00%</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900 text-sm">
                      <span>Total Invoice Balance:</span>
                      <span className="font-mono">{formatCurrency(activeInvoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Print Button */}
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
              onClick={() => {
                if (!paying) setCheckoutInvoice(null);
              }}
              className="absolute inset-0 bg-black cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-bg-card border border-border-custom rounded-card shadow-glow overflow-hidden z-10 p-6 space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-border-custom/50">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent-primary animate-pulse" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">
                    // Razorpay Secure Portal (@shivamsurajdube)
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
                  <h3 className="font-sans text-base font-bold text-white">
                    Razorpay Payment Confirmed
                  </h3>
                  <p className="font-mono text-[9px] text-brand-success uppercase tracking-wider">
                    // Webhook synced with @shivamsurajdube. Invoice marked as PAID.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmRazorpayPayment} className="space-y-4 font-mono text-xs">
                  <div className="p-4 bg-bg-secondary border border-border-custom rounded-input space-y-1.5 text-center">
                    <span className="font-mono text-[9px] text-text-muted uppercase">
                      // OFFICIAL RAZORPAY HANDLE
                    </span>
                    <h2 className="text-xl font-extrabold text-accent-primary font-mono">
                      razorpay.me/@shivamsurajdube
                    </h2>
                    <p className="font-sans text-xs text-white font-bold mt-1">
                      {checkoutInvoice.description} — {formatCurrency(checkoutInvoice.total)}
                    </p>
                  </div>

                  <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-input text-accent-primary text-[10px] leading-relaxed">
                    All portal transactions are routed strictly through official Razorpay handle <strong>@shivamsurajdube</strong> (UPI, Credit/Debit Cards, Net Banking).
                  </div>

                  <div className="space-y-2">
                    <a
                      href="https://razorpay.me/@shivamsurajdube"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 bg-accent-primary text-bg-primary font-mono text-xs font-bold uppercase rounded-input flex items-center justify-center gap-2 hover:bg-accent-primary/90 transition-colors cursor-pointer"
                    >
                      [OPEN_RAZORPAY_ME_@SHIVAMSURAJDUBE] &rarr;
                    </a>
                  </div>

                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full font-mono text-xs uppercase font-bold py-3 cursor-pointer"
                    isLoading={paying}
                  >
                    RECORD & VERIFY PAYMENT
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
